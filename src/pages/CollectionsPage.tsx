import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCollections } from '../hooks/useCollections';
import { SeoHead } from '../components/common/SeoHead';
import { ArrowRight } from 'lucide-react';
import './Pages.css';

export const CollectionsPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data, isLoading } = useCollections();
  const collections = data?.collections ?? [];

  return (
    <main className="page-container theme-ivory">
      <SeoHead
        title="Collections & Portfolios | MEHR, INDUS, NOOR, KARAKORAM, ZAR"
        description="Explore the five horological portfolios of NAYAB. Hand-finished dress watches, titanium architectural chronographs, complications, and high-jewelry timepieces."
        canonicalPath="/collections"
        schema={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'NAYAB Collections & Portfolios',
          url: 'https://nayabwatches.com/collections',
          description: 'Five distinct horological expressions rooted in contemporary Pakistani craftsmanship.',
        }}
      />
      <div className="container section-padding">
        {/* Editorial Masthead */}
        <header className="page-header">
          <span className="eyebrow">Haute Horlogerie Portfolios</span>
          <h1 className="display-1 page-title">The Five Portfolios</h1>
          <p className="body-lead page-subtitle">
            Five distinct horological expressions rooted in contemporary Pakistani craftsmanship, Mughal geometric discipline, and mechanical permanence.
          </p>
        </header>

        {/* Collections Overview */}
        {isLoading ? (
          <div className="page-loading">
            <span className="page-loading__text">Loading collections...</span>
          </div>
        ) : (
          <div className="collections-editorial-grid">
            {collections.map((col, index) => {
              const isHeroRow = index < 2; // MEHR and INDUS featured large

              return (
                <article
                  key={col.id}
                  className={`collection-editorial-card ${
                    isHeroRow ? 'collection-editorial-card--large' : 'collection-editorial-card--standard'
                  }`}
                >
                  <Link
                    to={`/collections/${col.slug}`}
                    className="collection-editorial-card__link"
                    aria-label={`Explore ${col.name} Collection`}
                  >
                    <div className="collection-editorial-card__media">
                      <img
                        src={col.heroImage || '/images/sovereign-39-front.png'}
                        alt={`${col.name} collection timepieces`}
                        className="collection-editorial-card__img"
                        loading="lazy"
                      />
                      <div className="collection-editorial-card__overlay" />
                    </div>

                    <div className="collection-editorial-card__content">
                      <span className="collection-editorial-card__eyebrow">
                        {col.tagline || 'NAYAB Fine Watchmaking'}
                      </span>
                      <h2 className="display-2 collection-editorial-card__name">
                        {col.name}
                      </h2>
                      <p className="body-standard collection-editorial-card__desc">
                        {col.description}
                      </p>
                      <div className="collection-editorial-card__footer">
                        <span className="collection-editorial-card__count">
                          {col.productCount || 1} Reference{col.productCount !== 1 ? 's' : ''}
                        </span>
                        <span className="collection-editorial-card__cta">
                          Discover Portfolio <ArrowRight size={14} className="collection-editorial-card__arrow" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
};
