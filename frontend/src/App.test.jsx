import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from './App.jsx';

afterEach(cleanup);

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }) => <div aria-label="Mapa de anuncios en Barcelona">{children}</div>,
  Marker: ({ children, eventHandlers }) => <button type="button" onClick={eventHandlers.click}>Marcador{children}</button>,
  Popup: ({ children }) => <span>{children}</span>,
  TileLayer: () => null,
  useMap: () => ({ flyTo: vi.fn() }),
}));

describe('búsqueda de anuncios', () => {
  it('muestra anuncios y filtra por barrio', () => {
    render(<App />);
    expect(screen.getByText('6 anuncios')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Zona, barrio o dirección'), { target: { value: 'Gràcia' } });

    expect(screen.getByText('1 anuncio')).toBeInTheDocument();
    expect(screen.getByText('Luz de tarde en Gràcia')).toBeInTheDocument();
    expect(screen.queryByText('Ático entre tejados')).not.toBeInTheDocument();
  });

  it('permite guardar y filtrar favoritos', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Guardar Luz de tarde en Gràcia en favoritos' }));
    fireEvent.click(screen.getByRole('button', { name: /Guardados/ }));

    expect(screen.getByText('Tus guardados')).toBeInTheDocument();
    expect(screen.getByText('1 anuncio')).toBeInTheDocument();
    expect(screen.getByText('Luz de tarde en Gràcia')).toBeInTheDocument();
  });

  it('ordena por precio y permite restablecer los filtros', () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText('Ordenar anuncios'), { target: { value: 'price-asc' } });

    const cards = screen.getAllByRole('article');
    expect(within(cards[0]).getByText('Pequeño refugio con terraza')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Zona, barrio o dirección'), { target: { value: 'Sarrià' } });
    fireEvent.click(screen.getByRole('button', { name: /Limpiar/ }));
    expect(screen.getByText('6 anuncios')).toBeInTheDocument();
  });
});