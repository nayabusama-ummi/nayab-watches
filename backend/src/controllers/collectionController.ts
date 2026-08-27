import { Request, Response, NextFunction } from 'express';
import { CollectionService } from '../services/collectionService.js';

export class CollectionController {
  static async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const collections = await CollectionService.getAll();
      return res.status(200).json({
        status: 'success',
        data: { collections },
      });
    } catch (err) {
      next(err);
    }
  }

  static async getBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const collection = await CollectionService.getBySlug(req.params.slug);
      return res.status(200).json({
        status: 'success',
        data: { collection },
      });
    } catch (err) {
      next(err);
    }
  }
}
