import { Response, NextFunction } from 'express';
import { CartService } from '../services/cartService.js';
import { addToCartSchema, updateCartItemSchema, mergeCartSchema } from '../validators/cartValidator.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

export class CartController {
  static async getCart(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const sessionId = req.query.sessionId as string | undefined;

      const cart = await CartService.getCart(userId, sessionId);
      return res.status(200).json({
        status: 'success',
        data: { cart },
      });
    } catch (err) {
      next(err);
    }
  }

  static async addItem(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = addToCartSchema.parse(req.body);
      const userId = req.user?.userId;

      const cart = await CartService.addItem(validated, userId);
      return res.status(200).json({
        status: 'success',
        data: { cart },
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateItem(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = updateCartItemSchema.parse(req.body);
      const userId = req.user?.userId;
      const sessionId = req.query.sessionId as string | undefined;

      const cart = await CartService.updateItem(req.params.id, validated, userId, sessionId);
      return res.status(200).json({
        status: 'success',
        data: { cart },
      });
    } catch (err) {
      next(err);
    }
  }

  static async removeItem(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const sessionId = req.query.sessionId as string | undefined;

      const cart = await CartService.removeItem(req.params.id, userId, sessionId);
      return res.status(200).json({
        status: 'success',
        data: { cart },
      });
    } catch (err) {
      next(err);
    }
  }

  static async mergeCart(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = mergeCartSchema.parse(req.body);
      const userId = req.user!.userId;

      const cart = await CartService.mergeCart(userId, validated.sessionId);
      return res.status(200).json({
        status: 'success',
        data: { cart },
      });
    } catch (err) {
      next(err);
    }
  }
}
