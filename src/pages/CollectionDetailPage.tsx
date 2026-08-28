import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCollection } from '../hooks/useCollections';
import { SeoHead } from '../components/common/SeoHead';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import './Pages.css';

export const CollectionDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [selectedMaterial, setSelectedMaterial] = useState<string>('all');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  const { data, isLoading, error } = useCollection(slug || '');
  const collection = data?.collection;

  if (isLoading) {
    return (
      <main className="page-container theme-ivory">
        <div className="container section-padding text-center">
          <div className="page-loading">
            <span className="page-loading__text">Loading portfolio details...</span>
          </div>
        </div>
      </main>
    );
  }

  if (error || !collection) {
    return (
      <main className="page-container theme-ivory">
        <div className="container section-padding text-center">
          <span className="eyebrow">Portfolio</span>
          <h1 className="display-1">Collection Not Found</h1>
          <p className="body-lead" style={{ marginTop: '1rem', marginBottom: '2rem' }}>
            The requested horology portfolio does not exist or has been archived.
          </p>
          <Link to="/collections" className="btn btn-secondary">
            Return to All Portfolios
          </Link>
        </div>
      </main>
    );
  }

  const products = collection.products ?? [];
  const filteredProducts = selectedMaterial === 'all'
    ? products
    : products.filter((p) => p.caseMaterial.toLowerCase().includes(selectedMaterial.toLowerCase()));

  // Available materials for subtle filter pills
  const materials = Array.from(new Set(products.map((p) => p.caseMaterial)));

  return (
    <main className="page-container theme-ivory">
      <SeoHead
        title={`${collection.name} Collection | Fine Watchmaking Portfolio`}
        description={collection.description || `${collection.name} Collection by NAYAB Fine Watchmaking.`}
        canonicalPath={`/collections/${collection.slug}`}
        image={collection.heroImage || '/images/sovereign-39-front.png'}
        schema={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: `${collection.name} Collection`,
          description: collection.description || `${collection.name} Collection by NAYAB Fine Watchmaking.`,
          url: `https://nayabwatches.com/collections/${collection.slug}`,
        }}
      />
      {/* Editorial Collection Hero */}
      <section className="collection-hero theme-black">
        <div className="container">
          <Link to="/collections" className="collection-hero__back-link">
            <ArrowLeft size={14} /> Back to Portfolios
          </Link>

          <div className="collection-hero__layout">
            <div className="collection-hero__content">
              <span className="eyebrow eyebrow-light">{collection.tagline || 'NAYAB Collection'}</span>
              <h1 className="display-hero collection-hero__title">{collection.name}</h1>
              <p className="body-lead collection-hero__lead">{collection.description}</p>
            </div>

            {collection.heroImage && (
              <div className="collection-hero__media">
                <img
                  src={collection.heroImage}
                  alt={`${collection.name} portfolio timepiece`}
                  className="collection-hero__img"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Product Grid Section */}
      <section className="container section-padding">
        {/* Subtle Material Filter (only if multiple materials exist) */}
        {materials.length > 1 && (
          <div className="collection-filters">
            <span className="collection-filters__label">Filter Material:</span>
            <div className="collection-filters__pills">
              <button
                className={`collection-filters__pill ${selectedMaterial === 'all' ? 'collection-filters__pill--active' : ''}`}
                onClick={() => setSelectedMaterial('all')}
              >
                All Materials ({products.length})
              </button>
              {materials.map((mat) => (
                <button
                  key={mat}
                  className={`collection-filters__pill ${selectedMaterial === mat ? 'collection-filters__pill--active' : ''}`}
                  onClick={() => setSelectedMaterial(mat)}
                >
                  {mat}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Luxury Product Grid */}
        <div className="collection-products-grid">
          {filteredProducts.map((product) => (
            <article key={product.id} className="luxury-product-card">
              <Link to={`/watches/${product.slug}`} className="luxury-product-card__media-link">
                <div className="luxury-product-card__thumb-frame">
                  <img
                    src={product.images[0]?.url || '/images/sovereign-39-front.png'}
                    alt={product.name}
                    className="luxury-product-card__img"
                    loading="lazy"
                  />
                  {product.newModel && (
                    <span className="luxury-product-card__badge">New Model 2026</span>
                  )}
                </div>
              </Link>

              <div className="luxury-product-card__info">
                <span className="luxury-product-card__ref">{product.reference}</span>
                <h3 className="luxury-product-card__title">
                  <Link to={`/watches/${product.slug}`}>{product.name}</Link>
                </h3>
                <p className="luxury-product-card__spec">
                  {product.caseMaterial} · {product.caseDiameter}
                </p>
                <p className="luxury-product-card__short-desc">
                  {product.shortDescription}
                </p>

                <div className="luxury-product-card__footer">
                  <span className="luxury-product-card__price">{product.formattedPrice}</span>
                  <Link to={`/watches/${product.slug}`} className="luxury-product-card__cta">
                    Discover <ArrowRight size={14} className="luxury-product-card__cta-arrow" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
};
