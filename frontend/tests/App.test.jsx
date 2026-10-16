import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from '../src/App.jsx';

afterEach(() => {
  cleanup();
  sessionStorage.clear();
  vi.unstubAllGlobals();
});

describe('catálogo de inmuebles', () => {
  it('muestra tarjetas con la información de cada inmueble', async () => {
    render(<App />);

    expect(await screen.findAllByRole('article')).toHaveLength(6);
    expect(screen.getByRole('heading', { name: 'Luz de tarde en Gràcia' })).toBeInTheDocument();
    expect(screen.getByText('Vila de Gràcia · Carrer de Verdi, 28')).toBeInTheDocument();
  });

  it('pide iniciar sesión al guardar un inmueble sin autenticación', async () => {
    render(<App />);
    const card = (await screen.findAllByRole('article'))[0];

    fireEvent.click(within(card).getByRole('button', { name: 'Guardar Luz de tarde en Gràcia en favoritos' }));

    expect(sessionStorage.getItem('pendingFavorite')).toBe('{"pendingFavoriteId":1}');
    expect(screen.getByRole('dialog')).toHaveAccessibleName('Inicia sesión para guardar');
    expect(screen.getAllByRole('article')).toHaveLength(6);
  });

  it('actualiza el favorito al instante y revierte el icono si falla la petición', async () => {
    let failRequest;
    const fetchMock = vi.fn((url, options = {}) => {
      if (options.method === 'POST') {
        return new Promise((resolve) => { failRequest = () => resolve({ ok: false, status: 503 }); });
      }
      return Promise.resolve({ ok: true, status: 200, json: async () => [] });
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<App isAuthenticated />);
    await screen.findAllByRole('article');
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith('/api/favorites'));

    fireEvent.click(screen.getByRole('button', { name: 'Guardar Luz de tarde en Gràcia en favoritos' }));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Quitar Luz de tarde en Gràcia de favoritos' }))
        .toHaveAttribute('aria-pressed', 'true');
    });

    failRequest();
    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo guardar el favorito');
    expect(screen.getByRole('button', { name: 'Guardar Luz de tarde en Gràcia en favoritos' }))
      .toHaveAttribute('aria-pressed', 'false');
  });
});
