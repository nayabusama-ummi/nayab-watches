import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { X, ArrowRight, User, Heart, Search, ShoppingBag } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './FullScreenNav.css';

interface FullScreenNavProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSearch: () => void;
  onOpenBag: () => void;
  itemCount: number;
}

type PreviewKey = 'collections' | 'new-models' | 'the-house' | 'craftsmanship';

interface PreviewContent {
  eyebrow: string;
  title: string;
  image: string;
  ctaText: string;
  ctaPath: string;
}

const PREVIEWS: Record<PreviewKey, PreviewContent> = {
  collections: {
    eyebrow: 'The Five Portfolios',
    title: 'MEHR · INDUS · NOOR · KARAKORAM · ZAR',
    image: '/images/sovereign-39-front.png',
    ctaText: 'Explore All Collections',
    ctaPath: '/collections',
  },
  'new-models': {
    eyebrow: 'Flagship Creations 2026',
    title: 'Sovereign 39 & Meridian 41',
    image: '/images/meridian-41-front.png',
    ctaText: 'Discover New Models',
    ctaPath: '/#new-models',
  },
  'the-house': {
    eyebrow: 'Provenance & Heritage',
    title: 'The Lahore Atelier',
    image: '/images/watchmaker-atelier.png',
    ctaText: 'Discover Our Story',
    ctaPath: '/#origin',
  },
  craftsmanship: {
    eyebrow: 'The Art of Watchmaking',
    title: 'Manual Anglage & Hand Regulation',
    image: '/images/craftsmanship-macro.png',
    ctaText: 'Explore Atelier Craft',
    ctaPath: '/#craftsmanship',
  },
};

export const FullScreenNav: React.FC<FullScreenNavProps> = ({
  isOpen,
  onClose,
  onOpenSearch,
  onOpenBag,
  itemCount,
}) => {
  const [activePreview, setActivePreview] = useState<PreviewKey>('new-models');
  const [isRendered, setIsRendered] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Scroll lock & keyboard accessibility
  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      setIsAnimatingOut(false);
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';

      const timer = setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    } else if (isRendered) {
      setIsAnimatingOut(true);
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';

      const timer = setTimeout(() => {
        setIsRendered(false);
        setIsAnimatingOut(false);
      }, 350);

      return () => clearTimeout(timer);
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
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isRendered && !isOpen) return null;

  const currentPreview = PREVIEWS[activePreview];

  const primaryNavItems = [
    {
      num: '01',
      title: 'Collections',
      path: '/collections',
      previewKey: 'collections' as PreviewKey,
      isAnchor: false,
    },
    {
      num: '02',
      title: 'New Models',
      path: '/#new-models',
      targetId: 'new-models',
      previewKey: 'new-models' as PreviewKey,
      isAnchor: true,
    },
    {
      num: '03',
      title: 'The House',
      path: '/#origin',
      targetId: 'origin',
      previewKey: 'the-house' as PreviewKey,
      isAnchor: true,
    },
    {
      num: '04',
      title: 'Craftsmanship',
      path: '/#craftsmanship',
      targetId: 'craftsmanship',
      previewKey: 'craftsmanship' as PreviewKey,
      isAnchor: true,
    },
  ];

  const handleNavigate = (path: string, targetId?: string) => {
    // Unlock body scroll immediately
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
    onClose();

    if (targetId) {
      if (location.pathname === '/') {
        // Already on home page, scroll directly
        const el = document.getElementById(targetId);
        if (el) {
          const navHeight = 70;
          const targetY = el.getBoundingClientRect().top + window.scrollY - navHeight;
          window.scrollTo({ top: targetY, behavior: 'smooth' });
        }
      } else {
        // On another page, navigate to home with hash
        navigate(`/#${targetId}`);
      }
    } else {
      navigate(path);
    }
  };

  return (
    <nav
      className={`fullscreen-nav ${isOpen && !isAnimatingOut ? 'fullscreen-nav--open' : ''} ${
        isAnimatingOut ? 'fullscreen-nav--closing' : ''
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="Maison Editorial Navigation"
    >
      <div className="fullscreen-nav__backdrop" onClick={onClose} />

      <div className="fullscreen-nav__stage">
        {/* Header Masthead Row */}
        <header className="fullscreen-nav__header">
          {/* Left Close Trigger */}
          <button
            ref={closeButtonRef}
            className="fullscreen-nav__close-btn pressable"
            onClick={onClose}
            aria-label="Close Navigation"
          >
            <X size={18} strokeWidth={1.5} className="fullscreen-nav__close-icon" />
            <span className="fullscreen-nav__close-text">Close</span>
          </button>

          {/* Center Brand Wordmark */}
          <div className="fullscreen-nav__center">
            <Link
              to="/"
              className="fullscreen-nav__logo"
              onClick={() => handleNavigate('/')}
              aria-label="NAYAB Home"
            >
              NAYAB
            </Link>
          </div>

          {/* Right Bag Control */}
          <div className="fullscreen-nav__header-right">
            <button
              className="fullscreen-nav__header-bag pressable"
              onClick={() => {
                onClose();
                onOpenBag();
              }}
              aria-label={`Open Acquisition Bag (${itemCount})`}
            >
              <ShoppingBag size={15} strokeWidth={1.5} />
              <span>Bag ({itemCount})</span>
            </button>
          </div>
        </header>

        {/* Main 60/40 Asymmetric Body */}
        <div className="fullscreen-nav__main">
          {/* Left Column: Primary Links + Utilities */}
          <div className="fullscreen-nav__left-col">
            {/* Primary Chapter Links */}
            <ul className="fullscreen-nav__primary-list" role="list">
              {primaryNavItems.map((item) => {
                const isSelected = activePreview === item.previewKey;

                return (
                  <li key={item.num} className="fullscreen-nav__primary-item">
                    <button
                      type="button"
                      className={`fullscreen-nav__primary-link ${
                        isSelected ? 'fullscreen-nav__primary-link--active' : ''
                      }`}
                      onMouseEnter={() => setActivePreview(item.previewKey)}
                      onFocus={() => setActivePreview(item.previewKey)}
                      onClick={() => handleNavigate(item.path, item.targetId)}
                    >
                      <span className="fullscreen-nav__num">{item.num}</span>
                      <span className="fullscreen-nav__title">{item.title}</span>
                    </button>
                  </li>
                );
              })}
            </ul>

            {/* Separated Utility Navigation */}
            <div className="fullscreen-nav__utilities">
              <span className="eyebrow fullscreen-nav__utility-eyebrow">Client Services</span>
              <div className="fullscreen-nav__utility-grid">
                <Link
                  to={user ? '/account' : '/login'}
                  className="fullscreen-nav__utility-link"
                  onClick={onClose}
                >
                  <User size={14} strokeWidth={1.5} />
                  <span>{user ? `Client Profile (${user.name.split(' ')[0]})` : 'Client Sign In / Register'}</span>
                </Link>

                <Link
                  to="/wishlist"
                  className="fullscreen-nav__utility-link"
                  onClick={onClose}
                >
                  <Heart size={14} strokeWidth={1.5} />
                  <span>Curated Wishlist</span>
                </Link>

                <button
                  type="button"
                  className="fullscreen-nav__utility-link pressable"
                  onClick={() => {
                    onClose();
                    onOpenSearch();
                  }}
                >
                  <Search size={14} strokeWidth={1.5} />
                  <span>Search Timepieces</span>
                </button>

                <button
                  type="button"
                  className="fullscreen-nav__utility-link pressable"
                  onClick={() => {
                    onClose();
                    onOpenBag();
                  }}
                >
                  <ShoppingBag size={14} strokeWidth={1.5} />
                  <span>Acquisition Bag ({itemCount})</span>
                </button>
              </div>
            </div>

            {/* Subtle Provenance Signature */}
            <footer className="fullscreen-nav__provenance">
              <p className="fullscreen-nav__provenance-text">
                NAYAB · FINE WATCHMAKING FROM PAKISTAN
              </p>
            </footer>
          </div>

          {/* Right Column: Dynamic Editorial Campaign Preview */}
          <div className="fullscreen-nav__right-col" aria-hidden="true">
            <div className="fullscreen-nav__preview-card" key={activePreview}>
              <div className="fullscreen-nav__preview-media">
                <img
                  src={currentPreview.image}
                  alt={currentPreview.title}
                  className="fullscreen-nav__preview-img"
                />
                <div className="fullscreen-nav__preview-overlay" />
              </div>

              <div className="fullscreen-nav__preview-info">
                <span className="eyebrow fullscreen-nav__preview-eyebrow">
                  {currentPreview.eyebrow}
                </span>
                <h3 className="fullscreen-nav__preview-title">
                  {currentPreview.title}
                </h3>
                <button
                  type="button"
                  className="fullscreen-nav__preview-cta"
                  onClick={() => {
                    const matchedItem = primaryNavItems.find(
                      (item) => item.previewKey === activePreview
                    );
                    handleNavigate(
                      currentPreview.ctaPath,
                      matchedItem?.isAnchor ? matchedItem.targetId : undefined
                    );
                  }}
                >
                  {currentPreview.ctaText} <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
