import React from 'react';
import './SectionTransition.css';

export const SectionTransition: React.FC = () => {
  return (
    <section className="section-transition theme-ivory" aria-label="Atelier Introduction">
      <div className="container text-center">
        <div className="section-transition__content">
          <span className="eyebrow section-transition__eyebrow">The Collection</span>
          <h2 className="display-1 section-transition__title">
            Timepieces for<br />a lifetime.
          </h2>
          <p className="body-lead section-transition__lead">
            Shaped by patience, manual discipline, and uncompromised metallurgy. Each NAYAB timepiece is conceived as an inheritance of quiet authority.
          </p>
          <div className="section-transition__divider" />
        </div>
      </div>
    </section>
  );
};
