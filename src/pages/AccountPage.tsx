import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../hooks/useWishlist';
import { ordersApi, ORDER_STATUS_LABEL } from '../api/orders.api';
import { addressesApi, AddressPayload, PROVINCES } from '../api/addresses.api';
import { ApiError, messageFor } from '../api/client';
import { User, LogOut, Package, Heart, MapPin, ArrowRight, Plus, Trash2, Star } from 'lucide-react';
import { EditorialButton } from '../components/common/EditorialButton';
import './Pages.css';
import './Commerce.css';

type AccountTab = 'profile' | 'wishlist' | 'orders' | 'addresses';

const EMPTY_ADDR: AddressPayload = {
  fullName: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  province: '',
  postalCode: '',
  country: 'Pakistan',
  isDefault: false,
};

export const AccountPage: React.FC = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { items: wishlistItems } = useWishlist();
  const [activeTab, setActiveTab] = useState<AccountTab>('profile');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Address form state
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addrForm, setAddrForm] = useState<AddressPayload>(EMPTY_ADDR);
  const [addrErrors, setAddrErrors] = useState<Record<string, string>>({});
  const [addrSubmitting, setAddrSubmitting] = useState(false);
  const [addrFeedback, setAddrFeedback] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Orders query
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => ordersApi.list({ limit: 20 }),
    enabled: !!user && activeTab === 'orders',
    staleTime: 30_000,
  });

  // Addresses query
  const { data: addressData, isLoading: addressesLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => addressesApi.list(),
    enabled: !!user && activeTab === 'addresses',
    staleTime: 30_000,
  });

  const orders = ordersData?.orders ?? [];
  const addresses = addressData?.addresses ?? [];

  if (isLoading) {
    return (
      <main className="page-container theme-ivory">
        <div className="container section-padding text-center">
          <div className="page-loading">
            <span className="page-loading__text">Accessing client record…</span>
          </div>
        </div>
      </main>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <main className="page-container theme-ivory">
        <div className="container section-padding">
          <div className="account-unauth-card">
            <span className="eyebrow">Client Portal</span>
            <h1 className="display-1">Client Identification</h1>
            <p className="body-lead" style={{ maxWidth: '540px', marginTop: '1rem', marginBottom: '2rem' }}>
              Please sign in to access your timepiece acquisitions, saved wishlist, and delivery addresses.
            </p>
            <div className="account-unauth-actions">
              <EditorialButton to="/login" variant="primary" size="lg">
                Sign In to Account
              </EditorialButton>
              <EditorialButton to="/register" variant="outline" size="md">
                Register New Client
              </EditorialButton>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const handleSignOut = async () => {
    await logout();
    navigate('/');
  };

  // Address form helpers
  const updateAddrField = (field: keyof AddressPayload, value: string | boolean) => {
    setAddrForm((prev) => ({ ...prev, [field]: value }));
    setAddrErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
  };

  const validateAddr = (): boolean => {
    const errs: Record<string, string> = {};
    if (!addrForm.fullName.trim()) errs.fullName = 'Full name is required.';
    if (!addrForm.phone.trim()) errs.phone = 'Phone number is required.';
    if (!addrForm.addressLine1.trim()) errs.addressLine1 = 'Address is required.';
    if (!addrForm.city.trim()) errs.city = 'City is required.';
    if (!addrForm.province) errs.province = 'Province is required.';
    setAddrErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAddr()) return;
    setAddrSubmitting(true);
    setAddrFeedback('');
    try {
      await addressesApi.create({ ...addrForm, province: addrForm.province as AddressPayload['province'] });
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      setAddrForm(EMPTY_ADDR);
      setShowAddressForm(false);
      setAddrFeedback('Address saved.');
    } catch (err) {
      if (err instanceof ApiError && Object.keys(err.fields).length > 0) {
        setAddrErrors(err.fields);
      } else {
        setAddrFeedback(messageFor(err));
      }
    } finally {
      setAddrSubmitting(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!window.confirm('Remove this address?')) return;
    try {
      await addressesApi.remove(id);
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    } catch {
      /* silently tolerate */
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await addressesApi.update(id, { isDefault: true });
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    } catch {
      /* silently tolerate */
    }
  };

  return (
    <main className="page-container theme-ivory">
      <div className="container section-padding">
        {/* Header */}
        <header className="account-header">
          <div>
            <span className="eyebrow">Client Record</span>
            <h1 className="display-1 account-title">{user.name}</h1>
            <p className="account-email">{user.email}</p>
          </div>
          <button
            className="account-signout-btn pressable"
            onClick={handleSignOut}
            aria-label="Sign out of client account"
          >
            <LogOut size={16} /> <span>Sign Out</span>
          </button>
        </header>

        {/* Navigation Tabs */}
        <nav className="account-nav" aria-label="Account Tabs">
          <button
            className={`account-nav__btn ${activeTab === 'profile' ? 'account-nav__btn--active' : ''}`}
            onClick={() => setActiveTab('profile')}
            aria-current={activeTab === 'profile' ? 'page' : undefined}
          >
            <User size={16} /> Profile
          </button>
          <button
            className={`account-nav__btn ${activeTab === 'orders' ? 'account-nav__btn--active' : ''}`}
            onClick={() => setActiveTab('orders')}
            aria-current={activeTab === 'orders' ? 'page' : undefined}
          >
            <Package size={16} /> Acquisitions ({orders.length})
          </button>
          <button
            className={`account-nav__btn ${activeTab === 'addresses' ? 'account-nav__btn--active' : ''}`}
            onClick={() => setActiveTab('addresses')}
            aria-current={activeTab === 'addresses' ? 'page' : undefined}
          >
            <MapPin size={16} /> Addresses
          </button>
          <button
            className={`account-nav__btn ${activeTab === 'wishlist' ? 'account-nav__btn--active' : ''}`}
            onClick={() => setActiveTab('wishlist')}
            aria-current={activeTab === 'wishlist' ? 'page' : undefined}
          >
            <Heart size={16} /> Wishlist ({wishlistItems.length})
          </button>
        </nav>

        {/* Tab: Profile */}
        {activeTab === 'profile' && (
          <div className="account-section">
            <div className="account-profile-grid">
              <div className="account-card">
                <span className="eyebrow">Client Record</span>
                <h3 className="account-card__title">Personal Information</h3>
                <div className="account-card__fields">
                  <div className="account-field">
                    <span className="account-field__label">Full Name</span>
                    <span className="account-field__val">{user.name}</span>
                  </div>
                  <div className="account-field">
                    <span className="account-field__label">Email Address</span>
                    <span className="account-field__val">{user.email}</span>
                  </div>
                  <div className="account-field">
                    <span className="account-field__label">Contact Phone</span>
                    <span className="account-field__val">{user.phone || 'Not registered'}</span>
                  </div>
                  <div className="account-field">
                    <span className="account-field__label">Member Since</span>
                    <span className="account-field__val">
                      {new Date(user.createdAt).toLocaleDateString('en-PK', {
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="account-card">
                <span className="eyebrow">Account</span>
                <h3 className="account-card__title">Registered Client</h3>
                <p className="body-standard" style={{ color: 'var(--color-charcoal-light)', lineHeight: 1.6 }}>
                  Your client profile is registered at the NAYAB design studio in Lahore. As a registered client, you receive priority notification for limited production references from the <strong>MEHR</strong> and <strong>ZAR</strong> portfolios.
                </p>
                <div className="account-card__badge-row">
                  <span>Client ID: #{user.id.substring(0, 8).toUpperCase()}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Orders */}
        {activeTab === 'orders' && (
          <div className="account-section">
            {ordersLoading && (
              <div className="page-loading">
                <span className="page-loading__text">Loading acquisitions…</span>
              </div>
            )}
            {!ordersLoading && orders.length === 0 && (
              <div className="cart-empty-state">
                <h2 className="display-2 cart-empty-state__title">No orders yet.</h2>
                <p className="body-lead cart-empty-state__desc">
                  Your acquired timepieces and transit records will be permanently catalogued here.
                </p>
                <EditorialButton to="/collections" variant="primary" size="md">
                  Discover Timepieces
                </EditorialButton>
              </div>
            )}
            {!ordersLoading && orders.length > 0 && (
              <div className="account-orders-list">
                {orders.map((order) => (
                  <Link
                    key={order.id}
                    to={`/orders/${order.id}`}
                    className="account-order-row"
                    aria-label={`View order ${order.orderNumber}`}
                  >
                    <div className="account-order-row__main">
                      <span className="account-order-row__num">{order.orderNumber}</span>
                      <span className="account-order-row__date">
                        {new Date(order.createdAt).toLocaleDateString('en-PK', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                      <span className="account-order-row__items">
                        {order.items.length} piece{order.items.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="account-order-row__right">
                      <span className="account-order-row__total">{order.formattedTotal}</span>
                      <span className={`order-status-badge order-status--${order.status.toLowerCase()}`}>
                        {ORDER_STATUS_LABEL[order.status]}
                      </span>
                      <ArrowRight size={14} className="account-order-row__arrow" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Addresses */}
        {activeTab === 'addresses' && (
          <div className="account-section">
            {addrFeedback && (
              <div className="commerce-notice commerce-notice--success" style={{ marginBottom: '1.5rem' }} role="status">
                {addrFeedback}
              </div>
            )}

            {addressesLoading && (
              <div className="page-loading">
                <span className="page-loading__text">Loading addresses…</span>
              </div>
            )}

            {!addressesLoading && (
              <>
                {addresses.length === 0 && !showAddressForm && (
                  <div className="cart-empty-state">
                    <h2 className="display-2 cart-empty-state__title">No saved addresses.</h2>
                    <p className="body-lead cart-empty-state__desc">
                      Add a delivery address for faster checkout.
                    </p>
                  </div>
                )}

                {addresses.length > 0 && (
                  <div className="account-addresses-grid">
                    {addresses.map((addr) => (
                      <div key={addr.id} className={`account-addr-card ${addr.isDefault ? 'account-addr-card--default' : ''}`}>
                        {addr.isDefault && (
                          <span className="checkout-addr-badge account-addr-card__default-badge">Default</span>
                        )}
                        <p className="account-addr-card__name">{addr.fullName}</p>
                        <p className="account-addr-card__detail">
                          {addr.addressLine1}
                          {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}<br />
                          {addr.city}, {addr.province}
                          {addr.postalCode ? ` ${addr.postalCode}` : ''}<br />
                          {addr.country} · {addr.phone}
                        </p>
                        <div className="account-addr-card__actions">
                          {!addr.isDefault && (
                            <button
                              className="account-addr-action-btn"
                              onClick={() => handleSetDefault(addr.id)}
                              aria-label="Set as default address"
                            >
                              <Star size={13} /> Set Default
                            </button>
                          )}
                          <button
                            className="account-addr-action-btn account-addr-action-btn--danger"
                            onClick={() => handleDeleteAddress(addr.id)}
                            aria-label="Remove address"
                          >
                            <Trash2 size={13} /> Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {!showAddressForm && (
                  <button
                    className="account-add-addr-btn"
                    onClick={() => setShowAddressForm(true)}
                    aria-expanded="false"
                  >
                    <Plus size={15} /> Add Delivery Address
                  </button>
                )}

                {showAddressForm && (
                  <div className="account-addr-form-wrap">
                    <h3 className="checkout-section__title" style={{ marginBottom: '1.25rem' }}>
                      New Address
                    </h3>
                    <form onSubmit={handleAddAddress} noValidate className="checkout-addr-form">
                      <div className="checkout-field-row">
                        <div className="checkout-field">
                          <label className="checkout-label" htmlFor="acc-fullName">
                            Full Name <span aria-hidden="true">*</span>
                          </label>
                          <input
                            id="acc-fullName"
                            type="text"
                            autoComplete="name"
                            required
                            value={addrForm.fullName}
                            onChange={(e) => updateAddrField('fullName', e.target.value)}
                            className={`checkout-input ${addrErrors.fullName ? 'checkout-input--error' : ''}`}
                            aria-invalid={!!addrErrors.fullName}
                            aria-describedby={addrErrors.fullName ? 'acc-fullName-err' : undefined}
                          />
                          {addrErrors.fullName && (
                            <span id="acc-fullName-err" className="checkout-field-err" role="alert">
                              {addrErrors.fullName}
                            </span>
                          )}
                        </div>
                        <div className="checkout-field">
                          <label className="checkout-label" htmlFor="acc-phone">
                            Phone <span aria-hidden="true">*</span>
                          </label>
                          <input
                            id="acc-phone"
                            type="tel"
                            autoComplete="tel"
                            required
                            value={addrForm.phone}
                            onChange={(e) => updateAddrField('phone', e.target.value)}
                            className={`checkout-input ${addrErrors.phone ? 'checkout-input--error' : ''}`}
                            aria-invalid={!!addrErrors.phone}
                          />
                          {addrErrors.phone && (
                            <span className="checkout-field-err" role="alert">{addrErrors.phone}</span>
                          )}
                        </div>
                      </div>

                      <div className="checkout-field">
                        <label className="checkout-label" htmlFor="acc-line1">
                          Address Line 1 <span aria-hidden="true">*</span>
                        </label>
                        <input
                          id="acc-line1"
                          type="text"
                          autoComplete="address-line1"
                          required
                          value={addrForm.addressLine1}
                          onChange={(e) => updateAddrField('addressLine1', e.target.value)}
                          className={`checkout-input ${addrErrors.addressLine1 ? 'checkout-input--error' : ''}`}
                          aria-invalid={!!addrErrors.addressLine1}
                        />
                        {addrErrors.addressLine1 && (
                          <span className="checkout-field-err" role="alert">{addrErrors.addressLine1}</span>
                        )}
                      </div>

                      <div className="checkout-field">
                        <label className="checkout-label" htmlFor="acc-line2">
                          Address Line 2 <span className="checkout-label__opt">(optional)</span>
                        </label>
                        <input
                          id="acc-line2"
                          type="text"
                          autoComplete="address-line2"
                          value={addrForm.addressLine2 ?? ''}
                          onChange={(e) => updateAddrField('addressLine2', e.target.value)}
                          className="checkout-input"
                        />
                      </div>

                      <div className="checkout-field-row">
                        <div className="checkout-field">
                          <label className="checkout-label" htmlFor="acc-city">
                            City <span aria-hidden="true">*</span>
                          </label>
                          <input
                            id="acc-city"
                            type="text"
                            autoComplete="address-level2"
                            required
                            value={addrForm.city}
                            onChange={(e) => updateAddrField('city', e.target.value)}
                            className={`checkout-input ${addrErrors.city ? 'checkout-input--error' : ''}`}
                            aria-invalid={!!addrErrors.city}
                          />
                          {addrErrors.city && (
                            <span className="checkout-field-err" role="alert">{addrErrors.city}</span>
                          )}
                        </div>
                        <div className="checkout-field">
                          <label className="checkout-label" htmlFor="acc-province">
                            Province <span aria-hidden="true">*</span>
                          </label>
                          <select
                            id="acc-province"
                            required
                            value={addrForm.province}
                            onChange={(e) => updateAddrField('province', e.target.value)}
                            className={`checkout-input checkout-select ${addrErrors.province ? 'checkout-input--error' : ''}`}
                            aria-invalid={!!addrErrors.province}
                          >
                            <option value="">Select…</option>
                            {PROVINCES.map((p) => (
                              <option key={p} value={p}>{p}</option>
                            ))}
                          </select>
                          {addrErrors.province && (
                            <span className="checkout-field-err" role="alert">{addrErrors.province}</span>
                          )}
                        </div>
                      </div>

                      <div className="checkout-field checkout-field--narrow">
                        <label className="checkout-label" htmlFor="acc-postal">
                          Postal Code <span className="checkout-label__opt">(optional)</span>
                        </label>
                        <input
                          id="acc-postal"
                          type="text"
                          autoComplete="postal-code"
                          value={addrForm.postalCode ?? ''}
                          onChange={(e) => updateAddrField('postalCode', e.target.value)}
                          className="checkout-input"
                        />
                      </div>

                      <label className="checkout-checkbox-row">
                        <input
                          type="checkbox"
                          checked={addrForm.isDefault ?? false}
                          onChange={(e) => updateAddrField('isDefault', e.target.checked)}
                          className="checkout-checkbox"
                          id="acc-default"
                        />
                        <span className="checkout-checkbox-label">Set as default delivery address</span>
                      </label>

                      {addrFeedback && !addrFeedback.includes('saved') && (
                        <div className="commerce-notice commerce-notice--error" role="alert">
                          {addrFeedback}
                        </div>
                      )}

                      <div className="account-addr-form-actions">
                        <EditorialButton
                          type="submit"
                          variant="primary"
                          size="md"
                          disabled={addrSubmitting}
                          loading={addrSubmitting}
                          loadingLabel="Saving…"
                        >
                          Save Address
                        </EditorialButton>
                        <button
                          type="button"
                          className="account-addr-action-btn"
                          onClick={() => { setShowAddressForm(false); setAddrForm(EMPTY_ADDR); setAddrErrors({}); }}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Tab: Wishlist */}
        {activeTab === 'wishlist' && (
          <div className="account-section">
            {wishlistItems.length === 0 ? (
              <div className="cart-empty-state">
                <h2 className="display-2 cart-empty-state__title">Your wishlist is empty.</h2>
                <p className="body-lead cart-empty-state__desc">
                  Browse the NAYAB collections to save your desired references.
                </p>
                <EditorialButton to="/collections" variant="primary" size="md">
                  Explore Portfolios
                </EditorialButton>
              </div>
            ) : (
              <div className="wishlist-grid">
                {wishlistItems.map((item) => (
                  <article key={item.id} className="luxury-product-card">
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
                      <span className="luxury-product-card__ref">{item.product.reference}</span>
                      <h3 className="luxury-product-card__title">
                        <Link to={`/watches/${item.product.slug}`}>{item.product.name}</Link>
                      </h3>
                      <p className="luxury-product-card__spec">
                        {item.product.collection.name} · {item.product.caseMaterial}
                      </p>
                      <div className="luxury-product-card__footer">
                        <span className="luxury-product-card__price">{item.product.formattedPrice}</span>
                        <Link to={`/watches/${item.product.slug}`} className="luxury-product-card__cta">
                          View <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
};


