import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../hooks/useWishlist';
import { User, LogOut, Package, Heart, Shield, ArrowRight } from 'lucide-react';
import { EditorialButton } from '../components/common/EditorialButton';
import './Pages.css';

export const AccountPage: React.FC = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { items: wishlistItems } = useWishlist();
  const [activeTab, setActiveTab] = useState<'profile' | 'wishlist' | 'orders'>('profile');
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (isLoading) {
    return (
      <main className="page-container theme-ivory">
        <div className="container section-padding text-center">
          <div className="page-loading">
            <span className="page-loading__text">Accessing client ledger...</span>
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
              Please sign in to access your registered timepieces, certificate records, and bespoke concierge inquiries.
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

  return (
    <main className="page-container theme-ivory">
      <div className="container section-padding">
        {/* Header */}
        <header className="account-header">
          <div>
            <span className="eyebrow">Maison Client Register</span>
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
          >
            <User size={16} /> Client Profile
          </button>
          <button
            className={`account-nav__btn ${activeTab === 'wishlist' ? 'account-nav__btn--active' : ''}`}
            onClick={() => setActiveTab('wishlist')}
          >
            <Heart size={16} /> Saved Wishlist ({wishlistItems.length})
          </button>
          <button
            className={`account-nav__btn ${activeTab === 'orders' ? 'account-nav__btn--active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <Package size={16} /> Acquisitions & Orders (0)
          </button>
        </nav>

        {/* Tab 1: Profile */}
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
                <span className="eyebrow">Privilege Tier</span>
                <h3 className="account-card__title">Maison Provenance</h3>
                <p className="body-standard" style={{ color: 'var(--color-charcoal-light)', lineHeight: 1.6 }}>
                  Your client profile is officially recorded at the Lahore atelier. As a registered client, you receive priority allocations for limited references from the <strong>MEHR</strong> and <strong>ZAR</strong> portfolios.
                </p>
                <div className="account-card__badge-row">
                  <Shield size={18} style={{ color: 'var(--color-champagne-gold)' }} />
                  <span>Verified Atelier Client ID: #{user.id.substring(0, 8).toUpperCase()}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Wishlist Overview */}
        {activeTab === 'wishlist' && (
          <div className="account-section">
            {wishlistItems.length === 0 ? (
              <div className="cart-empty-state">
                <h2 className="display-2 cart-empty-state__title">Your wishlist is empty.</h2>
                <p className="body-lead cart-empty-state__desc">
                  Browse the five NAYAB collections to save your desired references.
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

        {/* Tab 3: Orders */}
        {activeTab === 'orders' && (
          <div className="account-section">
            <div className="cart-empty-state">
              <h2 className="display-2 cart-empty-state__title">No orders yet.</h2>
              <p className="body-lead cart-empty-state__desc">
                Your acquired timepieces, transit certificates, and bespoke orders will be permanently catalogued here.
              </p>
              <EditorialButton to="/collections" variant="primary" size="md">
                Discover Timepieces
              </EditorialButton>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};
