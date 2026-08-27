import { prisma } from '../config/prisma.js';
import {
  BadRequestError,
  NotFoundError,
  InsufficientStockError,
} from '../utils/errors.js';
import { formatPKR, serializeBigInt, serializeProduct } from '../utils/money.js';
import { AddToCartInput, UpdateCartItemInput } from '../validators/cartValidator.js';

/**
 * The bag is a QUOTE, not a reservation. Adding a timepiece holds nothing —
 * stock is claimed only inside the checkout transaction (see orderService).
 * The checks here exist so a customer is told immediately rather than at the
 * final step, but they are advisory: the authoritative guard is the conditional
 * decrement at checkout.
 */

const CART_INCLUDE = {
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
} as const;

export class CartService {
  static async getOrCreateCart(userId?: string, sessionId?: string) {
    if (userId) {
      const existing = await prisma.cart.findUnique({
        where: { userId },
        include: CART_INCLUDE,
      });
      if (existing) return existing;

      return prisma.cart.create({ data: { userId }, include: CART_INCLUDE });
    }

    if (sessionId) {
      const existing = await prisma.cart.findUnique({
        where: { sessionId },
        include: CART_INCLUDE,
      });
      if (existing) return existing;

      return prisma.cart.create({ data: { sessionId }, include: CART_INCLUDE });
    }

    throw new BadRequestError(
      'Either user authentication or a session identifier is required.'
    );
  }

  /** How many pieces of a given line can actually be supplied. */
  private static availableFor(item: {
    product: { stock: number };
    variant: { stock: number } | null;
  }) {
    return item.variant
      ? Math.min(item.variant.stock, item.product.stock)
      : item.product.stock;
  }

  static async formatCart(cart: any) {
    const serializedCart = serializeBigInt(cart);

    const items = cart.items.map((item: any) => {
      const lineTotal = item.unitPriceSnapshot * BigInt(item.quantity);
      const available = CartService.availableFor(item);
      const currentPrice = item.variant ? item.variant.price : item.product.price;

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
        /**
         * Surfaced so the bag can tell the truth before checkout rejects it.
         */
        availableStock: available,
        inStock: available >= item.quantity,
        /** The catalogue has moved since this was added. */
        priceChanged: currentPrice !== item.unitPriceSnapshot,
        currentPrice: Number(currentPrice),
        formattedCurrentPrice: formatPKR(currentPrice),
      };
    });

    const totalQuantity = items.reduce(
      (acc: number, item: any) => acc + item.quantity,
      0
    );
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
      /** True when checkout would fail — lets the UI disable the button honestly. */
      hasUnavailableItems: items.some((item: any) => !item.inStock),
      hasPriceChanges: items.some((item: any) => item.priceChanged),
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

    let unitPrice = product.price;
    let available = product.stock;
    let label = product.name;

    if (input.variantId) {
      const variant = product.variants.find((v) => v.id === input.variantId);
      if (!variant) {
        throw new NotFoundError('Selected timepiece variant not found');
      }
      if (!variant.isActive) {
        throw new BadRequestError('That configuration is no longer offered.');
      }
      unitPrice = variant.price;
      available = Math.min(variant.stock, product.stock);
      label = `${product.name} — ${variant.name}`;
    }

    if (product.availability === 'OUT_OF_STOCK' || available < 1) {
      throw new BadRequestError('This timepiece is currently out of stock');
    }

    const cart = await this.getOrCreateCart(userId, input.sessionId);

    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: input.productId,
        variantId: input.variantId || null,
      },
    });

    // The check is against the TOTAL after adding, not the increment — otherwise
    // "add 1" pressed five times slips past a stock of one.
    const requestedTotal = (existingItem?.quantity ?? 0) + input.quantity;

    if (requestedTotal > available) {
      throw new InsufficientStockError(
        available === 0
          ? `${label} is no longer available.`
          : `Only ${available} ${available === 1 ? 'piece' : 'pieces'} of ${label} ${
              available === 1 ? 'is' : 'are'
            } available.`,
        [{ productName: label, requested: requestedTotal, available }]
      );
    }

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: requestedTotal },
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

  static async updateItem(
    itemId: string,
    input: UpdateCartItemInput,
    userId?: string,
    sessionId?: string
  ) {
    const cart = await this.getOrCreateCart(userId, sessionId);

    const item = await prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
      include: { product: true, variant: true },
    });

    if (!item) {
      throw new NotFoundError('Bag item not found');
    }

    // Previously unchecked — a quantity of 999 against a stock of 1 was accepted
    // here and only failed at checkout.
    const available = CartService.availableFor(item);

    if (input.quantity > available) {
      const label = item.variant
        ? `${item.product.name} — ${item.variant.name}`
        : item.product.name;

      throw new InsufficientStockError(
        available === 0
          ? `${label} is no longer available.`
          : `Only ${available} ${available === 1 ? 'piece' : 'pieces'} of ${label} ${
              available === 1 ? 'is' : 'are'
            } available.`,
        [{ productName: label, requested: input.quantity, available }]
      );
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
      where: { id: itemId, cartId: cart.id },
    });

    if (!item) {
      throw new NotFoundError('Bag item not found');
    }

    await prisma.cartItem.delete({ where: { id: item.id } });

    return this.getCart(userId, sessionId);
  }

  /** Empties the bag without deleting it. Used by checkout and by the UI. */
  static async clear(userId?: string, sessionId?: string) {
    const cart = await this.getOrCreateCart(userId, sessionId);
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    return this.getCart(userId, sessionId);
  }

  /**
   * Folds a guest bag into the account bag on sign-in.
   *
   * One transaction, so an interrupted merge cannot leave items counted twice or
   * the guest bag deleted with nothing moved. Quantities are capped at available
   * stock rather than summed blindly — merging two bags each holding the last
   * piece must not produce a quantity of two.
   */
  static async mergeCart(userId: string, sessionId: string) {
    const guestCart = await prisma.cart.findUnique({
      where: { sessionId },
      include: { items: { include: { product: true, variant: true } } },
    });

    if (!guestCart || guestCart.items.length === 0) {
      // Still clear away an empty guest bag so stale rows do not accumulate.
      if (guestCart) {
        await prisma.cart.delete({ where: { id: guestCart.id } }).catch(() => {});
      }
      return this.getCart(userId);
    }

    const userCart = await this.getOrCreateCart(userId);

    await prisma.$transaction(async (tx) => {
      const existing = await tx.cartItem.findMany({
        where: { cartId: userCart.id },
      });

      // Indexed once instead of a query per guest item.
      const byKey = new Map(
        existing.map((item) => [`${item.productId}:${item.variantId ?? ''}`, item])
      );

      for (const item of guestCart.items) {
        const key = `${item.productId}:${item.variantId ?? ''}`;
        const match = byKey.get(key);
        const available = item.variant
          ? Math.min(item.variant.stock, item.product.stock)
          : item.product.stock;

        if (available < 1) continue;

        if (match) {
          const merged = Math.min(match.quantity + item.quantity, available);
          if (merged !== match.quantity) {
            await tx.cartItem.update({
              where: { id: match.id },
              data: { quantity: merged },
            });
          }
        } else {
          await tx.cartItem.create({
            data: {
              cartId: userCart.id,
              productId: item.productId,
              variantId: item.variantId,
              quantity: Math.min(item.quantity, available),
              unitPriceSnapshot: item.unitPriceSnapshot,
            },
          });
        }
      }

      await tx.cart.delete({ where: { id: guestCart.id } });
    });

    return this.getCart(userId);
  }
}
