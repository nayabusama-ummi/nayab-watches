import React, { useEffect } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ordersApi, ORDER_STATUS_LABEL, ORDER_STATUS_NOTE } from '../api/orders.api';
import { formatAddressLine } from '../api/addresses.api';
import { messageFor } from '../api/client';
import { EditorialButton } from '../components/common/EditorialButton';
import {
  ArrowLeft,
  Package,
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  X,
} from 'lucide-react';
import './Commerce.css';

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const isNewOrder = location.state?.newOrder === true;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersApi.getOne(id!),
    enabled: !!id,
    staleTime: 30_000,
  });

  const order = data?.order;

  const handleCancel = async () => {
    if (!order) return;
    if (!window.confirm('Cancel this order? This cannot be undone.')) return;
    try {
      await ordersApi.cancel(order.id);
      refetch();
    } catch {
      // Error is surfaced by the browser
    }
  };

  if (isLoading) {
    return (
      <main className="page-container theme-ivory commerce-page">
        <div className="container section-padding">
          <div className="page-loading">
            <span className="page-loading__text">Loading order details…</span>
          </div>
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="page-container theme-ivory commerce-page">
        <div className="container section-padding">
          <div className="state-panel">
            <AlertTriangle size={32} style={{ color: 'var(--color-champagne-gold)', marginBottom: '1rem' }} />
            <span className="eyebrow">Order Not Found</span>
            <h1 className="display-2 state-panel__title">
              {error ? messageFor(error) : 'This order could not be found.'}
            </h1>
            <p className="body-lead state-panel__desc">
              The order may not exist, or you may not have permission to view it.
            </p>
            <div className="state-panel__actions">
              <EditorialButton to="/account" variant="primary" size="md">
                Back to Account
              </EditorialButton>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const statusBadgeClass = {
    PENDING: 'order-status--pending',
    CONFIRMED: 'order-status--confirmed',
    PROCESSING: 'order-status--processing',
    SHIPPED: 'order-status--shipped',
    DELIVERED: 'order-status--delivered',
    CANCELLED: 'order-status--cancelled',
  }[order.status] ?? 'order-status--pending';

  return (
    <main className="page-container theme-ivory commerce-page">
      <div className="container section-padding">
        <Link to="/account" className="commerce-back-link">
          <ArrowLeft size={13} /> Back to Account
        </Link>

        {/* Success banner for new orders */}
        {isNewOrder && (
          <div className="commerce-notice commerce-notice--success" role="status">
            <CheckCircle size={15} style={{ flexShrink: 0 }} />
            <span>
              <strong>Reservation confirmed.</strong> Order {order.orderNumber} has been received. A NAYAB client advisor will contact you within one business day.
            </span>
          </div>
        )}

        <header className="commerce-header">
          <span className="eyebrow">Order</span>
          <h1 className="display-1 commerce-header__title">{order.orderNumber}</h1>
          <div className="order-detail-meta">
            <span className={`order-status-badge ${statusBadgeClass}`}>
              {ORDER_STATUS_LABEL[order.status]}
            </span>
            <span className="order-detail-date">
              <Clock size={13} />
              {new Date(order.createdAt).toLocaleDateString('en-PK', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </div>
        </header>

        {/* Status note */}
        <div className="commerce-notice commerce-notice--info">
          <Package size={15} style={{ flexShrink: 0 }} />
          <span>{ORDER_STATUS_NOTE[order.status]}</span>
        </div>

        <div className="order-detail-layout">
          {/* Left: Items */}
          <div className="order-detail-main">
            <section className="checkout-section">
              <h2 className="checkout-section__title">
                <Package size={18} /> Acquired Timepieces
              </h2>
              <div className="order-items-list">
                {order.items.map((item) => (
                  <div key={item.id} className="order-item-row">
                    <div className="order-item-row__info">
                      <span className="order-item-row__ref">{item.reference}</span>
                      <h3 className="order-item-row__name">
                        <Link to={`/watches/${item.slug}`}>{item.name}</Link>
                      </h3>
                      {item.variantName && (
                        <p className="order-item-row__variant">{item.variantName}</p>
                      )}
                      <span className="order-item-row__qty">Qty {item.quantity}</span>
                    </div>
                    <div className="order-item-row__price">
                      <span className="order-item-row__total">{item.formattedLineTotal}</span>
                      {item.quantity > 1 && (
                        <span className="order-item-row__unit">{item.formattedUnitPrice} each</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Shipping Address */}
            <section className="checkout-section">
              <h2 className="checkout-section__title">
                <MapPin size={18} /> Delivery Address
              </h2>
              <div className="order-address-block">
                <p className="order-address-block__name">{order.shippingAddress.fullName}</p>
                <p className="order-address-block__phone">{order.shippingAddress.phone}</p>
                <p className="order-address-block__lines">
                  {formatAddressLine(order.shippingAddress)}
                </p>
              </div>
            </section>

            {/* Cancel */}
            {order.canCancel && (
              <section className="checkout-section">
                <button
                  type="button"
                  className="order-cancel-btn"
                  onClick={handleCancel}
                  aria-label="Cancel this order"
                >
                  <X size={14} /> Cancel Order
                </button>
                <p className="order-cancel-note">
                  You may cancel your reservation before it moves to Processing.
                </p>
              </section>
            )}
          </div>

          {/* Right: Totals */}
          <aside className="checkout-sidebar" aria-label="Order Totals">
            <div className="checkout-summary-card">
              <span className="eyebrow checkout-summary-card__eyebrow">Totals</span>
              <h2 className="checkout-summary-card__title">Financial Summary</h2>

              <div className="checkout-summary-rows">
                <div className="checkout-summary-row">
                  <span>Subtotal</span>
                  <span>{order.formattedSubtotal}</span>
                </div>
                <div className="checkout-summary-row">
                  <span>Delivery</span>
                  <span className="checkout-summary-free">
                    {order.shipping === 0 ? 'Complimentary' : order.formattedShipping}
                  </span>
                </div>
              </div>

              <div className="checkout-summary-divider" />

              <div className="checkout-summary-total">
                <span>Total</span>
                <span className="checkout-summary-total__amount">{order.formattedTotal}</span>
              </div>

              <p className="checkout-disclaimer">
                Payment method: Client office settlement (no digital payment processed).
              </p>

              <EditorialButton to="/account" variant="outline" size="md">
                All Orders
              </EditorialButton>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
};
