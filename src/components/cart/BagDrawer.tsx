import React from 'react';
import { Link } from 'react-router-dom';
import { X, Plus, Minus, Trash2, ArrowRight, ShieldCheck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { EditorialButton } from '../common/EditorialButton';
import './BagDrawer.css';

export const BagDrawer: React.FC = () => {
  const { cart, isBagOpen, closeBag, updateItem, removeItem, itemCount } = useCart();

  if (!isBagOpen) return null;

  const items = cart?.items ?? [];

  return (
    <aside
      className="bag-drawer-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Client Acquisition Bag"
    >
      <div className="bag-drawer__backdrop" onClick={closeBag} />

      <div className="bag-drawer__panel">
        {/* Header */}
        <header className="bag-drawer__header">
          <div className="bag-drawer__header-title-wrap">
            <span className="eyebrow">Acquisition Bag</span>
            <h2 className="bag-drawer__title">Your Selection ({itemCount})</h2>
          </div>
          <button
            className="bag-drawer__close-btn pressable"
            onClick={closeBag}
            aria-label="Close Bag Drawer"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </header>

        {/* Content */}
        <div className="bag-drawer__content">
          {items.length === 0 ? (
            <div className="bag-drawer__empty">
              <p className="bag-drawer__empty-title">Your bag is empty.</p>
              <p className="bag-drawer__empty-sub">
                Explore our collections to select an authentic mechanical timepiece.
              </p>
              <EditorialButton
                to="/collections"
                variant="outline"
                size="md"
                onClick={closeBag}
                className="bag-drawer__empty-btn"
              >
                Explore Collections
              </EditorialButton>
            </div>
          ) : (
            <div className="bag-drawer__items">
              {items.map((item) => (
                <article key={item.id} className="bag-drawer__item">
                  <Link
                    to={`/watches/${item.product.slug}`}
                    className="bag-drawer__item-thumb"
                    onClick={closeBag}
                  >
                    <img
                      src={item.product.images[0]?.url || '/images/sovereign-39-front.png'}
                      alt={item.product.name}
                      className="bag-drawer__item-img"
                    />
                  </Link>

                  <div className="bag-drawer__item-details">
                    <div className="bag-drawer__item-top">
                      <span className="bag-drawer__item-collection">
                        {item.product.collection.name} Collection
                      </span>
                      <button
                        className="bag-drawer__item-remove"
                        onClick={() => removeItem(item.id)}
                        aria-label={`Remove ${item.product.name} from bag`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <Link
                      to={`/watches/${item.product.slug}`}
                      className="bag-drawer__item-name"
                      onClick={closeBag}
                    >
                      {item.product.name}
                    </Link>

                    <p className="bag-drawer__item-spec">
                      {item.product.reference} · {item.product.caseMaterial}
                    </p>

                    {item.variant && (
                      <p className="bag-drawer__item-variant">
                        Variant: {item.variant.name}
                      </p>
                    )}

                    <div className="bag-drawer__item-bottom">
                      {/* Quantity Controls */}
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

                      <span className="bag-drawer__item-total">
                        {item.formattedLineTotal}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <footer className="bag-drawer__footer">
            <div className="bag-drawer__reassurance">
              <ShieldCheck size={16} className="bag-drawer__reassurance-icon" />
              <span>Complimentary insured courier delivery & 5-year guarantee.</span>
            </div>

            <div className="bag-drawer__subtotal-row">
              <span className="bag-drawer__subtotal-label">Subtotal</span>
              <span className="bag-drawer__subtotal-val">{cart?.formattedSubtotal}</span>
            </div>

            <div className="bag-drawer__actions">
              <EditorialButton
                to="/cart"
                variant="primary"
                size="lg"
                onClick={closeBag}
                className="bag-drawer__cta-btn"
              >
                Proceed to Acquisition Bag <ArrowRight size={16} />
              </EditorialButton>
            </div>
          </footer>
        )}
      </div>
    </aside>
  );
};
