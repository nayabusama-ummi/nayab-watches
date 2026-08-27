import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
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

  const { openBag, itemCount } = useCart();
  const location = useLocation();

  const isHomePage = location.pathname === '/';

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
    ? 'luxury-navbar--hero'
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

          {/* RIGHT: Minimal Search & Bag Utilities */}
          <div className="luxury-navbar__right">
            <button
              className="luxury-navbar__utility-btn pressable"
              onClick={() => setIsSearchOpen(true)}
              aria-label="Search Timepieces"
            >
              <span className="luxury-navbar__utility-text">Search</span>
            </button>

            <button
              className="luxury-navbar__utility-btn pressable"
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
