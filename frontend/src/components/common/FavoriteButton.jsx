import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Heart } from 'lucide-react';
import { favoritesQueryKey } from './favoriteQueries.js';

async function saveFavorite({ propertyId, isFavorite }) {
  const response = await fetch('/api/favorites', {
    method: isFavorite ? 'DELETE' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ property_id: propertyId }),
  });

  if (!response.ok) {
    throw new Error(`No se pudo actualizar el favorito (${response.status}).`);
  }
}

function FavoriteButton({
  propertyId,
  propertyTitle,
  isFavorite,
  isAuthenticated,
  onAuthRequired,
  onError,
}) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: saveFavorite,
    retry: false,
    onMutate: ({ propertyId: id, isFavorite: wasFavorite }) => {
      queryClient.cancelQueries({ queryKey: favoritesQueryKey });
      const previousFavorites = queryClient.getQueryData(favoritesQueryKey) ?? [];
      const nextFavorites = wasFavorite
        ? previousFavorites.filter((favoriteId) => favoriteId !== id)
        : [...previousFavorites, id];

      queryClient.setQueryData(favoritesQueryKey, nextFavorites);
      return { previousFavorites };
    },
    onError: (_error, _variables, context) => {
      if (context) queryClient.setQueryData(favoritesQueryKey, context.previousFavorites);
      onError();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: favoritesQueryKey });
    },
  });

  const handleClick = (event) => {
    event.stopPropagation();

    if (!isAuthenticated) {
      sessionStorage.setItem(
        'pendingFavorite',
        JSON.stringify({ pendingFavoriteId: propertyId }),
      );
      onAuthRequired();
      return;
    }

    mutation.mutate({ propertyId, isFavorite });
  };

  return (
    <button
      className={`favorite-button${isFavorite ? ' is-favorite' : ''}`}
      type="button"
      aria-label={isFavorite
        ? `Quitar ${propertyTitle} de favoritos`
        : `Guardar ${propertyTitle} en favoritos`}
      aria-pressed={isFavorite}
      onClick={handleClick}
    >
      <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
    </button>
  );
}

export default FavoriteButton;
