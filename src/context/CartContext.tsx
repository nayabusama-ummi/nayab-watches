import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { cartApi, ApiCart } from '../api/cart.api';
import { ApiError, messageFor } from '../api/client';
import { useAuth } from './AuthContext';
import { getGuestSessionId } from '../lib/guestSession';

/** Outcome of a bag mutation. Nothing here throws, so no call site can forget to catch. */
export interface BagResult {
  ok: boolean;
  error?: ApiError;
  message?: string;
}

interface CartContextType {
  cart: ApiCart | null;
  isLoading: boolean;
  /** The bag could not be loaded at all (API down, network). */
  loadError: string | null;
  refetch: () => void;

  isBagOpen: boolean;
  openBag: () => void;
  closeBag: () => void;
  toggleBag: () => void;

  addItem: (
    productId: string,
    variantId?: string,
    quantity?: number
  ) => Promise<BagResult>;
  updateItem: (itemId: string, quantity: number) => Promise<BagResult>;
  removeItem: (itemId: string) => Promise<BagResult>;
  clearBag: () => Promise<BagResult>;

  /** True while any bag write is in flight — use to guard against double-submits. */
  isMutating: boolean;
  /** True while this specific line is being written. */
  isItemBusy: (itemId: string) => boolean;

  /** Last write failure, for a banner. Cleared on the next successful write. */
  error: string | null;
  dismissError: () => void;

  itemCount: number;
  /** Checkout is impossible while true — a line can no longer be supplied. */
  hasBlockingIssues: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const queryClient = useQueryClient();

  const [isBagOpen, setIsBagOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /**
   * Ids currently being written. A Set rather than a single boolean so two
   * different lines can be edited independently while each one's own controls
   * stay locked. `''` is used for whole-bag operations.
   *
   * Held in a ref as well as state: state drives rendering, but the ref is what
   * the double-submit guard reads. Two clicks inside one tick both see the same
   * stale state value, whereas the ref is already updated.
   */
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());
  const inFlight = useRef<Set<string>>(new Set());

  /**
   * Read once, synchronously, on first render rather than in an effect. The old
   * version set this in a useEffect, so the very first cart query ran with an
   * empty session id and was skipped — the bag looked empty until something
   * else triggered a refetch.
   */
  const [sessionId] = useState<string>(() => getGuestSessionId());

  /**
   * A signed-in client's bag is found by their cookie; the guest handle is not
   * sent at all. Passing it would let a URL steer the request onto another bag,
   * and the server ignores it for authenticated requests regardless.
   */
  const scopeKey = user ? `user:${user.id}` : `guest:${sessionId}`;
  const guestParam = user ? undefined : sessionId;

  const { data, isPending, error: queryError, refetch } = useQuery({
    queryKey: ['cart', scopeKey],
    queryFn: async () => {
      const res = await cartApi.getCart(guestParam);
      return res.cart;
    },
    // Waiting for the session probe avoids fetching a guest bag and then
    // immediately re-fetching the account bag one tick later.
    enabled: !isAuthLoading,
    staleTime: 15_000,
  });

  const cart = data ?? null;

  const markBusy = useCallback((id: string, busy: boolean) => {
    if (busy) inFlight.current.add(id);
    else inFlight.current.delete(id);

    setBusyIds(new Set(inFlight.current));
  }, []);

  /**
   * One code path for every bag write: lock the line, run it, publish the cart
   * the server returned, unlock. The response is the authoritative bag, so it is
   * written straight into the cache instead of triggering another round trip.
   */
  const run = useCallback(
    async (busyKey: string, operation: () => Promise<{ cart: ApiCart }>): Promise<BagResult> => {
      if (inFlight.current.has(busyKey)) {
        // A second click while the first is still in flight is discarded rather
        // than queued, so a double-tap cannot add two pieces.
        return { ok: false, message: 'Please wait a moment.' };
      }

      markBusy(busyKey, true);

      try {
        const res = await operation();
        queryClient.setQueryData(['cart', scopeKey], res.cart);
        setError(null);
        return { ok: true };
      } catch (err) {
        const message = messageFor(err);
        setError(message);

        // A stock or price conflict means our view of the bag is behind the
        // server's. Re-read it so the client sees the real state immediately.
        if (
          err instanceof ApiError &&
          (err.code === 'INSUFFICIENT_STOCK' ||
            err.code === 'PRICE_CHANGED' ||
            err.code === 'NOT_FOUND')
        ) {
          queryClient.invalidateQueries({ queryKey: ['cart', scopeKey] });
        }

        return {
          ok: false,
          error: err instanceof ApiError ? err : undefined,
          message,
        };
      } finally {
        markBusy(busyKey, false);
      }
    },
    [markBusy, queryClient, scopeKey]
  );

  const openBag = useCallback(() => setIsBagOpen(true), []);
  const closeBag = useCallback(() => setIsBagOpen(false), []);
  const toggleBag = useCallback(() => setIsBagOpen((prev) => !prev), []);

  const addItem = useCallback(
    async (productId: string, variantId?: string, quantity = 1) => {
      const result = await run(`add:${productId}:${variantId ?? ''}`, () =>
        cartApi.addItem({ productId, variantId, quantity, sessionId: guestParam })
      );

      if (result.ok) setIsBagOpen(true);
      return result;
    },
    [run, guestParam]
  );

  const updateItem = useCallback(
    (itemId: string, quantity: number) =>
      run(itemId, () => cartApi.updateItem(itemId, quantity, guestParam)),
    [run, guestParam]
  );

  const removeItem = useCallback(
    (itemId: string) => run(itemId, () => cartApi.removeItem(itemId, guestParam)),
    [run, guestParam]
  );

  const clearBag = useCallback(
    () => run('', () => cartApi.clear(guestParam)),
    [run, guestParam]
  );

  const isItemBusy = useCallback((itemId: string) => busyIds.has(itemId), [busyIds]);

  const value = useMemo<CartContextType>(
    () => ({
      cart,
      isLoading: isPending,
      loadError: queryError ? messageFor(queryError) : null,
      refetch,
      isBagOpen,
      openBag,
      closeBag,
      toggleBag,
      addItem,
      updateItem,
      removeItem,
      clearBag,
      isMutating: busyIds.size > 0,
      isItemBusy,
      error,
      dismissError: () => setError(null),
      itemCount: cart?.totalQuantity ?? 0,
      hasBlockingIssues: cart?.hasUnavailableItems ?? false,
    }),
    [
      cart,
      isPending,
      queryError,
      refetch,
      isBagOpen,
      openBag,
      closeBag,
      toggleBag,
      addItem,
      updateItem,
      removeItem,
      clearBag,
      busyIds,
      isItemBusy,
      error,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
