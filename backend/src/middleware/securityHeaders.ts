import { Request, Response, NextFunction } from 'express';
import { ENV } from '../config/env.js';

/**
 * Hand-rolled security headers.
 *
 * `helmet` is the normal answer; it cannot be installed here (no registry
 * access), so the headers that actually matter for a JSON API behind a separate
 * SPA are set directly. This is not a full helmet replacement — the ones helmet
 * sets that are irrelevant to an API that never renders HTML are deliberately
 * omitted rather than cargo-culted.
 */
export const securityHeaders = (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  // Stop browsers from MIME-sniffing a JSON response into something executable.
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Legacy clickjacking defence. The API serves no HTML, but a stray error page
  // in a frame is still worth refusing.
  res.setHeader('X-Frame-Options', 'DENY');

  // Do not leak the full API URL (which can contain ids) to third parties.
  res.setHeader('Referrer-Policy', 'no-referrer');

  // The API needs none of these; withhold them from anything it might render.
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=()'
  );

  // A JSON API should never execute or embed anything.
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'"
  );

  // Auth responses must never be cached by an intermediary.
  res.setHeader('Cross-Origin-Resource-Policy', 'same-site');

  if (ENV.IS_PRODUCTION) {
    // Only meaningful over TLS; setting it in dev would poison localhost.
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains'
    );
  }

  next();
};

/**
 * Marks a response as private and uncacheable. Applied to authenticated reads so
 * a shared cache can never hand one customer's bag or orders to another.
 */
export const noStore = (_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  next();
};
