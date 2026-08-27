import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService.js';
import { registerSchema, loginSchema } from '../validators/authValidator.js';
import { ENV } from '../config/env.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = registerSchema.parse(req.body);
      const { user, token } = await AuthService.register(validated);

      res.cookie(ENV.COOKIE_NAME, token, {
        httpOnly: true,
        secure: ENV.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return res.status(201).json({
        status: 'success',
        data: { user, token },
      });
    } catch (err) {
      next(err);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = loginSchema.parse(req.body);
      const { user, token } = await AuthService.login(validated);

      res.cookie(ENV.COOKIE_NAME, token, {
        httpOnly: true,
        secure: ENV.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(200).json({
        status: 'success',
        data: { user, token },
      });
    } catch (err) {
      next(err);
    }
  }

  static async logout(_req: Request, res: Response) {
    res.clearCookie(ENV.COOKIE_NAME, {
      httpOnly: true,
      secure: ENV.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return res.status(200).json({
      status: 'success',
      message: 'Signed out successfully',
    });
  }

  static async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await AuthService.getMe(req.user!.userId);
      return res.status(200).json({
        status: 'success',
        data: { user },
      });
    } catch (err) {
      next(err);
    }
  }
}
