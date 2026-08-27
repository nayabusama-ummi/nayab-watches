import React from 'react';
import { EditorialButton } from '../common/EditorialButton';
import './ExplodedViewSection.css';

export const ExplodedViewSection: React.FC = () => {
  const specs = [
    { label: 'Bezel & Crystal', value: 'Domed sapphire with dual anti-glare' },
    { label: 'Dial Architecture', value: 'Midnight-blue textured Clous de Paris' },
    { label: 'Movement Core', value: 'Calibre N-01 Micro-Rotor Automatic' },
    { label: 'Monocoque Case', value: 'Grade 5 Titanium satin and mirror-bevelled' },
    { label: 'Integrated Bracelet', value: 'Articulated link system with invisible clasp' },
  ];

  return (
    <section className="exploded-section section-padding theme-black">
      <div className="container">
        {/* Header */}
        <div className="exploded-section__header">
          <span className="eyebrow">Horological Anatomy</span>
          <h2 className="display-1 exploded-section__title">
            Every fraction<br />has a purpose.
          </h2>
          <p className="body-lead exploded-section__subtitle">
            A mechanical architecture composed to disappear once assembled.
          </p>
        </div>

        {/* Large Exploded Visual Stage */}
        <div className="exploded-section__stage">
          <div className="exploded-section__media">
            <img
              src="/images/meridian-exploded.png"
              alt="NAYAB Meridian 41 exploded component architecture"
              className="exploded-section__img"
              loading="lazy"
            />
          </div>

          {/* Typographic Annotation Callouts */}
          <div className="exploded-section__annotations">
            {specs.map((item, idx) => (
              <div key={idx} className="exploded-section__annotation-item">
                <span className="exploded-section__annotation-num">0{idx + 1}</span>
                <div className="exploded-section__annotation-text">
                  <span className="spec-label">{item.label}</span>
                  <span className="spec-value exploded-section__annotation-val">
                    {item.value}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer CTA */}
        <div className="exploded-section__footer">
          <EditorialButton
            to="/watches/meridian-41"
            variant="outline"
            size="lg"
          >
            Explore Meridian 41 Engineering
          </EditorialButton>
        </div>
      </div>
    </section>
  );
};
