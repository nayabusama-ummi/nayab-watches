import dotenv from 'dotenv';
dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Development-only fallbacks. In production these are refused outright — a
 * predictable JWT secret would let anyone forge a token for any user, so the
 * process must fail loudly at boot rather than start in a compromised state.
 */
const DEV_JWT_SECRET = 'nayab_dev_only_secret_do_not_use_in_production';
const DEV_DATABASE_URL =
  'postgresql://postgres@localhost:5432/nayab_db?schema=public';

const required = (name: string, value: string | undefined): string => {
  if (!value || !value.trim()) {
    throw new Error(
      `[NAYAB] Missing required environment variable ${name}. ` +
        `Refusing to start in production without it. See .env.example.`
    );
  }
  return value.trim();
};

const resolveJwtSecret = (): string => {
  if (isProduction) {
    const secret = required('JWT_SECRET', process.env.JWT_SECRET);
    if (secret.length < 32) {
      throw new Error(
        '[NAYAB] JWT_SECRET must be at least 32 characters in production.'
      );
    }
    if (secret === DEV_JWT_SECRET) {
      throw new Error(
        '[NAYAB] JWT_SECRET is still the development placeholder. Generate a real one.'
      );
    }
    return secret;
  }

  if (!process.env.JWT_SECRET) {
    console.warn(
      '[NAYAB] JWT_SECRET is not set — using an insecure development secret. ' +
        'Set JWT_SECRET in backend/.env before deploying.'
    );
  }
  return process.env.JWT_SECRET?.trim() || DEV_JWT_SECRET;
};

const resolveOrigins = (): string[] => {
  const raw = process.env.CORS_ORIGIN;
  if (raw) {
    return raw
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean);
  }
  if (isProduction) {
    throw new Error(
      '[NAYAB] CORS_ORIGIN must be set explicitly in production. ' +
        'Comma-separated list of allowed frontend origins.'
    );
  }
  return ['http://localhost:3000', 'http://127.0.0.1:3000'];
};

export const ENV = {
  PORT: process.env.PORT || '5000',
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: isProduction
    ? required('DATABASE_URL', process.env.DATABASE_URL)
    : process.env.DATABASE_URL || DEV_DATABASE_URL,
  JWT_SECRET: resolveJwtSecret(),
  CORS_ORIGIN: resolveOrigins(),
  COOKIE_NAME: 'nayab_auth_token',
  IS_PRODUCTION: isProduction,
  /**
   * Cross-site cookie delivery. When the SPA is served from a different origin
   * than the API in production, the auth cookie needs SameSite=None (which
   * browsers only honour together with Secure).
   */
  COOKIE_CROSS_SITE: process.env.COOKIE_CROSS_SITE === 'true',
};

/** Shared cookie options so login, register and logout can never drift apart. */
export const authCookieOptions = () => {
  const crossSite = ENV.IS_PRODUCTION && ENV.COOKIE_CROSS_SITE;
  return {
    httpOnly: true,
    secure: ENV.IS_PRODUCTION,
    sameSite: (crossSite ? 'none' : 'lax') as 'none' | 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days, matches the JWT expiry
  };
};
