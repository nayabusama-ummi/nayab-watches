import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, SlidersHorizontal } from 'lucide-react';
import './FloatingInventoryCta.css';

export const FloatingInventoryCta: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Find the transition section where cinematic intro ends
      const transitionEl = document.querySelector('.section-transition');
      const footerEl = document.querySelector('.luxury-footer');

      if (!transitionEl) {
        // Fallback based on scroll depth
        const scrollY = window.scrollY;
        const pageHeight = document.documentElement.scrollHeight;
        setIsVisible(scrollY > 600 && scrollY < pageHeight - 1200);
        return;
      }

      const transitionRect = transitionEl.getBoundingClientRect();
      const footerRect = footerEl ? footerEl.getBoundingClientRect() : null;

      // Visible once top of transition section approaches or passes top of viewport
      const enteredEditorial = transitionRect.top <= window.innerHeight * 0.75;
      const reachedFooter = footerRect ? footerRect.top <= window.innerHeight : false;

      setIsVisible(enteredEditorial && !reachedFooter);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className={`floating-inventory-pill-wrap ${isVisible ? 'floating-inventory-pill-wrap--visible' : ''}`}
      aria-hidden={!isVisible}
    >
      <Link
        to="/watches"
        className="floating-inventory-pill pressable"
        tabIndex={isVisible ? 0 : -1}
        aria-label="View All NAYAB Timepieces"
      >
        <span className="floating-inventory-pill__icon" aria-hidden="true">
          <SlidersHorizontal size={14} />
        </span>
        <span className="floating-inventory-pill__text">All Timepieces</span>
        <span className="floating-inventory-pill__arrow" aria-hidden="true">
          <ArrowRight size={13} />
        </span>
      </Link>
    </div>
  );
};
