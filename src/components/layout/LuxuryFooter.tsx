import React from 'react';
import { Link } from 'react-router-dom';
import './LuxuryFooter.css';

export const LuxuryFooter: React.FC = () => {
  return (
    <footer className="luxury-footer theme-black" role="contentinfo">
      <div className="container">
        {/* Navigation Grid */}
        <div className="luxury-footer__grid">
          <div className="luxury-footer__col">
            <h4 className="luxury-footer__heading">Portfolios</h4>
            <ul className="luxury-footer__list">
              <li><Link to="/collections" className="luxury-footer__link">All Collections</Link></li>
              <li><Link to="/collections/mehr" className="luxury-footer__link">MEHR · Dress</Link></li>
              <li><Link to="/collections/indus" className="luxury-footer__link">INDUS · Titanium</Link></li>
              <li><Link to="/collections/noor" className="luxury-footer__link">NOOR · Women's</Link></li>
              <li><Link to="/collections/karakoram" className="luxury-footer__link">KARAKORAM · Sport</Link></li>
              <li><Link to="/collections/zar" className="luxury-footer__link">ZAR · Complications</Link></li>
            </ul>
          </div>

          <div className="luxury-footer__col">
            <h4 className="luxury-footer__heading">The House</h4>
            <ul className="luxury-footer__list">
              <li><a href="/#origin" className="luxury-footer__link">Origin & Heritage</a></li>
              <li><a href="/#craftsmanship" className="luxury-footer__link">Art of Watchmaking</a></li>
              <li><a href="/#archive" className="luxury-footer__link">Historical Archive</a></li>
              <li><Link to="/collections/zar" className="luxury-footer__link">Lahore High Complication Atelier</Link></li>
            </ul>
          </div>

          <div className="luxury-footer__col">
            <h4 className="luxury-footer__heading">Client Services</h4>
            <ul className="luxury-footer__list">
              <li><a href="#contact" className="luxury-footer__link">Concierge & Inquiries</a></li>
              <li><a href="#shipping" className="luxury-footer__link">Insured Worldwide Delivery</a></li>
              <li><a href="#care" className="luxury-footer__link">Maintenance & Restoration</a></li>
              <li><a href="#certificate" className="luxury-footer__link">Certificate of Provenance</a></li>
            </ul>
          </div>

          <div className="luxury-footer__col">
            <h4 className="luxury-footer__heading">Client Portal</h4>
            <ul className="luxury-footer__list">
              <li><Link to="/login" className="luxury-footer__link">Client Sign In</Link></li>
              <li><Link to="/register" className="luxury-footer__link">Register Account</Link></li>
              <li><Link to="/account" className="luxury-footer__link">Client Dashboard</Link></li>
              <li><Link to="/wishlist" className="luxury-footer__link">Curated Wishlist</Link></li>
              <li><Link to="/cart" className="luxury-footer__link">Acquisition Bag</Link></li>
            </ul>
          </div>
        </div>

        {/* Fictional Brand Disclaimer */}
        <div className="luxury-footer__disclaimer">
          <p>
            NAYAB is a contemporary Pakistani luxury horology house conceptualized as an exploration of quiet luxury, Pakistani craftsmanship traditions, and digital design engineering.
          </p>
        </div>

        {/* Massive Wordmark */}
        <div className="luxury-footer__wordmark-container">
          <span className="luxury-footer__wordmark">NAYAB</span>
        </div>

        {/* Bottom Bar */}
        <div className="luxury-footer__bottom">
          <p className="luxury-footer__copyright">
            © 2026 NAYAB Fine Watchmaking. All rights reserved.
          </p>
          <div className="luxury-footer__legal">
            <a href="#privacy" className="luxury-footer__legal-link">Privacy Policy</a>
            <a href="#terms" className="luxury-footer__legal-link">Terms of Service</a>
            <a href="#provenance" className="luxury-footer__legal-link">Lahore, Pakistan</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
