import React from 'react';
import './ChapterIndicator.css';

interface ChapterIndicatorProps {
  currentChapter: number; // 1, 2, 3
  progress: number;
  visible: boolean;
  onSelectChapter?: (chapter: number) => void;
}

export const ChapterIndicator: React.FC<ChapterIndicatorProps> = ({
  currentChapter,
  visible,
  onSelectChapter,
}) => {
  const chapters = [
    { num: '01', title: 'Heritage' },
    { num: '02', title: 'New Models' },
    { num: '03', title: 'Future' },
  ];

  return (
    <aside
      className={`chapter-indicator ${visible ? 'chapter-indicator--visible' : ''}`}
      aria-label="Cinematic Film Navigation"
      role="navigation"
    >
      <div className="chapter-indicator__rail">
        {chapters.map((ch, idx) => {
          const chapterIndex = idx + 1;
          const isActive = currentChapter === chapterIndex;

          return (
            <button
              key={ch.num}
              className={`chapter-indicator__item ${isActive ? 'chapter-indicator__item--active' : ''}`}
              onClick={() => onSelectChapter?.(chapterIndex)}
              aria-label={`Jump to Chapter ${ch.num}: ${ch.title}`}
              aria-current={isActive ? 'step' : undefined}
            >
              <span className="chapter-indicator__marker" />
              <span className="chapter-indicator__number">{ch.num}</span>
              {isActive && (
                <span className="chapter-indicator__label">{ch.title}</span>
              )}
            </button>
          );
        })}
      </div>
    </aside>
  );
};
