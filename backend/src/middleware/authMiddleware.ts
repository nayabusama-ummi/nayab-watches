import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/jwt.js';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';
import { ENV } from '../config/env.js';
import { prisma } from '../config/prisma.js';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

/**
 * Reads the JWT from the HttpOnly cookie.
 *
 * The Bearer fallback is retained for curl and the integration suite. It is not
 * a second session mechanism: the browser client never holds the token in JS, so
 * there is nothing for XSS to read. See section M — no credentials in
 * localStorage.
 */
const extractToken = (req: Request): string | undefined => {
  const cookieToken = req.cookies?.[ENV.COOKIE_NAME];
  if (cookieToken) return cookieToken;

  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) return header.slice(7).trim() || undefined;

  return undefined;
};

export const authenticate = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) => {
  const token = extractToken(req);

  if (!token) {
    return next(
      new UnauthorizedError('Please sign in to access this client resource')
    );
  }

  try {
    req.user = verifyToken(token);
    return next();
  } catch {
    return next(
      new UnauthorizedError('Your session has expired. Please sign in again.')
    );
  }
};

export const optionalAuthenticate = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) => {
  const token = extractToken(req);

  if (token) {
    try {
      req.user = verifyToken(token);
    } catch {
      // A stale or invalid token simply means "treat as guest" here.
    }
  }

  return next();
};

/**
 * Administrator gate.
 *
 * The role is read from the DATABASE on every request, not from a claim in the
 * token. That costs one indexed lookup, and buys two things a JWT claim cannot:
 * revoking an admin takes effect immediately rather than whenever their 7-day
 * token expires, and a user deleted mid-session is rejected instead of acting on
 * a cookie for a row that no longer exists.
 *
 * Mount as [authenticate, requireAdmin] — this does not authenticate on its own.
 */
export const requireAdmin = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) => {
  if (!req.user?.userId) {
    return next(new UnauthorizedError('Please sign in to continue'));
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { id: true, role: true },
    });

    if (!user) {
      return next(
        new UnauthorizedError('Your session is no longer valid. Please sign in again.')
      );
    }

    if (user.role !== 'ADMIN') {
      // Same generic message a non-existent route would give: an ordinary
      // customer probing /api/admin learns nothing about what is there.
      return next(new ForbiddenError('You do not have access to this resource'));
    }

    return next();
  } catch (error) {
    return next(error);
  }
};
