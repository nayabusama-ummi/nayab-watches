import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProduct, useProducts } from '../hooks/useProducts';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../hooks/useWishlist';
import { useAuth } from '../context/AuthContext';
import { Heart, ShieldCheck, Truck, Clock, ArrowRight, Check } from 'lucide-react';
import { EditorialButton } from '../components/common/EditorialButton';
import './Pages.css';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(undefined);
  const [isAdding, setIsAdding] = useState(false);
  const [addedNotice, setAddedNotice] = useState(false);

  const { isAuthenticated } = useAuth();
  const { addItem, openBag } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  useEffect(() => {
    window.scrollTo(0, 0);
    setSelectedImageIndex(0);
    setSelectedVariantId(undefined);
  }, [slug]);

  const { data, isLoading, error } = useProduct(slug || '');
  const product = data?.product;

  // Set default variant if variants exist
  useEffect(() => {
    if (product && product.variants?.length > 0 && !selectedVariantId) {
      setSelectedVariantId(product.variants[0].id);
    }
  }, [product, selectedVariantId]);

  // Fetch related products from same collection
  const { data: relatedData } = useProducts({
    collection: product?.collection.slug,
    limit: 3,
  });
  const relatedProducts = (relatedData?.products ?? []).filter((p) => p.slug !== product?.slug);

  if (isLoading) {
    return (
      <main className="page-container theme-ivory">
        <div className="container section-padding text-center">
          <div className="page-loading">
            <span className="page-loading__text">Loading timepiece specifications...</span>
          </div>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="page-container theme-ivory">
        <div className="container section-padding text-center">
          <span className="eyebrow">Haute Horlogerie</span>
          <h1 className="display-1">Timepiece Not Found</h1>
          <p className="body-lead" style={{ marginTop: '1rem', marginBottom: '2rem' }}>
            The requested reference could not be located in the atelier catalog.
          </p>
          <Link to="/collections" className="btn btn-secondary">
            Discover Collections
          </Link>
        </div>
      </main>
    );
  }

  const inWishlist = isInWishlist(product.id);
  const images = product.images?.length > 0 ? product.images : [{ id: '1', url: '/images/sovereign-39-front.png', alt: product.name, type: 'FRONT' as const, sortOrder: 1 }];
  const currentImage = images[selectedImageIndex] || images[0];

  const handleAddToBag = async () => {
    setIsAdding(true);
    try {
      await addItem(product.id, selectedVariantId, 1);
      setAddedNotice(true);
      setTimeout(() => setAddedNotice(false), 2400);
      openBag();
    } catch (e) {
      console.error('Failed to add timepiece to bag:', e);
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      // If not logged in, redirect to login with return path
      window.location.href = `/login?redirect=/watches/${product.slug}`;
      return;
    }

    if (inWishlist) {
      await removeFromWishlist(product.id);
    } else {
      await addToWishlist(product.id);
    }
  };

  return (
    <main className="pdp-page theme-ivory">
      {/* Breadcrumb Navigation */}
      <div className="container pdp-breadcrumb-container">
        <nav className="pdp-breadcrumb" aria-label="Breadcrumb">
          <Link to="/collections" className="pdp-breadcrumb__link">Collections</Link>
          <span className="pdp-breadcrumb__sep">/</span>
          <Link to={`/collections/${product.collection.slug}`} className="pdp-breadcrumb__link">
            {product.collection.name}
          </Link>
          <span className="pdp-breadcrumb__sep">/</span>
          <span className="pdp-breadcrumb__current">{product.name}</span>
        </nav>
      </div>

      {/* ABOVE THE FOLD: Gallery & Purchase Stage */}
      <section className="container pdp-stage">
        <div className="pdp-stage__grid">
          {/* Left: Multi-Angle Gallery Stage */}
          <div className="pdp-gallery">
            <div className="pdp-gallery__viewport">
              <img
                src={currentImage.url}
                alt={currentImage.alt || product.name}
                className="pdp-gallery__main-img"
              />
              <span className="pdp-gallery__view-type">
                {currentImage.type.replace('_', ' ')}
              </span>
            </div>

            {/* Thumbnail Selection */}
            {images.length > 1 && (
              <div className="pdp-gallery__thumbs" role="tablist" aria-label="Product angles">
                {images.map((img, idx) => (
                  <button
                    key={img.id || idx}
                    className={`pdp-gallery__thumb ${selectedImageIndex === idx ? 'pdp-gallery__thumb--active' : ''}`}
                    onClick={() => setSelectedImageIndex(idx)}
                    aria-label={`View ${img.type} angle`}
                  >
                    <img src={img.url} alt={img.alt} className="pdp-gallery__thumb-img" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Purchase Details */}
          <div className="pdp-info">
            <div className="pdp-info__masthead">
              <span className="eyebrow pdp-info__collection">
                <Link to={`/collections/${product.collection.slug}`}>
                  {product.collection.name} Collection
                </Link>
              </span>
              <h1 className="display-1 pdp-info__name">{product.name}</h1>
              <p className="pdp-info__ref">{product.reference}</p>
            </div>

            {/* Price & Availability */}
            <div className="pdp-info__price-row">
              <span className="pdp-info__price">{product.formattedPrice}</span>
              <span className={`pdp-info__availability pdp-info__availability--${product.availability.toLowerCase()}`}>
                {product.availability === 'AVAILABLE' ? 'Available for Acquisition' : product.availability.replace('_', ' ')}
              </span>
            </div>

            {/* Short Narrative */}
            <p className="body-lead pdp-info__short-desc">
              {product.shortDescription}
            </p>

            {/* Variant Selector (if variants exist) */}
            {product.variants?.length > 1 && (
              <div className="pdp-variants">
                <span className="pdp-variants__label">Configuration:</span>
                <div className="pdp-variants__options">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      className={`pdp-variants__btn ${selectedVariantId === v.id ? 'pdp-variants__btn--active' : ''}`}
                      onClick={() => setSelectedVariantId(v.id)}
                    >
                      <span className="pdp-variants__name">{v.name}</span>
                      <span className="pdp-variants__price">{v.formattedPrice}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Purchase CTA Suite */}
            <div className="pdp-actions">
              <EditorialButton
                variant="primary"
                size="lg"
                onClick={handleAddToBag}
                disabled={isAdding || product.availability === 'OUT_OF_STOCK'}
                className="pdp-actions__add-btn"
              >
                {addedNotice ? (
                  <>
                    <Check size={18} /> Added to Acquisition Bag
                  </>
                ) : isAdding ? (
                  'Reserving Reference...'
                ) : (
                  'Add to Bag'
                )}
              </EditorialButton>

              <button
                className={`pdp-actions__wishlist-btn pressable ${inWishlist ? 'pdp-actions__wishlist-btn--active' : ''}`}
                onClick={handleToggleWishlist}
                aria-label={inWishlist ? 'Remove from wishlist' : 'Save to client wishlist'}
                title={inWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
              >
                <Heart size={18} fill={inWishlist ? 'currentColor' : 'none'} />
                <span>{inWishlist ? 'In Wishlist' : 'Add to Wishlist'}</span>
              </button>
            </div>

            {/* Client Reassurance Features */}
            <div className="pdp-reassurances">
              <div className="pdp-reassurance-item">
                <Truck size={18} className="pdp-reassurance-item__icon" />
                <div className="pdp-reassurance-item__text">
                  <strong>Complimentary Insured Delivery</strong>
                  <span>Armored door-to-door courier dispatch within Pakistan & worldwide.</span>
                </div>
              </div>

              <div className="pdp-reassurance-item">
                <ShieldCheck size={18} className="pdp-reassurance-item__icon" />
                <div className="pdp-reassurance-item__text">
                  <strong>5-Year Atelier Guarantee</strong>
                  <span>Full coverage for mechanical escapement precision & servicing.</span>
                </div>
              </div>

              <div className="pdp-reassurance-item">
                <Clock size={18} className="pdp-reassurance-item__icon" />
                <div className="pdp-reassurance-item__text">
                  <strong>Certificate of Provenance</strong>
                  <span>Individually registered serial number and ledger entry at the Lahore atelier.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* EDITORIAL STORY SECTIONS BELOW */}
      
      {/* 1. The Design Philosophy */}
      <section className="pdp-editorial-section theme-ivory-light section-padding">
        <div className="container">
          <div className="pdp-editorial-section__layout">
            <div className="pdp-editorial-section__content">
              <span className="eyebrow">Horological Architecture</span>
              <h2 className="display-1 pdp-editorial-section__title">The Design</h2>
              <p className="body-lead pdp-editorial-section__lead">
                {product.narrative || product.description}
              </p>
              <p className="body-standard pdp-editorial-section__body">
                Rooted in centuries of subcontinent geometry, {product.name} achieves harmony through disciplined proportions. Every millimeter of the {product.caseDiameter} case has been calculated to sit with quiet balance upon the wrist.
              </p>
            </div>

            <div className="pdp-editorial-section__media">
              <img
                src={product.images.find(img => img.type === 'SIDE')?.url || currentImage.url}
                alt={`${product.name} profile architecture`}
                className="pdp-editorial-section__img"
              />
              <span className="pdp-editorial-section__caption">
                Case profile and lug curvature study, NAYAB atelier, Lahore.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Exploded View (for Meridian 41 or high-complication models) */}
      {product.images.some((img) => img.type === 'EXPLODED') && (
        <section className="pdp-exploded-section theme-black section-padding">
          <div className="container">
            <div className="pdp-exploded-section__header text-center">
              <span className="eyebrow">Micro-Engineering</span>
              <h2 className="display-hero pdp-exploded-section__title">
                Every fraction<br />has a purpose.
              </h2>
              <p className="body-lead pdp-exploded-section__subtitle">
                The Calibre N-01 micro-rotor architecture disassembled across 168 individual hand-finished components.
              </p>
            </div>

            <div className="pdp-exploded-section__stage">
              <img
                src="/images/meridian-exploded.png"
                alt="Calibre N-01 exploded view mechanics"
                className="pdp-exploded-section__img"
              />
              <div className="pdp-exploded-section__callout pdp-exploded-section__callout--1">
                <span className="pdp-exploded-section__callout-dot" />
                <span className="pdp-exploded-section__callout-label">Tungsten Micro-Rotor</span>
              </div>
              <div className="pdp-exploded-section__callout pdp-exploded-section__callout--2">
                <span className="pdp-exploded-section__callout-dot" />
                <span className="pdp-exploded-section__callout-label">Free-Sprung Gyromax Balance</span>
              </div>
              <div className="pdp-exploded-section__callout pdp-exploded-section__callout--3">
                <span className="pdp-exploded-section__callout-dot" />
                <span className="pdp-exploded-section__callout-label">Hand-Chamfered Bridges</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. Structured Technical Specifications */}
      <section className="pdp-specs-section theme-ivory section-padding">
        <div className="container">
          <header className="pdp-specs-section__header">
            <span className="eyebrow">Atelier Reference</span>
            <h2 className="display-1 pdp-specs-section__title">Technical Specifications</h2>
          </header>

          <div className="pdp-specs-grid">
            <div className="pdp-spec-card">
              <span className="pdp-spec-card__label">Case Material</span>
              <span className="pdp-spec-card__val">{product.caseMaterial}</span>
            </div>
            <div className="pdp-spec-card">
              <span className="pdp-spec-card__label">Diameter & Thickness</span>
              <span className="pdp-spec-card__val">{product.caseDiameter} {product.caseThickness ? `· ${product.caseThickness}` : ''}</span>
            </div>
            <div className="pdp-spec-card">
              <span className="pdp-spec-card__label">Dial & Hands</span>
              <span className="pdp-spec-card__val">{product.dial}</span>
            </div>
            <div className="pdp-spec-card">
              <span className="pdp-spec-card__label">Calibre</span>
              <span className="pdp-spec-card__val">{product.movement}</span>
            </div>
            <div className="pdp-spec-card">
              <span className="pdp-spec-card__label">Power Reserve</span>
              <span className="pdp-spec-card__val">{product.powerReserve || '60 hours'}</span>
            </div>
            <div className="pdp-spec-card">
              <span className="pdp-spec-card__label">Frequency & Jewels</span>
              <span className="pdp-spec-card__val">{product.frequency || '28,800 vph'} · {product.jewels || 28} Jewels</span>
            </div>
            <div className="pdp-spec-card">
              <span className="pdp-spec-card__label">Water Resistance</span>
              <span className="pdp-spec-card__val">{product.waterResistance || '30 meters'}</span>
            </div>
            <div className="pdp-spec-card">
              <span className="pdp-spec-card__label">Strap & Buckle</span>
              <span className="pdp-spec-card__val">{product.strapOrBracelet}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Related Timepieces */}
      {relatedProducts.length > 0 && (
        <section className="pdp-related theme-ivory-light section-padding">
          <div className="container">
            <header className="pdp-related__header">
              <span className="eyebrow">Complementary Creations</span>
              <h2 className="display-1 pdp-related__title">From the {product.collection.name} Portfolio</h2>
            </header>

            <div className="collection-products-grid">
              {relatedProducts.map((rel) => (
                <article key={rel.id} className="luxury-product-card">
                  <Link to={`/watches/${rel.slug}`} className="luxury-product-card__media-link">
                    <div className="luxury-product-card__thumb-frame">
                      <img
                        src={rel.images[0]?.url || '/images/sovereign-39-front.png'}
                        alt={rel.name}
                        className="luxury-product-card__img"
                      />
                    </div>
                  </Link>

                  <div className="luxury-product-card__info">
                    <span className="luxury-product-card__ref">{rel.reference}</span>
                    <h3 className="luxury-product-card__title">
                      <Link to={`/watches/${rel.slug}`}>{rel.name}</Link>
                    </h3>
                    <p className="luxury-product-card__spec">
                      {rel.caseMaterial} · {rel.caseDiameter}
                    </p>
                    <div className="luxury-product-card__footer">
                      <span className="luxury-product-card__price">{rel.formattedPrice}</span>
                      <Link to={`/watches/${rel.slug}`} className="luxury-product-card__cta">
                        Discover <ArrowRight size={14} className="luxury-product-card__cta-arrow" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
};
