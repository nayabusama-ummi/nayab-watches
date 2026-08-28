import React, { useEffect, useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productsApi, ApiProduct, ProductFilterParams } from '../api/products.api';
import { useWishlist } from '../hooks/useWishlist';
import {
  Search,
  X,
  SlidersHorizontal,
  ArrowUp,
  ArrowRight,
  Heart,
  RotateCcw,
} from 'lucide-react';
import { EditorialButton } from '../components/common/EditorialButton';
import './WatchesPage.css';

const COLLECTIONS_OPTIONS = [
  { label: 'All Collections', value: '' },
  { label: 'MEHR (Dress & Haute)', value: 'mehr' },
  { label: 'INDUS (Titanium Architecture)', value: 'indus' },
  { label: 'NOOR (Measured Diamond)', value: 'noor' },
  { label: 'KARAKORAM (High Altitude)', value: 'karakoram' },
  { label: 'ZAR (Complications)', value: 'zar' },
];

const MATERIAL_OPTIONS = [
  { label: 'All Materials', value: '' },
  { label: '18K Rose Gold', value: 'Rose Gold' },
  { label: 'Grade 5 Titanium', value: 'Titanium' },
  { label: '18K Honey Gold', value: 'Honey Gold' },
  { label: 'Stainless Steel', value: 'Stainless Steel' },
  { label: 'Damascened Steel', value: 'Damascened' },
];

const SIZE_OPTIONS = [
  { label: 'All Diameters', value: '' },
  { label: '32 mm', value: '32' },
  { label: '38 mm', value: '38' },
  { label: '39 mm', value: '39' },
  { label: '41 mm', value: '41' },
  { label: '42 mm', value: '42' },
  { label: '43 mm', value: '43' },
];

const AVAILABILITY_OPTIONS = [
  { label: 'All Availability', value: '' },
  { label: 'Available for Allocation', value: 'AVAILABLE' },
  { label: 'Limited Production', value: 'LIMITED' },
];

const SORT_OPTIONS = [
  { label: 'Newest Additions', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
];

export const WatchesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  const handleToggleWishlist = async (productId: string) => {
    if (isInWishlist(productId)) {
      await removeFromWishlist(productId);
    } else {
      await addToWishlist(productId);
    }
  };

  // Search & Filter State
  const [searchInput, setSearchInput] = useState(() => searchParams.get('search') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(searchInput);
  const [selectedCollection, setSelectedCollection] = useState(() => searchParams.get('collection') || '');
  const [selectedMaterial, setSelectedMaterial] = useState(() => searchParams.get('material') || '');
  const [selectedSize, setSelectedSize] = useState(() => searchParams.get('size') || '');
  const [selectedAvailability, setSelectedAvailability] = useState(() => searchParams.get('availability') || '');
  const [selectedSort, setSelectedSort] = useState<'newest' | 'price-asc' | 'price-desc'>(
    () => (searchParams.get('sort') as any) || 'newest'
  );

  // UI state
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Debounce search input by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Sync state to URL parameters
  useEffect(() => {
    const params: Record<string, string> = {};
    if (debouncedSearch) params.search = debouncedSearch;
    if (selectedCollection) params.collection = selectedCollection;
    if (selectedMaterial) params.material = selectedMaterial;
    if (selectedSize) params.size = selectedSize;
    if (selectedAvailability) params.availability = selectedAvailability;
    if (selectedSort !== 'newest') params.sort = selectedSort;

    setSearchParams(params, { replace: true });
  }, [
    debouncedSearch,
    selectedCollection,
    selectedMaterial,
    selectedSize,
    selectedAvailability,
    selectedSort,
    setSearchParams,
  ]);

  // Back to top scroll listener
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when filter drawer is open
  useEffect(() => {
    if (isFilterDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFilterDrawerOpen]);

  // Active filter count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCollection) count++;
    if (selectedMaterial) count++;
    if (selectedSize) count++;
    if (selectedAvailability) count++;
    return count;
  }, [selectedCollection, selectedMaterial, selectedSize, selectedAvailability]);

  // Query parameters for API
  const queryParams: ProductFilterParams = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      collection: selectedCollection || undefined,
      material: selectedMaterial || undefined,
      size: selectedSize || undefined,
      availability: selectedAvailability || undefined,
      sort: selectedSort,
      limit: 50,
    }),
    [
      debouncedSearch,
      selectedCollection,
      selectedMaterial,
      selectedSize,
      selectedAvailability,
      selectedSort,
    ]
  );

  // Products Query
  const { data, isLoading, error } = useQuery({
    queryKey: ['watches-catalogue', queryParams],
    queryFn: () => productsApi.getAll(queryParams),
    staleTime: 60_000,
  });

  const products: ApiProduct[] = data?.products ?? [];
  const totalCount = data?.pagination?.total ?? products.length;

  const handleResetFilters = () => {
    setSearchInput('');
    setDebouncedSearch('');
    setSelectedCollection('');
    setSelectedMaterial('');
    setSelectedSize('');
    setSelectedAvailability('');
    setSelectedSort('newest');
    setIsFilterDrawerOpen(false);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="page-container theme-ivory watches-page">
      {/* ── CATALOGUE HERO & SEARCH ── */}
      <header className="watches-hero">
        <div className="container">
          <div className="watches-hero__inner">
            <span className="eyebrow watches-hero__eyebrow">The Complete Collection</span>
            <h1 className="watches-hero__title">Every expression of NAYAB.</h1>
            <p className="watches-hero__count">
              {isLoading ? (
                'Cataloguing timepieces…'
              ) : (
                <span>
                  <strong>{totalCount}</strong> {totalCount === 1 ? 'timepiece' : 'timepieces'} displayed
                </span>
              )}
            </p>

            {/* Live Search Input */}
            <div className="watches-search-bar">
              <Search className="watches-search-bar__icon" size={18} aria-hidden="true" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by name, reference, collection, or material…"
                className="watches-search-bar__input"
                aria-label="Search timepieces catalogue"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput('')}
                  className="watches-search-bar__clear"
                  aria-label="Clear search input"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── CONTROLS TOOLBAR (Sticky Filter & Sort) ── */}
      <div className="watches-toolbar">
        <div className="container">
          <div className="watches-toolbar__inner">
            {/* Filter Drawer Trigger */}
            <button
              type="button"
              onClick={() => setIsFilterDrawerOpen(true)}
              className={`watches-filter-btn ${activeFiltersCount > 0 ? 'watches-filter-btn--active' : ''}`}
              aria-expanded={isFilterDrawerOpen}
              aria-label="Open filter panel"
            >
              <SlidersHorizontal size={14} aria-hidden="true" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="watches-filter-btn__badge">{activeFiltersCount}</span>
              )}
            </button>

            {/* Active filter pills (desktop quick clear) */}
            <div className="watches-active-pills">
              {selectedCollection && (
                <span className="watches-pill">
                  {selectedCollection.toUpperCase()}
                  <button onClick={() => setSelectedCollection('')} aria-label={`Remove ${selectedCollection} filter`}>
                    <X size={12} />
                  </button>
                </span>
              )}
              {selectedMaterial && (
                <span className="watches-pill">
                  {selectedMaterial}
                  <button onClick={() => setSelectedMaterial('')} aria-label={`Remove ${selectedMaterial} filter`}>
                    <X size={12} />
                  </button>
                </span>
              )}
              {selectedSize && (
                <span className="watches-pill">
                  {selectedSize} mm
                  <button onClick={() => setSelectedSize('')} aria-label={`Remove ${selectedSize}mm filter`}>
                    <X size={12} />
                  </button>
                </span>
              )}
              {selectedAvailability && (
                <span className="watches-pill">
                  {selectedAvailability === 'AVAILABLE' ? 'Available' : 'Limited'}
                  <button onClick={() => setSelectedAvailability('')} aria-label="Remove availability filter">
                    <X size={12} />
                  </button>
                </span>
              )}
              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="watches-reset-link"
                  aria-label="Reset all filters"
                >
                  <RotateCcw size={11} /> Reset
                </button>
              )}
            </div>

            {/* Sort Select */}
            <div className="watches-sort-wrap">
              <label htmlFor="watches-sort-select" className="watches-sort-label">
                Sort:
              </label>
              <select
                id="watches-sort-select"
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value as any)}
                className="watches-sort-select"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ── CATALOGUE GRID ── */}
      <section className="watches-grid-section">
        <div className="container">
          {isLoading ? (
            <div className="watches-skeleton-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="watches-skeleton-card">
                  <div className="watches-skeleton-card__img" />
                  <div className="watches-skeleton-card__ref" />
                  <div className="watches-skeleton-card__title" />
                  <div className="watches-skeleton-card__price" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="watches-empty-state">
              <h2 className="watches-empty-state__title">Catalogue Unavailable</h2>
              <p className="watches-empty-state__desc">
                We are momentarily unable to load timepiece records. Please refresh the atelier catalogue.
              </p>
              <EditorialButton onClick={() => window.location.reload()} variant="primary" size="md">
                Reload Catalogue
              </EditorialButton>
            </div>
          ) : products.length === 0 ? (
            <div className="watches-empty-state">
              <span className="eyebrow">No Allocations Found</span>
              <h2 className="watches-empty-state__title">No timepieces match your criteria</h2>
              <p className="watches-empty-state__desc">
                {searchInput
                  ? `No models found matching "${searchInput}". Try adjusting your query or resetting active filters.`
                  : 'No timepieces match the selected filter configuration. Clear filters to explore the full portfolio.'}
              </p>
              <div style={{ marginTop: '1.25rem' }}>
                <EditorialButton onClick={handleResetFilters} variant="primary" size="md">
                  <RotateCcw size={13} style={{ marginRight: '0.4rem' }} /> Clear All Filters
                </EditorialButton>
              </div>
            </div>
          ) : (
            <div className="watches-grid">
              {products.map((product) => {
                const isSaved = isInWishlist(product.id);
                const frontImage =
                  product.images.find((img) => img.type === 'FRONT')?.url ||
                  product.images[0]?.url ||
                  '/images/sovereign-39-front.png';
                const sideImage = product.images.find((img) => img.type === 'SIDE')?.url;

                return (
                  <article key={product.id} className="watches-card">
                    {/* Watch Media Frame */}
                    <Link
                      to={`/watches/${product.slug}`}
                      className="watches-card__media-link"
                      aria-label={`View details for ${product.name} (${product.reference})`}
                    >
                      <div className="watches-card__img-frame">
                        <img
                          src={frontImage}
                          alt={`${product.name} fine watchmaking front view`}
                          className="watches-card__img watches-card__img--primary"
                          loading="lazy"
                        />
                        {sideImage && (
                          <img
                            src={sideImage}
                            alt={`${product.name} architecture side profile`}
                            className="watches-card__img watches-card__img--secondary"
                            loading="lazy"
                          />
                        )}
                        {product.availability === 'LIMITED' && (
                          <span className="watches-card__badge">Limited Allocation</span>
                        )}
                      </div>
                    </Link>

                    {/* Wishlist Action */}
                    <button
                      type="button"
                      onClick={() => handleToggleWishlist(product.id)}
                      className={`watches-card__wishlist-btn ${isSaved ? 'watches-card__wishlist-btn--active' : ''}`}
                      aria-label={isSaved ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
                    >
                      <Heart size={15} fill={isSaved ? 'var(--color-oxblood)' : 'none'} />
                    </button>

                    {/* Watch Metadata & Description */}
                    <div className="watches-card__info">
                      <div className="watches-card__header-meta">
                        <span className="watches-card__ref">{product.reference}</span>
                        <span className="watches-card__collection">{product.collection.name}</span>
                      </div>

                      <h3 className="watches-card__title">
                        <Link to={`/watches/${product.slug}`}>{product.name}</Link>
                      </h3>

                      <p className="watches-card__specs">
                        {product.caseMaterial} · {product.caseDiameter}
                      </p>

                      <div className="watches-card__footer">
                        <span className="watches-card__price">{product.formattedPrice}</span>
                        <Link
                          to={`/watches/${product.slug}`}
                          className="watches-card__cta"
                          aria-label={`Discover ${product.name}`}
                        >
                          Discover <ArrowRight size={13} className="watches-card__arrow" />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── SLIDE-OVER FILTER DRAWER ── */}
      {isFilterDrawerOpen && (
        <div className="watches-drawer-overlay" onClick={() => setIsFilterDrawerOpen(false)}>
          <div
            className="watches-drawer"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Filter timepieces"
          >
            {/* Drawer Header */}
            <div className="watches-drawer__header">
              <div className="watches-drawer__header-left">
                <SlidersHorizontal size={15} className="watches-drawer__header-icon" />
                <h2 className="watches-drawer__title">Catalogue Filters</h2>
                {activeFiltersCount > 0 && (
                  <span className="watches-drawer__count-badge">{activeFiltersCount} Active</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsFilterDrawerOpen(false)}
                className="watches-drawer__close"
                aria-label="Close filter drawer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Body Options */}
            <div className="watches-drawer__body">
              {/* Filter: Collection */}
              <div className="watches-filter-group">
                <span className="watches-filter-group__label">Collection Portfolio</span>
                <div className="watches-filter-group__options">
                  {COLLECTIONS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setSelectedCollection(opt.value)}
                      className={`watches-filter-choice ${selectedCollection === opt.value ? 'watches-filter-choice--selected' : ''}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter: Case Material */}
              <div className="watches-filter-group">
                <span className="watches-filter-group__label">Precious Material & Metallurgy</span>
                <div className="watches-filter-group__options">
                  {MATERIAL_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setSelectedMaterial(opt.value)}
                      className={`watches-filter-choice ${selectedMaterial === opt.value ? 'watches-filter-choice--selected' : ''}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter: Case Diameter */}
              <div className="watches-filter-group">
                <span className="watches-filter-group__label">Case Diameter</span>
                <div className="watches-filter-group__options watches-filter-group__options--pills">
                  {SIZE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setSelectedSize(opt.value)}
                      className={`watches-filter-choice ${selectedSize === opt.value ? 'watches-filter-choice--selected' : ''}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter: Availability */}
              <div className="watches-filter-group">
                <span className="watches-filter-group__label">Allocation Status</span>
                <div className="watches-filter-group__options">
                  {AVAILABILITY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setSelectedAvailability(opt.value)}
                      className={`watches-filter-choice ${selectedAvailability === opt.value ? 'watches-filter-choice--selected' : ''}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="watches-drawer__footer">
              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="watches-drawer__reset-btn"
                >
                  Reset All
                </button>
              )}
              <EditorialButton
                onClick={() => setIsFilterDrawerOpen(false)}
                variant="primary"
                size="md"
                className="watches-drawer__apply-btn"
              >
                View {totalCount} {totalCount === 1 ? 'Timepiece' : 'Timepieces'}
              </EditorialButton>
            </div>
          </div>
        </div>
      )}

      {/* ── BACK TO TOP FLOATING BUTTON ── */}
      {showBackToTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="watches-back-to-top pressable"
          aria-label="Back to top of catalogue"
        >
          <ArrowUp size={16} />
        </button>
      )}
    </main>
  );
};
