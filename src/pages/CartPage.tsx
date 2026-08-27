import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Plus, Minus, Trash2, ShieldCheck, Truck, Lock, ArrowRight, ArrowLeft } from 'lucide-react';
import { EditorialButton } from '../components/common/EditorialButton';
import './Pages.css';

export const CartPage: React.FC = () => {
  const { cart, updateItem, removeItem, itemCount, isLoading } = useCart();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const items = cart?.items ?? [];

  return (
    <main className="page-container theme-ivory">
      <div className="container section-padding">
        {/* Header */}
        <header className="page-header">
          <Link to="/collections" className="cart-back-link">
            <ArrowLeft size={14} /> Continue Exploring Timepieces
          </Link>
          <span className="eyebrow">Client Portfolio Acquisition</span>
          <h1 className="display-1 page-title">Acquisition Bag</h1>
          <p className="body-lead page-subtitle">
            Review your selected mechanical timepieces before proceeding to private client registration and insured courier dispatch.
          </p>
        </header>

        {isLoading ? (
          <div className="page-loading">
            <span className="page-loading__text">Loading your acquisition bag...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="cart-empty-state">
            <h2 className="display-2 cart-empty-state__title">Your bag is empty.</h2>
            <p className="body-lead cart-empty-state__desc">
              You have not yet reserved any references from the NAYAB portfolios.
            </p>
            <div className="cart-empty-state__actions">
              <EditorialButton to="/collections" variant="primary" size="lg">
                Explore Collections
              </EditorialButton>
              <EditorialButton to="/watches/sovereign-39" variant="text" size="md">
                Discover Sovereign 39
              </EditorialButton>
            </div>
          </div>
        ) : (
          <div className="cart-layout">
            {/* Left: Cart Items List */}
            <div className="cart-items-column">
              <div className="cart-items-header">
                <span>Selected Reference ({itemCount})</span>
                <span>Subtotal</span>
              </div>

              <div className="cart-items-list">
                {items.map((item) => (
                  <article key={item.id} className="cart-item-row">
                    <Link
                      to={`/watches/${item.product.slug}`}
                      className="cart-item-row__media"
                      aria-label={`View ${item.product.name}`}
                    >
                      <img
                        src={item.product.images[0]?.url || '/images/sovereign-39-front.png'}
                        alt={item.product.name}
                        className="cart-item-row__img"
                      />
                    </Link>

                    <div className="cart-item-row__info">
                      <div className="cart-item-row__top">
                        <span className="cart-item-row__collection">
                          {item.product.collection.name} Collection · {item.product.reference}
                        </span>
                        <button
                          className="cart-item-row__remove-btn"
                          onClick={() => removeItem(item.id)}
                          aria-label={`Remove ${item.product.name}`}
                        >
                          <Trash2 size={15} /> <span>Remove</span>
                        </button>
                      </div>

                      <h3 className="cart-item-row__title">
                        <Link to={`/watches/${item.product.slug}`}>{item.product.name}</Link>
                      </h3>

                      <p className="cart-item-row__spec">
                        {item.product.caseMaterial} · {item.product.caseDiameter}
                      </p>

                      {item.variant && (
                        <p className="cart-item-row__variant">
                          Configuration: {item.variant.name}
                        </p>
                      )}

                      <div className="cart-item-row__stepper-wrap">
                        <div className="bag-drawer__stepper">
                          <button
                            className="bag-drawer__stepper-btn"
                            onClick={() => {
                              if (item.quantity > 1) {
                                updateItem(item.id, item.quantity - 1);
                              } else {
                                removeItem(item.id);
                              }
                            }}
                            aria-label="Decrease quantity"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="bag-drawer__stepper-val">{item.quantity}</span>
                          <button
                            className="bag-drawer__stepper-btn"
                            onClick={() => updateItem(item.id, item.quantity + 1)}
                            aria-label="Increase quantity"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="cart-item-row__price-col">
                      <span className="cart-item-row__total">{item.formattedLineTotal}</span>
                      {item.quantity > 1 && (
                        <span className="cart-item-row__unit-price">
                          {item.formattedUnitPrice} each
                        </span>
                      )}
                    </div>
                  </article>
                ))}
              </div>

              {/* Atelier Reassurance Notes */}
              <div className="cart-reassurances">
                <div className="cart-reassurance-card">
                  <Truck size={20} className="cart-reassurance-card__icon" />
                  <div>
                    <h4 className="cart-reassurance-card__title">Armored Express Courier</h4>
                    <p className="cart-reassurance-card__desc">
                      Dispatched in high-security temperature-controlled packaging with full transit insurance.
                    </p>
                  </div>
                </div>

                <div className="cart-reassurance-card">
                  <ShieldCheck size={20} className="cart-reassurance-card__icon" />
                  <div>
                    <h4 className="cart-reassurance-card__title">5-Year International Warranty</h4>
                    <p className="cart-reassurance-card__desc">
                      Every mechanical escapement is covered against manufacturing variance by our Lahore atelier.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Summary Card */}
            <aside className="cart-summary-column" aria-label="Acquisition Summary">
              <div className="cart-summary-card">
                <span className="eyebrow cart-summary-card__eyebrow">Order Summary</span>
                <h3 className="cart-summary-card__title">Acquisition Overview</h3>

                <div className="cart-summary-rows">
                  <div className="cart-summary-row">
                    <span>Selected Items ({itemCount})</span>
                    <span>{cart?.formattedSubtotal}</span>
                  </div>
                  <div className="cart-summary-row">
                    <span>Insured Worldwide Delivery</span>
                    <span className="cart-summary-free">Complimentary</span>
                  </div>
                  <div className="cart-summary-row">
                    <span>Certificate of Provenance</span>
                    <span className="cart-summary-free">Included</span>
                  </div>
                </div>

                <div className="cart-summary-divider" />

                <div className="cart-summary-total-row">
                  <span className="cart-summary-total-label">Total Amount</span>
                  <span className="cart-summary-total-val">{cart?.formattedSubtotal}</span>
                </div>

                <div className="cart-summary-actions">
                  <EditorialButton
                    to="/account"
                    variant="primary"
                    size="lg"
                    className="cart-summary-btn"
                  >
                    Proceed with Acquisition <ArrowRight size={16} />
                  </EditorialButton>
                  <p className="cart-summary-security-note">
                    <Lock size={12} /> Secure encrypted acquisition protocol
                  </p>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
};
