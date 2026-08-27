import { Prisma, OrderStatus } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import {
  NotFoundError,
  ForbiddenError,
  CartEmptyError,
  InsufficientStockError,
  PriceChangedError,
  InvalidStatusTransitionError,
  BadRequestError,
} from '../utils/errors.js';
import {
  formatPKR,
  calculateOrderTotals,
  serializeBigInt,
} from '../utils/money.js';
import {
  CreateOrderInput,
  AddressInput,
  ListOrdersQuery,
} from '../validators/orderValidator.js';

/**
 * Legal order status transitions.
 *
 * Encoded as a graph rather than checked ad hoc, so an illegal move is
 * impossible to introduce by writing a new controller. DELIVERED and CANCELLED
 * are terminal.
 */
const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};

/** Statuses whose stock is still held by the order and must be returned on cancel. */
const STATUSES_HOLDING_STOCK: OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
];

const ORDER_INCLUDE = {
  items: { orderBy: { createdAt: 'asc' } },
} satisfies Prisma.OrderInclude;

/**
 * The denormalised delivery address written onto every order.
 *
 * Typed explicitly rather than as a loose record: these six columns are NOT NULL
 * in the schema, and a widened `Record<string, any>` would let a missing one
 * through to a runtime constraint violation instead of a compile error.
 */
interface ShippingSnapshot {
  addressId: string | null;
  shipFullName: string;
  shipPhone: string;
  shipAddressLine1: string;
  shipAddressLine2: string | null;
  shipCity: string;
  shipProvince: string;
  shipPostalCode: string | null;
  shipCountry: string;
}

/**
 * A single line as the server has verified it: quantity from the bag, price from
 * the catalogue, and the snapshots that keep the order readable years later.
 */
interface VerifiedLine {
  productId: string;
  variantId: string | null;
  quantity: number;
  unitPrice: bigint;
  productNameSnapshot: string;
  referenceSnapshot: string;
  variantSnapshot: string | null;
  productSlugSnapshot: string;
  imageUrlSnapshot: string | null;
}

/**
 * Human-facing order reference.
 *
 * Deliberately random rather than sequential: NYB-2026-000042 would tell any
 * customer exactly how many watches NAYAB has ever sold, and would let them
 * probe adjacent numbers. Ambiguous characters (0/O, 1/I) are excluded so the
 * reference can be read aloud over the telephone.
 */
const ORDER_NUMBER_ALPHABET = 'ACDEFGHJKLMNPQRSTUVWXYZ23456789';

const generateOrderNumber = (): string => {
  let suffix = '';
  for (let i = 0; i < 6; i += 1) {
    suffix += ORDER_NUMBER_ALPHABET.charAt(
      Math.floor(Math.random() * ORDER_NUMBER_ALPHABET.length)
    );
  }
  return `NYB-${new Date().getFullYear()}-${suffix}`;
};

export class OrderService {
  /**
   * Places an order.
   *
   * Everything below happens inside ONE transaction. If any step throws — a
   * price moved, a piece sold out, the address vanished — Postgres rolls the
   * whole thing back and no stock is consumed, no order row survives, and the
   * bag is left exactly as it was.
   *
   * Three things are never taken from the client: the item list (read from the
   * bag), the prices (re-read from the catalogue), and the totals (computed
   * here). The request body carries only a delivery address.
   */
  static async createOrder(userId: string, input: CreateOrderInput) {
    const order = await prisma.$transaction(
      async (tx) => {
        // 1. The bag, as the server sees it.
        const cart = await tx.cart.findUnique({
          where: { userId },
          include: {
            items: {
              include: {
                product: {
                  include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 } },
                },
                variant: true,
              },
              orderBy: { createdAt: 'asc' },
            },
          },
        });

        if (!cart || cart.items.length === 0) {
          throw new CartEmptyError(
            'Your bag is empty. Add a timepiece before placing an order.'
          );
        }

        // 2. Delivery address — resolved server-side, ownership enforced.
        const shipping = await OrderService.resolveAddress(tx, userId, input);

        // 3. Re-read authoritative prices. The cart snapshot is treated as a
        //    quote shown to the customer, NOT as the price to charge.
        const priceDrift: Array<{ productName: string; was: string; now: string }> =
          [];
        const lines: VerifiedLine[] = [];

        for (const item of cart.items) {
          const authoritativePrice = item.variant
            ? item.variant.price
            : item.product.price;

          if (authoritativePrice !== item.unitPriceSnapshot) {
            priceDrift.push({
              productName: item.product.name,
              was: formatPKR(item.unitPriceSnapshot),
              now: formatPKR(authoritativePrice),
            });
          }

          lines.push({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            unitPrice: authoritativePrice,
            productNameSnapshot: item.product.name,
            referenceSnapshot: item.product.reference,
            variantSnapshot: item.variant?.name ?? null,
            productSlugSnapshot: item.product.slug,
            imageUrlSnapshot: item.product.images[0]?.url ?? null,
          });
        }

        if (priceDrift.length > 0) {
          // Refresh the quote so the customer sees the true price and can
          // consciously accept it. The rollback undoes nothing else.
          for (const item of cart.items) {
            const authoritativePrice = item.variant
              ? item.variant.price
              : item.product.price;
            if (authoritativePrice !== item.unitPriceSnapshot) {
              await tx.cartItem.update({
                where: { id: item.id },
                data: { unitPriceSnapshot: authoritativePrice },
              });
            }
          }
          throw new PriceChangedError(
            priceDrift.length === 1
              ? 'The price of a timepiece in your bag has changed. Please review and confirm.'
              : 'Prices of some timepieces in your bag have changed. Please review and confirm.',
            priceDrift
          );
        }

        // 4. Claim the stock.
        await OrderService.claimStock(tx, cart.items);

        // 5. Totals — computed here, in BigInt, from the prices just verified.
        const { subtotal, shipping: shippingCost, total } =
          calculateOrderTotals(lines);

        // 6. Write the order.
        const created = await OrderService.insertOrder(tx, {
          userId,
          lines,
          subtotal,
          shippingCost,
          total,
          shipping,
          paymentMethod: input.paymentMethod,
        });

        // 7. Empty the bag. The order items now hold the snapshots.
        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

        return created;
      },
      {
        // The default 5s is tight once a bag holds several lines, each doing a
        // guarded update. READ COMMITTED is sufficient — see claimStock.
        maxWait: 5000,
        timeout: 15000,
      }
    );

    return OrderService.formatOrder(order);
  }

  /**
   * Resolves the delivery address and returns the snapshot fields.
   *
   * A saved address is re-read from the database and checked for ownership —
   * passing another customer's addressId returns 404, not their address.
   */
  private static async resolveAddress(
    tx: Prisma.TransactionClient,
    userId: string,
    input: CreateOrderInput
  ): Promise<ShippingSnapshot> {
    if (input.addressId) {
      const saved = await tx.address.findFirst({
        where: { id: input.addressId, userId },
      });

      // 404 rather than 403: an address that is not yours is indistinguishable
      // from one that does not exist, so probing ids reveals nothing.
      if (!saved) {
        throw new NotFoundError('That delivery address could not be found.');
      }

      return {
        addressId: saved.id,
        shipFullName: saved.fullName,
        shipPhone: saved.phone,
        shipAddressLine1: saved.addressLine1,
        shipAddressLine2: saved.addressLine2,
        shipCity: saved.city,
        shipProvince: saved.province,
        shipPostalCode: saved.postalCode,
        shipCountry: saved.country,
      };
    }

    const incoming = input.address as AddressInput;
    let addressId: string | null = null;

    if (input.saveAddress) {
      const saved = await tx.address.create({
        data: {
          userId,
          fullName: incoming.fullName,
          phone: incoming.phone,
          addressLine1: incoming.addressLine1,
          addressLine2: incoming.addressLine2 || null,
          city: incoming.city,
          province: incoming.province,
          postalCode: incoming.postalCode || null,
          country: incoming.country,
        },
      });
      addressId = saved.id;
    }

    return {
      addressId,
      shipFullName: incoming.fullName,
      shipPhone: incoming.phone,
      shipAddressLine1: incoming.addressLine1,
      shipAddressLine2: incoming.addressLine2 || null,
      shipCity: incoming.city,
      shipProvince: incoming.province,
      shipPostalCode: incoming.postalCode || null,
      shipCountry: incoming.country,
    };
  }

  /**
   * Decrements stock in a way that cannot oversell.
   *
   * `updateMany` with `stock: { gte: quantity }` compiles to a single
   * `UPDATE ... WHERE stock >= n` statement. Under Postgres READ COMMITTED, a
   * concurrent transaction that reaches the same row waits for the first to
   * commit and then RE-EVALUATES the WHERE clause against the new row version —
   * so if the first buyer took the last piece, the second matches zero rows and
   * `count` is 0. That is why this needs no SERIALIZABLE isolation and no
   * application-level lock: the guard and the write are one atomic statement.
   *
   * A read-then-write (`findUnique`, check, `update`) would look correct and
   * oversell under load. That is the bug this shape exists to prevent.
   *
   * Where a variant is chosen BOTH counters are claimed: `product.stock` is the
   * total pieces of that reference on hand, `variant.stock` the breakdown by
   * configuration. The seed keeps them consistent (product = sum of variants).
   */
  private static async claimStock(
    tx: Prisma.TransactionClient,
    items: Array<{
      quantity: number;
      productId: string;
      variantId: string | null;
      product: { name: string; stock: number };
      variant: { name: string; stock: number } | null;
    }>
  ) {
    for (const item of items) {
      if (item.variantId) {
        const claimedVariant = await tx.productVariant.updateMany({
          where: { id: item.variantId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });

        if (claimedVariant.count === 0) {
          const current = await tx.productVariant.findUnique({
            where: { id: item.variantId },
            select: { stock: true },
          });
          throw new InsufficientStockError(
            `${item.product.name} — ${item.variant?.name ?? 'selected configuration'} is no longer available in that quantity.`,
            [
              {
                productName: `${item.product.name} (${item.variant?.name ?? 'variant'})`,
                requested: item.quantity,
                available: current?.stock ?? 0,
              },
            ]
          );
        }
      }

      const claimedProduct = await tx.product.updateMany({
        where: { id: item.productId, stock: { gte: item.quantity } },
        data: { stock: { decrement: item.quantity } },
      });

      if (claimedProduct.count === 0) {
        const current = await tx.product.findUnique({
          where: { id: item.productId },
          select: { stock: true },
        });
        throw new InsufficientStockError(
          `${item.product.name} is no longer available in that quantity.`,
          [
            {
              productName: item.product.name,
              requested: item.quantity,
              available: current?.stock ?? 0,
            },
          ]
        );
      }

      // Keep the shop-window state honest with the counter that backs it.
      const remaining = await tx.product.findUnique({
        where: { id: item.productId },
        select: { stock: true },
      });

      if (remaining) {
        const availability =
          remaining.stock === 0
            ? 'OUT_OF_STOCK'
            : remaining.stock <= 2
              ? 'LIMITED'
              : 'AVAILABLE';
        await tx.product.update({
          where: { id: item.productId },
          data: { availability },
        });
      }
    }
  }

  /**
   * Inserts the order and its items, retrying on the astronomically unlikely
   * order-number collision. Retry is bounded — an unbounded loop inside a
   * transaction would hold locks indefinitely.
   */
  private static async insertOrder(
    tx: Prisma.TransactionClient,
    args: {
      userId: string;
      lines: VerifiedLine[];
      subtotal: bigint;
      shippingCost: bigint;
      total: bigint;
      shipping: ShippingSnapshot;
      paymentMethod: string;
    }
  ) {
    const MAX_ATTEMPTS = 5;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
      try {
        return await tx.order.create({
          data: {
            orderNumber: generateOrderNumber(),
            userId: args.userId,
            status: 'PENDING',
            subtotal: args.subtotal,
            shipping: args.shippingCost,
            total: args.total,
            currency: 'PKR',
            paymentMethod: args.paymentMethod,
            ...args.shipping,
            items: {
              create: args.lines.map((line) => ({
                productId: line.productId,
                variantId: line.variantId,
                quantity: line.quantity,
                unitPrice: line.unitPrice,
                lineTotal: line.unitPrice * BigInt(line.quantity),
                productNameSnapshot: line.productNameSnapshot,
                referenceSnapshot: line.referenceSnapshot,
                variantSnapshot: line.variantSnapshot,
                productSlugSnapshot: line.productSlugSnapshot,
                imageUrlSnapshot: line.imageUrlSnapshot,
              })),
            },
          },
          include: ORDER_INCLUDE,
        });
      } catch (error) {
        const isDuplicateOrderNumber =
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002' &&
          (error.meta?.target as string[] | undefined)?.includes('orderNumber');

        if (!isDuplicateOrderNumber || attempt === MAX_ATTEMPTS) throw error;
      }
    }

    // Unreachable: the loop either returns or rethrows.
    throw new Error('Failed to allocate an order number');
  }

  /** A customer's own orders. Scoped by userId at the query level, not filtered after. */
  static async listForUser(userId: string, query: ListOrdersQuery) {
    const where: Prisma.OrderWhereInput = {
      userId,
      ...(query.status ? { status: query.status } : {}),
    };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: ORDER_INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      prisma.order.count({ where }),
    ]);

    return {
      orders: orders.map((order) => OrderService.formatOrder(order)),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        pages: Math.ceil(total / query.limit) || 1,
      },
    };
  }

  /**
   * A single order.
   *
   * `userId` is part of the WHERE clause, so requesting another customer's order
   * id returns 404 — the object-level authorisation is in the query itself and
   * cannot be forgotten by a caller. Admins pass `null` to bypass the scope.
   */
  static async getOne(orderId: string, userId: string | null) {
    const order = await prisma.order.findFirst({
      where: {
        // Accept either the opaque id or the human reference.
        OR: [{ id: orderId }, { orderNumber: orderId.toUpperCase() }],
        ...(userId ? { userId } : {}),
      },
      include: {
        ...ORDER_INCLUDE,
        ...(userId
          ? {}
          : { user: { select: { id: true, name: true, email: true } } }),
      },
    });

    if (!order) {
      throw new NotFoundError('That order could not be found.');
    }

    return OrderService.formatOrder(order);
  }

  /**
   * Customer-initiated cancellation.
   *
   * Permitted only while the order is still PENDING — once the atelier has
   * confirmed it, cancellation becomes a conversation, not a button.
   */
  static async cancelOwnOrder(orderId: string, userId: string) {
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId },
      select: { id: true, status: true },
    });

    if (!order) {
      throw new NotFoundError('That order could not be found.');
    }

    if (order.status !== 'PENDING') {
      throw new ForbiddenError(
        order.status === 'CANCELLED'
          ? 'That order has already been cancelled.'
          : 'This order has already been confirmed by the atelier. Please contact us to withdraw it.'
      );
    }

    return OrderService.transitionStatus(order.id, 'CANCELLED');
  }

  /**
   * Moves an order along the status graph, restoring stock on cancellation.
   *
   * The status read, the legality check, the write and the stock restoration all
   * happen in one transaction, so two administrators clicking at once cannot
   * both cancel the same order and return its stock twice.
   */
  static async transitionStatus(orderId: string, next: OrderStatus) {
    const updated = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: ORDER_INCLUDE,
      });

      if (!order) {
        throw new NotFoundError('That order could not be found.');
      }

      if (order.status === next) {
        throw new BadRequestError(`This order is already ${next.toLowerCase()}.`);
      }

      if (!STATUS_TRANSITIONS[order.status].includes(next)) {
        throw new InvalidStatusTransitionError(
          order.status.toLowerCase(),
          next.toLowerCase()
        );
      }

      // Cancelling returns the pieces to the window — but only from a status
      // that was still holding them, so stock can never be credited twice.
      if (next === 'CANCELLED' && STATUSES_HOLDING_STOCK.includes(order.status)) {
        for (const item of order.items) {
          if (item.variantId) {
            await tx.productVariant.updateMany({
              where: { id: item.variantId },
              data: { stock: { increment: item.quantity } },
            });
          }

          const restored = await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
            select: { stock: true },
          });

          await tx.product.update({
            where: { id: item.productId },
            data: {
              availability:
                restored.stock === 0
                  ? 'OUT_OF_STOCK'
                  : restored.stock <= 2
                    ? 'LIMITED'
                    : 'AVAILABLE',
            },
          });
        }
      }

      return tx.order.update({
        where: { id: order.id },
        data: { status: next },
        include: ORDER_INCLUDE,
      });
    });

    return OrderService.formatOrder(updated);
  }

  /** Every order, for the atelier. */
  static async listAll(query: ListOrdersQuery) {
    const where: Prisma.OrderWhereInput = query.status
      ? { status: query.status }
      : {};

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          ...ORDER_INCLUDE,
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      prisma.order.count({ where }),
    ]);

    return {
      orders: orders.map((order) => OrderService.formatOrder(order)),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        pages: Math.ceil(total / query.limit) || 1,
      },
    };
  }

  /**
   * Wire shape. BigInt columns are emitted as both a raw number (for the client
   * to compute with) and a formatted string (so every surface renders PKR
   * identically instead of each page inventing its own formatter).
   */
  static formatOrder(order: any) {
    const base = serializeBigInt({ ...order, items: undefined });

    return {
      ...base,
      items: (order.items ?? []).map((item: any) => ({
        id: item.id,
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        name: item.productNameSnapshot,
        reference: item.referenceSnapshot,
        variantName: item.variantSnapshot,
        slug: item.productSlugSnapshot,
        imageUrl: item.imageUrlSnapshot,
        unitPrice: Number(item.unitPrice),
        formattedUnitPrice: formatPKR(item.unitPrice),
        lineTotal: Number(item.lineTotal),
        formattedLineTotal: formatPKR(item.lineTotal),
      })),
      subtotal: Number(order.subtotal),
      formattedSubtotal: formatPKR(order.subtotal),
      shipping: Number(order.shipping),
      formattedShipping:
        order.shipping === BigInt(0) ? 'Complimentary' : formatPKR(order.shipping),
      total: Number(order.total),
      formattedTotal: formatPKR(order.total),
      shippingAddress: {
        fullName: order.shipFullName,
        phone: order.shipPhone,
        addressLine1: order.shipAddressLine1,
        addressLine2: order.shipAddressLine2,
        city: order.shipCity,
        province: order.shipProvince,
        postalCode: order.shipPostalCode,
        country: order.shipCountry,
      },
      /** Which moves the client may offer, so the UI never shows a button that 409s. */
      allowedTransitions: STATUS_TRANSITIONS[order.status as OrderStatus],
      canCancel: order.status === 'PENDING',
    };
  }
}
