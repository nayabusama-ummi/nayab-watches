import React from 'react';
import { Link } from 'react-router-dom';
import { COLLECTIONS } from '../../data/collections';
import { ArrowRight } from 'lucide-react';
import './CollectionsSection.css';

export const CollectionsSection: React.FC = () => {
  const row1Collections = COLLECTIONS.slice(0, 2); // MEHR, INDUS
  const row2Collections = COLLECTIONS.slice(2, 5); // KARAKORAM, NOOR, ZAR

  return (
    <section id="collections" className="collections-section section-padding theme-ivory">
      <div className="container">
        {/* Section Header */}
        <header className="collections-section__header">
          <div className="collections-section__header-left">
            <span className="eyebrow">The Five Portfolios</span>
            <h2 className="display-1 collections-section__title">
              Featured Collections
            </h2>
          </div>
          <div className="collections-section__header-right">
            <p className="body-standard collections-section__intro">
              Five distinct horological worlds rooted in Pakistani craftsmanship, material artistry, and mechanical permanence.
            </p>
          </div>
        </header>

        {/* Row 1: Large Flagship Portfolios (MEHR & INDUS) */}
        <div className="collections-section__row-top">
          {row1Collections.map((col) => (
            <article key={col.id} className={`collection-card collection-card--large collection-card--${col.slug}`}>
              <Link to={`/collections/${col.slug}`} className="collection-card__link" aria-label={`Explore ${col.name} Collection`}>
                <div className="collection-card__media">
                  <img
                    src={col.heroImage}
                    alt={col.name}
                    className="collection-card__img"
                    loading="lazy"
                    width="800"
                    height="500"
                  />
                  <div className="collection-card__overlay" />
                </div>

                <div className="collection-card__content">
                  <span className="collection-card__tagline">{col.tagline}</span>
                  <h3 className="display-2 collection-card__title">{col.name}</h3>
                  <p className="collection-card__desc">{col.description}</p>
                  <span className="collection-card__action">
                    Explore Collection <ArrowRight size={14} className="collection-card__arrow" />
                  </span>
                </div>
              </Link>
            </article>
          ))}
        </div>

        {/* Row 2: Secondary Portfolios (KARAKORAM, NOOR, ZAR) */}
        <div className="collections-section__row-bottom">
          {row2Collections.map((col) => (
            <article key={col.id} className={`collection-card collection-card--standard collection-card--${col.slug}`}>
              <Link to={`/collections/${col.slug}`} className="collection-card__link" aria-label={`Explore ${col.name} Collection`}>
                <div className="collection-card__media">
                  <img
                    src={col.heroImage}
                    alt={col.name}
                    className="collection-card__img"
                    loading="lazy"
                    width="500"
                    height="625"
                  />
                  <div className="collection-card__overlay" />
                </div>

                <div className="collection-card__content">
                  <span className="collection-card__tagline">{col.tagline}</span>
                  <h3 className="display-2 collection-card__title">{col.name}</h3>
                  <p className="collection-card__desc">{col.description}</p>
                  <span className="collection-card__action">
                    Explore Collection <ArrowRight size={14} className="collection-card__arrow" />
                  </span>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
