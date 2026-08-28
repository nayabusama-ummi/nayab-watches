import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ordersApi, CreateOrderPayload } from '../api/orders.api';
import { addressesApi, ApiAddress, AddressPayload, PROVINCES } from '../api/addresses.api';
import { ApiError, messageFor } from '../api/client';
import { EditorialButton } from '../components/common/EditorialButton';
import { SeoHead } from '../components/common/SeoHead';
import {
  ArrowLeft,
  MapPin,
  Plus,
  Package,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import './Commerce.css';

type AddressMode = 'saved' | 'new';

const EMPTY_ADDRESS: AddressPayload = {
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

export const CheckoutPage: React.FC = () => {
  const { cart, isLoading: cartLoading, clearBag } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [addressMode, setAddressMode] = useState<AddressMode>('saved');
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [newAddress, setNewAddress] = useState<AddressPayload>(EMPTY_ADDRESS);
  const [saveAddress, setSaveAddress] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Load saved addresses
  const { data: addressData, isLoading: addressesLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => addressesApi.list(),
    enabled: !!user,
  });

  const savedAddresses = addressData?.addresses ?? [];

  // Auto-select default address
  useEffect(() => {
    if (savedAddresses.length > 0 && !selectedAddressId) {
      const def = savedAddresses.find((a) => a.isDefault) ?? savedAddresses[0];
      setSelectedAddressId(def.id);
      setAddressMode('saved');
    } else if (savedAddresses.length === 0) {
      setAddressMode('new');
    }
  }, [savedAddresses, selectedAddressId]);

  const items = cart?.items ?? [];
  const isEmpty = !cartLoading && items.length === 0;

  const updateNewAddress = (field: keyof AddressPayload, value: string | boolean) => {
    setNewAddress((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
    setSubmitError('');
  };

  const validate = (): boolean => {
    if (addressMode === 'saved') {
      if (!selectedAddressId) {
        setSubmitError('Please select a delivery address.');
        return false;
      }
      return true;
    }

    const errs: Record<string, string> = {};
    if (!newAddress.fullName.trim()) errs.fullName = 'Full name is required.';
    if (!newAddress.phone.trim()) errs.phone = 'Phone number is required.';
    if (!newAddress.addressLine1.trim()) errs.addressLine1 = 'Address is required.';
    if (!newAddress.city.trim()) errs.city = 'City is required.';
    if (!newAddress.province) errs.province = 'Province is required.';

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setSubmitError('');

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const payload: CreateOrderPayload =
        addressMode === 'saved'
          ? { addressId: selectedAddressId, paymentMethod: 'SIMULATED' }
          : {
              address: {
                fullName: newAddress.fullName,
                phone: newAddress.phone,
                addressLine1: newAddress.addressLine1,
                addressLine2: newAddress.addressLine2 || undefined,
                city: newAddress.city,
                province: newAddress.province as AddressPayload['province'],
                postalCode: newAddress.postalCode || undefined,
                country: 'Pakistan',
              },
              saveAddress,
              paymentMethod: 'SIMULATED',
            };

      const { order } = await ordersApi.create(payload);

      // Cart is cleared server-side on checkout; invalidate client-side state
      await clearBag();

      navigate(`/orders/${order.id}`, { state: { newOrder: true } });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === 'VALIDATION_FAILED' && Object.keys(err.fields).length > 0) {
          setFieldErrors(err.fields);
          setSubmitError('Please review the fields marked below.');
        } else if (err.code === 'INSUFFICIENT_STOCK') {
          setSubmitError(
            'One or more items in your bag are no longer available in the requested quantity. Please review your bag.'
          );
        } else if (err.code === 'CART_EMPTY') {
          setSubmitError('Your bag is empty. Please add timepieces before proceeding.');
        } else {
          setSubmitError(messageFor(err));
        }
      } else {
        setSubmitError('Something went wrong. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cartLoading || addressesLoading) {
    return (
      <main className="page-container theme-ivory commerce-page">
        <div className="container section-padding">
          <div className="page-loading">
            <span className="page-loading__text">Preparing your acquisition details…</span>
          </div>
        </div>
      </main>
    );
  }

  if (isEmpty) {
    return (
      <main className="page-container theme-ivory commerce-page">
        <div className="container section-padding">
          <div className="state-panel">
            <Package size={32} style={{ color: 'var(--color-champagne-gold)', marginBottom: '1rem' }} />
            <span className="eyebrow">Acquisition Bag</span>
            <h1 className="display-2 state-panel__title">Your bag is empty</h1>
            <p className="body-lead state-panel__desc">
              Please add timepieces to your bag before proceeding to checkout.
            </p>
            <div className="state-panel__actions">
              <EditorialButton to="/collections" variant="primary" size="md">
                Explore Collections
              </EditorialButton>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page-container theme-ivory commerce-page">
      <SeoHead
        title="Checkout & Client Acquisition Confirmation"
        description="Confirm your delivery address and reserve your NAYAB fine mechanical timepiece allocation."
        canonicalPath="/checkout"
      />
      <div className="container section-padding">
        <Link to="/cart" className="commerce-back-link">
          <ArrowLeft size={13} /> Return to Bag
        </Link>

        <header className="commerce-header">
          <span className="eyebrow">Acquisition</span>
          <h1 className="display-1 commerce-header__title">Confirm Your Order</h1>
          <p className="body-standard commerce-header__lead">
            Review your delivery details and confirm your acquisition. No payment is collected at this stage — our client office will contact you to arrange settlement and dispatch.
          </p>
        </header>

        {/* Payment simulation notice */}
        <div className="commerce-notice commerce-notice--info" role="note">
          <Lock size={15} style={{ flexShrink: 0 }} />
          <span>
            <strong>Order reservation only.</strong> This is a confirmed order reservation. No payment is processed digitally — a NAYAB client advisor will contact you within one business day to arrange payment and dispatch.
          </span>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="checkout-layout">
            {/* Left: Delivery Address */}
            <div className="checkout-main">
              <section className="checkout-section">
                <h2 className="checkout-section__title">
                  <MapPin size={18} /> Delivery Address
                </h2>

                {/* Saved addresses */}
                {savedAddresses.length > 0 && (
                  <div className="checkout-address-tabs">
                    <button
                      type="button"
                      className={`checkout-addr-tab ${addressMode === 'saved' ? 'checkout-addr-tab--active' : ''}`}
                      onClick={() => setAddressMode('saved')}
                    >
                      Saved Address
                    </button>
                    <button
                      type="button"
                      className={`checkout-addr-tab ${addressMode === 'new' ? 'checkout-addr-tab--active' : ''}`}
                      onClick={() => setAddressMode('new')}
                    >
                      <Plus size={14} /> New Address
                    </button>
                  </div>
                )}

                {addressMode === 'saved' && savedAddresses.length > 0 && (
                  <div className="checkout-saved-addresses">
                    {savedAddresses.map((addr: ApiAddress) => (
                      <label
                        key={addr.id}
                        className={`checkout-addr-card ${selectedAddressId === addr.id ? 'checkout-addr-card--selected' : ''}`}
                      >
                        <input
                          type="radio"
                          name="savedAddress"
                          value={addr.id}
                          checked={selectedAddressId === addr.id}
                          onChange={() => setSelectedAddressId(addr.id)}
                          className="checkout-addr-radio"
                        />
                        <div className="checkout-addr-card__body">
                          <span className="checkout-addr-card__name">{addr.fullName}</span>
                          {addr.isDefault && <span className="checkout-addr-badge">Default</span>}
                          <p className="checkout-addr-card__text">
                            {addr.addressLine1}
                            {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}
                            <br />
                            {addr.city}, {addr.province}
                            {addr.postalCode ? ` ${addr.postalCode}` : ''}
                            <br />
                            {addr.country} · {addr.phone}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}

                {addressMode === 'new' && (
                  <div className="checkout-addr-form">
                    <div className="checkout-field-row">
                      <div className="checkout-field">
                        <label className="checkout-label" htmlFor="co-fullName">
                          Full Name <span aria-hidden="true">*</span>
                        </label>
                        <input
                          id="co-fullName"
                          type="text"
                          autoComplete="name"
                          required
                          value={newAddress.fullName}
                          onChange={(e) => updateNewAddress('fullName', e.target.value)}
                          className={`checkout-input ${fieldErrors.fullName ? 'checkout-input--error' : ''}`}
                          aria-invalid={!!fieldErrors.fullName}
                          aria-describedby={fieldErrors.fullName ? 'co-fullName-err' : undefined}
                        />
                        {fieldErrors.fullName && (
                          <span id="co-fullName-err" className="checkout-field-err" role="alert">
                            {fieldErrors.fullName}
                          </span>
                        )}
                      </div>
                      <div className="checkout-field">
                        <label className="checkout-label" htmlFor="co-phone">
                          Phone <span aria-hidden="true">*</span>
                        </label>
                        <input
                          id="co-phone"
                          type="tel"
                          autoComplete="tel"
                          required
                          value={newAddress.phone}
                          onChange={(e) => updateNewAddress('phone', e.target.value)}
                          className={`checkout-input ${fieldErrors.phone ? 'checkout-input--error' : ''}`}
                          aria-invalid={!!fieldErrors.phone}
                          aria-describedby={fieldErrors.phone ? 'co-phone-err' : undefined}
                        />
                        {fieldErrors.phone && (
                          <span id="co-phone-err" className="checkout-field-err" role="alert">
                            {fieldErrors.phone}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="checkout-field">
                      <label className="checkout-label" htmlFor="co-line1">
                        Address Line 1 <span aria-hidden="true">*</span>
                      </label>
                      <input
                        id="co-line1"
                        type="text"
                        autoComplete="address-line1"
                        required
                        value={newAddress.addressLine1}
                        onChange={(e) => updateNewAddress('addressLine1', e.target.value)}
                        className={`checkout-input ${fieldErrors.addressLine1 ? 'checkout-input--error' : ''}`}
                        aria-invalid={!!fieldErrors.addressLine1}
                        aria-describedby={fieldErrors.addressLine1 ? 'co-line1-err' : undefined}
                      />
                      {fieldErrors.addressLine1 && (
                        <span id="co-line1-err" className="checkout-field-err" role="alert">
                          {fieldErrors.addressLine1}
                        </span>
                      )}
                    </div>

                    <div className="checkout-field">
                      <label className="checkout-label" htmlFor="co-line2">
                        Address Line 2 <span className="checkout-label__opt">(optional)</span>
                      </label>
                      <input
                        id="co-line2"
                        type="text"
                        autoComplete="address-line2"
                        value={newAddress.addressLine2 ?? ''}
                        onChange={(e) => updateNewAddress('addressLine2', e.target.value)}
                        className="checkout-input"
                      />
                    </div>

                    <div className="checkout-field-row">
                      <div className="checkout-field">
                        <label className="checkout-label" htmlFor="co-city">
                          City <span aria-hidden="true">*</span>
                        </label>
                        <input
                          id="co-city"
                          type="text"
                          autoComplete="address-level2"
                          required
                          value={newAddress.city}
                          onChange={(e) => updateNewAddress('city', e.target.value)}
                          className={`checkout-input ${fieldErrors.city ? 'checkout-input--error' : ''}`}
                          aria-invalid={!!fieldErrors.city}
                          aria-describedby={fieldErrors.city ? 'co-city-err' : undefined}
                        />
                        {fieldErrors.city && (
                          <span id="co-city-err" className="checkout-field-err" role="alert">
                            {fieldErrors.city}
                          </span>
                        )}
                      </div>

                      <div className="checkout-field">
                        <label className="checkout-label" htmlFor="co-province">
                          Province / Territory <span aria-hidden="true">*</span>
                        </label>
                        <select
                          id="co-province"
                          required
                          value={newAddress.province}
                          onChange={(e) => updateNewAddress('province', e.target.value)}
                          className={`checkout-input checkout-select ${fieldErrors.province ? 'checkout-input--error' : ''}`}
                          aria-invalid={!!fieldErrors.province}
                          aria-describedby={fieldErrors.province ? 'co-province-err' : undefined}
                        >
                          <option value="">Select province…</option>
                          {PROVINCES.map((p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                        </select>
                        {fieldErrors.province && (
                          <span id="co-province-err" className="checkout-field-err" role="alert">
                            {fieldErrors.province}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="checkout-field checkout-field--narrow">
                      <label className="checkout-label" htmlFor="co-postal">
                        Postal Code <span className="checkout-label__opt">(optional)</span>
                      </label>
                      <input
                        id="co-postal"
                        type="text"
                        autoComplete="postal-code"
                        value={newAddress.postalCode ?? ''}
                        onChange={(e) => updateNewAddress('postalCode', e.target.value)}
                        className="checkout-input"
                      />
                    </div>

                    <label className="checkout-checkbox-row">
                      <input
                        type="checkbox"
                        checked={saveAddress}
                        onChange={(e) => setSaveAddress(e.target.checked)}
                        className="checkout-checkbox"
                        id="co-save"
                      />
                      <span className="checkout-checkbox-label">Save this address to my account</span>
                    </label>
                  </div>
                )}
              </section>
            </div>

            {/* Right: Order Summary */}
            <aside className="checkout-sidebar" aria-label="Order Summary">
              <div className="checkout-summary-card">
                <span className="eyebrow checkout-summary-card__eyebrow">Summary</span>
                <h2 className="checkout-summary-card__title">Acquisition Overview</h2>

                <div className="checkout-summary-items">
                  {items.map((item) => (
                    <div key={item.id} className="checkout-summary-item">
                      <div className="checkout-summary-item__info">
                        <span className="checkout-summary-item__name">
                          {item.product.name}
                          {item.variant ? ` — ${item.variant.name}` : ''}
                        </span>
                        <span className="checkout-summary-item__qty">Qty {item.quantity}</span>
                      </div>
                      <span className="checkout-summary-item__price">{item.formattedLineTotal}</span>
                    </div>
                  ))}
                </div>

                <div className="checkout-summary-divider" />

                <div className="checkout-summary-rows">
                  <div className="checkout-summary-row">
                    <span>Subtotal</span>
                    <span>{cart?.formattedSubtotal}</span>
                  </div>
                  <div className="checkout-summary-row">
                    <span>Delivery</span>
                    <span className="checkout-summary-free">Complimentary</span>
                  </div>
                </div>

                <div className="checkout-summary-divider" />

                <div className="checkout-summary-total">
                  <span>Total</span>
                  <span className="checkout-summary-total__amount">{cart?.formattedSubtotal}</span>
                </div>

                {submitError && (
                  <div className="commerce-notice commerce-notice--error" role="alert">
                    <AlertTriangle size={15} style={{ flexShrink: 0 }} />
                    <span>{submitError}</span>
                  </div>
                )}

                <EditorialButton
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="checkout-submit-btn"
                  disabled={isSubmitting}
                  loading={isSubmitting}
                  loadingLabel="Confirming Reservation…"
                  showArrow={!isSubmitting}
                >
                  Confirm Acquisition
                </EditorialButton>

                <p className="checkout-disclaimer">
                  <Lock size={11} /> Reservation only. No digital payment is collected. A client advisor will contact you to arrange settlement.
                </p>
              </div>
            </aside>
          </div>
        </form>
      </div>
    </main>
  );
};
