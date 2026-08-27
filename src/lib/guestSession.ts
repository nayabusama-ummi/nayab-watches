/**
 * Guest bag identity.
 *
 * This is the ONLY thing NAYAB keeps in localStorage besides UI preference.
 * It is an opaque, meaningless handle to an anonymous bag row — no credentials,
 * no session token, no prices, no catalogue, no order data. Everything that
 * matters is server-side, and the moment a client signs in this handle is
 * exchanged for their account bag and discarded.
 *
 * The auth session itself lives in an HttpOnly cookie that JavaScript cannot
 * read, so nothing here is worth stealing.
 */

const GUEST_SESSION_KEY = 'nayab_guest_session_id';

/** Backend accepts 8–64 characters (sessionIdField in cartValidator). */
const isWellFormed = (value: string | null): value is string =>
  !!value && value.length >= 8 && value.length <= 64;

const mint = (): string => {
  // crypto.randomUUID is unavailable on http:// origins in some browsers, so
  // getRandomValues is the fallback rather than Math.random.
  const cryptoObj = globalThis.crypto;

  if (cryptoObj?.randomUUID) return `guest_${cryptoObj.randomUUID()}`;

  if (cryptoObj?.getRandomValues) {
    const bytes = new Uint8Array(16);
    cryptoObj.getRandomValues(bytes);
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
    return `guest_${hex}`;
  }

  return `guest_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
};

/**
 * Reads the handle, creating one if absent. Safe in private-browsing modes where
 * localStorage throws on access: the caller still gets a usable id for this tab,
 * it simply will not survive a reload.
 */
export const getGuestSessionId = (): string => {
  try {
    const existing = localStorage.getItem(GUEST_SESSION_KEY);
    if (isWellFormed(existing)) return existing;

    const fresh = mint();
    localStorage.setItem(GUEST_SESSION_KEY, fresh);
    return fresh;
  } catch {
    return mint();
  }
};

/** Peek without creating — used on sign-in to decide whether a merge is needed. */
export const peekGuestSessionId = (): string | null => {
  try {
    const existing = localStorage.getItem(GUEST_SESSION_KEY);
    return isWellFormed(existing) ? existing : null;
  } catch {
    return null;
  }
};

export const clearGuestSessionId = (): void => {
  try {
    localStorage.removeItem(GUEST_SESSION_KEY);
  } catch {
    /* nothing to clean up if storage is unavailable */
  }
};
