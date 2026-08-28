import React from 'react';
import { Link } from 'react-router-dom';
import { EditorialButton } from '../common/EditorialButton';
import { PRODUCTS } from '../../data/products';
import './NewModelsSection.css';

export const NewModelsSection: React.FC = () => {
  const sovereign = PRODUCTS.find((p) => p.slug === 'sovereign-39');
  const meridian = PRODUCTS.find((p) => p.slug === 'meridian-41');

  return (
    <section id="new-models" className="new-models section-padding theme-ivory">
      <div className="container">
        {/* Section Header */}
        <header className="new-models__header">
          <div className="new-models__header-left">
            <span className="eyebrow">Flagship Creations</span>
            <h2 className="display-1 new-models__title">New Models 2026</h2>
          </div>
          <div className="new-models__header-right">
            <p className="body-standard new-models__intro">
              Two distinct philosophical expressions of contemporary fine watchmaking. The classical warmth of hand-enamelled 18k rose gold meets the structural precision of grade 5 titanium.
            </p>
          </div>
        </header>

        {/* 2-Column Split Showcase with Equal Image Containers */}
        <div className="new-models__grid">
          {/* Left: Sovereign 39 (MEHR Collection) */}
          {sovereign && (
            <article className="new-models__card new-models__card--sovereign">
              <Link to={`/watches/${sovereign.slug}`} className="new-models__card-media" aria-label={`View ${sovereign.name}`}>
                <div className="new-models__media-frame">
                  <img
                    src={sovereign.heroImage}
                    alt={sovereign.name}
                    className="new-models__img"
                    loading="lazy"
                    width="500"
                    height="600"
                  />
                </div>
              </Link>

              <div className="new-models__card-info">
                <div className="new-models__card-meta">
                  <span className="new-models__collection">{sovereign.collection}</span>
                  <h3 className="display-2 new-models__name">{sovereign.name}</h3>
                  <p className="new-models__spec">
                    {sovereign.material} · {sovereign.size}
                  </p>
                </div>
                <p className="body-standard new-models__desc">{sovereign.description}</p>
                <div className="new-models__card-footer">
                  <span className="new-models__price">{sovereign.formattedPrice}</span>
                  <EditorialButton to={`/watches/${sovereign.slug}`} variant="primary" size="md">
                    Discover Timepiece
                  </EditorialButton>
                </div>
              </div>
            </article>
          )}

          {/* Right: Meridian 41 (INDUS Collection) */}
          {meridian && (
            <article className="new-models__card new-models__card--meridian">
              <Link to={`/watches/${meridian.slug}`} className="new-models__card-media" aria-label={`View ${meridian.name}`}>
                <div className="new-models__media-frame">
                  <img
                    src={meridian.heroImage}
                    alt={meridian.name}
                    className="new-models__img"
                    loading="lazy"
                    width="500"
                    height="600"
                  />
                </div>
              </Link>

              <div className="new-models__card-info">
                <div className="new-models__card-meta">
                  <span className="new-models__collection">{meridian.collection}</span>
                  <h3 className="display-2 new-models__name">{meridian.name}</h3>
                  <p className="new-models__spec">
                    {meridian.material} · {meridian.size}
                  </p>
                </div>
                <p className="body-standard new-models__desc">{meridian.description}</p>
                <div className="new-models__card-footer">
                  <span className="new-models__price">{meridian.formattedPrice}</span>
                  <EditorialButton to={`/watches/${meridian.slug}`} variant="primary" size="md">
                    Discover Timepiece
                  </EditorialButton>
                </div>
              </div>
            </article>
          )}
        </div>
      </div>
    </section>
  );
};
