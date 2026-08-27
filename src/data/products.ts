export interface ProductSpecification {
  caseDiameter: string;
  thickness: string;
  caseMaterial: string;
  dial: string;
  hands: string;
  crystal: string;
  waterResistance: string;
  calibre: string;
  powerReserve: string;
  frequency: string;
  jewels: number;
  bracelet: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  collection: string;
  collectionSlug: string;
  tagline: string;
  price: number;
  formattedPrice: string;
  material: string;
  size: string;
  dialColor: string;
  heroImage: string;
  sideImage?: string;
  detailImage?: string;
  explodedImage?: string;
  isNew?: boolean;
  isHero?: boolean;
  category: 'mens' | 'womens' | 'unisex';
  description: string;
  narrative: string;
  specs: ProductSpecification;
}

export const PRODUCTS: Product[] = [
  {
    id: 'sovereign-39',
    slug: 'sovereign-39',
    name: 'Sovereign 39',
    collection: 'MEHR Collection',
    collectionSlug: 'mehr',
    tagline: 'Quiet authority in rose gold and ivory enamel.',
    price: 18900,
    formattedPrice: '$18,900',
    material: '18k Rose Gold',
    size: '39 mm',
    dialColor: 'Ivory Enamel',
    heroImage: '/images/sovereign-39-front.png',
    sideImage: '/images/sovereign-side.png',
    detailImage: '/images/craftsmanship-macro.png',
    isNew: true,
    isHero: true,
    category: 'mens',
    description: 'The formal flagship of NAYAB. A 39 mm case carved in 18k rose gold houses a multi-fired grand feu ivory enamel dial, dauphine hands, and small seconds at 6 o’clock.',
    narrative: 'Conceived in the Lahore atelier, Sovereign 39 unites Mughal architectural balance with strict horological restraint. The dial is hand-fired across multiple furnace stages to achieve depth and permanence.',
    specs: {
      caseDiameter: '39 mm',
      thickness: '9.2 mm',
      caseMaterial: '18k Polished Rose Gold (5N)',
      dial: 'Grand Feu Ivory Enamel with applied gold batons',
      hands: 'Hand-bevelled Dauphine in 18k Rose Gold',
      crystal: 'Domed Sapphire with anti-reflective coating',
      waterResistance: '30 meters / 3 ATM',
      calibre: 'Calibre N-12 Manual Wind',
      powerReserve: '72 hours (Twin Barrel)',
      frequency: '21,600 vph (3 Hz)',
      jewels: 28,
      bracelet: 'Hand-stitched patinated Mississippiensis alligator leather'
    }
  },
  {
    id: 'meridian-41',
    slug: 'meridian-41',
    name: 'Meridian 41',
    collection: 'INDUS Collection',
    collectionSlug: 'indus',
    tagline: 'Architectural titanium and midnight-blue geometry.',
    price: 24500,
    formattedPrice: '$24,500',
    material: 'Grade 5 Titanium',
    size: '41 mm',
    dialColor: 'Midnight Blue Guilloché',
    heroImage: '/images/meridian-41-front.png',
    sideImage: '/images/meridian-material-macro.png',
    explodedImage: '/images/meridian-exploded.png',
    isNew: true,
    isHero: true,
    category: 'mens',
    description: 'The contemporary titanium flagship of NAYAB. Forged in ultra-light Grade 5 titanium with an integrated tapering bracelet, textured midnight-blue dial, and micro-rotor automatic calibre.',
    narrative: 'Meridian 41 draws structural inspiration from Indus architectural geometry. Alternating satin-brushed planes and mirror-polished facets create crisp light transitions across the monocoque case.',
    specs: {
      caseDiameter: '41 mm',
      thickness: '9.8 mm',
      caseMaterial: 'Grade 5 Titanium with satin and hand-polished facets',
      dial: 'Textured Midnight-Blue Clous de Paris with luminescent indices',
      hands: 'Skeletonized titanium hands with Super-LumiNova',
      crystal: 'Flat Sapphire with multi-layer anti-glare treatment',
      waterResistance: '120 meters / 12 ATM',
      calibre: 'Calibre N-01 Micro-Rotor Automatic',
      powerReserve: '60 hours',
      frequency: '28,800 vph (4 Hz)',
      jewels: 32,
      bracelet: 'Integrated Grade 5 Titanium tapered bracelet with hidden micro-adjustment clasp'
    }
  },
  {
    id: 'noor-32',
    slug: 'noor-32',
    name: 'NOOR 32',
    collection: 'NOOR Collection',
    collectionSlug: 'noor',
    tagline: 'Measured proportions and quiet brilliance.',
    price: 16200,
    formattedPrice: '$16,200',
    material: '18k Champagne Gold',
    size: '32 mm',
    dialColor: 'Opaline Ivory',
    heroImage: '/images/noor-32-women.webp',
    sideImage: '/images/sovereign-side.png',
    isNew: false,
    category: 'womens',
    description: 'A smaller expression of the NAYAB language — balanced proportions, mechanical precision and quiet presence in a 32 mm champagne gold case.',
    narrative: 'NOOR 32 is designed with classical discipline. A slender 7.8 mm case houses an in-house manual calibre with opaline ivory dial and hand-polished gold hour markers.',
    specs: {
      caseDiameter: '32 mm',
      thickness: '7.8 mm',
      caseMaterial: '18k Champagne Gold',
      dial: 'Opaline Ivory with hand-applied gold indices',
      hands: 'Polished leaf hands',
      crystal: 'Box-shaped Sapphire Crystal',
      waterResistance: '30 meters / 3 ATM',
      calibre: 'Calibre N-18 Ultra-Thin Manual Wind',
      powerReserve: '50 hours',
      frequency: '28,800 vph (4 Hz)',
      jewels: 24,
      bracelet: 'Taupe grey calfskin leather strap with 18k gold pin buckle'
    }
  },
  {
    id: 'karakoram-chronometer-42',
    slug: 'karakoram-chronometer-42',
    name: 'Karakoram Chronometer',
    collection: 'KARAKORAM Collection',
    collectionSlug: 'karakoram',
    tagline: 'High-altitude precision and marine-grade column-wheel chronograph.',
    price: 22400,
    formattedPrice: '$22,400',
    material: 'Brushed Steel & Ceramic',
    size: '42 mm',
    dialColor: 'Deep Slate Grey',
    heroImage: '/images/collection-regatta.png',
    isNew: false,
    category: 'mens',
    description: 'Constructed for demanding environments. High-altitude column-wheel chronograph with ceramic bezel and 300m water resistance.',
    narrative: 'Engineered with inspiration from Pakistan\'s northern Karakoram ranges. Provides tactile feedback through an integrated column-wheel chronograph mechanism.',
    specs: {
      caseDiameter: '42 mm',
      thickness: '12.4 mm',
      caseMaterial: 'Marine-grade 904L Steel with Zirconia Ceramic Bezel',
      dial: 'Sunburst Slate Grey with high-contrast nautical sub-counters',
      hands: 'Sword hands with luminous coating',
      crystal: 'Flat Sapphire with extreme scratch resistance',
      waterResistance: '300 meters / 30 ATM',
      calibre: 'Calibre N-54 Flyback Column-Wheel Chronograph',
      powerReserve: '65 hours',
      frequency: '36,000 vph (5 Hz)',
      jewels: 38,
      bracelet: 'Reinforced FKM vulcanized rubber and steel mesh bracelet'
    }
  },
  {
    id: 'zar-grand-complication',
    slug: 'zar-grand-complication',
    name: 'ZAR Minute Repeater',
    collection: 'ZAR Collection',
    collectionSlug: 'zar',
    tagline: 'The pinnacle of acoustic horology and precious metallurgy.',
    price: 145000,
    formattedPrice: '$145,000',
    material: '18k Honey Gold',
    size: '43 mm',
    dialColor: 'Openworked Sapphire',
    heroImage: '/images/collection-atelier.png',
    isNew: false,
    category: 'unisex',
    description: 'A cathedral-gong minute repeater chiming hours, quarter-hours, and minutes on two hand-tuned circular steel gongs.',
    narrative: 'Crafted entirely within the private high-complication atelier in Lahore. Each steel gong is voiced and tuned by ear over four weeks of manual adjustment.',
    specs: {
      caseDiameter: '43 mm',
      thickness: '11.6 mm',
      caseMaterial: 'Acoustic Resonance 18k Honey Gold',
      dial: 'Smoked Sapphire Crystal revealing hand-anglage movement bridges',
      hands: 'Flame-blued steel hands',
      crystal: 'Domed Sapphire with interior anti-glare',
      waterResistance: 'Dust / Humidity resistant (Acoustic cavity)',
      calibre: 'Calibre N-00 Cathedral Minute Repeater',
      powerReserve: '55 hours',
      frequency: '21,600 vph (3 Hz)',
      jewels: 46,
      bracelet: 'Hand-sewn saddle leather with honey gold folding clasp'
    }
  }
];

export const getProductBySlug = (slug: string): Product | undefined => {
  return PRODUCTS.find(p => p.slug === slug);
};
