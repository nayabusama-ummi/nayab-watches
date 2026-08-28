import { ApiProduct, ProductFilterParams, ProductsResponse } from '../api/products.api';
import { ApiCollection } from '../api/collections.api';
import { ApiCart } from '../api/cart.api';
import { ApiOrder } from '../api/orders.api';
import { ApiAddress } from '../api/addresses.api';
import { UserProfile } from '../api/auth.api';

export const FALLBACK_COLLECTIONS: ApiCollection[] = [
  {
    id: 'col-mehr',
    slug: 'mehr',
    name: 'MEHR',
    tagline: 'Quiet Proportions · Precious Materials',
    description: 'Quiet proportions. Precious materials. A formal expression of NAYAB.',
    heroImage: '/images/sovereign-39-front.png',
    accentColor: '#B8965D',
    displayOrder: 1,
    productCount: 2,
  },
  {
    id: 'col-indus',
    slug: 'indus',
    name: 'INDUS',
    tagline: 'Integrated Architecture · Modern Movement',
    description: 'Integrated architecture shaped for modern movement.',
    heroImage: '/images/meridian-41-front.png',
    accentColor: '#B9BDC2',
    displayOrder: 2,
    productCount: 2,
  },
  {
    id: 'col-noor',
    slug: 'noor',
    name: 'NOOR',
    tagline: 'Measured Proportions · Quiet Brilliance',
    description: 'Measured proportions and quiet brilliance.',
    heroImage: '/images/noor-32-women.webp',
    accentColor: '#D4B67F',
    displayOrder: 3,
    productCount: 1,
  },
  {
    id: 'col-karakoram',
    slug: 'karakoram',
    name: 'KARAKORAM',
    tagline: 'High Altitude Precision · Enduring Endurance',
    description: 'Precision engineered for altitude, distance and changing conditions.',
    heroImage: '/images/collection-regatta.png',
    accentColor: '#17342F',
    displayOrder: 4,
    productCount: 1,
  },
  {
    id: 'col-zar',
    slug: 'zar',
    name: 'ZAR',
    tagline: 'Rare Metallurgy · High Mechanical Complications',
    description: "Rare materials and NAYAB's most complex mechanical work.",
    heroImage: '/images/collection-atelier.png',
    accentColor: '#B8965D',
    displayOrder: 5,
    productCount: 1,
  },
];

export const FALLBACK_PRODUCTS: ApiProduct[] = [
  {
    id: 'prod-sovereign-39',
    slug: 'sovereign-39',
    name: 'Sovereign 39',
    reference: 'REF. NB-3901-RG',
    collectionId: 'col-mehr',
    collection: {
      id: 'col-mehr',
      slug: 'mehr',
      name: 'MEHR',
      tagline: 'Quiet Proportions · Precious Materials',
    },
    tagline: 'Quiet authority in rose gold and ivory enamel.',
    shortDescription: 'A 39 mm case carved in 18k rose gold houses a multi-fired grand feu ivory enamel dial, dauphine hands, and small seconds at 6 o’clock.',
    description: 'The formal flagship of NAYAB. Conceived in the Lahore atelier, Sovereign 39 unites Mughal architectural balance with strict horological restraint. The dial is hand-fired across multiple furnace stages to achieve depth and permanence.',
    narrative: 'Every Sovereign case is hand-finished with contrasting satin-brushed bands and mirror-polished bezels. The manual-winding Calibre N-12 operates with twin barrels providing 72 hours of stable torque.',
    price: 3850000,
    formattedPrice: 'PKR 3,850,000',
    currency: 'PKR',
    caseMaterial: '18k Rose Gold (5N)',
    caseDiameter: '39 mm',
    caseThickness: '8.4 mm',
    dial: 'Grand Feu Ivory Enamel with hand-applied gold indices',
    movement: 'Manual-winding Calibre N-12',
    powerReserve: '72 hours (Twin Barrel)',
    waterResistance: '30 meters / 3 ATM',
    frequency: '21,600 vph (3 Hz)',
    jewels: 28,
    strapOrBracelet: 'Hand-stitched patinated Mississippiensis alligator leather with 18k rose gold pin buckle',
    availability: 'AVAILABLE',
    stock: 4,
    featured: true,
    newModel: true,
    category: 'mens',
    images: [
      { id: 'img-sov-1', url: '/images/sovereign-39-front.png', alt: 'NAYAB Sovereign 39 18k Rose Gold front dial view', type: 'HERO', sortOrder: 1 },
      { id: 'img-sov-2', url: '/images/sovereign-39-front.png', alt: 'NAYAB Sovereign 39 dial detail', type: 'FRONT', sortOrder: 2 },
      { id: 'img-sov-3', url: '/images/sovereign-side.png', alt: 'NAYAB Sovereign 39 profile architecture', type: 'SIDE', sortOrder: 3 },
      { id: 'img-sov-4', url: '/images/craftsmanship-macro.png', alt: 'NAYAB Sovereign 39 hand-bevelled anglage macro', type: 'MACRO', sortOrder: 4 },
    ],
    variants: [
      {
        id: 'var-sov-rg',
        sku: 'NB-3901-RG-IVORY',
        name: '18k Rose Gold / Ivory Enamel / Brown Alligator',
        material: '18k Rose Gold',
        dialColor: 'Grand Feu Ivory Enamel',
        strap: 'Brown Alligator Leather',
        price: 3850000,
        formattedPrice: 'PKR 3,850,000',
        stock: 3,
      },
      {
        id: 'var-sov-wg',
        sku: 'NB-3901-WG-SLATE',
        name: '18k White Gold / Smoked Slate Enamel / Black Alligator',
        material: '18k White Gold',
        dialColor: 'Smoked Slate Enamel',
        strap: 'Black Alligator Leather',
        price: 4100000,
        formattedPrice: 'PKR 4,100,000',
        stock: 1,
      },
    ],
  },
  {
    id: 'prod-mehr-36',
    slug: 'mehr-36',
    name: 'Mehr 36',
    reference: 'REF. NB-3601-YG',
    collectionId: 'col-mehr',
    collection: {
      id: 'col-mehr',
      slug: 'mehr',
      name: 'MEHR',
      tagline: 'Quiet Proportions · Precious Materials',
    },
    tagline: 'Classical restraint in 18k yellow gold.',
    shortDescription: 'A mid-size 36 mm formal dress watch with opaline silver dial, blued seconds hand, and ultra-thin hand-wound movement.',
    description: 'Mehr 36 is scaled for collectors seeking classical proportions. Featuring a clean sector dial layout with subtle railroad track minute indices and a slender 7.9 mm case profile.',
    narrative: 'Crafted as a tribute to classical subcontinent horological aesthetics, Mehr 36 combines warmth and timeless wrist presence.',
    price: 3250000,
    formattedPrice: 'PKR 3,250,000',
    currency: 'PKR',
    caseMaterial: '18k Yellow Gold (3N)',
    caseDiameter: '36 mm',
    caseThickness: '7.9 mm',
    dial: 'Opaline Silver with black printed indices and gold batons',
    movement: 'Manual-winding Calibre N-12 Ultra-Thin',
    powerReserve: '60 hours',
    waterResistance: '30 meters / 3 ATM',
    frequency: '21,600 vph (3 Hz)',
    jewels: 26,
    strapOrBracelet: 'Matte black hand-rolled alligator leather',
    availability: 'AVAILABLE',
    stock: 3,
    featured: false,
    newModel: false,
    category: 'unisex',
    images: [
      { id: 'img-mehr-1', url: '/images/sovereign-39-front.png', alt: 'NAYAB Mehr 36 18k Yellow Gold', type: 'HERO', sortOrder: 1 },
      { id: 'img-mehr-2', url: '/images/sovereign-39-front.png', alt: 'NAYAB Mehr 36 front view', type: 'FRONT', sortOrder: 2 },
    ],
    variants: [
      {
        id: 'var-mehr-yg',
        sku: 'NB-3601-YG-SILVER',
        name: '18k Yellow Gold / Opaline Silver / Black Alligator',
        material: '18k Yellow Gold',
        dialColor: 'Opaline Silver',
        strap: 'Matte Black Alligator',
        price: 3250000,
        formattedPrice: 'PKR 3,250,000',
        stock: 3,
      },
    ],
  },
  {
    id: 'prod-meridian-41',
    slug: 'meridian-41',
    name: 'Meridian 41',
    reference: 'REF. NB-4102-TI',
    collectionId: 'col-indus',
    collection: {
      id: 'col-indus',
      slug: 'indus',
      name: 'INDUS',
      tagline: 'Integrated Architecture · Modern Movement',
    },
    tagline: 'Architectural titanium and midnight-blue geometry.',
    shortDescription: 'Ultra-light Grade 5 titanium with an integrated tapering bracelet, textured midnight-blue dial, and micro-rotor automatic calibre.',
    description: 'The contemporary titanium flagship of NAYAB. Forged in ultra-light Grade 5 titanium with an integrated tapering bracelet, textured midnight-blue dial, and micro-rotor automatic calibre.',
    narrative: 'Meridian 41 draws structural inspiration from Indus architectural geometry. Alternating satin-brushed planes and mirror-polished facets create crisp light transitions across the monocoque case.',
    price: 2950000,
    formattedPrice: 'PKR 2,950,000',
    currency: 'PKR',
    caseMaterial: 'Grade 5 Titanium with satin and hand-polished facets',
    caseDiameter: '41 mm',
    caseThickness: '9.8 mm',
    dial: 'Textured Midnight-Blue Clous de Paris with luminescent indices',
    movement: 'Calibre N-01 Micro-Rotor Automatic (Tungsten Mass)',
    powerReserve: '60 hours',
    waterResistance: '120 meters / 12 ATM',
    frequency: '28,800 vph (4 Hz)',
    jewels: 32,
    strapOrBracelet: 'Integrated Grade 5 Titanium tapered bracelet with hidden micro-adjustment clasp',
    availability: 'AVAILABLE',
    stock: 5,
    featured: true,
    newModel: true,
    category: 'mens',
    images: [
      { id: 'img-mer-1', url: '/images/meridian-41-front.png', alt: 'NAYAB Meridian 41 Titanium front view', type: 'HERO', sortOrder: 1 },
      { id: 'img-mer-2', url: '/images/meridian-41-front.png', alt: 'NAYAB Meridian 41 dial and bezel', type: 'FRONT', sortOrder: 2 },
      { id: 'img-mer-3', url: '/images/meridian-material-macro.png', alt: 'NAYAB Meridian 41 brushed titanium facet macro', type: 'MACRO', sortOrder: 3 },
      { id: 'img-mer-4', url: '/images/meridian-exploded.png', alt: 'NAYAB Meridian 41 Calibre N-01 exploded view', type: 'EXPLODED', sortOrder: 4 },
    ],
    variants: [
      {
        id: 'var-mer-blue',
        sku: 'NB-4102-TI-BLUE',
        name: 'Grade 5 Titanium / Midnight Blue / Integrated Bracelet',
        material: 'Grade 5 Titanium',
        dialColor: 'Midnight Blue Clous de Paris',
        strap: 'Integrated Titanium Bracelet',
        price: 2950000,
        formattedPrice: 'PKR 2,950,000',
        stock: 4,
      },
      {
        id: 'var-mer-charcoal',
        sku: 'NB-4102-TI-CHARCOAL',
        name: 'Grade 5 Titanium / Charcoal Anthracite / Integrated Bracelet',
        material: 'Grade 5 Titanium',
        dialColor: 'Charcoal Anthracite Guilloché',
        strap: 'Integrated Titanium Bracelet',
        price: 2950000,
        formattedPrice: 'PKR 2,950,000',
        stock: 1,
      },
    ],
  },
  {
    id: 'prod-indus-39',
    slug: 'indus-39',
    name: 'Indus 39',
    reference: 'REF. NB-3902-ST',
    collectionId: 'col-indus',
    collection: {
      id: 'col-indus',
      slug: 'indus',
      name: 'INDUS',
      tagline: 'Integrated Architecture · Modern Movement',
    },
    tagline: 'Architectural steel for modern movement.',
    shortDescription: 'Forged in high-finish 904L steel with integrated bracelet and smoked slate tapisserie dial.',
    description: 'Indus 39 distills the geometric language of the INDUS collection into a compact 39 mm profile suited for versatile daily wear.',
    narrative: 'Every facet reflects architectural harmony, powered by the thin automatic Calibre N-01 with tungsten micro-rotor.',
    price: 2450000,
    formattedPrice: 'PKR 2,450,000',
    currency: 'PKR',
    caseMaterial: 'Marine-grade 904L Stainless Steel',
    caseDiameter: '39 mm',
    caseThickness: '9.4 mm',
    dial: 'Smoked Slate Tapisserie with applied luminescent indices',
    movement: 'Calibre N-01 Micro-Rotor Automatic',
    powerReserve: '60 hours',
    waterResistance: '120 meters / 12 ATM',
    frequency: '28,800 vph (4 Hz)',
    jewels: 32,
    strapOrBracelet: 'Integrated 904L Steel bracelet with butterfly deployant clasp',
    availability: 'AVAILABLE',
    stock: 6,
    featured: false,
    newModel: false,
    category: 'mens',
    images: [
      { id: 'img-indus-1', url: '/images/meridian-41-front.png', alt: 'NAYAB Indus 39 Steel front view', type: 'HERO', sortOrder: 1 },
      { id: 'img-indus-2', url: '/images/meridian-41-front.png', alt: 'NAYAB Indus 39 dial', type: 'FRONT', sortOrder: 2 },
    ],
    variants: [
      {
        id: 'var-indus-slate',
        sku: 'NB-3902-ST-SLATE',
        name: '904L Steel / Smoked Slate / Integrated Steel',
        material: '904L Steel',
        dialColor: 'Smoked Slate',
        strap: 'Integrated 904L Steel Bracelet',
        price: 2450000,
        formattedPrice: 'PKR 2,450,000',
        stock: 6,
      },
    ],
  },
  {
    id: 'prod-noor-32',
    slug: 'noor-32',
    name: 'Noor 32',
    reference: 'REF. NB-3201-CG',
    collectionId: 'col-noor',
    collection: {
      id: 'col-noor',
      slug: 'noor',
      name: 'NOOR',
      tagline: 'Measured Proportions · Quiet Brilliance',
    },
    tagline: 'Measured proportions and quiet brilliance.',
    shortDescription: 'A smaller expression of the NAYAB language — balanced proportions, mechanical precision and quiet presence in an 18k champagne gold case.',
    description: 'NOOR 32 is designed with classical discipline. A slender 7.8 mm case houses an in-house manual calibre with opaline ivory dial and hand-polished gold hour markers.',
    narrative: 'Proportioned with restraint, NOOR 32 celebrates the subtle play of warm champagne gold against an unadorned opaline ivory dial.',
    price: 1850000,
    formattedPrice: 'PKR 1,850,000',
    currency: 'PKR',
    caseMaterial: '18k Champagne Gold',
    caseDiameter: '32 mm',
    caseThickness: '7.8 mm',
    dial: 'Opaline Ivory with hand-applied gold indices and small seconds',
    movement: 'Calibre N-18 Ultra-Thin Manual Wind',
    powerReserve: '50 hours',
    waterResistance: '30 meters / 3 ATM',
    frequency: '28,800 vph (4 Hz)',
    jewels: 24,
    strapOrBracelet: 'Taupe grey fine calfskin leather strap with 18k gold pin buckle',
    availability: 'AVAILABLE',
    stock: 4,
    featured: true,
    newModel: false,
    category: 'womens',
    images: [
      { id: 'img-noor-1', url: '/images/noor-32-women.webp', alt: 'NAYAB NOOR 32 18k Champagne Gold watch product photography', type: 'HERO', sortOrder: 1 },
      { id: 'img-noor-2', url: '/images/noor-32-women.webp', alt: 'NAYAB NOOR 32 dial and strap detail', type: 'FRONT', sortOrder: 2 },
      { id: 'img-noor-3', url: '/images/sovereign-side.png', alt: 'NAYAB NOOR 32 profile', type: 'SIDE', sortOrder: 3 },
    ],
    variants: [
      {
        id: 'var-noor-ivory',
        sku: 'NB-3201-CG-IVORY',
        name: '18k Champagne Gold / Opaline Ivory / Taupe Calfskin',
        material: '18k Champagne Gold',
        dialColor: 'Opaline Ivory',
        strap: 'Taupe Grey Calfskin',
        price: 1850000,
        formattedPrice: 'PKR 1,850,000',
        stock: 4,
      },
    ],
  },
  {
    id: 'prod-karakoram-42',
    slug: 'karakoram-42',
    name: 'Karakoram 42',
    reference: 'REF. NB-4205-SS',
    collectionId: 'col-karakoram',
    collection: {
      id: 'col-karakoram',
      slug: 'karakoram',
      name: 'KARAKORAM',
      tagline: 'High Altitude Precision · Enduring Endurance',
    },
    tagline: 'High altitude precision and column-wheel chronograph.',
    shortDescription: 'Constructed for demanding environments. High-altitude column-wheel chronograph with ceramic bezel and 300m water resistance.',
    description: "Engineered with inspiration from Pakistan's northern Karakoram ranges. Provides tactile feedback through an integrated column-wheel chronograph mechanism.",
    narrative: 'Tested across extreme temperature variances, the Karakoram 42 balances robust construction with meticulous Haute Horlogerie hand-finishing on movement bridges.',
    price: 2750000,
    formattedPrice: 'PKR 2,750,000',
    currency: 'PKR',
    caseMaterial: 'Marine-grade 904L Steel with Zirconia Ceramic Bezel',
    caseDiameter: '42 mm',
    caseThickness: '12.4 mm',
    dial: 'Sunburst Slate Grey with high-contrast nautical sub-counters',
    movement: 'Calibre N-54 Flyback Column-Wheel Chronograph',
    powerReserve: '65 hours',
    waterResistance: '300 meters / 30 ATM',
    frequency: '36,000 vph (5 Hz)',
    jewels: 38,
    strapOrBracelet: 'Reinforced FKM vulcanized rubber and steel mesh bracelet',
    availability: 'AVAILABLE',
    stock: 3,
    featured: false,
    newModel: false,
    category: 'mens',
    images: [
      { id: 'img-kara-1', url: '/images/collection-regatta.png', alt: 'NAYAB Karakoram 42 Chronograph', type: 'HERO', sortOrder: 1 },
      { id: 'img-kara-2', url: '/images/collection-regatta.png', alt: 'NAYAB Karakoram 42 front view', type: 'FRONT', sortOrder: 2 },
    ],
    variants: [
      {
        id: 'var-kara-slate',
        sku: 'NB-4205-SS-SLATE',
        name: '904L Steel / Slate Sunburst / FKM Rubber',
        material: '904L Steel & Ceramic',
        dialColor: 'Sunburst Slate Grey',
        strap: 'FKM Vulcanized Rubber',
        price: 2750000,
        formattedPrice: 'PKR 2,750,000',
        stock: 3,
      },
    ],
  },
  {
    id: 'prod-zar-perpetual',
    slug: 'zar-perpetual',
    name: 'Zar Perpetual Minute Repeater',
    reference: 'REF. NB-4309-HG',
    collectionId: 'col-zar',
    collection: {
      id: 'col-zar',
      slug: 'zar',
      name: 'ZAR',
      tagline: 'Rare Metallurgy · High Mechanical Complications',
    },
    tagline: 'The pinnacle of acoustic horology and precious metallurgy.',
    shortDescription: 'A cathedral-gong minute repeater chiming hours, quarter-hours, and minutes on two hand-tuned circular steel gongs.',
    description: 'Crafted entirely within the private high-complication atelier in Lahore. Each steel gong is voiced and tuned by ear over four weeks of manual adjustment.',
    narrative: 'A masterpiece of acoustic resonance. The honey gold case alloy is specifically blended to deliver pure sustained harmonic resonance for the cathedral gongs.',
    price: 28500000,
    formattedPrice: 'PKR 28,500,000',
    currency: 'PKR',
    caseMaterial: 'Acoustic Resonance 18k Honey Gold',
    caseDiameter: '43 mm',
    caseThickness: '11.6 mm',
    dial: 'Smoked Sapphire Crystal revealing hand-anglage movement bridges',
    movement: 'Calibre N-00 Cathedral Minute Repeater',
    powerReserve: '55 hours',
    waterResistance: '30 meters / 3 ATM',
    frequency: '21,600 vph (3 Hz)',
    jewels: 46,
    strapOrBracelet: 'Hand-sewn saddle leather with honey gold folding clasp',
    availability: 'LIMITED',
    stock: 1,
    featured: false,
    newModel: false,
    category: 'unisex',
    images: [
      { id: 'img-zar-1', url: '/images/collection-atelier.png', alt: 'NAYAB ZAR Minute Repeater Haute Horlogerie', type: 'HERO', sortOrder: 1 },
      { id: 'img-zar-2', url: '/images/collection-atelier.png', alt: 'NAYAB ZAR front view', type: 'FRONT', sortOrder: 2 },
    ],
    variants: [
      {
        id: 'var-zar-sapphire',
        sku: 'NB-4309-HG-SAPPHIRE',
        name: '18k Honey Gold / Smoked Sapphire / Hand-Sewn Saddle Leather',
        material: '18k Honey Gold',
        dialColor: 'Smoked Sapphire',
        strap: 'Hand-Sewn Saddle Leather',
        price: 28500000,
        formattedPrice: 'PKR 28,500,000',
        stock: 1,
      },
    ],
  },
];

// Helper: Filter fallback products
export function queryFallbackProducts(params: ProductFilterParams = {}): ProductsResponse {
  let list = [...FALLBACK_PRODUCTS];

  if (params.search) {
    const q = params.search.toLowerCase().trim();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.reference.toLowerCase().includes(q) ||
        p.collection.name.toLowerCase().includes(q) ||
        p.caseMaterial.toLowerCase().includes(q) ||
        p.dial.toLowerCase().includes(q)
    );
  }

  if (params.collection) {
    const cSlug = params.collection.toLowerCase();
    list = list.filter((p) => p.collection.slug.toLowerCase() === cSlug);
  }

  if (params.material) {
    const mat = params.material.toLowerCase();
    list = list.filter((p) => p.caseMaterial.toLowerCase().includes(mat));
  }

  if (params.size) {
    const s = params.size;
    list = list.filter((p) => p.caseDiameter.includes(s));
  }

  if (params.availability) {
    list = list.filter((p) => p.availability === params.availability);
  }

  if (params.category) {
    list = list.filter((p) => p.category === params.category);
  }

  if (params.sort === 'price-asc') {
    list.sort((a, b) => a.price - b.price);
  } else if (params.sort === 'price-desc') {
    list.sort((a, b) => b.price - a.price);
  }

  const page = params.page || 1;
  const limit = params.limit || 50;
  const total = list.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const paginated = list.slice((page - 1) * limit, page * limit);

  return {
    products: paginated,
    pagination: {
      total,
      page,
      limit,
      totalPages,
    },
  };
}

// Helper: Get product by slug (with aliases)
export function getFallbackProductBySlug(slug: string): ApiProduct | undefined {
  const s = slug.toLowerCase();
  return (
    FALLBACK_PRODUCTS.find((p) => p.slug.toLowerCase() === s) ||
    (s === 'karakoram-chronometer-42' ? FALLBACK_PRODUCTS.find((p) => p.slug === 'karakoram-42') : undefined) ||
    (s === 'karakoram-42' ? FALLBACK_PRODUCTS.find((p) => p.slug === 'karakoram-42') : undefined) ||
    (s === 'zar-grand-complication' ? FALLBACK_PRODUCTS.find((p) => p.slug === 'zar-perpetual') : undefined) ||
    (s === 'zar-perpetual' ? FALLBACK_PRODUCTS.find((p) => p.slug === 'zar-perpetual') : undefined)
  );
}

// Helper: Get collection by slug
export function getFallbackCollectionBySlug(slug: string): ApiCollection | undefined {
  const s = slug.toLowerCase();
  const col = FALLBACK_COLLECTIONS.find((c) => c.slug.toLowerCase() === s);
  if (col) {
    const prods = FALLBACK_PRODUCTS.filter((p) => p.collection.slug.toLowerCase() === s);
    return {
      ...col,
      productCount: prods.length,
      products: prods,
    };
  }
  return undefined;
}

// Local Storage Keys
const CART_KEY = 'nayab_local_cart_v1';
const WISHLIST_KEY = 'nayab_local_wishlist_v1';
const ORDERS_KEY = 'nayab_local_orders_v1';
const USER_KEY = 'nayab_local_user_v1';
const ADDRESSES_KEY = 'nayab_local_addresses_v1';

export const mockStore = {
  // Products & Collections
  getProducts: (params?: ProductFilterParams) => queryFallbackProducts(params),
  getProductBySlug: (slug: string) => getFallbackProductBySlug(slug),
  getCollections: () => FALLBACK_COLLECTIONS,
  getCollectionBySlug: (slug: string) => getFallbackCollectionBySlug(slug),

  // Cart
  getCart: (): ApiCart => {
    try {
      const raw = localStorage.getItem(CART_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return {
      id: 'local-cart',
      totalQuantity: 0,
      subtotal: 0,
      formattedSubtotal: 'PKR 0',
      items: [],
      hasUnavailableItems: false,
      hasPriceChanges: false,
    };
  },
  saveCart: (cart: ApiCart) => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch {}
  },
  addToCart: (productId: string, variantId?: string, quantity: number = 1): ApiCart => {
    const cart = mockStore.getCart();
    const product = FALLBACK_PRODUCTS.find((p) => p.id === productId || p.slug === productId);
    if (!product) return cart;

    const variant = variantId ? product.variants.find((v) => v.id === variantId || v.sku === variantId) : product.variants[0];
    const unitPrice = variant ? variant.price : product.price;

    const existingIndex = cart.items.findIndex(
      (item) => (item.product.id === product.id || item.product.slug === product.slug) && item.variantId === (variant?.id || undefined)
    );

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += quantity;
      cart.items[existingIndex].lineTotal = cart.items[existingIndex].quantity * unitPrice;
      cart.items[existingIndex].formattedLineTotal = `PKR ${cart.items[existingIndex].lineTotal.toLocaleString()}`;
    } else {
      cart.items.push({
        id: `cart-item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        productId: product.id,
        variantId: variant?.id,
        quantity,
        unitPrice,
        formattedUnitPrice: `PKR ${unitPrice.toLocaleString()}`,
        lineTotal: quantity * unitPrice,
        formattedLineTotal: `PKR ${(quantity * unitPrice).toLocaleString()}`,
        product,
        variant,
        availableStock: product.stock,
        inStock: true,
        priceChanged: false,
        currentPrice: unitPrice,
        formattedCurrentPrice: `PKR ${unitPrice.toLocaleString()}`,
      });
    }

    const subtotal = cart.items.reduce((sum, i) => sum + i.lineTotal, 0);
    cart.subtotal = subtotal;
    cart.formattedSubtotal = `PKR ${subtotal.toLocaleString()}`;
    cart.totalQuantity = cart.items.reduce((sum, i) => sum + i.quantity, 0);

    mockStore.saveCart(cart);
    return cart;
  },
  updateCartItem: (itemId: string, quantity: number): ApiCart => {
    const cart = mockStore.getCart();
    if (quantity <= 0) {
      cart.items = cart.items.filter((i) => i.id !== itemId);
    } else {
      const item = cart.items.find((i) => i.id === itemId);
      if (item) {
        item.quantity = quantity;
        item.lineTotal = quantity * item.unitPrice;
        item.formattedLineTotal = `PKR ${item.lineTotal.toLocaleString()}`;
      }
    }
    const subtotal = cart.items.reduce((sum, i) => sum + i.lineTotal, 0);
    cart.subtotal = subtotal;
    cart.formattedSubtotal = `PKR ${subtotal.toLocaleString()}`;
    cart.totalQuantity = cart.items.reduce((sum, i) => sum + i.quantity, 0);
    mockStore.saveCart(cart);
    return cart;
  },
  removeCartItem: (itemId: string): ApiCart => {
    return mockStore.updateCartItem(itemId, 0);
  },
  clearCart: (): ApiCart => {
    const emptyCart: ApiCart = {
      id: 'local-cart',
      totalQuantity: 0,
      subtotal: 0,
      formattedSubtotal: 'PKR 0',
      items: [],
      hasUnavailableItems: false,
      hasPriceChanges: false,
    };
    mockStore.saveCart(emptyCart);
    return emptyCart;
  },

  // Orders
  getOrders: (): ApiOrder[] => {
    try {
      const raw = localStorage.getItem(ORDERS_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return [];
  },
  getOrderById: (orderIdOrNumber: string): ApiOrder | undefined => {
    const orders = mockStore.getOrders();
    return orders.find((o) => o.id === orderIdOrNumber || o.orderNumber === orderIdOrNumber);
  },
  createOrder: (payload: { addressId?: string; guestAddress?: any; paymentMethod?: string }): ApiOrder => {
    const cart = mockStore.getCart();
    const orderNum = `NYB-2026-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const orderId = `order-${Date.now()}`;

    const newOrder: ApiOrder = {
      id: orderId,
      orderNumber: orderNum,
      status: 'PENDING',
      subtotal: cart.subtotal || 3850000,
      formattedSubtotal: cart.formattedSubtotal || 'PKR 3,850,000',
      shipping: 0,
      formattedShipping: 'Complimentary',
      total: cart.subtotal || 3850000,
      formattedTotal: cart.formattedSubtotal || 'PKR 3,850,000',
      currency: 'PKR',
      paymentMethod: 'SIMULATED',
      shippingAddress: {
        fullName: payload.guestAddress?.fullName || 'Mian Tariq',
        phone: payload.guestAddress?.phone || '+92 300 8400000',
        addressLine1: payload.guestAddress?.addressLine1 || '14-C, Zamzama Boulevard, Phase V, DHA',
        addressLine2: payload.guestAddress?.addressLine2 || null,
        city: payload.guestAddress?.city || 'Karachi',
        province: payload.guestAddress?.province || 'Sindh',
        postalCode: payload.guestAddress?.postalCode || '75500',
        country: 'Pakistan',
      },
      items: (cart.items.length > 0 ? cart.items : [
        {
          id: 'item-demo',
          productId: 'prod-sovereign-39',
          variantId: 'var-sov-rg',
          quantity: 1,
          unitPrice: 3850000,
          formattedUnitPrice: 'PKR 3,850,000',
          lineTotal: 3850000,
          formattedLineTotal: 'PKR 3,850,000',
          product: FALLBACK_PRODUCTS[0],
          variant: FALLBACK_PRODUCTS[0].variants[0],
          availableStock: 4,
          inStock: true,
          priceChanged: false,
          currentPrice: 3850000,
          formattedCurrentPrice: 'PKR 3,850,000',
        }
      ]).map((item) => ({
        id: `order-item-${Math.random().toString(36).substring(2, 7)}`,
        productId: item.product.id,
        variantId: item.variant?.id || null,
        quantity: item.quantity,
        name: item.product.name,
        reference: item.product.reference,
        variantName: item.variant?.name || null,
        slug: item.product.slug,
        imageUrl: item.product.images[0]?.url || '/images/sovereign-39-front.png',
        unitPrice: item.unitPrice,
        formattedUnitPrice: item.formattedUnitPrice,
        lineTotal: item.lineTotal,
        formattedLineTotal: item.formattedLineTotal,
      })),
      allowedTransitions: ['CANCELLED'],
      canCancel: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const orders = [newOrder, ...mockStore.getOrders()];
    try {
      localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    } catch {}

    mockStore.clearCart();
    return newOrder;
  },

  // Auth / User
  getUser: (): UserProfile | null => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return null;
  },
  saveUser: (user: UserProfile | null) => {
    try {
      if (user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(USER_KEY);
      }
    } catch {}
  },
  loginDemo: (email?: string, name?: string): UserProfile => {
    const user: UserProfile = {
      id: 'usr-client-demo-1',
      name: name || (email?.includes('atelier') ? 'NAYAB Atelier Master' : 'Mian Tariq'),
      email: email || 'client@nayab.pk',
      phone: '+92 300 8400000',
      role: email?.includes('atelier') ? 'ADMIN' : 'CUSTOMER',
      createdAt: '2026-08-20T10:00:00.000Z',
    };
    mockStore.saveUser(user);
    return user;
  },

  // Addresses
  getAddresses: (): ApiAddress[] => {
    try {
      const raw = localStorage.getItem(ADDRESSES_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return [
      {
        id: 'addr-default-1',
        fullName: 'Mian Tariq',
        phone: '+92 300 8400000',
        addressLine1: '14-C, Zamzama Boulevard',
        addressLine2: 'Phase V, DHA',
        city: 'Karachi',
        province: 'Sindh',
        postalCode: '75500',
        country: 'Pakistan',
        isDefault: true,
        createdAt: '2026-08-20T10:00:00.000Z',
        updatedAt: '2026-08-20T10:00:00.000Z',
      },
    ];
  },
  saveAddresses: (addresses: ApiAddress[]) => {
    try {
      localStorage.setItem(ADDRESSES_KEY, JSON.stringify(addresses));
    } catch {}
  },

  // Wishlist
  getWishlist: (): string[] => {
    try {
      const raw = localStorage.getItem(WISHLIST_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return [];
  },
  toggleWishlist: (productId: string): string[] => {
    let list = mockStore.getWishlist();
    if (list.includes(productId)) {
      list = list.filter((id) => id !== productId);
    } else {
      list.push(productId);
    }
    try {
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
    } catch {}
    return list;
  },
};
