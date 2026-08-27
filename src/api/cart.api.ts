import { apiClient } from './client';
import { ApiProduct, ProductVariant } from './products.api';

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
  getCart: (sessionId?: string): Promise<{ cart: ApiCart }> => {
    return apiClient<{ cart: ApiCart }>(
      `/cart${sessionId ? `?sessionId=${encodeURIComponent(sessionId)}` : ''}`
    );
  },

  addItem: (payload: {
    productId: string;
    variantId?: string;
    quantity?: number;
    sessionId?: string;
  }): Promise<{ cart: ApiCart }> => {
    return apiClient<{ cart: ApiCart }>('/cart/items', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateItem: (
    itemId: string,
    quantity: number,
    sessionId?: string
  ): Promise<{ cart: ApiCart }> => {
    return apiClient<{ cart: ApiCart }>(
      `/cart/items/${itemId}${
        sessionId ? `?sessionId=${encodeURIComponent(sessionId)}` : ''
      }`,
      { method: 'PATCH', body: JSON.stringify({ quantity }) }
    );
  },

  removeItem: (itemId: string, sessionId?: string): Promise<{ cart: ApiCart }> => {
    return apiClient<{ cart: ApiCart }>(
      `/cart/items/${itemId}${
        sessionId ? `?sessionId=${encodeURIComponent(sessionId)}` : ''
      }`,
      { method: 'DELETE' }
    );
  },

  clear: (sessionId?: string): Promise<{ cart: ApiCart }> => {
    return apiClient<{ cart: ApiCart }>(
      `/cart${sessionId ? `?sessionId=${encodeURIComponent(sessionId)}` : ''}`,
      { method: 'DELETE' }
    );
  },

  /** Folds a guest bag into the account bag. Called once, on sign-in. */
  mergeCart: (sessionId: string): Promise<{ cart: ApiCart }> => {
    return apiClient<{ cart: ApiCart }>('/cart/merge', {
      method: 'POST',
      body: JSON.stringify({ sessionId }),
    });
  },
};
