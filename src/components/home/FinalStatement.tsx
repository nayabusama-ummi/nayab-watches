import React from 'react';
import { EditorialButton } from '../common/EditorialButton';
import './FinalStatement.css';

export const FinalStatement: React.FC = () => {
  return (
    <section className="final-statement theme-ivory" aria-label="Atelier Conclusion">
      <div className="container text-center">
        <div className="final-statement__content">
          <span className="eyebrow final-statement__eyebrow">The Atelier Philosophy</span>
          <h2 className="display-hero final-statement__title">
            Not made for now.<br />
            Made for what remains.
          </h2>
          <p className="body-lead final-statement__lead">
            An invitation to acquire mechanical permanence. Explore the complete collection or request a private consultation at our Lahore salon.
          </p>
          <div className="final-statement__actions">
            <EditorialButton
              to="/collections"
              variant="primary"
              size="lg"
            >
              Explore The Collection
            </EditorialButton>
            <EditorialButton
              to="/collections/mehr"
              variant="text"
              size="md"
            >
              Discover MEHR
            </EditorialButton>
          </div>
        </div>
      </div>
    </section>
  );
};
