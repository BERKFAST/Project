import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import FavoriteButton from '../src/components/common/FavoriteButton.jsx';
import { favoritesQueryKey } from '../src/components/common/favoriteQueries.js';

afterEach(() => {
  cleanup();
  sessionStorage.clear();
  vi.unstubAllGlobals();
});

function renderButton({ favorites = [], isAuthenticated = true, onAuthRequired = vi.fn(), onError = vi.fn() } = {}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  queryClient.setQueryData(favoritesQueryKey, favorites);
  const parentClick = vi.fn();

  function ButtonWithFavoriteState() {
    const { data: savedFavorites = [] } = useQuery({
      queryKey: favoritesQueryKey,
      queryFn: async () => queryClient.getQueryData(favoritesQueryKey) ?? [],
    });

    return (
      <div onClick={parentClick}>
        <FavoriteButton
          propertyId={42}
          propertyTitle="Piso luminoso"
          isFavorite={savedFavorites.includes(42)}
          isAuthenticated={isAuthenticated}
          onAuthRequired={onAuthRequired}
          onError={onError}
        />
      </div>
    );
  }

  render(
    <QueryClientProvider client={queryClient}>
      <ButtonWithFavoriteState />
    </QueryClientProvider>,
  );
  return { queryClient, onAuthRequired, onError, parentClick };
}

function pendingRequest() {
  let resolve;
  const promise = new Promise((done) => { resolve = done; });
  return { promise, resolve };
}

describe('FavoriteButton', () => {
  it('guarda el inmueble pendiente y abre autenticación sin propagar el clic', () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const { onAuthRequired, parentClick } = renderButton({ isAuthenticated: false });

    fireEvent.click(screen.getByRole('button', { name: 'Guardar Piso luminoso en favoritos' }));

    expect(sessionStorage.getItem('pendingFavorite')).toBe('{"pendingFavoriteId":42}');
    expect(onAuthRequired).toHaveBeenCalledOnce();
    expect(parentClick).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('cambia el icono al instante y envía POST al guardar', async () => {
    const request = pendingRequest();
    const fetchMock = vi.fn(() => request.promise);
    vi.stubGlobal('fetch', fetchMock);
    const { queryClient } = renderButton();

    fireEvent.click(screen.getByRole('button', { name: 'Guardar Piso luminoso en favoritos' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Quitar Piso luminoso de favoritos' }))
        .toHaveAttribute('aria-pressed', 'true');
    });
    expect(queryClient.getQueryData(favoritesQueryKey)).toEqual([42]);
    expect(fetchMock).toHaveBeenCalledWith('/api/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ property_id: 42 }),
    });

    request.resolve({ ok: true, status: 200 });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Quitar Piso luminoso de favoritos' })).toBeInTheDocument());
  });

  it('envía DELETE para quitar un inmueble guardado', async () => {
    const request = pendingRequest();
    const fetchMock = vi.fn(() => request.promise);
    vi.stubGlobal('fetch', fetchMock);
    const { queryClient } = renderButton({ favorites: [42] });

    fireEvent.click(screen.getByRole('button', { name: 'Quitar Piso luminoso de favoritos' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Guardar Piso luminoso en favoritos' }))
        .toHaveAttribute('aria-pressed', 'false');
    });
    expect(queryClient.getQueryData(favoritesQueryKey)).toEqual([]);
    expect(fetchMock).toHaveBeenCalledWith('/api/favorites', expect.objectContaining({ method: 'DELETE' }));

    request.resolve({ ok: true, status: 200 });
  });

  it('revierte el estado y notifica el error cuando falla la petición', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }));
    const { onError, queryClient } = renderButton();

    fireEvent.click(screen.getByRole('button', { name: 'Guardar Piso luminoso en favoritos' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Guardar Piso luminoso en favoritos' }))
        .toHaveAttribute('aria-pressed', 'false');
    });
    expect(queryClient.getQueryData(favoritesQueryKey)).toEqual([]);
    expect(onError).toHaveBeenCalledOnce();
  });
});
