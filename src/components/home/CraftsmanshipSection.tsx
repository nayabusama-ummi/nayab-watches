import React from 'react';
import { EditorialButton } from '../common/EditorialButton';
import './CraftsmanshipSection.css';

export const CraftsmanshipSection: React.FC = () => {
  const pillars = [
    { title: 'Hand-Finished Bridges', desc: 'Each bridge is manually chamfered with gentian wood and diamond paste to reveal crisp anglage bevels.' },
    { title: 'Mirror-Polished Bevels', desc: 'Case surfaces alternate between hand-applied satin brushing and distortion-free mirror-polished facets.' },
    { title: 'Individually Adjusted Calibres', desc: 'Every escapement and balance wheel is regulated across five positions by master artisans in Lahore.' }
  ];

  return (
    <section id="craftsmanship" className="craftsmanship section-padding theme-black">
      <div className="container">
        <div className="craftsmanship__grid">
          {/* Left: Disciplined B&W Photography Grid */}
          <div className="craftsmanship__media-col">
            <div className="craftsmanship__main-frame">
              <img
                src="/images/watchmaker-atelier.png"
                alt="Watchmaker hand-adjusting movement bridge at the NAYAB atelier, Lahore"
                className="craftsmanship__img"
                loading="lazy"
                width="700"
                height="800"
              />
              <span className="craftsmanship__caption">
                Movement assembly at the NAYAB atelier, Lahore.
              </span>
            </div>

            <div className="craftsmanship__secondary-frame">
              <img
                src="/images/craftsmanship-macro.png"
                alt="Macro detail of hand-polished anglage movement finishing"
                className="craftsmanship__img hover-zoom-img"
                loading="lazy"
                width="400"
                height="260"
              />
            </div>
          </div>

          {/* Right: Large Statement & Craftsmanship Pillars */}
          <div className="craftsmanship__content-col">
            <span className="eyebrow">The Art of Watchmaking</span>
            
            <h2 className="display-1 craftsmanship__statement">
              Precision begins<br />
              where machines stop.
            </h2>

            <p className="body-lead craftsmanship__lead">
              No automated instrument can replace the instinctive touch of an artisan filing an interior angle or testing the balance of an escapement.
            </p>

            <div className="craftsmanship__pillars">
              {pillars.map((p, idx) => (
                <div key={idx} className="craftsmanship__pillar">
                  <h3 className="craftsmanship__pillar-title">{p.title}</h3>
                  <p className="body-fine craftsmanship__pillar-desc">{p.desc}</p>
                </div>
              ))}
            </div>

            <div className="craftsmanship__cta">
              <EditorialButton
                to="/#archive"
                variant="outline"
                size="md"
              >
                Discover Atelier Philosophy
              </EditorialButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
