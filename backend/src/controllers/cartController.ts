import { Response, NextFunction } from 'express';
import { CartService } from '../services/cartService.js';
import {
  addToCartSchema,
  updateCartItemSchema,
  mergeCartSchema,
} from '../validators/cartValidator.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

/**
 * Resolves whose bag to operate on.
 *
 * Two things happen here that the previous `req.query.sessionId as string` did
 * not do:
 *
 * 1. Express turns a repeated parameter (`?sessionId=a&sessionId=b`) into an
 *    ARRAY. Cast to `string` it reached Prisma as an array and produced a 500.
 *    Only a single string value is accepted.
 * 2. For a signed-in customer the parameter is discarded outright. Their bag is
 *    located by user id, so no query string can steer the operation onto someone
 *    else's bag.
 */
const resolveOwner = (req: AuthenticatedRequest) => {
  const userId = req.user?.userId;
  if (userId) return { userId, sessionId: undefined };

  const raw = req.query.sessionId;
  const sessionId = typeof raw === 'string' && raw.trim() ? raw.trim() : undefined;

  return { userId: undefined, sessionId };
};

export class CartController {
  static async getCart(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { userId, sessionId } = resolveOwner(req);
      const cart = await CartService.getCart(userId, sessionId);
      return res.status(200).json({ status: 'success', data: { cart } });
    } catch (err) {
      next(err);
    }
  }

  static async addItem(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = addToCartSchema.parse(req.body);
      const userId = req.user?.userId;

      // A signed-in customer's own bag always wins over any sessionId in the body.
      const input = userId ? { ...validated, sessionId: undefined } : validated;

      const cart = await CartService.addItem(input, userId);
      return res.status(200).json({ status: 'success', data: { cart } });
    } catch (err) {
      next(err);
    }
  }

  static async updateItem(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = updateCartItemSchema.parse(req.body);
      const { userId, sessionId } = resolveOwner(req);

      const cart = await CartService.updateItem(
        req.params.id,
        validated,
        userId,
        sessionId
      );
      return res.status(200).json({ status: 'success', data: { cart } });
    } catch (err) {
      next(err);
    }
  }

  static async removeItem(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { userId, sessionId } = resolveOwner(req);
      const cart = await CartService.removeItem(req.params.id, userId, sessionId);
      return res.status(200).json({ status: 'success', data: { cart } });
    } catch (err) {
      next(err);
    }
  }

  static async clear(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { userId, sessionId } = resolveOwner(req);
      const cart = await CartService.clear(userId, sessionId);
      return res.status(200).json({ status: 'success', data: { cart } });
    } catch (err) {
      next(err);
    }
  }

  static async mergeCart(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = mergeCartSchema.parse(req.body);
      const cart = await CartService.mergeCart(
        req.user!.userId,
        validated.sessionId
      );
      return res.status(200).json({ status: 'success', data: { cart } });
    } catch (err) {
      next(err);
    }
  }
}
