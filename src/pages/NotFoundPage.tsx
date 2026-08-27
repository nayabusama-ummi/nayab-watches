import React from 'react';
import { EditorialButton } from '../components/common/EditorialButton';
import './Pages.css';

export const NotFoundPage: React.FC = () => {
  return (
    <main className="page-container theme-ivory" style={{ minHeight: '70vh' }}>
      <div className="container section-padding">
        <div className="account-unauth-card" style={{ textAlign: 'center' }}>
          <span className="eyebrow">404</span>
          <h1 className="display-1" style={{ marginTop: '0.5rem' }}>Page Not Found</h1>
          <p
            className="body-lead"
            style={{ maxWidth: '48ch', margin: '1rem auto 2rem', color: 'var(--color-charcoal-light)' }}
          >
            The page you are looking for does not exist or may have moved.
          </p>
          <div className="account-unauth-actions">
            <EditorialButton to="/" variant="primary" size="lg">
              Return to Home
            </EditorialButton>
            <EditorialButton to="/collections" variant="outline" size="md">
              Explore Collections
            </EditorialButton>
          </div>
        </div>
      </div>
    </main>
  );
};
