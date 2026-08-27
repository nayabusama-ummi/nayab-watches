import { prisma } from '../config/prisma.js';
import { ConflictError, NotFoundError } from '../utils/errors.js';
import { serializeProduct } from '../utils/money.js';

export class WishlistService {
  static async getWishlist(userId: string) {
    const items = await prisma.wishlistItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            collection: { select: { slug: true, name: true } },
            images: { orderBy: { sortOrder: 'asc' } },
            variants: { where: { isActive: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return items.map((item) => ({
      id: item.id,
      productId: item.productId,
      createdAt: item.createdAt,
      product: serializeProduct(item.product),
    }));
  }

  static async addItem(userId: string, productId: string) {
    // Check product existence
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundError('Timepiece not found');
    }

    // Check duplicate
    const existing = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (existing) {
      throw new ConflictError('This timepiece is already in your wishlist');
    }

    const item = await prisma.wishlistItem.create({
      data: {
        userId,
        productId,
      },
      include: {
        product: {
          include: {
            collection: { select: { slug: true, name: true } },
            images: { orderBy: { sortOrder: 'asc' } },
          },
        },
      },
    });

    return {
      id: item.id,
      productId: item.productId,
      createdAt: item.createdAt,
      product: serializeProduct(item.product),
    };
  }

  static async removeItem(userId: string, productId: string) {
    const item = await prisma.wishlistItem.findFirst({
      where: {
        userId,
        OR: [{ productId }, { id: productId }],
      },
    });

    if (!item) {
      throw new NotFoundError('Item not found in your wishlist');
    }

    await prisma.wishlistItem.delete({
      where: { id: item.id },
    });

    return { success: true, message: 'Timepiece removed from wishlist' };
  }
}
