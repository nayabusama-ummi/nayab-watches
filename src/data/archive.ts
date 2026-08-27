export interface ArchiveMilestone {
  year: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  caption: string;
}

export const ARCHIVE_MILESTONES: ArchiveMilestone[] = [
  {
    year: 'Origins',
    title: 'The Metalwork Legacy',
    subtitle: 'Traditions of Hand Finishing',
    description: 'Centuries of subcontinent jewellery, filigree, and precision metallurgy form the foundation of NAYAB\'s mechanical philosophy. Every timepiece is shaped with patience and generational permanence.',
    image: '/images/archive-1898.png',
    caption: 'Original escapement geometries and hand-drafted movement studies.'
  },
  {
    year: 'Architecture',
    title: 'Mughal Proportion',
    subtitle: 'Symmetry & Restraint',
    description: 'NAYAB applies geometric principles derived from classical architectural proportions — balance, quiet symmetry, and controlled negative space in dial and case design.',
    image: '/images/archive-1928.png',
    caption: 'Proportional blueprint of the Calibre N-12 twin-barrel architecture.'
  },
  {
    year: 'MEHR',
    title: 'The Sovereign Standard',
    subtitle: 'Rose Gold & Ivory Enamel',
    description: 'The archetype of formal dress horology: multi-fired grand feu ivory enamel paired with 18k rose gold and dauphine hands, embodying quiet authority.',
    image: '/images/sovereign-side.png',
    caption: 'Profile study of the Sovereign 39 rose-gold case architecture.'
  },
  {
    year: 'INDUS',
    title: 'The Meridian Horizon',
    subtitle: 'Grade 5 Titanium Geometry',
    description: 'The future of contemporary Pakistani fine watchmaking: Grade 5 titanium, micro-rotor automatic mechanics, and an integrated bracelet engineered for modern life.',
    image: '/images/meridian-41-front.png',
    caption: 'The Meridian 41 titanium sports-luxury reference, NAYAB atelier.'
  }
];
