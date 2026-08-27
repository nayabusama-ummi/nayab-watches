/**
 * NAYAB money handling.
 *
 * Representation: BigInt, WHOLE PKR (major units). `3850000n` is PKR 3,850,000,
 * not paisa. Pakistani retail prices at this tier are never quoted in paisa, so
 * there is no sub-unit to track. All arithmetic stays in BigInt — no float ever
 * touches an authoritative amount.
 *
 * Serialisation: BigInt is not valid JSON, so `BigInt.prototype.toJSON` is
 * installed once at import time (see below) as a safety net. That makes every
 * endpoint safe by default, including ones added later that return raw Prisma
 * rows — previously each call site had to remember to serialise, and forgetting
 * produced a 500 at response time.
 */

declare global {
  interface BigInt {
    toJSON(): number;
  }
}

/**
 * Global BigInt → JSON safety net.
 *
 * Emits a NUMBER, not a string, to stay wire-compatible with the existing
 * clients and test suite. Safe because NAYAB amounts are whole rupees far below
 * Number.MAX_SAFE_INTEGER (9.007e15); the guard below makes a violation loud
 * rather than silent.
 */
if (!('toJSON' in BigInt.prototype)) {
  Object.defineProperty(BigInt.prototype, 'toJSON', {
    value: function (this: bigint) {
      if (this > BigInt(Number.MAX_SAFE_INTEGER)) {
        throw new Error(
          `[NAYAB] Monetary value ${this.toString()} exceeds safe integer range ` +
            `and cannot be serialised as a JSON number.`
        );
      }
      return Number(this);
    },
    writable: true,
    configurable: true,
  });
}

/** PKR 3,850,000 */
export const formatPKR = (amount: bigint | number): string => {
  const num = typeof amount === 'bigint' ? Number(amount) : amount;
  // Explicit grouping rather than toLocaleString('en-PK'): a small-icu Node
  // build silently ignores the locale and produces an ungrouped string, which
  // is how the exact-match price assertions in the test suite start failing on
  // one machine and not another.
  const sign = num < 0 ? '-' : '';
  const digits = Math.abs(Math.trunc(num)).toString();
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `PKR ${sign}${grouped}`;
};

export const serializeBigInt = <T>(obj: T): T => {
  return JSON.parse(
    JSON.stringify(obj, (_, value) =>
      typeof value === 'bigint' ? Number(value) : value
    )
  );
};

export const serializeProduct = (product: any) => {
  if (!product) return null;
  const serialized = serializeBigInt(product);
  return {
    ...serialized,
    formattedPrice: formatPKR(product.price),
    variants: product.variants?.map((v: any) => ({
      ...serializeBigInt(v),
      formattedPrice: formatPKR(v.price),
    })),
  };
};

/**
 * Shipping. NAYAB delivers by insured courier at no charge — a flat zero rather
 * than a fabricated fee, and computed server-side so the client can never
 * propose its own. Kept as a function so a real rate table can replace it
 * without touching the checkout transaction.
 */
export const calculateShipping = (_subtotalPKR: bigint): bigint => BigInt(0);

/** Authoritative order totals. Inputs and outputs are BigInt throughout. */
export const calculateOrderTotals = (
  lines: Array<{ unitPrice: bigint; quantity: number }>
) => {
  const subtotal = lines.reduce(
    (acc, line) => acc + line.unitPrice * BigInt(line.quantity),
    BigInt(0)
  );
  const shipping = calculateShipping(subtotal);
  return { subtotal, shipping, total: subtotal + shipping };
};
