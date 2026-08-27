import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Lock, AlertCircle } from 'lucide-react';
import { EditorialButton } from '../components/common/EditorialButton';
import './AuthPages.css';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, user } = useAuth();
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

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters in length.');
      return;
    }

    setIsSubmitting(true);

    try {
      await register({
        name,
        email,
        password,
        phone: phone || undefined,
      });
      navigate(redirectPath);
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please check your details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-page theme-ivory">
      <div className="auth-split">
        {/* Left: Campaign Art */}
        <div className="auth-split__media">
          <img
            src="/images/sovereign-side.png"
            alt="NAYAB Sovereign 39 18k Rose Gold case architecture"
            className="auth-split__img"
          />
          <div className="auth-split__media-overlay" />
          <div className="auth-split__quote">
            <span className="eyebrow eyebrow-light">Generational Permanence</span>
            <p className="auth-split__quote-text">
              "A timepiece should feel inherited rather than simply purchased."
            </p>
          </div>
        </div>

        {/* Right: Registration Form */}
        <div className="auth-split__form-col">
          <div className="auth-form-card">
            <header className="auth-form-card__header">
              <span className="eyebrow">Client Registration</span>
              <h1 className="display-1 auth-form-card__title">Create Account</h1>
              <p className="body-standard auth-form-card__subtitle">
                Register as a NAYAB client to preserve your wishlist, track acquisitions, and receive private horology communications.
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
                <label className="auth-label" htmlFor="register-name">
                  Full Name
                </label>
                <input
                  id="register-name"
                  type="text"
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Mian Tariq"
                  className="auth-input"
                />
              </div>

              <div className="auth-input-group">
                <label className="auth-label" htmlFor="register-email">
                  Email Address
                </label>
                <input
                  id="register-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="auth-input"
                />
              </div>

              <div className="auth-input-grid">
                <div className="auth-input-group">
                  <label className="auth-label" htmlFor="register-password">
                    Password (8+ chars)
                  </label>
                  <input
                    id="register-password"
                    type="password"
                    required
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="auth-input"
                  />
                </div>

                <div className="auth-input-group">
                  <label className="auth-label" htmlFor="register-confirm-password">
                    Confirm Password
                  </label>
                  <input
                    id="register-confirm-password"
                    type="password"
                    required
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="auth-input"
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <label className="auth-label" htmlFor="register-phone">
                  Phone Number (Optional)
                </label>
                <input
                  id="register-phone"
                  type="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+92 300 0000000"
                  className="auth-input"
                />
              </div>

              <div className="auth-form__actions">
                <EditorialButton
                  variant="primary"
                  size="lg"
                  type="submit"
                  disabled={isSubmitting}
                  className="auth-form__submit-btn"
                >
                  {isSubmitting ? 'Registering Client...' : 'Register Client Account'}
                  <ArrowRight size={16} />
                </EditorialButton>
              </div>
            </form>

            <footer className="auth-form-card__footer">
              <p className="auth-form-card__footer-text">
                Already registered?{' '}
                <Link to={`/login${redirectPath !== '/account' ? `?redirect=${redirectPath}` : ''}`} className="auth-link">
                  Sign in to your account
                </Link>
              </p>
              <div className="auth-form-card__security">
                <Lock size={12} />
                <span>Protected by strict client privacy & data isolation</span>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </main>
  );
};
