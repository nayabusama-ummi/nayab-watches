import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, AlertCircle, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { EditorialButton } from '../components/common/EditorialButton';
import './AuthPages.css';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/account';

  useEffect(() => {
    window.scrollTo(0, 0);
    if (user) {
      navigate(redirectPath);
    }
  }, [user, navigate, redirectPath]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      await login({ email, password });
      navigate(redirectPath);
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid email or password. Please verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-page theme-ivory">
      <div className="auth-split">
        {/* Left: Campaign Atelier Art */}
        <div className="auth-split__media">
          <img
            src="/images/watchmaker-atelier.png"
            alt="Hand-finishing movement at the NAYAB atelier, Lahore"
            className="auth-split__img"
          />
          <div className="auth-split__media-overlay" />
          <div className="auth-split__quote">
            <span className="eyebrow eyebrow-light">The Atelier Ledger</span>
            <p className="auth-split__quote-text">
              "Every timepiece acquired from NAYAB is registered in the permanent atelier archives in Lahore."
            </p>
            <div className="auth-split__badge">
              <ShieldCheck size={14} className="auth-split__badge-icon" />
              <span>Authentic Horology Registry</span>
            </div>
          </div>
        </div>

        {/* Right: Clean Editorial Form */}
        <div className="auth-split__form-col">
          <div className="auth-form-card">
            {/* Tab Switcher */}
            <div className="auth-tabs">
              <Link to={`/login${redirectPath !== '/account' ? `?redirect=${redirectPath}` : ''}`} className="auth-tab auth-tab--active">
                Sign In
              </Link>
              <Link to={`/register${redirectPath !== '/account' ? `?redirect=${redirectPath}` : ''}`} className="auth-tab">
                Create Account
              </Link>
            </div>

            <header className="auth-form-card__header">
              <span className="eyebrow">Client Portal</span>
              <h1 className="display-1 auth-form-card__title">Sign In</h1>
              <p className="body-standard auth-form-card__subtitle">
                Access your registered acquisitions, private wishlist, and atelier orders.
              </p>
            </header>

            {errorMessage && (
              <div className="auth-error-banner" role="alert">
                <AlertCircle size={16} />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="auth-input-group">
                <label className="auth-label" htmlFor="login-email">
                  Email Address
                </label>
                <input
                  id="login-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="client@domain.com"
                  className="auth-input"
                />
              </div>

              <div className="auth-input-group">
                <div className="auth-input-top">
                  <label className="auth-label" htmlFor="login-password">
                    Password
                  </label>
                </div>
                <div className="auth-password-wrapper">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="auth-input auth-input--password"
                  />
                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="auth-form__actions">
                <EditorialButton
                  variant="primary"
                  size="lg"
                  type="submit"
                  disabled={isSubmitting}
                  className="auth-form__submit-btn"
                >
                  {isSubmitting ? 'Verifying Client…' : 'Sign In to Account'}
                </EditorialButton>
              </div>
            </form>

            <footer className="auth-form-card__footer">
              <p className="auth-form-card__footer-text">
                New to NAYAB?{' '}
                <Link to={`/register${redirectPath !== '/account' ? `?redirect=${redirectPath}` : ''}`} className="auth-link">
                  Register a new client account
                </Link>
              </p>
              <div className="auth-form-card__security">
                <Lock size={12} />
                <span>Encrypted HttpOnly cookie authentication</span>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </main>
  );
};
