/**
 * NAYAB error taxonomy.
 *
 * Every error carries a stable machine-readable `code` so clients can branch on
 * it without string-matching prose. The wire format is emitted by
 * middleware/errorMiddleware.ts and is deliberately ADDITIVE: it keeps the
 * original `{ status, message }` envelope that the existing API and test suite
 * rely on, and adds the `{ error: { code, message, fields } }` object alongside.
 */

export type ErrorCode =
  | 'VALIDATION_FAILED'
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'CART_EMPTY'
  | 'INSUFFICIENT_STOCK'
  | 'PRICE_CHANGED'
  | 'INVALID_STATUS_TRANSITION'
  | 'PRODUCT_IN_USE'
  | 'INTERNAL_ERROR';

export class AppError extends Error {
  public statusCode: number;
  public code: ErrorCode;
  public details?: any;
  /** Per-field messages, keyed by field path. Shapes the `fields` object. */
  public fields?: Record<string, string>;

  constructor(
    message: string,
    statusCode = 500,
    code: ErrorCode = 'INTERNAL_ERROR',
    details?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Invalid request', details?: any) {
    super(message, 400, 'BAD_REQUEST', details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Access denied') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(message, 409, 'CONFLICT');
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Too many requests. Please try again shortly.') {
    super(message, 429, 'RATE_LIMITED');
  }
}

/** Bag is empty at checkout. */
export class CartEmptyError extends AppError {
  constructor(message = 'Your bag is empty.') {
    super(message, 400, 'CART_EMPTY');
  }
}

/**
 * Requested quantity exceeds what is actually available. Carries the specifics
 * so the bag can show the customer exactly which timepiece is short.
 */
export class InsufficientStockError extends AppError {
  constructor(
    message: string,
    public readonly items: Array<{
      productName: string;
      requested: number;
      available: number;
    }> = []
  ) {
    super(message, 409, 'INSUFFICIENT_STOCK', { items });
  }
}

/** Catalogue price moved while the item sat in the bag. */
export class PriceChangedError extends AppError {
  constructor(
    message: string,
    public readonly items: Array<{
      productName: string;
      was: string;
      now: string;
    }> = []
  ) {
    super(message, 409, 'PRICE_CHANGED', { items });
  }
}

/** Order status moves are a directed graph; this rejects an illegal edge. */
export class InvalidStatusTransitionError extends AppError {
  constructor(from: string, to: string) {
    super(
      `An order that is ${from} cannot be moved to ${to}.`,
      422,
      'INVALID_STATUS_TRANSITION'
    );
  }
}

/** Blocks destructive delete of a product that already appears in an order. */
export class ProductInUseError extends AppError {
  constructor(
    message = 'This timepiece appears in an existing order and cannot be deleted. Deactivate it instead.'
  ) {
    super(message, 409, 'PRODUCT_IN_USE');
  }
}
