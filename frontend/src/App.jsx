import { useEffect, useMemo, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import { ArrowDownUp, ArrowRight, Heart, House, MapPin, Search, SlidersHorizontal, X } from 'lucide-react';
import { formatPrice, listings } from './listings.js';

const markerIcon = L.divIcon({
  className: 'price-marker-wrap',
  html: '<span class="price-marker"></span>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function MapFocus({ listing }) {
  const map = useMap();

  useEffect(() => {
    if (listing) map.flyTo(listing.position, 15, { duration: 0.65 });
  }, [listing, map]);

  return null;
}

function ListingMap({ items, selectedListing, onSelect }) {
  return (
    <div className="map-frame" aria-label="Mapa de anuncios en Barcelona">
      <MapContainer center={[41.388, 2.174]} zoom={13} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapFocus listing={selectedListing} />
        {items.map((listing) => (
          <Marker
            key={listing.id}
            position={listing.position}
            icon={markerIcon}
            eventHandlers={{ click: () => onSelect(listing) }}
          >
            <Popup>
              <strong>{formatPrice(listing.price)}</strong>
              <br />
              {listing.neighborhood}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <div className="map-label"><MapPin size={15} /> Barcelona</div>
    </div>
  );
}

function ListingCard({ listing, isFavorite, onFavorite, onSelect, isSelected }) {
  return (
    <article className={`listing-card${isSelected ? ' is-selected' : ''}`}>
      <div className="listing-photo-wrap">
        <img
          className="listing-photo"
          src={`https://images.unsplash.com/${listing.image}?auto=format&fit=crop&w=720&q=82`}
          alt={`Interior de ${listing.title}`}
          loading="lazy"
        />
        <span className="listing-type">En venta</span>
        <button
          type="button"
          className={`favorite-button${isFavorite ? ' is-favorite' : ''}`}
          aria-label={isFavorite ? `Quitar ${listing.title} de favoritos` : `Guardar ${listing.title} en favoritos`}
          aria-pressed={isFavorite}
          onClick={() => onFavorite(listing.id)}
        >
          <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
      </div>
      <div className="listing-copy">
        <div className="listing-heading">
          <h3>{listing.title}</h3>
          <span className="listing-price">{formatPrice(listing.price)}</span>
        </div>
        <p className="listing-location">{listing.neighborhood} <span>·</span> {listing.address}</p>
        <div className="listing-meta">
          <span>{listing.rooms} hab.</span><i /> <span>{listing.area} m²</span><i /> <span>{listing.type}</span>
        </div>
        <div className="listing-bottom">
          <p className="listing-detail">{listing.detail}</p>
          <button className="listing-locate" type="button" aria-label={`Ver ${listing.title} en el mapa`} onClick={() => onSelect(listing)}>
            <MapPin size={14} />
          </button>
        </div>
      </div>
    </article>
  );
}

function App() {
  const [search, setSearch] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRooms, setMinRooms] = useState('');
  const [sortOrder, setSortOrder] = useState('recommended');
  const [favorites, setFavorites] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [mobileView, setMobileView] = useState('list');

  const filteredListings = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase('es');
    const result = listings.filter((listing) => {
      const matchesSearch = !normalizedSearch ||
        `${listing.neighborhood} ${listing.address} ${listing.title}`.toLocaleLowerCase('es').includes(normalizedSearch);
      return matchesSearch &&
        (!maxPrice || listing.price <= Number(maxPrice)) &&
        (!minRooms || listing.rooms >= Number(minRooms)) &&
        (!showFavorites || favorites.includes(listing.id));
    });

    if (sortOrder === 'price-asc') result.sort((a, b) => a.price - b.price);
    if (sortOrder === 'price-desc') result.sort((a, b) => b.price - a.price);
    return result;
  }, [favorites, maxPrice, minRooms, search, showFavorites, sortOrder]);

  const toggleFavorite = (id) => {
    setFavorites((current) => current.includes(id) ? current.filter((favorite) => favorite !== id) : [...current, id]);
  };

  const clearFilters = () => {
    setSearch('');
    setMaxPrice('');
    setMinRooms('');
    setShowFavorites(false);
  };

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="/" aria-label="Llar, inicio"><span className="brand-mark"><House size={17} strokeWidth={2.5} /></span>llar<span className="brand-period">.</span></a>
        <nav className="main-nav" aria-label="Navegación principal">
          <a className="nav-active" href="#buscar">Comprar</a>
          <a href="#buscar">Alquilar</a>
          <a href="#buscar">Vender</a>
        </nav>
        <div className="header-actions">
          <button
            className={`saved-search${showFavorites ? ' active' : ''}`}
            type="button"
            onClick={() => setShowFavorites((current) => !current)}
            aria-pressed={showFavorites}
          >
            <Heart size={17} /> <span>Guardados</span>
            {favorites.length > 0 && <span className="saved-count">{favorites.length}</span>}
          </button>
          <button className="publish-button" type="button" onClick={() => window.alert('Muy pronto podrás publicar tu anuncio en Llar.')}>Publicar anuncio <ArrowRight size={16} /></button>
        </div>
      </header>

      <main id="buscar">
        <section className="intro-row">
          <div>
            <p className="eyebrow"><span /> TU PRÓXIMO CAPÍTULO EMPIEZA AQUÍ</p>
            <h1>Un lugar que<br /><em>se siente tuyo.</em></h1>
          </div>
          <p className="intro-note">Encuentra ese rincón de Barcelona<br className="desktop-break" /> donde todo empieza a encajar.</p>
        </section>

        <section className="search-panel" aria-label="Filtros de búsqueda">
          <label className="search-field">
            <Search size={19} aria-hidden="true" />
            <span className="sr-only">Zona, barrio o dirección</span>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Zona, barrio o dirección" />
          </label>
          <label className="filter-field">
            <span>Precio máximo</span>
            <select aria-label="Precio máximo" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)}>
              <option value="">Sin límite</option>
              <option value="350000">350.000 €</option>
              <option value="500000">500.000 €</option>
              <option value="750000">750.000 €</option>
            </select>
          </label>
          <label className="filter-field rooms-field">
            <span>Habitaciones</span>
            <select aria-label="Habitaciones" value={minRooms} onChange={(event) => setMinRooms(event.target.value)}>
              <option value="">Cualquiera</option>
              <option value="1">1 o más</option>
              <option value="2">2 o más</option>
              <option value="3">3 o más</option>
              <option value="4">4 o más</option>
            </select>
          </label>
          <button className="search-submit" type="button" onClick={() => setMobileView('list')} aria-label="Ver resultados"><Search size={19} /><span>Buscar</span></button>
        </section>

        <section className="results-toolbar">
          <div className="results-title">
            <h2>{showFavorites ? 'Tus guardados' : 'Hogares para ti'}</h2>
            <span className="result-count">{filteredListings.length} {filteredListings.length === 1 ? 'anuncio' : 'anuncios'}</span>
            <span className="demo-tag">MUESTRA</span>
          </div>
          <div className="toolbar-actions">
            <button className="mobile-view-toggle" type="button" onClick={() => setMobileView((view) => view === 'list' ? 'map' : 'list')}>
              {mobileView === 'list' ? <MapPin size={16} /> : <House size={16} />}
              {mobileView === 'list' ? 'Mapa' : 'Lista'}
            </button>
            <label className="sort-control"><ArrowDownUp size={15} /><span className="sr-only">Ordenar anuncios</span>
              <select aria-label="Ordenar anuncios" value={sortOrder} onChange={(event) => setSortOrder(event.target.value)}>
                <option value="recommended">Recomendados</option>
                <option value="price-asc">Menor precio</option>
                <option value="price-desc">Mayor precio</option>
              </select>
            </label>
            <button className="clear-button" type="button" onClick={clearFilters}><SlidersHorizontal size={15} /> Limpiar</button>
          </div>
        </section>

        <section className={`results-layout mobile-${mobileView}`} aria-label="Resultados de búsqueda">
          <div className="listing-column">
            {filteredListings.length > 0 ? filteredListings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                isFavorite={favorites.includes(listing.id)}
                isSelected={selectedListing?.id === listing.id}
                onFavorite={toggleFavorite}
                onSelect={setSelectedListing}
              />
            )) : (
              <div className="empty-state">
                <span className="empty-icon"><Search size={21} /></span>
                <h3>No encontramos ese hogar</h3>
                <p>Prueba con otro barrio o amplía tus filtros.</p>
                <button type="button" onClick={clearFilters}><X size={15} /> Borrar filtros</button>
              </div>
            )}
          </div>
          <ListingMap
            items={filteredListings}
            selectedListing={filteredListings.find((listing) => listing.id === selectedListing?.id) ?? null}
            onSelect={setSelectedListing}
          />
        </section>
      </main>
      <footer className="site-footer"><span>LLAR <span className="footer-dot">·</span> BARCELONA</span><span>Imágenes y anuncios de muestra</span></footer>
    </div>
  );
}

export default App;