import { formatPrice } from '../../listings.js';
import { useRef, useState } from 'react';
import type { SyntheticEvent, TouchEvent } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import FavoriteButton from '../common/FavoriteButton.jsx';

const placeholderImage = '/assets/property-placeholder.webp';

type Listing = {
  id: number;
  title: string;
  neighborhood: string;
  address: string;
  price: number;
  previousPrice?: number;
  rooms: number;
  area: number;
  type: string;
  image: string;
  images?: string[];
};

type PropertyCardProps = {
  listing: Listing;
  isFavorite: boolean;
  isAuthenticated: boolean;
  onAuthRequired: () => void;
  onFavoriteError: () => void;
};

function PropertyCard({
  listing,
  isFavorite,
  isAuthenticated,
  onAuthRequired,
  onFavoriteError,
}: PropertyCardProps) {
  const images = listing.images?.length ? listing.images : [listing.image];
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const image = images[activeImageIndex];
  const hasPriceDrop = listing.previousPrice !== undefined && listing.previousPrice > listing.price;

  const handleImageError = (event: SyntheticEvent<HTMLImageElement>) => {
    if (!event.currentTarget.src.endsWith(placeholderImage)) {
      event.currentTarget.src = placeholderImage;
    }
  };

  const showImage = (direction: number) => {
    setActiveImageIndex((index) => (index + direction + images.length) % images.length);
  };

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const startX = touchStartX.current;
    const endX = event.changedTouches[0]?.clientX;
    touchStartX.current = null;

    if (startX === null || endX === undefined) return;
    const swipeDistance = endX - startX;
    if (Math.abs(swipeDistance) >= 40) {
      event.stopPropagation();
      showImage(swipeDistance < 0 ? 1 : -1);
    }
  };

  return (
    <article className="property-card">
      <div
        className="property-image"
        role="group"
        aria-label={`Galería de fotos: ${listing.title}`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={`https://images.unsplash.com/${image}?auto=format&fit=crop&w=720&q=82`}
          alt={listing.title}
          loading="lazy"
          onError={handleImageError}
        />
        {hasPriceDrop && (
          <span className="price-drop-badge">Bajada de precio</span>
        )}
        {images.length > 1 && (
          <>
            <button
              className="gallery-button gallery-previous"
              type="button"
              aria-label={`Imagen anterior de ${listing.title}`}
              onClick={(event) => {
                event.stopPropagation();
                showImage(-1);
              }}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              className="gallery-button gallery-next"
              type="button"
              aria-label={`Imagen siguiente de ${listing.title}`}
              onClick={(event) => {
                event.stopPropagation();
                showImage(1);
              }}
            >
              <ChevronRight size={20} />
            </button>
            <span className="gallery-counter" aria-live="polite">
              {activeImageIndex + 1} / {images.length}
            </span>
          </>
        )}
        <FavoriteButton
          propertyId={listing.id}
          propertyTitle={listing.title}
          isFavorite={isFavorite}
          isAuthenticated={isAuthenticated}
          onAuthRequired={onAuthRequired}
          onError={onFavoriteError}
        />
      </div>
      <div className="property-info">
        <div className="property-heading">
          <h2>{listing.title}</h2>
          <p className="property-price">{formatPrice(listing.price)}</p>
        </div>
        <p className="property-location">{listing.neighborhood} · {listing.address}</p>
        <p className="property-details">{listing.rooms} hab. · {listing.area} m² · {listing.type}</p>
      </div>
    </article>
  );
}

export default PropertyCard;
