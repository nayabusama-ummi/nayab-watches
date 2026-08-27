import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { ENV } from './config/env.js';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorMiddleware.js';
import { securityHeaders } from './middleware/securityHeaders.js';
import { generalRateLimit } from './middleware/rateLimit.js';
// Installs the global BigInt → JSON safety net before any route can respond.
import './utils/money.js';

export const createApp = () => {
  const app = express();

  // Don't advertise the framework.
  app.disable('x-powered-by');

  /**
   * Trust the first proxy hop in production so `req.ip` is the real client
   * address rather than the load balancer's — the rate limiter keys on it, and
   * without this every request shares one bucket.
   */
  if (ENV.IS_PRODUCTION) app.set('trust proxy', 1);

  app.use(securityHeaders);

  /**
   * CORS. The previous implementation called `callback(null, true)` in BOTH
   * branches, so the allow-list was decorative and any origin could make
   * credentialed requests. Now an unknown origin is refused.
   *
   * Requests with no Origin header (curl, server-to-server, supertest) are
   * allowed: the browser only omits Origin when there is no cross-site context
   * to protect, and blocking them would break the test suite and health checks.
   */
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (ENV.CORS_ORIGIN.includes(origin)) return callback(null, true);

        if (!ENV.IS_PRODUCTION) {
          // Locally, any loopback port is fine — Vite moves ports when 3000 is taken.
          if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
            return callback(null, true);
          }
          console.warn(`[cors] blocked origin ${origin}`);
        }

        // `false`, not an Error: the response simply lacks the CORS headers,
        // which is the correct outcome. Throwing produces a confusing 500.
        return callback(null, false);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Cart-Session'],
      maxAge: 86400,
    })
  );

  app.use(cookieParser());

  // Explicit cap. The default is already 100kb, but stating it makes the bound
  // intentional rather than incidental.
  app.use(express.json({ limit: '100kb' }));

  // NOTE: express.urlencoded is deliberately NOT mounted. Every endpoint takes
  // JSON; accepting form bodies only widens the parser surface for no caller.

  app.use('/api', generalRateLimit);

  app.use('/api', routes);

  // Unknown paths return the standard JSON error envelope, not Express's HTML.
  app.use(notFoundHandler);

  app.use(errorHandler);

  return app;
};
