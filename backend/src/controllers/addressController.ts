import { Response, NextFunction } from 'express';
import { AddressService } from '../services/addressService.js';
import {
  addressBodySchema,
  updateAddressSchema,
} from '../validators/orderValidator.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

export class AddressController {
  static async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const addresses = await AddressService.list(req.user!.userId);
      return res.status(200).json({
        status: 'success',
        data: { addresses },
      });
    } catch (err) {
      next(err);
    }
  }

  static async create(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const validated = addressBodySchema.parse(req.body);
      const address = await AddressService.create(req.user!.userId, validated);

      return res.status(201).json({
        status: 'success',
        data: { address },
      });
    } catch (err) {
      next(err);
    }
  }

  static async update(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const validated = updateAddressSchema.parse(req.body);
      const address = await AddressService.update(
        req.user!.userId,
        req.params.id,
        validated
      );

      return res.status(200).json({
        status: 'success',
        data: { address },
      });
    } catch (err) {
      next(err);
    }
  }

  static async remove(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      await AddressService.remove(req.user!.userId, req.params.id);
      return res.status(200).json({
        status: 'success',
        message: 'Address removed',
      });
    } catch (err) {
      next(err);
    }
  }
}
