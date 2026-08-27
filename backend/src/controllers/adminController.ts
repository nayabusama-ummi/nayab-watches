import { Response, NextFunction } from 'express';
import { AdminService } from '../services/adminService.js';
import { OrderService } from '../services/orderService.js';
import {
  adjustStockSchema,
  updateProductFlagsSchema,
  adminListQuerySchema,
} from '../validators/adminValidator.js';
import {
  listOrdersQuerySchema,
  updateOrderStatusSchema,
} from '../validators/orderValidator.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

/**
 * Every handler here sits behind [authenticate, requireAdmin], which resolves the
 * role from the database on each request. Hiding the admin link in the UI is
 * presentation, not protection — this is the protection.
 */
export class AdminController {
  static async overview(
    _req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const overview = await AdminService.getOverview();
      return res.status(200).json({ status: 'success', data: { overview } });
    } catch (err) {
      next(err);
    }
  }

  static async listOrders(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const query = listOrdersQuerySchema.parse(req.query);
      const result = await OrderService.listAll(query);
      return res.status(200).json({ status: 'success', data: result });
    } catch (err) {
      next(err);
    }
  }

  static async getOrder(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      // `null` bypasses the per-customer scope — deliberate, and only reachable
      // through requireAdmin.
      const order = await OrderService.getOne(req.params.id, null);
      return res.status(200).json({ status: 'success', data: { order } });
    } catch (err) {
      next(err);
    }
  }

  static async updateOrderStatus(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { status } = updateOrderStatusSchema.parse(req.body);
      const order = await OrderService.transitionStatus(req.params.id, status);
      return res.status(200).json({ status: 'success', data: { order } });
    } catch (err) {
      next(err);
    }
  }

  static async listProducts(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const query = adminListQuerySchema.parse(req.query);
      const result = await AdminService.listProducts(query);
      return res.status(200).json({ status: 'success', data: result });
    } catch (err) {
      next(err);
    }
  }

  static async adjustProductStock(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const validated = adjustStockSchema.parse(req.body);
      const product = await AdminService.adjustProductStock(
        req.params.id,
        validated
      );
      return res.status(200).json({ status: 'success', data: { product } });
    } catch (err) {
      next(err);
    }
  }

  static async adjustVariantStock(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const validated = adjustStockSchema.parse(req.body);
      const variant = await AdminService.adjustVariantStock(
        req.params.id,
        validated
      );
      return res.status(200).json({ status: 'success', data: { variant } });
    } catch (err) {
      next(err);
    }
  }

  static async updateProductFlags(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const validated = updateProductFlagsSchema.parse(req.body);
      const product = await AdminService.updateProductFlags(
        req.params.id,
        validated
      );
      return res.status(200).json({ status: 'success', data: { product } });
    } catch (err) {
      next(err);
    }
  }

  static async retireProduct(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const product = await AdminService.retireProduct(req.params.id);
      return res.status(200).json({ status: 'success', data: { product } });
    } catch (err) {
      next(err);
    }
  }

  static async deleteProduct(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const product = await AdminService.deleteProduct(req.params.id);
      return res.status(200).json({
        status: 'success',
        message: `${product.name} removed from the catalogue`,
      });
    } catch (err) {
      next(err);
    }
  }
}
