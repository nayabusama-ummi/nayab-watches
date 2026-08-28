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
            <h4 className="luxury-footer__heading">Timepieces</h4>
            <ul className="luxury-footer__list">
              <li><Link to="/watches" className="luxury-footer__link">All 7 Timepieces</Link></li>
              <li><Link to="/watches/sovereign-39" className="luxury-footer__link">Sovereign 39 (Rose Gold)</Link></li>
              <li><Link to="/watches/meridian-41" className="luxury-footer__link">Meridian 41 (Titanium GMT)</Link></li>
              <li><Link to="/watches/zar-perpetual" className="luxury-footer__link">Zar Perpetual Calendar</Link></li>
              <li><Link to="/watches/noor-32" className="luxury-footer__link">Noor 32 (Diamond Pavé)</Link></li>
              <li><Link to="/watches/indus-39" className="luxury-footer__link">Indus 39 (High-Beat)</Link></li>
            </ul>
          </div>

          <div className="luxury-footer__col">
            <h4 className="luxury-footer__heading">The House</h4>
            <ul className="luxury-footer__list">
              <li><a href="/#origin" className="luxury-footer__link">Origin & Heritage</a></li>
              <li><a href="/#craftsmanship" className="luxury-footer__link">Art of Watchmaking</a></li>
              <li><a href="/#archive" className="luxury-footer__link">Historical Archive</a></li>
              <li><Link to="/collections/zar" className="luxury-footer__link">Lahore High Complications</Link></li>
              <li><Link to="/contact" className="luxury-footer__link">Concierge Inquiries</Link></li>
            </ul>
          </div>

          <div className="luxury-footer__col">
            <h4 className="luxury-footer__heading">Client & Social</h4>
            <ul className="luxury-footer__list">
              <li><Link to="/account" className="luxury-footer__link">Client Dashboard</Link></li>
              <li><Link to="/wishlist" className="luxury-footer__link">Curated Wishlist</Link></li>
              <li><Link to="/cart" className="luxury-footer__link">Acquisition Bag</Link></li>
              <li>
                <a
                  href="https://instagram.com/nayabwatches"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="luxury-footer__link"
                >
                  Instagram · @nayabwatches ↗
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/nayabusama-ummi/nayab-watches"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="luxury-footer__link"
                >
                  GitHub Atelier Repo ↗
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Fictional Brand Disclaimer & Content */}
        <div className="luxury-footer__disclaimer">
          <p>
            NAYAB is an independent haute horlogerie house crafting contemporary Pakistani mechanical timepieces in Lahore, Pakistan. Built on regional metallurgy, in-house calibres, and generational permanence.
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
