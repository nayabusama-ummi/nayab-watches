import { prisma } from '../config/prisma.js';
import { BadRequestError, NotFoundError } from '../utils/errors.js';
import { formatPKR, serializeBigInt, serializeProduct } from '../utils/money.js';
import { AddToCartInput, UpdateCartItemInput } from '../validators/cartValidator.js';

export class CartService {
  static async getOrCreateCart(userId?: string, sessionId?: string) {
    if (userId) {
      let cart = await prisma.cart.findUnique({
        where: { userId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  collection: { select: { slug: true, name: true } },
                  images: { orderBy: { sortOrder: 'asc' } },
                },
              },
              variant: true,
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!cart) {
        cart = await prisma.cart.create({
          data: { userId },
          include: {
            items: {
              include: {
                product: {
                  include: {
                    collection: { select: { slug: true, name: true } },
                    images: { orderBy: { sortOrder: 'asc' } },
                  },
                },
                variant: true,
              },
            },
          },
        });
      }

      return cart;
    }

    if (sessionId) {
      let cart = await prisma.cart.findUnique({
        where: { sessionId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  collection: { select: { slug: true, name: true } },
                  images: { orderBy: { sortOrder: 'asc' } },
                },
              },
              variant: true,
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!cart) {
        cart = await prisma.cart.create({
          data: { sessionId },
          include: {
            items: {
              include: {
                product: {
                  include: {
                    collection: { select: { slug: true, name: true } },
                    images: { orderBy: { sortOrder: 'asc' } },
                  },
                },
                variant: true,
              },
            },
          },
        });
      }

      return cart;
    }

    throw new BadRequestError('Either user authentication or a session identifier is required.');
  }

  static async formatCart(cart: any) {
    const serializedCart = serializeBigInt(cart);
    const items = cart.items.map((item: any) => {
      const lineTotal = item.unitPriceSnapshot * BigInt(item.quantity);
      return {
        id: item.id,
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        unitPrice: Number(item.unitPriceSnapshot),
        formattedUnitPrice: formatPKR(item.unitPriceSnapshot),
        lineTotal: Number(lineTotal),
        formattedLineTotal: formatPKR(lineTotal),
        product: serializeProduct(item.product),
        variant: item.variant ? serializeBigInt(item.variant) : null,
      };
    });

    const totalQuantity = items.reduce((acc: number, item: any) => acc + item.quantity, 0);
    const rawTotal = cart.items.reduce(
      (acc: bigint, item: any) => acc + item.unitPriceSnapshot * BigInt(item.quantity),
      BigInt(0)
    );

    return {
      id: serializedCart.id,
      userId: serializedCart.userId,
      sessionId: serializedCart.sessionId,
      totalQuantity,
      subtotal: Number(rawTotal),
      formattedSubtotal: formatPKR(rawTotal),
      items,
    };
  }

  static async getCart(userId?: string, sessionId?: string) {
    const cart = await this.getOrCreateCart(userId, sessionId);
    return this.formatCart(cart);
  }

  static async addItem(input: AddToCartInput, userId?: string) {
    const product = await prisma.product.findUnique({
      where: { id: input.productId },
      include: { variants: true },
    });

    if (!product) {
      throw new NotFoundError('Timepiece not found');
    }

    if (product.availability === 'OUT_OF_STOCK' || product.stock < 1) {
      throw new BadRequestError('This timepiece is currently out of stock');
    }

    let unitPrice = product.price;

    if (input.variantId) {
      const variant = product.variants.find((v) => v.id === input.variantId);
      if (!variant) {
        throw new NotFoundError('Selected timepiece variant not found');
      }
      unitPrice = variant.price;
    }

    const cart = await this.getOrCreateCart(userId, input.sessionId);

    // Check existing item
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: input.productId,
        variantId: input.variantId || null,
      },
    });

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + input.quantity,
        },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: input.productId,
          variantId: input.variantId || null,
          quantity: input.quantity,
          unitPriceSnapshot: unitPrice,
        },
      });
    }

    return this.getCart(userId, input.sessionId);
  }

  static async updateItem(itemId: string, input: UpdateCartItemInput, userId?: string, sessionId?: string) {
    const cart = await this.getOrCreateCart(userId, sessionId);

    const item = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cartId: cart.id,
      },
    });

    if (!item) {
      throw new NotFoundError('Bag item not found');
    }

    await prisma.cartItem.update({
      where: { id: item.id },
      data: { quantity: input.quantity },
    });

    return this.getCart(userId, sessionId);
  }

  static async removeItem(itemId: string, userId?: string, sessionId?: string) {
    const cart = await this.getOrCreateCart(userId, sessionId);

    const item = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cartId: cart.id,
      },
    });

    if (!item) {
      throw new NotFoundError('Bag item not found');
    }

    await prisma.cartItem.delete({
      where: { id: item.id },
    });

    return this.getCart(userId, sessionId);
  }

  static async mergeCart(userId: string, sessionId: string) {
    const guestCart = await prisma.cart.findUnique({
      where: { sessionId },
      include: { items: true },
    });

    if (!guestCart || guestCart.items.length === 0) {
      return this.getCart(userId);
    }

    const userCart = await this.getOrCreateCart(userId);

    for (const item of guestCart.items) {
      const existingUserItem = await prisma.cartItem.findFirst({
        where: {
          cartId: userCart.id,
          productId: item.productId,
          variantId: item.variantId,
        },
      });

      if (existingUserItem) {
        await prisma.cartItem.update({
          where: { id: existingUserItem.id },
          data: {
            quantity: existingUserItem.quantity + item.quantity,
          },
        });
      } else {
        await prisma.cartItem.create({
          data: {
            cartId: userCart.id,
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            unitPriceSnapshot: item.unitPriceSnapshot,
          },
        });
      }
    }

    // Clean guest cart
    await prisma.cart.delete({
      where: { id: guestCart.id },
    });

    return this.getCart(userId);
  }
}
