import React, { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, prefersReducedMotion } from '../../animations/gsapSetup';
import { CinematicChapter, ChapterData } from './CinematicChapter';
import { ChapterIndicator } from './ChapterIndicator';
import { Volume2, VolumeX } from 'lucide-react';
import './CinematicExperience.css';

const CHAPTERS_DATA: ChapterData[] = [
  {
    id: 1,
    eyebrow: 'NAYAB · HAUTE HORLOGERIE & CONTEMPORARY PAKISTANI WATCHMAKING',
    title: 'A legacy measured\nin generations.',
    supportingLine: 'Hand-finished mechanical timepieces defined by patience, regional metallurgy, in-house calibres, and generational permanence in Lahore, Pakistan.',
    ctaText: 'Discover our heritage',
    ctaTarget: '#origin',
    videoSrc: '/media/nayab-heritage.mp4',
    posterSrc: '/media/nayab-heritage-poster.webp',
  },
  {
    id: 2,
    eyebrow: 'New Models 2026',
    title: 'Two expressions\nof time.',
    subtitle: 'Sovereign 39  ·  Meridian 41',
    supportingLine: 'A dialogue between 18k rose gold permanence and architectural grade 5 titanium.',
    ctaText: 'Discover the new models',
    ctaTarget: '#new-models',
    videoSrc: '/media/nayab-new-models.mp4',
    posterSrc: '/media/nayab-new-models-poster.webp',
  },
  {
    id: 3,
    eyebrow: 'The Future of Horology',
    title: 'The future,\nshaped by tradition.',
    supportingLine: 'Precision evolves. Craft remains.',
    ctaText: 'Discover Meridian 41',
    ctaTarget: '/watches/meridian-41',
    videoSrc: '/media/nayab-future.mp4',
    posterSrc: '/media/nayab-future-poster.webp',
  },
];

export const CinematicExperience: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const [currentChapter, setCurrentChapter] = useState(1);
  const [progress, setProgress] = useState(0);
  const [isIndicatorVisible, setIsIndicatorVisible] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    const reduced = prefersReducedMotion();
    setIsReducedMotion(reduced);

    if (reduced || !containerRef.current || !stageRef.current) return;

    const ctx = gsap.context(() => {
      // Pin the cinematic stage for 320vh scroll
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        pin: stageRef.current,
        pinSpacing: false,
        scrub: 0.5,
        onUpdate: (self) => {
          const p = self.progress;
          setProgress(p);

          // Update active chapter based on scroll position
          let activeCh = 1;
          if (p >= 0.33 && p < 0.68) {
            activeCh = 2;
          } else if (p >= 0.68) {
            activeCh = 3;
          }
          setCurrentChapter(activeCh);

          // Indicator visibility
          setIsIndicatorVisible(p < 0.96 && self.isActive);

          // Video crossfades
          const v1 = videoRefs.current[0];
          const v2 = videoRefs.current[1];
          const v3 = videoRefs.current[2];

          // Chapter 1 -> Chapter 2 crossfade
          if (v1 && v2) {
            if (p < 0.30) {
              v1.style.opacity = '1';
              v2.style.opacity = '0';
              if (v1.paused) v1.play().catch(() => {});
            } else if (p >= 0.30 && p < 0.40) {
              const blend = (p - 0.30) / 0.10;
              v1.style.opacity = `${1 - blend}`;
              v2.style.opacity = `${blend}`;
              if (v2.paused) v2.play().catch(() => {});
            } else if (p >= 0.40 && p < 0.64) {
              v1.style.opacity = '0';
              v2.style.opacity = '1';
              if (v2.paused) v2.play().catch(() => {});
            }
          }

          // Chapter 2 -> Chapter 3 crossfade
          if (v2 && v3) {
            if (p >= 0.64 && p < 0.74) {
              const blend = (p - 0.64) / 0.10;
              v2.style.opacity = `${1 - blend}`;
              v3.style.opacity = `${blend}`;
              if (v3.paused) v3.play().catch(() => {});
            } else if (p >= 0.74) {
              v2.style.opacity = '0';
              v3.style.opacity = '1';
              if (v3.paused) v3.play().catch(() => {});
            }
          }
        },
        onLeave: () => {
          setIsIndicatorVisible(false);
        },
        onEnterBack: () => {
          setIsIndicatorVisible(true);
        }
      });
    }, containerRef);

    // Initial play for chapter 1 video
    const firstVid = videoRefs.current[0];
    if (firstVid) {
      firstVid.play().catch(() => {});
    }

    return () => {
      ctx.revert();
    };
  }, []);

  const handleSelectChapter = (chapterNum: number) => {
    if (!containerRef.current) return;
    const totalHeight = containerRef.current.offsetHeight - window.innerHeight;
    const targetScroll = containerRef.current.offsetTop + (totalHeight * (chapterNum - 1)) / 2.8;
    window.scrollTo({ top: targetScroll, behavior: 'smooth' });
  };

  const toggleSound = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    videoRefs.current.forEach((v) => {
      if (v) v.muted = nextMuted;
    });
  };

  // If reduced motion is requested, render static accessible layout
  if (isReducedMotion) {
    return (
      <section className="cinematic-reduced" aria-label="NAYAB Cinematic Introduction">
        {CHAPTERS_DATA.map((ch) => (
          <div key={ch.id} className="cinematic-reduced__item">
            <img src={ch.posterSrc} alt={ch.title} className="cinematic-reduced__img" />
            <div className="cinematic-reduced__content">
              <span className="eyebrow eyebrow-light">{ch.eyebrow}</span>
              <h2 className="display-1">{ch.title}</h2>
              {ch.subtitle && <p className="cinematic-chapter__subtitle">{ch.subtitle}</p>}
              <p className="body-standard">{ch.supportingLine}</p>
            </div>
          </div>
        ))}
      </section>
    );
  }

  // Calculate chapter text opacities based on progress
  const getChapterOpacity = (chIndex: number) => {
    if (chIndex === 1) {
      if (progress < 0.28) return 1;
      if (progress < 0.36) return Math.max(0, 1 - (progress - 0.28) / 0.08);
      return 0;
    }
    if (chIndex === 2) {
      if (progress < 0.34) return 0;
      if (progress < 0.42) return (progress - 0.34) / 0.08;
      if (progress < 0.62) return 1;
      if (progress < 0.70) return Math.max(0, 1 - (progress - 0.62) / 0.08);
      return 0;
    }
    if (chIndex === 3) {
      if (progress < 0.68) return 0;
      if (progress < 0.76) return (progress - 0.68) / 0.08;
      if (progress < 0.94) return 1;
      return Math.max(0, 1 - (progress - 0.94) / 0.06);
    }
    return 0;
  };

  return (
    <div
      ref={containerRef}
      className="cinematic-container theme-black"
      id="cinematic-hero"
      style={{ height: '320vh' }}
    >
      <div ref={stageRef} className="cinematic-stage">
        {/* Controlled Tonal Overlay Gradient */}
        <div className="cinematic-stage__vignette" />

        {/* Video Canvas Layer */}
        <div className="cinematic-stage__videos">
          {CHAPTERS_DATA.map((ch, idx) => (
            <video
              key={ch.id}
              ref={(el) => (videoRefs.current[idx] = el)}
              src={ch.videoSrc}
              poster={ch.posterSrc}
              muted={isMuted}
              playsInline
              loop
              preload={idx === 0 ? 'auto' : 'metadata'}
              className={`cinematic-stage__video cinematic-stage__video--${idx + 1}`}
              style={{
                opacity: idx === 0 ? 1 : 0,
                zIndex: idx + 1,
              }}
              aria-label={`Cinematic film: ${ch.eyebrow}`}
            />
          ))}
        </div>

        {/* Text Overlay Layer */}
        <div className="cinematic-stage__overlay">
          {CHAPTERS_DATA.map((ch) => (
            <CinematicChapter
              key={ch.id}
              chapter={ch}
              isActive={currentChapter === ch.id}
              opacity={getChapterOpacity(ch.id)}
            />
          ))}
        </div>

        {/* Chapter Indicator */}
        <ChapterIndicator
          currentChapter={currentChapter}
          progress={progress}
          visible={isIndicatorVisible}
          onSelectChapter={handleSelectChapter}
        />

        {/* Audio Mute/Unmute Toggle */}
        <button
          className="cinematic-stage__sound-toggle pressable"
          onClick={toggleSound}
          aria-label={isMuted ? 'Unmute video audio' : 'Mute video audio'}
          title={isMuted ? 'Unmute audio' : 'Mute audio'}
        >
          {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
        </button>

        {/* Scroll Cue */}
        <div
          className="cinematic-stage__scroll-cue"
          style={{ opacity: progress < 0.08 ? 1 : 0 }}
        >
          <span className="cinematic-stage__scroll-label">Scroll to Explore</span>
          <div className="cinematic-stage__scroll-line" />
        </div>
      </div>
    </div>
  );
};
