import { Request, Response, NextFunction } from 'express';
import { RateLimitError } from '../utils/errors.js';

/**
 * Dependency-free fixed-window rate limiter.
 *
 * Deliberately in-process: `express-rate-limit` cannot be installed in this
 * environment, and for a single-node deployment a Map is sufficient. Two honest
 * limitations, both documented in the README:
 *   1. Counters reset when the process restarts.
 *   2. With multiple instances each holds its own counters, so the effective
 *      limit is (max × instances). A shared store (Redis) is the fix.
 *
 * Its job is blunting credential stuffing against /api/auth/login, not
 * withstanding a distributed attack.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

interface RateLimitOptions {
  /** Window length in milliseconds. */
  windowMs: number;
  /** Requests permitted per key per window. */
  max: number;
  message?: string;
  /** Defaults to client IP. */
  keyGenerator?: (req: Request) => string;
  /** When true, a 2xx/3xx response refunds the request (login-specific). */
  skipSuccessfulRequests?: boolean;
}

const buckets = new Map<string, Bucket>();

// Evict expired buckets so the Map cannot grow without bound.
const SWEEP_INTERVAL_MS = 60_000;
const sweeper = setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}, SWEEP_INTERVAL_MS);
// Never hold the event loop open — matters for vitest, which otherwise hangs.
sweeper.unref();

/** Exposed for tests, so one suite's attempts cannot bleed into the next. */
export const resetRateLimits = () => buckets.clear();

export const rateLimit = (options: RateLimitOptions) => {
  const {
    windowMs,
    max,
    message = 'Too many requests. Please try again shortly.',
    keyGenerator = (req: Request) => req.ip ?? 'unknown',
    skipSuccessfulRequests = false,
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    const key = `${req.method}:${req.baseUrl}${req.path}:${keyGenerator(req)}`;
    const now = Date.now();

    let bucket = buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + windowMs };
      buckets.set(key, bucket);
    }

    bucket.count += 1;

    const remaining = Math.max(0, max - bucket.count);
    res.setHeader('RateLimit-Limit', String(max));
    res.setHeader('RateLimit-Remaining', String(remaining));
    res.setHeader(
      'RateLimit-Reset',
      String(Math.ceil((bucket.resetAt - now) / 1000))
    );

    if (bucket.count > max) {
      res.setHeader(
        'Retry-After',
        String(Math.ceil((bucket.resetAt - now) / 1000))
      );
      return next(new RateLimitError(message));
    }

    if (skipSuccessfulRequests) {
      res.on('finish', () => {
        if (res.statusCode < 400 && bucket!.count > 0) bucket!.count -= 1;
      });
    }

    return next();
  };
};

/**
 * Login: 10 failed attempts per 15 minutes per IP. Successful logins are
 * refunded, so a legitimate user on a shared NAT address is not punished for
 * their neighbours' successes.
 */
export const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  message:
    'Too many sign-in attempts from this address. Please try again in a few minutes.',
});

/** Registration: 5 accounts per hour per IP. */
export const registerRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: 'Too many accounts created from this address. Please try again later.',
});

/**
 * Order placement: 20 per 10 minutes. Guards the checkout transaction, which is
 * the most expensive path in the API, against accidental double-submission
 * storms as well as abuse.
 */
export const checkoutRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20,
  message: 'Too many order attempts. Please wait a moment and try again.',
});

/** Broad ceiling for everything else. Generous enough to be invisible in normal use. */
export const generalRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
});
