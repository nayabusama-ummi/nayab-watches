import { prisma } from '../config/prisma.js';
import { NotFoundError } from '../utils/errors.js';
import { serializeProduct } from '../utils/money.js';
import { ProductQueryInput } from '../validators/productValidator.js';
import { Prisma } from '@prisma/client';

export class ProductService {
  static async getAll(query: ProductQueryInput) {
    const where: Prisma.ProductWhereInput = {};

    if (query.collection) {
      where.collection = {
        slug: query.collection,
      };
    }

    if (query.material) {
      where.caseMaterial = {
        contains: query.material,
        mode: 'insensitive',
      };
    }

    if (query.size) {
      where.caseDiameter = {
        contains: query.size,
      };
    }

    if (query.availability) {
      where.availability = query.availability;
    }

    if (query.category) {
      where.category = query.category;
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { reference: { contains: query.search, mode: 'insensitive' } },
        { caseMaterial: { contains: query.search, mode: 'insensitive' } },
        { dial: { contains: query.search, mode: 'insensitive' } },
        { collection: { name: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    // Sort order
    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
    if (query.sort === 'price-asc') {
      orderBy = { price: 'asc' };
    } else if (query.sort === 'price-desc') {
      orderBy = { price: 'desc' };
    }

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        orderBy,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        include: {
          collection: {
            select: { id: true, slug: true, name: true },
          },
          images: {
            orderBy: { sortOrder: 'asc' },
          },
          variants: {
            where: { isActive: true },
          },
        },
      }),
    ]);

    return {
      products: products.map(serializeProduct),
      pagination: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  static async getBySlug(slug: string) {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        collection: {
          select: { id: true, slug: true, name: true, tagline: true },
        },
        images: {
          orderBy: { sortOrder: 'asc' },
        },
        variants: {
          where: { isActive: true },
        },
      },
    });

    if (!product) {
      throw new NotFoundError(`Timepiece '${slug}' not found`);
    }

    return serializeProduct(product);
  }
}
