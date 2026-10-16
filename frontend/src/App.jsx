import { useState } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { Heart, X } from 'lucide-react';
import PropertyCard from './components/catalog/PropertyCard.tsx';
import PropertyCardSkeleton from './components/catalog/PropertyCardSkeleton.jsx';
import { useProperties } from './components/catalog/useProperties.js';
import { favoritesQueryKey } from './components/common/favoriteQueries.js';

async function fetchFavorites() {
  const response = await fetch('/api/favorites');
  if (!response.ok) {
    throw new Error(`No se pudieron cargar los favoritos (${response.status}).`);
  }

  const favorites = await response.json();
  if (!Array.isArray(favorites) || !favorites.every(Number.isInteger)) {
    throw new Error('La API devolvió una lista de favoritos no válida.');
  }
  return favorites;
}

function PropertyCatalog({ isAuthenticated }) {
  const [showFavorites, setShowFavorites] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [toast, setToast] = useState('');
  const {
    data: properties = [],
    error: propertiesError,
    isLoading: propertiesLoading,
  } = useProperties();
  const { data: favorites = [], error } = useQuery({
    queryKey: favoritesQueryKey,
    queryFn: fetchFavorites,
    enabled: isAuthenticated,
    initialData: [],
    retry: false,
  });

  const visibleListings = showFavorites
    ? properties.filter((listing) => favorites.includes(listing.id))
    : properties;

  return (
    <main className="app">
      <header className="page-header">
        <div>
          <p className="eyebrow">HOGARES EN BARCELONA</p>
          <h1>Encuentra tu próximo hogar</h1>
        </div>
        <button
          className="favorites-filter"
          type="button"
          aria-pressed={showFavorites}
          onClick={() => setShowFavorites((showing) => !showing)}
        >
          <Heart size={18} fill={showFavorites ? 'currentColor' : 'none'} />
          Favoritos ({favorites.length})
        </button>
      </header>

      <section className="property-grid" aria-label="Inmuebles" aria-busy={propertiesLoading}>
        {propertiesLoading && Array.from({ length: 6 }, (_, index) => (
          <PropertyCardSkeleton key={index} />
        ))}
        {!propertiesLoading && visibleListings.map((listing) => (
          <PropertyCard
            key={listing.id}
            listing={listing}
            isFavorite={favorites.includes(listing.id)}
            isAuthenticated={isAuthenticated}
            onAuthRequired={() => setShowAuthModal(true)}
            onFavoriteError={() => setToast('No se pudo guardar el favorito. Inténtalo de nuevo.')}
          />
        ))}
        {!propertiesLoading && propertiesError && (
          <p className="empty-message" role="alert">{propertiesError.message}</p>
        )}
        {!propertiesLoading && !propertiesError && visibleListings.length === 0 && (
          <p className="empty-message">Todavía no has guardado ningún inmueble.</p>
        )}
      </section>
      {showAuthModal && (
        <div className="modal-backdrop" onClick={() => setShowAuthModal(false)}>
          <section
            className="auth-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="modal-close"
              type="button"
              aria-label="Cerrar"
              onClick={() => setShowAuthModal(false)}
            >
              <X size={18} />
            </button>
            <h2 id="auth-title">Inicia sesión para guardar</h2>
            <p>Inicia sesión para guardar este inmueble en tus favoritos.</p>
            <button className="modal-action" type="button" onClick={() => setShowAuthModal(false)}>
              Entendido
            </button>
          </section>
        </div>
      )}
      {(toast || error) && (
        <div className="favorite-toast" role="alert">
          <span>{toast || error.message}</span>
          <button type="button" aria-label="Cerrar aviso" onClick={() => setToast('')}>
            <X size={16} />
          </button>
        </div>
      )}
    </main>
  );
}

function App({ isAuthenticated = false }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { refetchOnWindowFocus: false } },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <PropertyCatalog isAuthenticated={isAuthenticated} />
    </QueryClientProvider>
  );
}

export default App;
