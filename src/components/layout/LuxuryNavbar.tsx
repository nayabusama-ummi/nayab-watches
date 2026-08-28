import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { SearchDrawer } from '../search/SearchDrawer';
import { BagDrawer } from '../cart/BagDrawer';
import { FullScreenNav } from './FullScreenNav';
import './LuxuryNavbar.css';

export const LuxuryNavbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSectionTheme, setActiveSectionTheme] = useState<'dark' | 'light'>('dark');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const { user } = useAuth();
  const { openBag, itemCount } = useCart();
  const location = useLocation();

  const isHomePage = location.pathname === '/';

  // Set the correct initial theme immediately on route change (before any scroll)
  useEffect(() => {
    if (!isHomePage) {
      setActiveSectionTheme('light');
    } else {
      setActiveSectionTheme('dark');
    }
  }, [isHomePage, location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 40);

      // If not on home page, default based on page theme
      if (!isHomePage) {
        setActiveSectionTheme('light');
        return;
      }

      // Check current section under navbar
      const sections = document.querySelectorAll('section[id], section.section-transition, div.cinematic-container, footer');
      const navCenterY = 50;

      let currentTheme: 'dark' | 'light' = 'dark';

      sections.forEach((sec) => {
        const rect = sec.getBoundingClientRect();
        if (rect.top <= navCenterY && rect.bottom >= navCenterY) {
          if (sec.classList.contains('theme-ivory') || sec.classList.contains('theme-ivory-light')) {
            currentTheme = 'light';
          } else if (sec.classList.contains('theme-black') || sec.classList.contains('cinematic-container')) {
            currentTheme = 'dark';
          }
        }
      });

      setActiveSectionTheme(currentTheme);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isHomePage, location.pathname]);

  // Close overlays on route changes
  useEffect(() => {
    setIsMenuOpen(false);
    setIsSearchOpen(false);
  }, [location.pathname]);

  const navStateClass = !isScrolled
    ? (activeSectionTheme === 'light' ? 'luxury-navbar--static-light' : 'luxury-navbar--hero')
    : activeSectionTheme === 'light'
    ? 'luxury-navbar--scrolled-light'
    : 'luxury-navbar--scrolled-dark';

  return (
    <>
      <header
        className={`luxury-navbar ${navStateClass}`}
        data-nav-theme={activeSectionTheme}
        role="banner"
      >
        <div className="luxury-navbar__grid">
          {/* LEFT: Refined Custom Menu Trigger */}
          <div className="luxury-navbar__left">
            <button
              className="luxury-navbar__menu-trigger pressable"
              onClick={() => setIsMenuOpen(true)}
              aria-label="Open Full-Screen Navigation Menu"
              aria-haspopup="dialog"
              aria-expanded={isMenuOpen}
            >
              <span className="luxury-navbar__menu-lines" aria-hidden="true">
                <span className="luxury-navbar__menu-line luxury-navbar__menu-line--top" />
                <span className="luxury-navbar__menu-line luxury-navbar__menu-line--bottom" />
              </span>
              <span className="luxury-navbar__menu-text">Menu</span>
            </button>
          </div>

          {/* CENTER: Optically Centered NAYAB Wordmark */}
          <div className="luxury-navbar__center">
            <Link to="/" className="luxury-navbar__logo" aria-label="NAYAB Fine Watchmaking">
              NAYAB
            </Link>
          </div>

          {/* RIGHT: Timepieces Icon, Search, Client Portal / Sign In & Bag Utilities */}
          <div className="luxury-navbar__right">
            {/* Watch Icon: Direct jump to Timepieces Catalogue */}
            <Link
              to="/watches"
              className="luxury-navbar__watch-icon-btn pressable"
              aria-label="Explore Timepieces Catalogue"
              title="All Timepieces"
            >
              <svg
                className="luxury-navbar__watch-icon-svg"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M7 17L7.48551 19.4276C7.66878 20.3439 7.76041 20.8021 7.99964 21.1448C8.2106 21.447 8.50097 21.685 8.83869 21.8326C9.22166 22 9.6889 22 10.6234 22H13.3766C14.3111 22 14.7783 22 15.1613 21.8326C15.499 21.685 15.7894 21.447 16.0004 21.1448C16.2396 20.8021 16.3312 20.3439 16.5145 19.4276L17 17M7 7L7.48551 4.57243C7.66878 3.6561 7.76041 3.19793 7.99964 2.85522C8.2106 2.55301 8.50097 2.31497 8.83869 2.16737C9.22166 2 9.6889 2 10.6234 2H13.3766C14.3111 2 14.7783 2 15.1613 2.16737C15.499 2.31497 15.7894 2.55301 16.0004 2.85522C16.2396 3.19793 16.3312 3.6561 16.5145 4.57243L17 7M12 9V12L13.5 13.5M19 12C19 15.866 15.866 19 12 19C8.13401 19 5 15.866 5 12C5 8.13401 8.13401 5 12 5C15.866 5 19 8.13401 19 12Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>

            <button
              className="luxury-navbar__utility-btn pressable"
              onClick={() => setIsSearchOpen(true)}
              aria-label="Search Timepieces"
            >
              <span className="luxury-navbar__utility-text">Search</span>
            </button>

            {user?.role === 'ADMIN' && (
              <Link
                to="/admin"
                className="luxury-navbar__utility-btn luxury-navbar__admin-badge pressable"
                aria-label="Admin Atelier Console"
              >
                <span className="luxury-navbar__utility-text">Admin</span>
              </Link>
            )}

            <Link
              to={user ? '/account' : '/login'}
              className="luxury-navbar__utility-btn pressable"
              aria-label={user ? `Client Account (${user.name})` : 'Client Sign In'}
            >
              <span className="luxury-navbar__utility-text">
                {user ? 'Account' : 'Sign In'}
              </span>
            </Link>

            <button
              className="luxury-navbar__utility-btn luxury-navbar__bag-btn pressable"
              onClick={openBag}
              aria-label={`Open Acquisition Bag (${itemCount} items)`}
            >
              <span className="luxury-navbar__utility-text">
                Bag ({itemCount})
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Full-Screen Maison Navigation Overlay */}
      <FullScreenNav
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenBag={openBag}
        itemCount={itemCount}
      />

      {/* Search Drawer Overlay */}
      <SearchDrawer isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Slide-Over Bag Drawer */}
      <BagDrawer />
    </>
  );
};
