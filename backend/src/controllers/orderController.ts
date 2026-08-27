import { Response, NextFunction } from 'express';
import { OrderService } from '../services/orderService.js';
import {
  createOrderSchema,
  listOrdersQuerySchema,
} from '../validators/orderValidator.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

export class OrderController {
  static async create(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const validated = createOrderSchema.parse(req.body);
      const order = await OrderService.createOrder(req.user!.userId, validated);

      return res.status(201).json({
        status: 'success',
        data: { order },
      });
    } catch (err) {
      next(err);
    }
  }

  static async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const query = listOrdersQuerySchema.parse(req.query);
      const result = await OrderService.listForUser(req.user!.userId, query);

      return res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getOne(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      // The user id is passed into the query, not compared afterwards, so an id
      // belonging to another customer simply does not match.
      const order = await OrderService.getOne(req.params.id, req.user!.userId);

      return res.status(200).json({
        status: 'success',
        data: { order },
      });
    } catch (err) {
      next(err);
    }
  }

  static async cancel(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const order = await OrderService.cancelOwnOrder(
        req.params.id,
        req.user!.userId
      );

      return res.status(200).json({
        status: 'success',
        data: { order },
      });
    } catch (err) {
      next(err);
    }
  }
}
