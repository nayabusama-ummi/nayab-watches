import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../hooks/useWishlist';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { EditorialButton } from '../components/common/EditorialButton';
import { SeoHead } from '../components/common/SeoHead';
import './Pages.css';

export const WishlistPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { items, isLoading, removeFromWishlist } = useWishlist();
  const { addItem, openBag } = useCart();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleMoveToBag = async (productId: string) => {
    await addItem(productId);
    await removeFromWishlist(productId);
    openBag();
  };

  return (
    <main className="page-container theme-ivory">
      <SeoHead
        title="Curated Wishlist | Saved Timepiece References"
        description="View your saved NAYAB mechanical timepieces and curated collection references."
        canonicalPath="/wishlist"
      />
      <div className="container section-padding">
        {/* Header */}
        <header className="page-header">
          <span className="eyebrow">Client Curations</span>
          <h1 className="display-1 page-title">Curated Wishlist</h1>
          <p className="body-lead page-subtitle">
            A private catalog of timepieces saved for future acquisition or consultation with our atelier concierge.
          </p>
        </header>

        {!isAuthenticated ? (
          <div className="wishlist-guest-card">
            <h2 className="display-2 wishlist-guest-card__title">Sign In to Save Your Selection</h2>
            <p className="body-lead wishlist-guest-card__desc">
              Create or access your NAYAB client account to synchronize your curated timepieces across devices and receive private portfolio announcements.
            </p>
            <div className="wishlist-guest-card__actions">
              <EditorialButton to="/login?redirect=/wishlist" variant="primary" size="lg">
                Sign In to Account
              </EditorialButton>
              <EditorialButton to="/register?redirect=/wishlist" variant="outline" size="md">
                Register New Client
              </EditorialButton>
            </div>
          </div>
        ) : isLoading ? (
          <div className="page-loading">
            <span className="page-loading__text">Loading your curated wishlist...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="cart-empty-state">
            <h2 className="display-2 cart-empty-state__title">Your selection is empty.</h2>
            <p className="body-lead cart-empty-state__desc">
              Explore the NAYAB collections to bookmark references that speak to your sense of permanence.
            </p>
            <div className="cart-empty-state__actions">
              <EditorialButton to="/collections" variant="primary" size="lg">
                Explore Collections
              </EditorialButton>
            </div>
          </div>
        ) : (
          <div className="wishlist-grid">
            {items.map((item) => (
              <article key={item.id} className="luxury-product-card wishlist-card">
                <Link to={`/watches/${item.product.slug}`} className="luxury-product-card__media-link">
                  <div className="luxury-product-card__thumb-frame">
                    <img
                      src={item.product.images[0]?.url || '/images/sovereign-39-front.png'}
                      alt={item.product.name}
                      className="luxury-product-card__img"
                    />
                  </div>
                </Link>

                <div className="luxury-product-card__info">
                  <div className="wishlist-card__top">
                    <span className="luxury-product-card__ref">{item.product.reference}</span>
                    <button
                      className="wishlist-card__remove-btn"
                      onClick={() => removeFromWishlist(item.productId)}
                      aria-label={`Remove ${item.product.name} from wishlist`}
                      title="Remove from wishlist"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <h3 className="luxury-product-card__title">
                    <Link to={`/watches/${item.product.slug}`}>{item.product.name}</Link>
                  </h3>

                  <p className="luxury-product-card__spec">
                    {item.product.collection.name} Collection · {item.product.caseMaterial}
                  </p>

                  <span className="luxury-product-card__price">{item.product.formattedPrice}</span>

                  <div className="wishlist-card__actions">
                    <EditorialButton
                      variant="primary"
                      size="sm"
                      onClick={() => handleMoveToBag(item.productId)}
                      className="wishlist-card__bag-btn"
                    >
                      <ShoppingBag size={14} /> Move to Bag
                    </EditorialButton>
                    <Link to={`/watches/${item.product.slug}`} className="luxury-product-card__cta">
                      Details <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};
