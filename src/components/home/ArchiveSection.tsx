import React, { useState } from 'react';
import { ARCHIVE_MILESTONES, ArchiveMilestone } from '../../data/archive';
import './ArchiveSection.css';

export const ArchiveSection: React.FC = () => {
  const [selectedMilestone, setSelectedMilestone] = useState<ArchiveMilestone>(ARCHIVE_MILESTONES[0]);

  return (
    <section id="archive" className="archive-section section-padding theme-black">
      <div className="container">
        {/* Header */}
        <header className="archive-section__header">
          <span className="eyebrow">Maison Chronicles</span>
          <h2 className="display-1 archive-section__title">The Archive</h2>
          <p className="body-lead archive-section__intro">
            A contemporary Pakistani watch house built with an old-world respect for craft, documented through manual studies, geometric ledgers, and architectural blueprints.
          </p>
        </header>

        {/* Timeline Navigation Strip */}
        <nav className="archive-section__timeline-nav" aria-label="Archive Historical Milestones">
          {ARCHIVE_MILESTONES.map((m) => {
            const isSelected = selectedMilestone.year === m.year;

            return (
              <button
                key={m.year}
                className={`archive-section__timeline-btn pressable ${
                  isSelected ? 'archive-section__timeline-btn--active' : ''
                }`}
                onClick={() => setSelectedMilestone(m)}
                aria-label={`Milestone: ${m.title}`}
                aria-pressed={isSelected}
              >
                <span className="archive-section__btn-year">{m.year}</span>
                <span className="archive-section__btn-title">{m.title}</span>
                <div className="archive-section__btn-indicator" />
              </button>
            );
          })}
        </nav>

        {/* Detailed Milestone Showcase */}
        <article className="archive-section__display">
          <div className="archive-section__media-frame">
            <img
              src={selectedMilestone.image}
              alt={`${selectedMilestone.year} - ${selectedMilestone.title}`}
              className="archive-section__image"
              key={selectedMilestone.year}
            />
            <p className="archive-section__caption">{selectedMilestone.caption}</p>
          </div>

          <div className="archive-section__narrative">
            <div className="archive-section__year-stamp">{selectedMilestone.year}</div>
            <span className="eyebrow">{selectedMilestone.subtitle}</span>
            <h3 className="display-2 archive-section__display-title">
              {selectedMilestone.title}
            </h3>
            <p className="body-standard archive-section__body">
              {selectedMilestone.description}
            </p>
          </div>
        </article>
      </div>
    </section>
  );
};
