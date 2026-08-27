import { PrismaClient, ProductAvailability, ProductImageType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * This seed is DESTRUCTIVE — it truncates every table before inserting. It is a
 * demo-data loader, not a migration, so it refuses to run against production
 * unless the operator states the intent explicitly.
 */
const assertSafeToSeed = () => {
  if (process.env.NODE_ENV !== 'production') return;

  if (process.env.ALLOW_PRODUCTION_SEED !== 'true') {
    console.error(
      '\n[NAYAB] Refusing to seed: NODE_ENV=production.\n' +
        'This script DELETES all users, orders, products and collections.\n' +
        'If you genuinely intend to wipe and reseed production, re-run with ' +
        'ALLOW_PRODUCTION_SEED=true.\n'
    );
    process.exit(1);
  }

  console.warn(
    '[NAYAB] ALLOW_PRODUCTION_SEED=true — wiping and reseeding a production database.'
  );
};

async function main() {
  assertSafeToSeed();

  console.log('Seeding NAYAB database...');

  // Clean existing tables in reverse relation order. order_items → products is
  // ON DELETE RESTRICT, so orders must go before products or this throws.
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.collection.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();

  // 1. Seed Demo Client User
  const passwordHash = await bcrypt.hash('Nayab@2026', 10);
  const demoUser = await prisma.user.create({
    data: {
      name: 'Mian Tariq',
      email: 'client@nayab.pk',
      passwordHash,
      phone: '+92 300 8400000',
      role: 'CUSTOMER',
    },
  });
  console.log('Created demo client user:', demoUser.email);

  // A saved address so the checkout flow can be demonstrated without typing one.
  await prisma.address.create({
    data: {
      userId: demoUser.id,
      fullName: 'Mian Tariq',
      phone: '+92 300 8400000',
      addressLine1: '14-C, Zamzama Boulevard',
      addressLine2: 'Phase V, DHA',
      city: 'Karachi',
      province: 'Sindh',
      postalCode: '75500',
      country: 'Pakistan',
      isDefault: true,
    },
  });

  /**
   * Administrator. The password is a known demo credential and is printed below
   * on purpose — this account exists so the private atelier views can be opened
   * on a local machine. Change it before any deployment that is reachable.
   */
  const adminUser = await prisma.user.create({
    data: {
      name: 'NAYAB Atelier',
      email: 'atelier@nayab.pk',
      passwordHash: await bcrypt.hash(
        process.env.SEED_ADMIN_PASSWORD || 'Atelier@2026',
        10
      ),
      phone: '+92 42 3577 0000',
      role: 'ADMIN',
    },
  });
  console.log('Created administrator:', adminUser.email);

  // 2. Seed Collections
  const collectionsData = [
    {
      slug: 'mehr',
      name: 'MEHR',
      tagline: 'Quiet Proportions · Precious Materials',
      description: 'Quiet proportions. Precious materials. A formal expression of NAYAB.',
      heroImage: '/images/sovereign-39-front.png',
      accentColor: '#B8965D',
      displayOrder: 1,
    },
    {
      slug: 'indus',
      name: 'INDUS',
      tagline: 'Integrated Architecture · Modern Movement',
      description: 'Integrated architecture shaped for modern movement.',
      heroImage: '/images/meridian-41-front.png',
      accentColor: '#B9BDC2',
      displayOrder: 2,
    },
    {
      slug: 'noor',
      name: 'NOOR',
      tagline: 'Measured Proportions · Quiet Brilliance',
      description: 'Measured proportions and quiet brilliance.',
      heroImage: '/images/noor-32-women.webp',
      accentColor: '#D4B67F',
      displayOrder: 3,
    },
    {
      slug: 'karakoram',
      name: 'KARAKORAM',
      tagline: 'High Altitude Precision · Enduring Endurance',
      description: 'Precision engineered for altitude, distance and changing conditions.',
      heroImage: '/images/collection-regatta.png',
      accentColor: '#17342F',
      displayOrder: 4,
    },
    {
      slug: 'zar',
      name: 'ZAR',
      tagline: 'Rare Metallurgy · High Mechanical Complications',
      description: 'Rare materials and NAYAB\'s most complex mechanical work.',
      heroImage: '/images/collection-atelier.png',
      accentColor: '#B8965D',
      displayOrder: 5,
    },
  ];

  const collectionsMap: Record<string, string> = {};

  for (const c of collectionsData) {
    const created = await prisma.collection.create({
      data: c,
    });
    collectionsMap[c.slug] = created.id;
  }
  console.log('Created 5 collections:', Object.keys(collectionsMap));

  // 3. Seed Products
  const products = [
    {
      slug: 'sovereign-39',
      name: 'Sovereign 39',
      reference: 'REF. NB-3901-RG',
      collectionId: collectionsMap['mehr'],
      tagline: 'Quiet authority in rose gold and ivory enamel.',
      shortDescription: 'A 39 mm case carved in 18k rose gold houses a multi-fired grand feu ivory enamel dial, dauphine hands, and small seconds at 6 o’clock.',
      description: 'The formal flagship of NAYAB. Conceived in the Lahore atelier, Sovereign 39 unites Mughal architectural balance with strict horological restraint. The dial is hand-fired across multiple furnace stages to achieve depth and permanence.',
      narrative: 'Every Sovereign case is hand-finished with contrasting satin-brushed bands and mirror-polished bezels. The manual-winding Calibre N-12 operates with twin barrels providing 72 hours of stable torque.',
      price: BigInt(3850000), // PKR 3,850,000
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
      availability: ProductAvailability.AVAILABLE,
      stock: 4,
      featured: true,
      newModel: true,
      category: 'mens',
      images: [
        { url: '/images/sovereign-39-front.png', alt: 'NAYAB Sovereign 39 18k Rose Gold front dial view', type: ProductImageType.HERO, sortOrder: 1 },
        { url: '/images/sovereign-39-front.png', alt: 'NAYAB Sovereign 39 dial detail', type: ProductImageType.FRONT, sortOrder: 2 },
        { url: '/images/sovereign-side.png', alt: 'NAYAB Sovereign 39 profile architecture', type: ProductImageType.SIDE, sortOrder: 3 },
        { url: '/images/craftsmanship-macro.png', alt: 'NAYAB Sovereign 39 hand-bevelled anglage macro', type: ProductImageType.MACRO, sortOrder: 4 },
      ],
      variants: [
        {
          sku: 'NB-3901-RG-IVORY',
          name: '18k Rose Gold / Ivory Enamel / Brown Alligator',
          material: '18k Rose Gold',
          dialColor: 'Grand Feu Ivory Enamel',
          strap: 'Brown Alligator Leather',
          price: BigInt(3850000),
          stock: 3,
        },
        {
          sku: 'NB-3901-WG-SLATE',
          name: '18k White Gold / Smoked Slate Enamel / Black Alligator',
          material: '18k White Gold',
          dialColor: 'Smoked Slate Enamel',
          strap: 'Black Alligator Leather',
          price: BigInt(4100000),
          stock: 1,
        },
      ],
    },
    {
      slug: 'mehr-36',
      name: 'Mehr 36',
      reference: 'REF. NB-3601-YG',
      collectionId: collectionsMap['mehr'],
      tagline: 'Classical restraint in 18k yellow gold.',
      shortDescription: 'A mid-size 36 mm formal dress watch with opaline silver dial, blued seconds hand, and ultra-thin hand-wound movement.',
      description: 'Mehr 36 is scaled for collectors seeking classical proportions. Featuring a clean sector dial layout with subtle railroad track minute indices and a slender 7.9 mm case profile.',
      narrative: 'Crafted as a tribute to classical subcontinent horological aesthetics, Mehr 36 combines warmth and timeless wrist presence.',
      price: BigInt(3250000), // PKR 3,250,000
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
      availability: ProductAvailability.AVAILABLE,
      stock: 3,
      featured: false,
      newModel: false,
      category: 'unisex',
      images: [
        { url: '/images/sovereign-39-front.png', alt: 'NAYAB Mehr 36 18k Yellow Gold', type: ProductImageType.HERO, sortOrder: 1 },
        { url: '/images/sovereign-39-front.png', alt: 'NAYAB Mehr 36 front view', type: ProductImageType.FRONT, sortOrder: 2 },
      ],
      variants: [
        {
          sku: 'NB-3601-YG-SILVER',
          name: '18k Yellow Gold / Opaline Silver / Black Alligator',
          material: '18k Yellow Gold',
          dialColor: 'Opaline Silver',
          strap: 'Matte Black Alligator',
          price: BigInt(3250000),
          stock: 3,
        },
      ],
    },
    {
      slug: 'meridian-41',
      name: 'Meridian 41',
      reference: 'REF. NB-4102-TI',
      collectionId: collectionsMap['indus'],
      tagline: 'Architectural titanium and midnight-blue geometry.',
      shortDescription: 'Ultra-light Grade 5 titanium with an integrated tapering bracelet, textured midnight-blue dial, and micro-rotor automatic calibre.',
      description: 'The contemporary titanium flagship of NAYAB. Forged in ultra-light Grade 5 titanium with an integrated tapering bracelet, textured midnight-blue dial, and micro-rotor automatic calibre.',
      narrative: 'Meridian 4draws structural inspiration from Indus architectural geometry. Alternating satin-brushed planes and mirror-polished facets create crisp light transitions across the monocoque case.',
      price: BigInt(2950000), // PKR 2,950,000
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
      availability: ProductAvailability.AVAILABLE,
      stock: 5,
      featured: true,
      newModel: true,
      category: 'mens',
      images: [
        { url: '/images/meridian-41-front.png', alt: 'NAYAB Meridian 41 Titanium front view', type: ProductImageType.HERO, sortOrder: 1 },
        { url: '/images/meridian-41-front.png', alt: 'NAYAB Meridian 41 dial and bezel', type: ProductImageType.FRONT, sortOrder: 2 },
        { url: '/images/meridian-material-macro.png', alt: 'NAYAB Meridian 41 brushed titanium facet macro', type: ProductImageType.MACRO, sortOrder: 3 },
        { url: '/images/meridian-exploded.png', alt: 'NAYAB Meridian 41 Calibre N-01 exploded view', type: ProductImageType.EXPLODED, sortOrder: 4 },
      ],
      variants: [
        {
          sku: 'NB-4102-TI-BLUE',
          name: 'Grade 5 Titanium / Midnight Blue / Integrated Bracelet',
          material: 'Grade 5 Titanium',
          dialColor: 'Midnight Blue Clous de Paris',
          strap: 'Integrated Titanium Bracelet',
          price: BigInt(2950000),
          stock: 4,
        },
        {
          sku: 'NB-4102-TI-CHARCOAL',
          name: 'Grade 5 Titanium / Charcoal Anthracite / Integrated Bracelet',
          material: 'Grade 5 Titanium',
          dialColor: 'Charcoal Anthracite Guilloché',
          strap: 'Integrated Titanium Bracelet',
          price: BigInt(2950000),
          stock: 1,
        },
      ],
    },
    {
      slug: 'indus-39',
      name: 'Indus 39',
      reference: 'REF. NB-3902-ST',
      collectionId: collectionsMap['indus'],
      tagline: 'Architectural steel for modern movement.',
      shortDescription: 'Forged in high-finish 904L steel with integrated bracelet and smoked slate tapisserie dial.',
      description: 'Indus 39 distills the geometric language of the INDUS collection into a compact 39 mm profile suited for versatile daily wear.',
      narrative: 'Every facet reflects architectural harmony, powered by the thin automatic Calibre N-01 with tungsten micro-rotor.',
      price: BigInt(2450000), // PKR 2,450,000
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
      availability: ProductAvailability.AVAILABLE,
      stock: 6,
      featured: false,
      newModel: false,
      category: 'mens',
      images: [
        { url: '/images/meridian-41-front.png', alt: 'NAYAB Indus 39 Steel front view', type: ProductImageType.HERO, sortOrder: 1 },
        { url: '/images/meridian-41-front.png', alt: 'NAYAB Indus 39 dial', type: ProductImageType.FRONT, sortOrder: 2 },
      ],
      variants: [
        {
          sku: 'NB-3902-ST-SLATE',
          name: '904L Steel / Smoked Slate / Integrated Steel',
          material: '904L Steel',
          dialColor: 'Smoked Slate',
          strap: 'Integrated 904L Steel Bracelet',
          price: BigInt(2450000),
          stock: 6,
        },
      ],
    },
    {
      slug: 'noor-32',
      name: 'Noor 32',
      reference: 'REF. NB-3201-CG',
      collectionId: collectionsMap['noor'],
      tagline: 'Measured proportions and quiet brilliance.',
      shortDescription: 'A smaller expression of the NAYAB language — balanced proportions, mechanical precision and quiet presence in an 18k champagne gold case.',
      description: 'NOOR 32 is designed with classical discipline. A slender 7.8 mm case houses an in-house manual calibre with opaline ivory dial and hand-polished gold hour markers.',
      narrative: 'Proportioned with restraint, NOOR 32 celebrates the subtle play of warm champagne gold against an unadorned opaline ivory dial.',
      price: BigInt(1850000), // PKR 1,850,000
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
      availability: ProductAvailability.AVAILABLE,
      stock: 4,
      featured: true,
      newModel: false,
      category: 'womens',
      images: [
        { url: '/images/noor-32-women.webp', alt: 'NAYAB NOOR 32 18k Champagne Gold watch product photography', type: ProductImageType.HERO, sortOrder: 1 },
        { url: '/images/noor-32-women.webp', alt: 'NAYAB NOOR 32 dial and strap detail', type: ProductImageType.FRONT, sortOrder: 2 },
        { url: '/images/sovereign-side.png', alt: 'NAYAB NOOR 32 profile', type: ProductImageType.SIDE, sortOrder: 3 },
      ],
      variants: [
        {
          sku: 'NB-3201-CG-IVORY',
          name: '18k Champagne Gold / Opaline Ivory / Taupe Calfskin',
          material: '18k Champagne Gold',
          dialColor: 'Opaline Ivory',
          strap: 'Taupe Grey Calfskin',
          price: BigInt(1850000),
          stock: 4,
        },
      ],
    },
    {
      slug: 'karakoram-42',
      name: 'Karakoram 42',
      reference: 'REF. NB-4205-SS',
      collectionId: collectionsMap['karakoram'],
      tagline: 'High altitude precision and column-wheel chronograph.',
      shortDescription: 'Constructed for demanding environments. High-altitude column-wheel chronograph with ceramic bezel and 300m water resistance.',
      description: 'Engineered with inspiration from Pakistan\'s northern Karakoram ranges. Provides tactile feedback through an integrated column-wheel chronograph mechanism.',
      narrative: 'Tested across extreme temperature variances, the Karakoram 42 balances robust construction with meticulous Haute Horlogerie hand-finishing on movement bridges.',
      price: BigInt(2750000), // PKR 2,750,000
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
      availability: ProductAvailability.AVAILABLE,
      stock: 3,
      featured: false,
      newModel: false,
      category: 'mens',
      images: [
        { url: '/images/collection-regatta.png', alt: 'NAYAB Karakoram 42 Chronograph', type: ProductImageType.HERO, sortOrder: 1 },
        { url: '/images/collection-regatta.png', alt: 'NAYAB Karakoram 42 front view', type: ProductImageType.FRONT, sortOrder: 2 },
      ],
      variants: [
        {
          sku: 'NB-4205-SS-SLATE',
          name: '904L Steel / Slate Sunburst / FKM Rubber',
          material: '904L Steel & Ceramic',
          dialColor: 'Sunburst Slate Grey',
          strap: 'FKM Vulcanized Rubber',
          price: BigInt(2750000),
          stock: 3,
        },
      ],
    },
    {
      slug: 'zar-perpetual',
      name: 'Zar Perpetual Minute Repeater',
      reference: 'REF. NB-4309-HG',
      collectionId: collectionsMap['zar'],
      tagline: 'The pinnacle of acoustic horology and precious metallurgy.',
      shortDescription: 'A cathedral-gong minute repeater chiming hours, quarter-hours, and minutes on two hand-tuned circular steel gongs.',
      description: 'Crafted entirely within the private high-complication atelier in Lahore. Each steel gong is voiced and tuned by ear over four weeks of manual adjustment.',
      narrative: 'A masterpiece of acoustic resonance. The honey gold case alloy is specifically blended to deliver pure sustained harmonic resonance for the cathedral gongs.',
      price: BigInt(28500000), // PKR 28,500,000
      currency: 'PKR',
      caseMaterial: 'Acoustic Resonance 18k Honey Gold',
      caseDiameter: '43 mm',
      caseThickness: '11.6 mm',
      dial: 'Smoked Sapphire Crystal revealing hand-anglage movement bridges',
      movement: 'Calibre N-00 Cathedral Minute Repeater',
      powerReserve: '55 hours',
      frequency: '21,600 vph (3 Hz)',
      jewels: 46,
      strapOrBracelet: 'Hand-sewn saddle leather with honey gold folding clasp',
      availability: ProductAvailability.LIMITED,
      stock: 1,
      featured: false,
      newModel: false,
      category: 'unisex',
      images: [
        { url: '/images/collection-atelier.png', alt: 'NAYAB ZAR Minute Repeater Haute Horlogerie', type: ProductImageType.HERO, sortOrder: 1 },
        { url: '/images/collection-atelier.png', alt: 'NAYAB ZAR front view', type: ProductImageType.FRONT, sortOrder: 2 },
      ],
      variants: [
        {
          sku: 'NB-4309-HG-SAPPHIRE',
          name: '18k Honey Gold / Smoked Sapphire / Hand-Sewn Saddle Leather',
          material: '18k Honey Gold',
          dialColor: 'Smoked Sapphire',
          strap: 'Hand-Sewn Saddle Leather',
          price: BigInt(28500000),
          stock: 1,
        },
      ],
    },
  ];

  for (const p of products) {
    const { images, variants, ...productFields } = p;
    const createdProduct = await prisma.product.create({
      data: {
        ...productFields,
        images: {
          create: images,
        },
        variants: {
          create: variants,
        },
      },
    });
    console.log(`Created product: ${createdProduct.name} (${createdProduct.reference})`);
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
