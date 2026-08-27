import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import './EditorialButton.css';

interface EditorialButtonProps {
  children: React.ReactNode;
  to?: string;
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text' | 'gold' | 'light';
  size?: 'sm' | 'md' | 'lg';
  showArrow?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  ariaLabel?: string;
  disabled?: boolean;
  /** Replaces the label and locks the control while a request is in flight. */
  loading?: boolean;
  loadingLabel?: string;
}

export const EditorialButton: React.FC<EditorialButtonProps> = ({
  children,
  to,
  href,
  onClick,
  variant = 'secondary',
  size = 'md',
  showArrow = true,
  className = '',
  type = 'button',
  ariaLabel,
  disabled = false,
  loading = false,
  loadingLabel,
}) => {
  const isLocked = disabled || loading;

  const buttonClasses = [
    'editorial-button',
    `editorial-button--${variant}`,
    `editorial-button--${size}`,
    isLocked ? 'editorial-button--disabled' : '',
    loading ? 'is-loading' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      <span className="editorial-button__text">
        {loading ? loadingLabel ?? 'Working…' : children}
      </span>
      {showArrow && !loading && (
        <span className="editorial-button__arrow-wrapper" aria-hidden="true">
          <ArrowRight
            className="editorial-button__arrow"
            size={size === 'sm' ? 13 : size === 'lg' ? 16 : 14}
          />
        </span>
      )}
    </>
  );

  if (to) {
    /**
     * A locked link is rendered as a real disabled button rather than an <a> with
     * pointer-events removed — that trick still leaves the link keyboard-focusable
     * and followable with Enter.
     */
    if (isLocked) {
      return (
        <button type="button" className={buttonClasses} disabled aria-label={ariaLabel}>
          {content}
        </button>
      );
    }

    return (
      <Link
        to={to}
        className={buttonClasses}
        aria-label={ariaLabel}
        // Previously dropped on this branch, so drawers and menus passing a
        // close handler alongside `to` navigated and stayed open.
        onClick={onClick}
        aria-busy={loading || undefined}
      >
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a
        href={href}
        className={buttonClasses}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={ariaLabel}
        onClick={onClick}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={buttonClasses}
      aria-label={ariaLabel}
      disabled={isLocked}
      aria-busy={loading || undefined}
    >
      {content}
    </button>
  );
};
