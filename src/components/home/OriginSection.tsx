import React from 'react';
import { EditorialButton } from '../common/EditorialButton';
import './OriginSection.css';

export const OriginSection: React.FC = () => {
  return (
    <section id="origin" className="origin-section section-padding-md theme-ivory">
      <div className="container">
        <div className="origin-section__grid">
          <div className="origin-section__content">
            <span className="eyebrow">Origin</span>
            <h2 className="display-1 origin-section__title">
              Designed from Pakistan.<br />
              Made for permanence.
            </h2>
            <p className="body-lead origin-section__lead">
              NAYAB is a contemporary Pakistani watch house exploring mechanical time through the country's traditions of precision craft, material artistry and architectural proportion.
            </p>
            <p className="body-standard origin-section__desc">
              Built with an old-world respect for manual horology. From our Lahore atelier, we unite regional metallurgical traditions and Mughal geometric discipline with high-precision mechanical watchmaking.
            </p>
            <div className="origin-section__actions">
              <EditorialButton to="/#craftsmanship" variant="text" size="md">
                Explore The Atelier
              </EditorialButton>
            </div>
          </div>

          <div className="origin-section__media">
            <div className="origin-section__img-frame">
              <img
                src="/images/watchmaker-atelier.png"
                alt="Movement assembly and hand-finishing at the NAYAB atelier, Lahore"
                className="origin-section__img"
                loading="lazy"
              />
              <span className="origin-section__caption">
                Movement assembly at the NAYAB atelier, Lahore.
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
