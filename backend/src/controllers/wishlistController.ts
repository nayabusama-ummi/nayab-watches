import { Response, NextFunction } from 'express';
import { WishlistService } from '../services/wishlistService.js';
import { addToWishlistSchema } from '../validators/wishlistValidator.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

export class WishlistController {
  static async getWishlist(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const items = await WishlistService.getWishlist(req.user!.userId);
      return res.status(200).json({
        status: 'success',
        data: { items },
      });
    } catch (err) {
      next(err);
    }
  }

  static async addItem(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = addToWishlistSchema.parse(req.body);
      const item = await WishlistService.addItem(req.user!.userId, validated.productId);

      return res.status(201).json({
        status: 'success',
        data: { item },
      });
    } catch (err) {
      next(err);
    }
  }

  static async removeItem(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await WishlistService.removeItem(req.user!.userId, req.params.productId);
      return res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
}
