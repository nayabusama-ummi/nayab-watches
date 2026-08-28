import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { CinematicExperience } from '../components/home/CinematicExperience';
import { SectionTransition } from '../components/home/SectionTransition';
import { OriginSection } from '../components/home/OriginSection';
import { NewModelsSection } from '../components/home/NewModelsSection';
import { WomensCollectionSection } from '../components/home/WomensCollectionSection';
import { CraftsmanshipSection } from '../components/home/CraftsmanshipSection';
import { ExplodedViewSection } from '../components/home/ExplodedViewSection';
import { CollectionsSection } from '../components/home/CollectionsSection';
import { ArchiveSection } from '../components/home/ArchiveSection';
import { FinalStatement } from '../components/home/FinalStatement';
import { FloatingInventoryCta } from '../components/home/FloatingInventoryCta';

export const HomePage: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const targetId = location.hash.replace('#', '');
      const timer = setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) {
          const navHeight = 70;
          const targetY = el.getBoundingClientRect().top + window.scrollY - navHeight;
          window.scrollTo({ top: targetY, behavior: 'smooth' });
        }
      }, 150);
      return () => clearTimeout(timer);
    } else {
      window.scrollTo(0, 0);
    }
  }, [location.hash]);

  return (
    <main className="homepage">
      {/* PHASE A: Pinned 3-Chapter Cinematic Experience */}
      <CinematicExperience />

      {/* PHASE B: Editorial Luxury Experience */}
      <SectionTransition />
      <OriginSection />
      <NewModelsSection />
      <WomensCollectionSection />
      <CraftsmanshipSection />
      <ExplodedViewSection />
      <CollectionsSection />
      <ArchiveSection />
      <FinalStatement />
      <FloatingInventoryCta />
    </main>
  );
};
