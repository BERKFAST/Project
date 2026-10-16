import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, describe, expect, it, vi } from 'vitest';
import PropertyCard from '../src/components/catalog/PropertyCard.tsx';

afterEach(cleanup);

const listing = {
  id: 1,
  title: 'Piso de prueba',
  neighborhood: 'Gràcia',
  address: 'Carrer de prova, 1',
  price: 400000,
  previousPrice: 425000,
  rooms: 2,
  area: 80,
  type: 'Piso',
  image: 'photo-a',
  images: ['photo-a', 'photo-b', 'photo-c'],
};

function renderCard(onCardClick = vi.fn()) {
  const queryClient = new QueryClient();
  return render(
    <div onClick={onCardClick}>
      <QueryClientProvider client={queryClient}>
        <PropertyCard
          listing={listing}
          isFavorite={false}
          isAuthenticated={false}
          onAuthRequired={vi.fn()}
          onFavoriteError={vi.fn()}
        />
      </QueryClientProvider>
    </div>,
  );
}

describe('tarjeta de inmueble', () => {
  it('muestra el badge solo cuando el precio anterior es superior', () => {
    renderCard();
    expect(screen.getByText('Bajada de precio')).toBeInTheDocument();
  });

  it('permite navegar la galería con los botones sin propagar el clic', () => {
    const bubbledClick = vi.fn();
    renderCard(bubbledClick);

    fireEvent.click(screen.getByRole('button', { name: 'Imagen siguiente de Piso de prueba' }));

    expect(screen.getByRole('img', { name: 'Piso de prueba' })).toHaveAttribute(
      'src',
      expect.stringContaining('photo-b'),
    );
    expect(bubbledClick).not.toHaveBeenCalled();
    expect(screen.getByText('2 / 3')).toBeInTheDocument();
  });

  it('cambia de foto con un swipe táctil', () => {
    renderCard();
    const gallery = screen.getByRole('group', { name: 'Galería de fotos: Piso de prueba' });

    fireEvent.touchStart(gallery, {
      touches: [{ identifier: 1, target: gallery, clientX: 180, clientY: 20 }],
    });
    fireEvent.touchEnd(gallery, {
      changedTouches: [{ identifier: 1, target: gallery, clientX: 100, clientY: 20 }],
    });

    expect(screen.getByRole('img', { name: 'Piso de prueba' })).toHaveAttribute(
      'src',
      expect.stringContaining('photo-b'),
    );
  });

  it('usa la imagen de respaldo si una foto no carga', () => {
    renderCard();
    const image = screen.getByRole('img', { name: 'Piso de prueba' });

    fireEvent.error(image);

    expect(image).toHaveAttribute('src', '/assets/property-placeholder.webp');
  });
});
