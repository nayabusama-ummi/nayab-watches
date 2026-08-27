import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Keeps signed-out visitors off client pages and sends them back afterwards.
 *
 * This is a convenience, not a security control. Every protected endpoint is
 * authorised server-side; hiding a route in the browser protects nothing, and
 * the backend is written on the assumption that a client will call it directly.
 */
export const RequireAuth: React.FC<{
  children: React.ReactNode;
  /** Set for the atelier area. The server re-reads the role regardless. */
  adminOnly?: boolean;
}> = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  // Redirecting before the session probe resolves would bounce a signed-in
  // client to the login screen on every hard refresh.
  if (isLoading) {
    return (
      <main className="page-container theme-ivory">
        <div className="container section-padding">
          <div className="page-loading" role="status" aria-live="polite">
            <span className="page-loading__text">Verifying your session…</span>
          </div>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }

  if (adminOnly && !isAdmin) {
    // Deliberately not a redirect to /login: the client is signed in, they
    // simply have no business here, and saying so is clearer than a loop.
    return (
      <main className="page-container theme-ivory">
        <div className="container section-padding">
          <div className="state-panel">
            <span className="eyebrow">Restricted</span>
            <h1 className="display-2 state-panel__title">Atelier access only</h1>
            <p className="body-lead state-panel__desc">
              This area is reserved for NAYAB atelier staff. If you believe you
              should have access, contact the client office.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return <>{children}</>;
};
