import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/productService.js';
import { productQuerySchema } from '../validators/productValidator.js';

export class ProductController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const query = productQuerySchema.parse(req.query);
      const result = await ProductService.getAll(query);

      return res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await ProductService.getBySlug(req.params.slug);
      return res.status(200).json({
        status: 'success',
        data: { product },
      });
    } catch (err) {
      next(err);
    }
  }
}
