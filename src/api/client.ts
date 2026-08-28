const rawApiUrl = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');
const API_BASE_URL =
  rawApiUrl ||
  (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data: T;
  message?: string;
}

/**
 * The codes the API is contracted to return (backend: utils/errors.ts).
 * Kept as a union so a `switch` over them is exhaustively checked.
 */
export type ApiErrorCode =
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
  | 'INTERNAL_ERROR'
  | 'NETWORK_ERROR';

/** Per-line detail attached to INSUFFICIENT_STOCK and PRICE_CHANGED. */
export interface StockConflictItem {
  productName: string;
  requested?: number;
  available?: number;
  was?: number;
  now?: number;
}

export class ApiError extends Error {
  public statusCode: number;
  /** Branch on this, never on the message — messages are copy and will change. */
  public code: ApiErrorCode;
  /** Field name → message, for painting errors next to inputs. */
  public fields: Record<string, string>;
  /** Present on INSUFFICIENT_STOCK / PRICE_CHANGED. */
  public items?: StockConflictItem[];
  /** Seconds to wait, present on RATE_LIMITED. */
  public retryAfter?: number;

  constructor(
    message: string,
    statusCode = 500,
    code: ApiErrorCode = 'INTERNAL_ERROR',
    fields: Record<string, string> = {},
    items?: StockConflictItem[],
    retryAfter?: number
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.fields = fields;
    this.items = items;
    this.retryAfter = retryAfter;
  }

  /** True when signing in again is the fix. */
  get isAuthError() {
    return this.code === 'UNAUTHORIZED';
  }
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  // Only declare a JSON body when there actually is one — a Content-Type on a
  // bodyless GET provokes a needless CORS preflight.
  if (options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  let response: Response;

  try {
    response = await fetch(url, {
      ...options,
      headers,
      // The session cookie is HttpOnly, so it is never readable from JS. This is
      // the only thing that carries it.
      credentials: 'include',
    });
  } catch {
    // fetch only rejects for transport failures — the API being down, DNS, CORS.
    throw new ApiError(
      'Could not reach the NAYAB service. Please check your connection and try again.',
      0,
      'NETWORK_ERROR'
    );
  }

  // 204 and other empty responses would make .json() throw.
  const raw = await response.text();
  const json = raw ? safeParse(raw) : {};

  if (!response.ok) {
    const envelope = json?.error;
    const retryHeader = response.headers.get('Retry-After');

    throw new ApiError(
      envelope?.message ||
        json?.message ||
        `Request failed with status ${response.status}`,
      response.status,
      (envelope?.code as ApiErrorCode) || fallbackCode(response.status),
      envelope?.fields ?? fieldsFromLegacy(json),
      json?.details?.items,
      retryHeader ? Number(retryHeader) : undefined
    );
  }

  return (json.data ?? json) as T;
}

const safeParse = (raw: string): any => {
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
};

/** Used when an error came from somewhere that is not our error handler. */
const fallbackCode = (status: number): ApiErrorCode => {
  if (status === 400) return 'BAD_REQUEST';
  if (status === 401) return 'UNAUTHORIZED';
  if (status === 403) return 'FORBIDDEN';
  if (status === 404) return 'NOT_FOUND';
  if (status === 409) return 'CONFLICT';
  if (status === 429) return 'RATE_LIMITED';
  return 'INTERNAL_ERROR';
};

/** Older responses carried `errors: [{ field, message }]`. */
const fieldsFromLegacy = (json: any): Record<string, string> => {
  if (!Array.isArray(json?.errors)) return {};

  return json.errors.reduce(
    (acc: Record<string, string>, entry: { field?: string; message?: string }) => {
      if (entry?.field && entry?.message && !acc[entry.field]) {
        acc[entry.field] = entry.message;
      }
      return acc;
    },
    {}
  );
};

/**
 * Turns anything thrown into a sentence fit to show a client.
 * Never surfaces a raw exception string.
 */
export const messageFor = (err: unknown): string => {
  if (err instanceof ApiError) {
    if (err.code === 'RATE_LIMITED') {
      return err.retryAfter
        ? `Too many attempts. Please try again in ${err.retryAfter} seconds.`
        : 'Too many attempts. Please try again shortly.';
    }
    return err.message;
  }
  return 'Something went wrong. Please try again.';
};
