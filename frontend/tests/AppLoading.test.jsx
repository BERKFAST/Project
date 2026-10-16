import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from '../src/App.jsx';

vi.mock('../src/components/catalog/useProperties.js', () => ({
  useProperties: () => ({ data: undefined, error: null, isLoading: true }),
}));

afterEach(cleanup);

describe('carga del catálogo', () => {
  it('muestra skeletons mientras useProperties está cargando', () => {
    render(<App />);

    expect(screen.getAllByRole('status', { name: 'Cargando inmueble' })).toHaveLength(6);
    expect(screen.getByRole('region', { name: 'Inmuebles' })).toHaveAttribute('aria-busy', 'true');
  });
});
