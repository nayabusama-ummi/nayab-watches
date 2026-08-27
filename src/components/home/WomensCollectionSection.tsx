import React from 'react';
import { Link } from 'react-router-dom';
import { EditorialButton } from '../common/EditorialButton';
import './WomensCollectionSection.css';

export const WomensCollectionSection: React.FC = () => {
  return (
    <section id="womens" className="womens-section section-padding theme-ivory-light">
      <div className="container">
        <div className="womens-section__layout">
          {/* Left: Isolated Women's Timepiece Photography */}
          <div className="womens-section__media">
            <Link to="/watches/noor-32" className="womens-section__img-frame" aria-label="View NAYAB NOOR 32">
              <img
                src="/images/noor-32-women.webp"
                alt="NAYAB NOOR 32 mm mechanical dress watch in 18k Champagne Gold"
                className="womens-section__img hover-zoom-img"
                loading="lazy"
                width="600"
                height="750"
              />
              <span className="womens-section__badge">NOOR 32 · 18k Champagne Gold</span>
            </Link>
          </div>

          {/* Right: Editorial Narrative */}
          <div className="womens-section__content">
            <span className="eyebrow">NOOR Collection</span>
            <h2 className="display-1 womens-section__title">
              Grace,<br />measured precisely.
            </h2>
            <p className="body-lead womens-section__lead">
              A smaller expression of the NAYAB language — balanced proportions, mechanical precision and quiet presence.
            </p>
            <p className="body-standard womens-section__desc">
              Housed in a slender 32 mm case crafted from 18k champagne gold, NOOR 32 pairs an opaline ivory dial with an ultra-thin manual-wind calibre. Proportioned for generational elegance without ornamental cliché.
            </p>
            <div className="womens-section__action">
              <EditorialButton
                to="/collections/noor"
                variant="primary"
                size="md"
              >
                Explore NOOR
              </EditorialButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
