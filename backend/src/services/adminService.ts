import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import {
  NotFoundError,
  ConflictError,
  ProductInUseError,
} from '../utils/errors.js';
import { formatPKR } from '../utils/money.js';
import {
  AdjustStockInput,
  UpdateProductFlagsInput,
  AdminListQuery,
} from '../validators/adminValidator.js';

/** Derives the shop-window state from the count. One rule, applied everywhere. */
export const availabilityForStock = (stock: number) =>
  stock === 0 ? 'OUT_OF_STOCK' : stock <= 2 ? 'LIMITED' : 'AVAILABLE';

export class AdminService {
  /** Counts for the atelier overview. No fabricated metrics — only what is countable. */
  static async getOverview() {
    const [
      totalOrders,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      totalProducts,
      outOfStock,
      lowStock,
      customers,
      revenue,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.order.count({ where: { status: 'PROCESSING' } }),
      prisma.order.count({ where: { status: 'SHIPPED' } }),
      prisma.order.count({ where: { status: 'DELIVERED' } }),
      prisma.order.count({ where: { status: 'CANCELLED' } }),
      prisma.product.count(),
      prisma.product.count({ where: { stock: 0 } }),
      prisma.product.count({ where: { stock: { gt: 0, lte: 2 } } }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      /**
       * Committed value excludes cancelled orders. Named "committed" rather than
       * "revenue" because payment is simulated — no funds have been collected.
       */
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { not: 'CANCELLED' } },
      }),
    ]);

    const committed = revenue._sum.total ?? BigInt(0);

    return {
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        processing: processingOrders,
        shipped: shippedOrders,
        delivered: deliveredOrders,
        cancelled: cancelledOrders,
      },
      catalogue: { total: totalProducts, outOfStock, lowStock },
      customers,
      committedValue: Number(committed),
      formattedCommittedValue: formatPKR(committed),
      /** Stated on the dashboard so no one mistakes this for settled money. */
      paymentNote: 'Simulated checkout — no payments are processed.',
    };
  }

  /** Catalogue with stock, for the inventory table. */
  static async listProducts(query: AdminListQuery) {
    const where: Prisma.ProductWhereInput = query.search
      ? {
          OR: [
            { name: { contains: query.search, mode: 'insensitive' } },
            { reference: { contains: query.search, mode: 'insensitive' } },
            { slug: { contains: query.search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        select: {
          id: true,
          slug: true,
          name: true,
          reference: true,
          price: true,
          stock: true,
          availability: true,
          featured: true,
          newModel: true,
          collection: { select: { name: true, slug: true } },
          variants: {
            select: { id: true, name: true, sku: true, stock: true, price: true },
          },
          _count: { select: { orderItems: true } },
        },
        orderBy: [{ stock: 'asc' }, { name: 'asc' }],
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products: products.map((product) => ({
        ...product,
        price: Number(product.price),
        formattedPrice: formatPKR(product.price),
        variants: product.variants.map((variant) => ({
          ...variant,
          price: Number(variant.price),
          formattedPrice: formatPKR(variant.price),
        })),
        orderedCount: product._count.orderItems,
        _count: undefined,
      })),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        pages: Math.ceil(total / query.limit) || 1,
      },
    };
  }

  /**
   * Sets a product's stock to an absolute figure.
   *
   * `expectedStock` makes this a compare-and-set: if another administrator (or a
   * customer's order) changed the count since the form was rendered, the write is
   * refused rather than silently overwriting their work.
   */
  static async adjustProductStock(productId: string, input: AdjustStockInput) {
    return prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: productId },
        select: { id: true, name: true, stock: true },
      });

      if (!product) {
        throw new NotFoundError('Timepiece not found');
      }

      if (
        input.expectedStock !== undefined &&
        input.expectedStock !== product.stock
      ) {
        throw new ConflictError(
          `Stock for ${product.name} has since changed to ${product.stock}. Reload and try again.`
        );
      }

      const updated = await tx.product.update({
        where: { id: productId },
        data: {
          stock: input.stock,
          availability: availabilityForStock(input.stock),
        },
        select: {
          id: true,
          name: true,
          reference: true,
          stock: true,
          availability: true,
        },
      });

      console.log(
        `[admin] stock ${product.name}: ${product.stock} → ${input.stock}` +
          (input.reason ? ` (${input.reason})` : '')
      );

      return updated;
    });
  }

  /** Same compare-and-set for a specific variant, plus product-total reconciliation. */
  static async adjustVariantStock(variantId: string, input: AdjustStockInput) {
    return prisma.$transaction(async (tx) => {
      const variant = await tx.productVariant.findUnique({
        where: { id: variantId },
        select: { id: true, name: true, stock: true, productId: true },
      });

      if (!variant) {
        throw new NotFoundError('Variant not found');
      }

      if (
        input.expectedStock !== undefined &&
        input.expectedStock !== variant.stock
      ) {
        throw new ConflictError(
          `Stock for ${variant.name} has since changed to ${variant.stock}. Reload and try again.`
        );
      }

      const updated = await tx.productVariant.update({
        where: { id: variantId },
        data: { stock: input.stock },
        select: { id: true, name: true, sku: true, stock: true, productId: true },
      });

      // The product total is the sum of its variants; keep the invariant true
      // rather than letting the two drift into disagreement.
      const sum = await tx.productVariant.aggregate({
        where: { productId: variant.productId },
        _sum: { stock: true },
      });
      const productStock = sum._sum.stock ?? 0;

      await tx.product.update({
        where: { id: variant.productId },
        data: {
          stock: productStock,
          availability: availabilityForStock(productStock),
        },
      });

      return { ...updated, productStock };
    });
  }

  static async updateProductFlags(
    productId: string,
    input: UpdateProductFlagsInput
  ) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });

    if (!product) {
      throw new NotFoundError('Timepiece not found');
    }

    return prisma.product.update({
      where: { id: productId },
      data: input,
      select: {
        id: true,
        name: true,
        featured: true,
        newModel: true,
        availability: true,
      },
    });
  }

  /**
   * Removes a product from the catalogue.
   *
   * Refuses if the reference appears in any order: the database enforces this
   * too (order_items → products is ON DELETE RESTRICT), and this check exists to
   * turn that constraint violation into a clear explanation. Retiring — stock 0,
   * OUT_OF_STOCK — is the correct action for a discontinued reference, and keeps
   * the archive honest.
   */
  static async deleteProduct(productId: string) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        name: true,
        _count: { select: { orderItems: true } },
      },
    });

    if (!product) {
      throw new NotFoundError('Timepiece not found');
    }

    if (product._count.orderItems > 0) {
      throw new ProductInUseError(
        `${product.name} appears in ${product._count.orderItems} order line(s) and cannot be deleted. ` +
          'Retire it instead by setting stock to zero.'
      );
    }

    await prisma.product.delete({ where: { id: productId } });

    return { id: productId, name: product.name };
  }

  /** Retires a reference without destroying its history. */
  static async retireProduct(productId: string) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });

    if (!product) {
      throw new NotFoundError('Timepiece not found');
    }

    return prisma.$transaction(async (tx) => {
      await tx.productVariant.updateMany({
        where: { productId },
        data: { stock: 0, isActive: false },
      });

      return tx.product.update({
        where: { id: productId },
        data: { stock: 0, availability: 'OUT_OF_STOCK', featured: false },
        select: {
          id: true,
          name: true,
          stock: true,
          availability: true,
        },
      });
    });
  }
}
