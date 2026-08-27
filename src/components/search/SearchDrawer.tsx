import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, X, ArrowRight } from 'lucide-react';
import { useProducts } from '../../hooks/useProducts';
import './SearchDrawer.css';

interface SearchDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchDrawer: React.FC<SearchDrawerProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 280);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Focus input & scroll lock when opened
  useEffect(() => {
    if (isOpen) {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';

      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      setSearchTerm('');
      setDebouncedSearch('');
    }
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const { data, isLoading } = useProducts({
    search: debouncedSearch,
    limit: 8,
  });

  const products = data?.products ?? [];

  if (!isOpen) return null;

  return (
    <div className="search-overlay" role="dialog" aria-modal="true" aria-label="Search Timepieces">
      <div className="search-overlay__backdrop" onClick={onClose} />

      <div className="search-overlay__panel">
        <div className="container search-overlay__container">
          {/* Header & Input */}
          <div className="search-overlay__header">
            <div className="search-overlay__input-wrapper">
              <Search className="search-overlay__input-icon" size={20} strokeWidth={1.5} />
              <input
                ref={inputRef}
                type="text"
                className="search-overlay__input"
                placeholder="Search NAYAB timepieces by name, material, or reference..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search NAYAB timepieces"
              />
            </div>
            <button
              className="search-overlay__close-btn pressable"
              onClick={onClose}
              aria-label="Close search"
            >
              <X size={22} strokeWidth={1.5} />
            </button>
          </div>

          {/* Quick Suggestions / Results */}
          <div className="search-overlay__content">
            {isLoading && debouncedSearch && (
              <div className="search-overlay__loading">
                <span className="search-overlay__loading-text">Searching atelier archives...</span>
              </div>
            )}

            {!isLoading && debouncedSearch && products.length === 0 && (
              <div className="search-overlay__empty">
                <p className="search-overlay__empty-text">
                  No timepieces found matching "{debouncedSearch}".
                </p>
                <p className="search-overlay__empty-sub">
                  Try exploring our <Link to="/collections" onClick={onClose} className="search-overlay__link">five portfolios</Link>.
                </p>
              </div>
            )}

            {products.length > 0 && (
              <div className="search-overlay__results">
                <span className="eyebrow search-overlay__section-title">
                  {debouncedSearch ? 'Matching Timepieces' : 'Featured References'}
                </span>
                <div className="search-overlay__grid">
                  {products.map((product) => (
                    <Link
                      key={product.id}
                      to={`/watches/${product.slug}`}
                      className="search-overlay__item"
                      onClick={onClose}
                    >
                      <div className="search-overlay__item-thumb">
                        <img
                          src={product.images[0]?.url || '/images/sovereign-39-front.png'}
                          alt={product.name}
                          className="search-overlay__item-img"
                        />
                      </div>
                      <div className="search-overlay__item-info">
                        <span className="search-overlay__item-collection">
                          {product.collection.name} Collection · {product.reference}
                        </span>
                        <h4 className="search-overlay__item-name">{product.name}</h4>
                        <p className="search-overlay__item-spec">
                          {product.caseMaterial} · {product.caseDiameter}
                        </p>
                        <span className="search-overlay__item-price">{product.formattedPrice}</span>
                      </div>
                      <ArrowRight size={16} className="search-overlay__item-arrow" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {!debouncedSearch && (
              <div className="search-overlay__curated">
                <span className="eyebrow search-overlay__section-title">Explore Portfolios</span>
                <div className="search-overlay__curated-links">
                  <Link to="/collections/mehr" onClick={onClose} className="search-overlay__curated-pill">
                    MEHR · Formal Dress
                  </Link>
                  <Link to="/collections/indus" onClick={onClose} className="search-overlay__curated-pill">
                    INDUS · Titanium Architecture
                  </Link>
                  <Link to="/collections/noor" onClick={onClose} className="search-overlay__curated-pill">
                    NOOR · 32 mm Refinement
                  </Link>
                  <Link to="/collections/karakoram" onClick={onClose} className="search-overlay__curated-pill">
                    KARAKORAM · High Altitude
                  </Link>
                  <Link to="/collections/zar" onClick={onClose} className="search-overlay__curated-pill">
                    ZAR · Grand Complications
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
