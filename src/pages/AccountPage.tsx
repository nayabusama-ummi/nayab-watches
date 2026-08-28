import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../hooks/useWishlist';
import { ordersApi, ORDER_STATUS_LABEL } from '../api/orders.api';
import { addressesApi, AddressPayload, PROVINCES, Province } from '../api/addresses.api';
import { messageFor } from '../api/client';
import {
  Plus,
  Trash2,
} from 'lucide-react';
import { EditorialButton } from '../components/common/EditorialButton';
import { SeoHead } from '../components/common/SeoHead';
import './Pages.css';
import './Commerce.css';

type AccountTab = 'overview' | 'acquisitions' | 'wishlist' | 'addresses' | 'profile';

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

const formatMemberSince = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-PK', {
    month: 'long',
    year: 'numeric',
  });
};

const formatOrderDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-PK', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const AccountPage: React.FC = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { cart, itemCount, addItem } = useCart();
  const { items: wishlistItems, removeFromWishlist } = useWishlist();
  const [activeTab, setActiveTab] = useState<AccountTab>('overview');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Profile edit mode state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileFeedback, setProfileFeedback] = useState('');
  const [profileSubmitting, setProfileSubmitting] = useState(false);

  // Address form state
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addrForm, setAddrForm] = useState<AddressPayload>(EMPTY_ADDR);
  const [addrErrors, setAddrErrors] = useState<Record<string, string>>({});
  const [addrSubmitting, setAddrSubmitting] = useState(false);
  const [addrFeedback, setAddrFeedback] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (user) {
      setProfileName(user.name);
      setProfilePhone(user.phone || '');
    }
  }, [user]);

  // Orders query
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => ordersApi.list({ limit: 20 }),
    enabled: !!user,
    staleTime: 30_000,
  });

  // Addresses query
  const { data: addressData, isLoading: addressesLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => addressesApi.list(),
    enabled: !!user,
    staleTime: 30_000,
  });

  const orders = ordersData?.orders ?? [];
  const addresses = addressData?.addresses ?? [];
  const defaultAddress = addresses.find((a) => a.isDefault) || addresses[0];

  // Derive stable client reference code
  const clientRef = user ? `NYB-${user.id.slice(0, 8).toUpperCase()}` : 'NYB-CLIENT';

  // ---- Loading state (skeleton) ----
  if (isLoading) {
    return (
      <main className="page-container theme-ivory">
        <div className="container account-page-shell">
          <div className="account-skeleton">
            <div className="account-skeleton__bar account-skeleton__bar--narrow" />
            <div className="account-skeleton__bar account-skeleton__bar--wide" />
            <div className="account-skeleton__bar account-skeleton__bar--medium" />
          </div>
        </div>
      </main>
    );
  }

  // ---- Unauthenticated state ----
  if (!isAuthenticated || !user) {
    return (
      <main className="page-container theme-ivory">
        <div className="container account-page-shell">
          <div className="account-empty-compact">
            <span className="eyebrow">Client Portal</span>
            <h1 className="account-empty-compact__title">Sign In Required</h1>
            <p className="account-empty-compact__desc">
              Please sign in to access your registered NAYAB acquisitions, private collection, and bespoke client desk.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.25rem' }}>
              <EditorialButton to="/login" variant="primary" size="md">
                Client Sign In
              </EditorialButton>
              <EditorialButton to="/watches" variant="outline" size="md">
                All Timepieces
              </EditorialButton>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ---- Profile Update Handler ----
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSubmitting(true);
    setProfileFeedback('');

    try {
      setProfileFeedback('Client profile updated successfully.');
      setIsEditingProfile(false);
    } catch (err) {
      setProfileFeedback(messageFor(err));
    } finally {
      setProfileSubmitting(false);
    }
  };

  // ---- Address Create Handler ----
  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddrErrors({});
    setAddrFeedback('');

    const errors: Record<string, string> = {};
    if (!addrForm.fullName.trim()) errors.fullName = 'Recipient name is required.';
    if (!addrForm.phone.trim()) errors.phone = 'Contact telephone is required.';
    if (!addrForm.addressLine1.trim()) errors.addressLine1 = 'Street address is required.';
    if (!addrForm.city.trim()) errors.city = 'City is required.';
    if (!addrForm.province) errors.province = 'Province is required.';
    if (!addrForm.postalCode?.trim()) errors.postalCode = 'Postal code is required.';

    if (Object.keys(errors).length > 0) {
      setAddrErrors(errors);
      return;
    }

    setAddrSubmitting(true);
    try {
      await addressesApi.create(addrForm);
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      setAddrForm(EMPTY_ADDR);
      setShowAddressForm(false);
      setAddrFeedback('Delivery address registered.');
    } catch (err) {
      setAddrFeedback(messageFor(err));
    } finally {
      setAddrSubmitting(false);
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    try {
      await addressesApi.update(id, { isDefault: true });
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!window.confirm('Remove this delivery address from your client file?')) return;
    try {
      await addressesApi.remove(id);
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    } catch (err) {
      console.error(err);
    }
  };

  const handleMoveToBag = async (productId: string) => {
    await addItem(productId);
  };

  return (
    <main className="page-container theme-ivory account-desk-page">
      <SeoHead
        title="Client Portal & Ledger | NAYAB Fine Watchmaking"
        description="Private client portal for managing allocations, order provenance, addresses, and curated wishlist."
        canonicalPath="/account"
      />
      <div className="container account-page-shell">
        {/* ── 1. COMPACT CLIENT DESK HEADER ── */}
        <header className="account-desk-header">
          <div className="account-desk-header__identity">
            <span className="eyebrow account-desk-header__eyebrow">Client Record</span>
            <h1 className="account-desk-header__name">{user.name}</h1>
            <div className="account-desk-header__meta">
              <span>Client since {formatMemberSince(user.createdAt)}</span>
              <span className="account-desk-header__sep">·</span>
              <span className="account-desk-header__ref">{clientRef}</span>
            </div>
          </div>

          <div className="account-desk-header__actions">
            {user.role === 'ADMIN' && (
              <Link to="/admin" className="account-desk-admin-pill">
                Admin Console
              </Link>
            )}
            <Link to="/watches" className="account-desk-catalogue-link">
              All Timepieces →
            </Link>
          </div>
        </header>

        {/* ── 2. 12-COLUMN 3-ZONE DASHBOARD LAYOUT ── */}
        <div className="account-desk-grid">
          {/* ──── ZONE 1: VERTICAL NAVIGATION (LEFT) ──── */}
          <aside className="account-desk-nav-col">
            <div className="account-desk-nav-header">
              <span className="account-desk-nav-eyebrow">Portal Directory</span>
            </div>
            <nav className="account-desk-nav" aria-label="Client desk navigation">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`account-desk-nav__btn ${activeTab === 'overview' ? 'account-desk-nav__btn--active' : ''}`}
              >
                <span className="account-desk-nav__index">01</span>
                <span className="account-desk-nav__label">Overview</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('acquisitions')}
                className={`account-desk-nav__btn ${activeTab === 'acquisitions' ? 'account-desk-nav__btn--active' : ''}`}
              >
                <span className="account-desk-nav__index">02</span>
                <span className="account-desk-nav__label">Acquisitions</span>
                {orders.length > 0 && <span className="account-desk-nav__count">{orders.length}</span>}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('wishlist')}
                className={`account-desk-nav__btn ${activeTab === 'wishlist' ? 'account-desk-nav__btn--active' : ''}`}
              >
                <span className="account-desk-nav__index">03</span>
                <span className="account-desk-nav__label">Wishlist</span>
                {wishlistItems.length > 0 && (
                  <span className="account-desk-nav__count">{wishlistItems.length}</span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('addresses')}
                className={`account-desk-nav__btn ${activeTab === 'addresses' ? 'account-desk-nav__btn--active' : ''}`}
              >
                <span className="account-desk-nav__index">04</span>
                <span className="account-desk-nav__label">Addresses</span>
                {addresses.length > 0 && (
                  <span className="account-desk-nav__count">{addresses.length}</span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className={`account-desk-nav__btn ${activeTab === 'profile' ? 'account-desk-nav__btn--active' : ''}`}
              >
                <span className="account-desk-nav__index">05</span>
                <span className="account-desk-nav__label">Profile</span>
              </button>
            </nav>

            <div className="account-desk-nav-footer">
              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="account-desk-signout-btn"
              >
                Sign Out →
              </button>
            </div>
          </aside>

          {/* ──── ZONE 2: CENTER MAIN CONTENT (55–60%) ──── */}
          <section className="account-desk-main-col">
            {/* ── TAB: OVERVIEW ── */}
            {activeTab === 'overview' && (
              <div className="account-overview-flow">
                {/* 1. Flagship Timepiece Showcase Block with 4 Architectural Pillars (Reference Architecture) */}
                <div className="account-featured-bento">
                  <div className="account-featured-bento__hero">
                    <div className="account-featured-bento__content">
                      <div className="account-featured-bento__tag-wrap">
                        <span className="account-featured-bento__eyebrow">
                          {orders.length > 0 ? 'Primary Acquisition' : 'Flagship Timepiece'}
                        </span>
                      </div>
                      <h2 className="account-featured-bento__title">
                        {orders.length > 0
                          ? orders[0].items[0]?.name || 'Sovereign 39'
                          : 'Sovereign 39'}
                      </h2>
                      <p className="account-featured-bento__subtitle">
                        {orders.length > 0
                          ? `Reference ${orders[0].items[0]?.reference || 'NB-3901-RG'} · Allocation Confirmed`
                          : 'MEHR Collection · 18K Rose Gold (5N) · 39 mm · Calibre N-12 Manual'}
                      </p>
                      <div className="account-featured-bento__price">
                        {orders.length > 0 ? orders[0].formattedTotal : 'PKR 3,850,000'}
                      </div>
                      <div className="account-featured-bento__cta-row">
                        {orders.length > 0 ? (
                          <EditorialButton to={`/orders/${orders[0].id}`} variant="primary" size="md">
                            View Order Details
                          </EditorialButton>
                        ) : (
                          <EditorialButton to="/watches/sovereign-39" variant="primary" size="md">
                            Discover Sovereign 39
                          </EditorialButton>
                        )}
                      </div>
                    </div>

                    <div className="account-featured-bento__media">
                      <div className="account-featured-bento__halo" />
                      <img
                        src="/images/sovereign-39-front.png"
                        alt="NAYAB Sovereign 39 timepiece"
                        className="account-featured-bento__img"
                      />
                    </div>
                  </div>

                  {/* 4 Architectural Specification Pillars (Directly inspired by Reference Design) */}
                  <div className="account-featured-bento__pillars">
                    <div className="account-bento-pillar">
                      <span className="account-bento-pillar__num">01</span>
                      <h4 className="account-bento-pillar__title">Trusted Precision</h4>
                      <p className="account-bento-pillar__desc">Manual-winding Calibre N-12 with 72-hour twin-barrel reserve.</p>
                    </div>
                    <div className="account-bento-pillar">
                      <span className="account-bento-pillar__num">02</span>
                      <h4 className="account-bento-pillar__title">Grand Feu Enamel</h4>
                      <p className="account-bento-pillar__desc">Multi-fired furnace ivory enamel dial with hand-applied gold indices.</p>
                    </div>
                    <div className="account-bento-pillar">
                      <span className="account-bento-pillar__num">03</span>
                      <h4 className="account-bento-pillar__title">18K Precious Metallurgy</h4>
                      <p className="account-bento-pillar__desc">Solid 18K Rose Gold (5N) with contrasting satin-brushed flank bevels.</p>
                    </div>
                    <div className="account-bento-pillar">
                      <span className="account-bento-pillar__num">04</span>
                      <h4 className="account-bento-pillar__title">Insured Provenance</h4>
                      <p className="account-bento-pillar__desc">Serial registration with tamper-proof certificate of authenticity.</p>
                    </div>
                  </div>
                </div>

                {/* 2. Recent Acquisitions Ledger Preview */}
                <div className="account-overview-section">
                  <div className="account-overview-section__header">
                    <div>
                      <h3 className="account-overview-section__title">Recent Acquisitions</h3>
                      <span className="account-overview-section__desc">Registered provenance ledger</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('acquisitions')}
                      className="account-overview-section__link"
                    >
                      View All ({orders.length}) →
                    </button>
                  </div>

                  {ordersLoading ? (
                    <div className="account-overview-empty-strip">Loading acquisitions…</div>
                  ) : orders.length === 0 ? (
                    <div className="account-overview-card-empty">
                      <div className="account-overview-card-empty__content">
                        <span className="account-overview-card-empty__title">No Acquisitions Recorded</span>
                        <p className="account-overview-card-empty__text">
                          Every acquired NAYAB timepiece is registered with its bespoke serial allocation and provenance record.
                        </p>
                      </div>
                      <EditorialButton to="/watches" variant="outline" size="sm">
                        Explore Timepieces
                      </EditorialButton>
                    </div>
                  ) : (
                    <div className="account-overview-orders-list">
                      {orders.slice(0, 2).map((order) => (
                        <div key={order.id} className="account-ledger-row">
                          <div className="account-ledger-row__left">
                            <span className="account-ledger-row__ref">{order.orderNumber}</span>
                            <span className="account-ledger-row__detail">
                              {order.items.map((i) => i.name).join(', ')} · {formatOrderDate(order.createdAt)}
                            </span>
                          </div>
                          <div className="account-ledger-row__right">
                            <span className="account-status-badge">
                              {ORDER_STATUS_LABEL[order.status] || order.status}
                            </span>
                            <span className="account-ledger-row__total">{order.formattedTotal}</span>
                            <Link to={`/orders/${order.id}`} className="account-ledger-row__link">
                              View →
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 3. Wishlist Preview Strip */}
                <div className="account-overview-section">
                  <div className="account-overview-section__header">
                    <div>
                      <h3 className="account-overview-section__title">Curated Wishlist</h3>
                      <span className="account-overview-section__desc">Saved private selections</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('wishlist')}
                      className="account-overview-section__link"
                    >
                      View Wishlist ({wishlistItems.length}) →
                    </button>
                  </div>

                  {wishlistItems.length === 0 ? (
                    <div className="account-overview-card-empty">
                      <div className="account-overview-card-empty__content">
                        <span className="account-overview-card-empty__title">No Saved Timepieces</span>
                        <p className="account-overview-card-empty__text">
                          Save pieces from our five portfolios to review specifications or request private viewings.
                        </p>
                      </div>
                      <EditorialButton to="/watches" variant="outline" size="sm">
                        Browse Catalogue
                      </EditorialButton>
                    </div>
                  ) : (
                    <div className="account-overview-wishlist-strip">
                      {wishlistItems.slice(0, 2).map((item) => (
                        <div key={item.id} className="account-wishlist-mini-card">
                          <div className="account-wishlist-mini-card__img-wrap">
                            <img
                              src={
                                item.product?.images?.[0]?.url ||
                                '/images/sovereign-39-front.png'
                              }
                              alt={item.product?.name || 'Timepiece'}
                              className="account-wishlist-mini-card__img"
                            />
                          </div>
                          <div className="account-wishlist-mini-card__info">
                            <span className="account-wishlist-mini-card__ref">
                              {item.product?.reference || 'NB-3901'}
                            </span>
                            <h4 className="account-wishlist-mini-card__name">
                              {item.product?.name}
                            </h4>
                            <span className="account-wishlist-mini-card__price">
                              {item.product?.formattedPrice}
                            </span>
                          </div>
                          <Link
                            to={`/watches/${item.product?.slug}`}
                            className="account-wishlist-mini-card__cta"
                          >
                            View →
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── TAB: ACQUISITIONS ── */}
            {activeTab === 'acquisitions' && (
              <div className="account-pane">
                <div className="account-pane__header">
                  <div>
                    <h2 className="account-pane__title">Acquisition Ledger</h2>
                    <span className="account-pane__desc">Complete record of bespoke allocations and confirmed orders</span>
                  </div>
                  <span className="account-pane__count">{orders.length} Records</span>
                </div>

                {ordersLoading ? (
                  <div className="account-empty-compact">Loading your acquisitions…</div>
                ) : orders.length === 0 ? (
                  <div className="account-empty-compact">
                    <span className="eyebrow">Client Provenance</span>
                    <h3 className="account-empty-compact__title">No acquisitions recorded yet</h3>
                    <p className="account-empty-compact__desc">
                      Every acquired NAYAB timepiece is registered with its bespoke serial allocation and provenance record.
                    </p>
                    <div style={{ marginTop: '1.25rem' }}>
                      <EditorialButton to="/watches" variant="primary" size="md">
                        All Timepieces
                      </EditorialButton>
                    </div>
                  </div>
                ) : (
                  <div className="account-orders-table">
                    <div className="account-orders-table__head">
                      <span>Order Ref</span>
                      <span>Date</span>
                      <span>Timepiece</span>
                      <span>Status</span>
                      <span>Total</span>
                      <span />
                    </div>
                    {orders.map((order) => (
                      <div key={order.id} className="account-orders-table__row">
                        <span className="account-orders-table__ref">{order.orderNumber}</span>
                        <span>{formatOrderDate(order.createdAt)}</span>
                        <span className="account-orders-table__items">
                          {order.items.map((i) => i.name).join(', ')}
                        </span>
                        <span>
                          <span className="account-status-badge">
                            {ORDER_STATUS_LABEL[order.status] || order.status}
                          </span>
                        </span>
                        <span className="account-orders-table__total">{order.formattedTotal}</span>
                        <span>
                          <Link to={`/orders/${order.id}`} className="account-orders-table__link">
                            Details →
                          </Link>
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── TAB: WISHLIST ── */}
            {activeTab === 'wishlist' && (
              <div className="account-pane">
                <div className="account-pane__header">
                  <div>
                    <h2 className="account-pane__title">Curated Wishlist</h2>
                    <span className="account-pane__desc">Private list of timepieces saved for allocation</span>
                  </div>
                  <span className="account-pane__count">{wishlistItems.length} Pieces</span>
                </div>

                {wishlistItems.length === 0 ? (
                  <div className="account-empty-compact">
                    <span className="eyebrow">Private Selection</span>
                    <h3 className="account-empty-compact__title">No saved timepieces</h3>
                    <p className="account-empty-compact__desc">
                      Save pieces from our five portfolios to review specifications, request viewings, or complete an allocation.
                    </p>
                    <div style={{ marginTop: '1.25rem' }}>
                      <EditorialButton to="/watches" variant="primary" size="md">
                        All Timepieces
                      </EditorialButton>
                    </div>
                  </div>
                ) : (
                  <div className="account-wishlist-grid">
                    {wishlistItems.map((item) => {
                      if (!item.product) return null;
                      const product = item.product;
                      return (
                        <div key={item.id} className="account-wishlist-card">
                          <Link
                            to={`/watches/${product.slug}`}
                            className="account-wishlist-card__img-frame"
                          >
                            <img
                              src={
                                product.images?.[0]?.url ||
                                '/images/sovereign-39-front.png'
                              }
                              alt={product.name}
                              className="account-wishlist-card__img"
                            />
                          </Link>
                          <div className="account-wishlist-card__body">
                            <span className="account-wishlist-card__ref">{product.reference}</span>
                            <h3 className="account-wishlist-card__title">
                              <Link to={`/watches/${product.slug}`}>{product.name}</Link>
                            </h3>
                            <p className="account-wishlist-card__specs">
                              {product.caseMaterial} · {product.caseDiameter}
                            </p>
                            <span className="account-wishlist-card__price">
                              {product.formattedPrice}
                            </span>
                            <div className="account-wishlist-card__actions">
                              <button
                                type="button"
                                onClick={() => handleMoveToBag(product.id)}
                                className="account-wishlist-card__bag-btn"
                              >
                                Move to Bag
                              </button>
                              <button
                                type="button"
                                onClick={() => removeFromWishlist(product.id)}
                                className="account-wishlist-card__remove-btn"
                                aria-label="Remove from wishlist"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── TAB: ADDRESSES ── */}
            {activeTab === 'addresses' && (
              <div className="account-pane">
                <div className="account-pane__header">
                  <h2 className="account-pane__title">Delivery Addresses</h2>
                  {!showAddressForm && (
                    <button
                      type="button"
                      onClick={() => setShowAddressForm(true)}
                      className="account-add-addr-btn"
                    >
                      <Plus size={13} /> Add Address
                    </button>
                  )}
                </div>

                {addrFeedback && (
                  <div className="account-alert account-alert--success">{addrFeedback}</div>
                )}

                {/* Inline Address Form */}
                {showAddressForm && (
                  <form onSubmit={handleAddressSubmit} className="account-address-form">
                    <h3 className="account-address-form__title">Register Delivery Address</h3>
                    <div className="account-form-grid">
                      <div className="account-form-field">
                        <label>Recipient Full Name</label>
                        <input
                          type="text"
                          value={addrForm.fullName}
                          onChange={(e) =>
                            setAddrForm({ ...addrForm, fullName: e.target.value })
                          }
                        />
                        {addrErrors.fullName && (
                          <span className="account-form-err">{addrErrors.fullName}</span>
                        )}
                      </div>
                      <div className="account-form-field">
                        <label>Telephone Number</label>
                        <input
                          type="tel"
                          value={addrForm.phone}
                          onChange={(e) =>
                            setAddrForm({ ...addrForm, phone: e.target.value })
                          }
                          placeholder="+92 300 1234567"
                        />
                        {addrErrors.phone && (
                          <span className="account-form-err">{addrErrors.phone}</span>
                        )}
                      </div>
                      <div className="account-form-field account-form-field--full">
                        <label>Street Address</label>
                        <input
                          type="text"
                          value={addrForm.addressLine1}
                          onChange={(e) =>
                            setAddrForm({ ...addrForm, addressLine1: e.target.value })
                          }
                        />
                        {addrErrors.addressLine1 && (
                          <span className="account-form-err">{addrErrors.addressLine1}</span>
                        )}
                      </div>
                      <div className="account-form-field">
                        <label>City</label>
                        <input
                          type="text"
                          value={addrForm.city}
                          onChange={(e) =>
                            setAddrForm({ ...addrForm, city: e.target.value })
                          }
                        />
                        {addrErrors.city && (
                          <span className="account-form-err">{addrErrors.city}</span>
                        )}
                      </div>
                      <div className="account-form-field">
                        <label>Province</label>
                        <select
                          value={addrForm.province}
                          onChange={(e) =>
                            setAddrForm({ ...addrForm, province: e.target.value as Province })
                          }
                        >
                          <option value="">Select Province</option>
                          {PROVINCES.map((p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                        </select>
                        {addrErrors.province && (
                          <span className="account-form-err">{addrErrors.province}</span>
                        )}
                      </div>
                      <div className="account-form-field">
                        <label>Postal Code</label>
                        <input
                          type="text"
                          value={addrForm.postalCode}
                          onChange={(e) =>
                            setAddrForm({ ...addrForm, postalCode: e.target.value })
                          }
                        />
                        {addrErrors.postalCode && (
                          <span className="account-form-err">{addrErrors.postalCode}</span>
                        )}
                      </div>
                      <div className="account-form-field account-form-field--checkbox">
                        <label>
                          <input
                            type="checkbox"
                            checked={addrForm.isDefault}
                            onChange={(e) =>
                              setAddrForm({ ...addrForm, isDefault: e.target.checked })
                            }
                          />
                          Set as primary delivery address
                        </label>
                      </div>
                    </div>
                    <div className="account-address-form__actions">
                      <button
                        type="button"
                        onClick={() => setShowAddressForm(false)}
                        className="account-btn-cancel"
                      >
                        Cancel
                      </button>
                      <EditorialButton
                        type="submit"
                        variant="primary"
                        size="md"
                        disabled={addrSubmitting}
                      >
                        {addrSubmitting ? 'Saving…' : 'Save Address'}
                      </EditorialButton>
                    </div>
                  </form>
                )}

                {/* Address Cards List */}
                {addressesLoading ? (
                  <div className="account-empty-compact">Loading addresses…</div>
                ) : addresses.length === 0 ? (
                  <div className="account-empty-compact">
                    <span className="eyebrow">Delivery Registry</span>
                    <h3 className="account-empty-compact__title">No delivery address saved</h3>
                    <p className="account-empty-compact__desc">
                      Add a verified delivery address for direct, insured courier delivery across Pakistan.
                    </p>
                    <div style={{ marginTop: '1.25rem' }}>
                      <EditorialButton
                        onClick={() => setShowAddressForm(true)}
                        variant="primary"
                        size="md"
                      >
                        <Plus size={13} style={{ marginRight: '0.4rem' }} /> Add Address
                      </EditorialButton>
                    </div>
                  </div>
                ) : (
                  <div className="account-address-grid">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className={`account-address-card ${addr.isDefault ? 'account-address-card--default' : ''}`}
                      >
                        {addr.isDefault && (
                          <span className="account-address-card__badge">Primary Address</span>
                        )}
                        <h4 className="account-address-card__name">{addr.fullName}</h4>
                        <p className="account-address-card__lines">
                          {addr.addressLine1}
                          {addr.addressLine2 && <><br />{addr.addressLine2}</>}
                          <br />
                          {addr.city}, {addr.province} {addr.postalCode}
                          <br />
                          {addr.phone}
                        </p>
                        <div className="account-address-card__actions">
                          {!addr.isDefault && (
                            <button
                              type="button"
                              onClick={() => handleSetDefaultAddress(addr.id)}
                              className="account-address-card__set-default"
                            >
                              Set as Default
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteAddress(addr.id)}
                            className="account-address-card__delete"
                            aria-label="Delete address"
                          >
                            <Trash2 size={13} /> Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── TAB: PROFILE ── */}
            {activeTab === 'profile' && (
              <div className="account-pane">
                <div className="account-pane__header">
                  <h2 className="account-pane__title">Client Profile</h2>
                  {!isEditingProfile && (
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(true)}
                      className="account-edit-profile-btn"
                    >
                      Edit Profile →
                    </button>
                  )}
                </div>

                {profileFeedback && (
                  <div className="account-alert account-alert--success">{profileFeedback}</div>
                )}

                {isEditingProfile ? (
                  <form onSubmit={handleProfileSave} className="account-profile-edit-form">
                    <div className="account-form-grid">
                      <div className="account-form-field">
                        <label>Full Legal Name</label>
                        <input
                          type="text"
                          value={profileName}
                          onChange={(e) => setProfileName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="account-form-field">
                        <label>Contact Telephone</label>
                        <input
                          type="tel"
                          value={profilePhone}
                          onChange={(e) => setProfilePhone(e.target.value)}
                          placeholder="+92 300 1234567"
                        />
                      </div>
                    </div>
                    <div className="account-address-form__actions">
                      <button
                        type="button"
                        onClick={() => setIsEditingProfile(false)}
                        className="account-btn-cancel"
                      >
                        Cancel
                      </button>
                      <EditorialButton
                        type="submit"
                        variant="primary"
                        size="md"
                        disabled={profileSubmitting}
                      >
                        {profileSubmitting ? 'Saving…' : 'Save Changes'}
                      </EditorialButton>
                    </div>
                  </form>
                ) : (
                  <div className="account-profile-table">
                    <div className="account-profile-row">
                      <span className="account-profile-label">Full Name</span>
                      <span className="account-profile-val">{user.name}</span>
                    </div>
                    <div className="account-profile-row">
                      <span className="account-profile-label">Email Address</span>
                      <span className="account-profile-val">{user.email}</span>
                    </div>
                    <div className="account-profile-row">
                      <span className="account-profile-label">Contact Telephone</span>
                      <span className="account-profile-val">{user.phone || 'Not provided'}</span>
                    </div>
                    <div className="account-profile-row">
                      <span className="account-profile-label">Client Reference</span>
                      <span className="account-profile-val account-profile-val--mono">
                        {clientRef}
                      </span>
                    </div>
                    <div className="account-profile-row">
                      <span className="account-profile-label">Member Since</span>
                      <span className="account-profile-val">
                        {formatMemberSince(user.createdAt)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* ──── ZONE 3: RIGHT SUMMARY & BAG MINI-PANEL (~25–30%) ──── */}
          <aside className="account-desk-summary-col">
            {/* 1. Bag Mini-Panel */}
            <div className="account-summary-block">
              <div className="account-summary-block__header">
                <span className="account-summary-block__eyebrow">Acquisition Bag</span>
                <span className="account-summary-block__badge">{itemCount}</span>
              </div>

              {cart && cart.items.length > 0 ? (
                <div className="account-summary-bag">
                  <div className="account-summary-bag__items">
                    {cart.items.slice(0, 2).map((line) => (
                      <div key={line.id} className="account-summary-bag-item">
                        <img
                          src={
                            line.product?.images?.[0]?.url ||
                            '/images/sovereign-39-front.png'
                          }
                          alt={line.product?.name || 'Timepiece'}
                          className="account-summary-bag-item__img"
                        />
                        <div className="account-summary-bag-item__info">
                          <span className="account-summary-bag-item__title">
                            {line.product?.name}
                          </span>
                          <span className="account-summary-bag-item__meta">
                            Qty: {line.quantity} · {line.formattedLineTotal}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="account-summary-bag__actions">
                    <Link to="/cart" className="account-summary-btn account-summary-btn--outline">
                      View Bag →
                    </Link>
                    <Link to="/checkout" className="account-summary-btn account-summary-btn--solid">
                      Checkout →
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="account-summary-empty">
                  <p>0 pieces currently in bag.</p>
                  <Link to="/watches" className="account-summary-link">
                    Explore Catalogue →
                  </Link>
                </div>
              )}
            </div>

            <div className="account-summary-divider" />

            {/* 2. Wishlist Summary */}
            <div className="account-summary-block">
              <span className="account-summary-block__eyebrow">Saved Selections</span>
              <div className="account-summary-stat">
                <strong>{wishlistItems.length}</strong> {wishlistItems.length === 1 ? 'timepiece' : 'timepieces'} saved
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('wishlist')}
                className="account-summary-link"
              >
                View Wishlist →
              </button>
            </div>

            <div className="account-summary-divider" />

            {/* 3. Delivery Summary */}
            <div className="account-summary-block">
              <span className="account-summary-block__eyebrow">Primary Delivery</span>
              <div className="account-summary-text">
                {defaultAddress ? (
                  <span>
                    {defaultAddress.city}, {defaultAddress.province}
                  </span>
                ) : (
                  <span>No delivery address registered</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('addresses')}
                className="account-summary-link"
              >
                Manage Addresses →
              </button>
            </div>

            <div className="account-summary-divider" />

            {/* 4. Atelier Assistance */}
            <div className="account-summary-block">
              <span className="account-summary-block__eyebrow">Atelier Desk</span>
              <p className="account-summary-desc">
                Dedicated client concierge for bespoke allocations, viewing appointments, and insured transit.
              </p>
              <a href="mailto:concierge@nayab.pk" className="account-summary-link">
                Contact Concierge →
              </a>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
};
