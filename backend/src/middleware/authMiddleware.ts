import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/jwt.js';
import { UnauthorizedError } from '../utils/errors.js';
import { ENV } from '../config/env.js';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export const authenticate = (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
  let token = req.cookies?.[ENV.COOKIE_NAME];

  // Also allow Bearer token in header for API testing
  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new UnauthorizedError('Please sign in to access this client resource'));
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch {
    return next(new UnauthorizedError('Your session has expired. Please sign in again.'));
  }
};

export const optionalAuthenticate = (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
  let token = req.cookies?.[ENV.COOKIE_NAME];
  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = verifyToken(token);
      req.user = decoded;
    } catch {
      // Ignore error for optional authentication
    }
  }

  next();
};
