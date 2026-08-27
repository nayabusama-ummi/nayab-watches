export interface Collection {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  heroImage: string;
  accentColor?: string;
  focus: string;
  count: number;
}

export const COLLECTIONS: Collection[] = [
  {
    id: 'mehr',
    slug: 'mehr',
    name: 'MEHR',
    tagline: 'Quiet Proportions · Precious Materials',
    description: 'Quiet proportions. Precious materials. A formal expression of NAYAB.',
    heroImage: '/images/sovereign-39-front.png',
    accentColor: '#B8965D',
    focus: 'Formal dress timepieces in rose gold and grand feu enamel',
    count: 2
  },
  {
    id: 'indus',
    slug: 'indus',
    name: 'INDUS',
    tagline: 'Integrated Architecture · Modern Movement',
    description: 'Integrated architecture shaped for modern movement.',
    heroImage: '/images/meridian-41-front.png',
    accentColor: '#B9BDC2',
    focus: 'Grade 5 titanium sports-luxury with architectural geometry',
    count: 2
  },
  {
    id: 'karakoram',
    slug: 'karakoram',
    name: 'KARAKORAM',
    tagline: 'High Altitude Precision · Enduring Endurance',
    description: 'Precision engineered for altitude, distance and changing conditions.',
    heroImage: '/images/collection-regatta.png',
    accentColor: '#17342F',
    focus: 'Exploration & high-frequency column-wheel chronometers',
    count: 1
  },
  {
    id: 'noor',
    slug: 'noor',
    name: 'NOOR',
    tagline: 'Measured Proportions · Quiet Brilliance',
    description: 'Measured proportions and quiet brilliance.',
    heroImage: '/images/noor-32-women.webp',
    accentColor: '#D4B67F',
    focus: 'Refined 32 mm mechanical dress horology',
    count: 1
  },
  {
    id: 'zar',
    slug: 'zar',
    name: 'ZAR',
    tagline: 'Rare Metallurgy · High Mechanical Complications',
    description: 'Rare materials and NAYAB\'s most complex mechanical work.',
    heroImage: '/images/collection-atelier.png',
    accentColor: '#B8965D',
    focus: 'Cathedral minute repeaters & tourbillon complications',
    count: 1
  }
];

export const getCollectionBySlug = (slug: string): Collection | undefined => {
  return COLLECTIONS.find(c => c.slug === slug);
};
