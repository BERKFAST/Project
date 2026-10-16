function PropertyCardSkeleton() {
  return (
    <div className="property-card-skeleton" role="status" aria-label="Cargando inmueble">
      <div className="skeleton-image" />
      <div className="skeleton-info">
        <div className="skeleton-heading">
          <div className="skeleton-line skeleton-title" />
          <div className="skeleton-line skeleton-price" />
        </div>
        <div className="skeleton-line skeleton-location" />
        <div className="skeleton-line skeleton-details" />
      </div>
    </div>
  );
}

export default PropertyCardSkeleton;
