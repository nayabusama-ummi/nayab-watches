import React from 'react';
import { EditorialButton } from '../common/EditorialButton';
import './CinematicChapter.css';

export interface ChapterData {
  id: number;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  supportingLine?: string;
  ctaText: string;
  ctaTarget: string;
  videoSrc: string;
  posterSrc: string;
}

interface CinematicChapterProps {
  chapter: ChapterData;
  isActive: boolean;
  opacity: number;
}

export const CinematicChapter: React.FC<CinematicChapterProps> = ({
  chapter,
  isActive,
  opacity,
}) => {
  return (
    <div
      className={`cinematic-chapter ${isActive ? 'cinematic-chapter--active' : ''}`}
      style={{ opacity }}
      aria-hidden={!isActive}
    >
      <div className="container cinematic-chapter__container">
        <div className="cinematic-chapter__content">
          {chapter.eyebrow && (
            <span className="eyebrow eyebrow-light cinematic-chapter__eyebrow">
              {chapter.eyebrow}
            </span>
          )}

          <h2 className="display-hero cinematic-chapter__title">
            {chapter.title.split('\n').map((line, i) => (
              <span key={i} className="cinematic-chapter__title-line">
                {line}
              </span>
            ))}
          </h2>

          {chapter.subtitle && (
            <p className="cinematic-chapter__subtitle">{chapter.subtitle}</p>
          )}

          {chapter.supportingLine && (
            <p className="cinematic-chapter__supporting">
              {chapter.supportingLine}
            </p>
          )}

          <div className="cinematic-chapter__cta">
            {chapter.ctaTarget.startsWith('#') ? (
              <EditorialButton
                variant="outline"
                size="md"
                onClick={() => {
                  const el = document.querySelector(chapter.ctaTarget);
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                {chapter.ctaText}
              </EditorialButton>
            ) : (
              <EditorialButton
                to={chapter.ctaTarget}
                variant="outline"
                size="md"
              >
                {chapter.ctaText}
              </EditorialButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
