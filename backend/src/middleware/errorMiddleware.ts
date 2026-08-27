import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { AppError, ErrorCode } from '../utils/errors.js';
import { ZodError } from 'zod';
import { ENV } from '../config/env.js';

/**
 * Single exit point for every error leaving the API.
 *
 * Wire format is additive by design:
 *   {
 *     status: 'error',              // legacy envelope, kept for existing clients/tests
 *     message: 'human readable',    // legacy
 *     error: { code, message, fields }   // standard contract (section AI)
 *   }
 *
 * Nothing internal is ever exposed: Prisma codes, SQL, stack traces and file
 * paths are logged server-side and replaced with a generic message.
 */

interface ErrorBody {
  status: 'error';
  message: string;
  error: {
    code: ErrorCode;
    message: string;
    fields: Record<string, string>;
  };
  errors?: Array<{ field: string; message: string }>;
  details?: any;
}

const build = (
  code: ErrorCode,
  message: string,
  fields: Record<string, string> = {}
): ErrorBody => ({
  status: 'error',
  message,
  error: { code, message, fields },
});

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  // 1. Schema validation
  if (err instanceof ZodError) {
    const fields: Record<string, string> = {};
    const formattedErrors = err.errors.map((e) => {
      const field = e.path.join('.');
      // First message per field wins — closest to what the user should fix.
      if (field && !fields[field]) fields[field] = e.message;
      return { field, message: e.message };
    });

    const body = build('VALIDATION_FAILED', 'Validation failed', fields);
    // `errors` array retained for backwards compatibility.
    body.errors = formattedErrors;
    return res.status(400).json(body);
  }

  // 2. Errors we raised on purpose
  if (err instanceof AppError) {
    const body = build(err.code, err.message, err.fields ?? {});
    if (err.details) body.details = err.details;
    return res.status(err.statusCode).json(body);
  }

  // 3. Prisma — translated to safe messages, codes never leave the server.
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    console.error(`[prisma:${err.code}]`, err.message);

    if (err.code === 'P2002') {
      const target = (err.meta?.target as string[] | undefined)?.join(', ');
      return res
        .status(409)
        .json(
          build(
            'CONFLICT',
            target
              ? `That ${target} is already in use.`
              : 'That record already exists.'
          )
        );
    }
    if (err.code === 'P2025') {
      return res
        .status(404)
        .json(build('NOT_FOUND', 'The requested record no longer exists.'));
    }
    if (err.code === 'P2003') {
      return res
        .status(409)
        .json(
          build(
            'CONFLICT',
            'This record is referenced elsewhere and cannot be changed.'
          )
        );
    }
    // Any other known Prisma failure is an internal detail.
    return res
      .status(500)
      .json(
        build(
          'INTERNAL_ERROR',
          'An internal horology service error occurred. Please try again.'
        )
      );
  }

  if (
    err instanceof Prisma.PrismaClientValidationError ||
    err instanceof Prisma.PrismaClientInitializationError ||
    err instanceof Prisma.PrismaClientRustPanicError
  ) {
    console.error('[prisma:fatal]', err.message);
    return res
      .status(500)
      .json(
        build(
          'INTERNAL_ERROR',
          'An internal horology service error occurred. Please try again.'
        )
      );
  }

  // 4. Malformed JSON body — express.json() raises a SyntaxError with .body set.
  if (err instanceof SyntaxError && 'body' in err) {
    return res
      .status(400)
      .json(build('BAD_REQUEST', 'Request body is not valid JSON.'));
  }

  // 5. Everything else
  console.error('Unhandled server error:', err);
  const body = build(
    'INTERNAL_ERROR',
    'An internal horology service error occurred. Please try again.'
  );
  // Stack is exposed ONLY outside production, and only under `details`.
  if (ENV.NODE_ENV !== 'production' && err?.stack) {
    body.details = { stack: String(err.stack).split('\n').slice(0, 4) };
  }
  return res.status(500).json(body);
};

/** Terminal 404 so unknown paths return JSON, not Express's HTML page. */
export const notFoundHandler = (req: Request, res: Response) => {
  return res
    .status(404)
    .json(
      build('NOT_FOUND', `Route ${req.method} ${req.originalUrl} does not exist.`)
    );
};
