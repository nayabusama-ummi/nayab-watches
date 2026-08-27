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
}) => {
  const buttonClasses = `editorial-button editorial-button--${variant} editorial-button--${size} ${className}`;

  const content = (
    <>
      <span className="editorial-button__text">{children}</span>
      {showArrow && (
        <span className="editorial-button__arrow-wrapper" aria-hidden="true">
          <ArrowRight className="editorial-button__arrow" size={size === 'sm' ? 13 : size === 'lg' ? 16 : 14} />
        </span>
      )}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={buttonClasses} aria-label={ariaLabel}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={buttonClasses} target="_blank" rel="noopener noreferrer" aria-label={ariaLabel}>
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
      disabled={disabled}
    >
      {content}
    </button>
  );
};
