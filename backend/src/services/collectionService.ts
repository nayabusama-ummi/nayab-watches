import { prisma } from '../config/prisma.js';
import { NotFoundError } from '../utils/errors.js';
import { serializeProduct } from '../utils/money.js';

export class CollectionService {
  static async getAll() {
    const collections = await prisma.collection.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    return collections.map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      tagline: c.tagline,
      description: c.description,
      heroImage: c.heroImage,
      accentColor: c.accentColor,
      displayOrder: c.displayOrder,
      productCount: c._count.products,
    }));
  }

  static async getBySlug(slug: string) {
    const collection = await prisma.collection.findUnique({
      where: { slug },
      include: {
        products: {
          include: {
            images: {
              orderBy: { sortOrder: 'asc' },
            },
            variants: {
              where: { isActive: true },
            },
          },
          orderBy: { featured: 'desc' },
        },
      },
    });

    if (!collection || !collection.isActive) {
      throw new NotFoundError(`Collection '${slug}' not found`);
    }

    return {
      id: collection.id,
      slug: collection.slug,
      name: collection.name,
      tagline: collection.tagline,
      description: collection.description,
      heroImage: collection.heroImage,
      accentColor: collection.accentColor,
      products: collection.products.map(serializeProduct),
    };
  }
}
