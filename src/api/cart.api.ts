import { apiClient } from './client';
import { ApiProduct, ProductVariant } from './products.api';
import { mockStore } from '../data/mockStore';

export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  quantity: number;
  /** Price captured when the piece was added — what the client was quoted. */
  unitPrice: number;
  formattedUnitPrice: string;
  lineTotal: number;
  formattedLineTotal: string;
  product: ApiProduct;
  variant?: ProductVariant;
  /** How many can actually be supplied right now. */
  availableStock: number;
  /** False when `quantity` exceeds `availableStock` — checkout would refuse. */
  inStock: boolean;
  /** The catalogue price has moved since this line was added. */
  priceChanged: boolean;
  currentPrice: number;
  formattedCurrentPrice: string;
}

export interface ApiCart {
  id: string;
  userId?: string;
  sessionId?: string;
  totalQuantity: number;
  subtotal: number;
  formattedSubtotal: string;
  items: CartItem[];
  /** Any line the atelier can no longer supply — checkout must stay disabled. */
  hasUnavailableItems: boolean;
  /** Any line whose price moved — the client must be shown before proceeding. */
  hasPriceChanges: boolean;
}

/**
 * The bag is a quote, not a reservation. Nothing here holds stock; allocation
 * happens inside the checkout transaction.
 */
export const cartApi = {
  getCart: async (sessionId?: string): Promise<{ cart: ApiCart }> => {
    try {
      const res = await apiClient<{ cart: ApiCart }>(
        `/cart${sessionId ? `?sessionId=${encodeURIComponent(sessionId)}` : ''}`
      );
      if (res && res.cart) return res;
      return { cart: mockStore.getCart() };
    } catch {
      return { cart: mockStore.getCart() };
    }
  },

  addItem: async (payload: {
    productId: string;
    variantId?: string;
    quantity?: number;
    sessionId?: string;
  }): Promise<{ cart: ApiCart }> => {
    try {
      const res = await apiClient<{ cart: ApiCart }>('/cart/items', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (res && res.cart) return res;
      return { cart: mockStore.addToCart(payload.productId, payload.variantId, payload.quantity || 1) };
    } catch {
      return { cart: mockStore.addToCart(payload.productId, payload.variantId, payload.quantity || 1) };
    }
  },

  updateItem: async (
    itemId: string,
    quantity: number,
    sessionId?: string
  ): Promise<{ cart: ApiCart }> => {
    try {
      const res = await apiClient<{ cart: ApiCart }>(
        `/cart/items/${itemId}${
          sessionId ? `?sessionId=${encodeURIComponent(sessionId)}` : ''
        }`,
        { method: 'PATCH', body: JSON.stringify({ quantity }) }
      );
      if (res && res.cart) return res;
      return { cart: mockStore.updateCartItem(itemId, quantity) };
    } catch {
      return { cart: mockStore.updateCartItem(itemId, quantity) };
    }
  },

  removeItem: async (itemId: string, sessionId?: string): Promise<{ cart: ApiCart }> => {
    try {
      const res = await apiClient<{ cart: ApiCart }>(
        `/cart/items/${itemId}${
          sessionId ? `?sessionId=${encodeURIComponent(sessionId)}` : ''
        }`,
        { method: 'DELETE' }
      );
      if (res && res.cart) return res;
      return { cart: mockStore.removeCartItem(itemId) };
    } catch {
      return { cart: mockStore.removeCartItem(itemId) };
    }
  },

  clear: async (sessionId?: string): Promise<{ cart: ApiCart }> => {
    try {
      const res = await apiClient<{ cart: ApiCart }>(
        `/cart${sessionId ? `?sessionId=${encodeURIComponent(sessionId)}` : ''}`,
        { method: 'DELETE' }
      );
      if (res && res.cart) return res;
      return { cart: mockStore.clearCart() };
    } catch {
      return { cart: mockStore.clearCart() };
    }
  },

  /** Folds a guest bag into the account bag. Called once, on sign-in. */
  mergeCart: async (sessionId: string): Promise<{ cart: ApiCart }> => {
    try {
      const res = await apiClient<{ cart: ApiCart }>('/cart/merge', {
        method: 'POST',
        body: JSON.stringify({ sessionId }),
      });
      if (res && res.cart) return res;
      return { cart: mockStore.getCart() };
    } catch {
      return { cart: mockStore.getCart() };
    }
  },
};
