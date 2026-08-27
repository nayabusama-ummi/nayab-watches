import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService.js';
import { CartService } from '../services/cartService.js';
import { registerSchema, loginSchema } from '../validators/authValidator.js';
import { ENV, authCookieOptions } from '../config/env.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

/**
 * Auth responses deliberately DO NOT contain the JWT.
 *
 * The token is delivered only as an HttpOnly cookie, so client JavaScript can
 * never read it and therefore can never persist it to localStorage — the whole
 * point of section M. Returning it in the body would hand every future frontend
 * author a loaded gun.
 */

/**
 * Absorbs a guest bag into the account at the moment of sign-in.
 *
 * Best-effort: a merge failure must never block authentication. The customer is
 * signed in either way and can re-add items; failing the login would be a far
 * worse outcome than a lost bag.
 */
const mergeGuestBag = async (userId: string, sessionId?: string) => {
  if (!sessionId) return;
  try {
    await CartService.mergeCart(userId, sessionId);
  } catch (error) {
    console.error('[auth] guest bag merge failed', error);
  }
};

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = registerSchema.parse(req.body);
      const { user, token } = await AuthService.register(validated);

      await mergeGuestBag(user.id, validated.sessionId);

      res.cookie(ENV.COOKIE_NAME, token, authCookieOptions());

      return res.status(201).json({
        status: 'success',
        data: { user },
      });
    } catch (err) {
      next(err);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = loginSchema.parse(req.body);
      const { user, token } = await AuthService.login(validated);

      await mergeGuestBag(user.id, validated.sessionId);

      res.cookie(ENV.COOKIE_NAME, token, authCookieOptions());

      return res.status(200).json({
        status: 'success',
        data: { user },
      });
    } catch (err) {
      next(err);
    }
  }

  static async logout(_req: Request, res: Response) {
    // Options must match those used to set it, or the browser keeps the cookie.
    const { maxAge: _maxAge, ...clearOptions } = authCookieOptions();
    res.clearCookie(ENV.COOKIE_NAME, clearOptions);

    return res.status(200).json({
      status: 'success',
      message: 'Signed out successfully',
    });
  }

  static async getMe(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
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
