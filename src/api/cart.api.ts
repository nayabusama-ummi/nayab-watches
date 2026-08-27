import { apiClient } from './client';
import { ApiProduct, ProductVariant } from './products.api';

export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  quantity: number;
  unitPrice: number;
  formattedUnitPrice: string;
  lineTotal: number;
  formattedLineTotal: string;
  product: ApiProduct;
  variant?: ProductVariant;
}

export interface ApiCart {
  id: string;
  userId?: string;
  sessionId?: string;
  totalQuantity: number;
  subtotal: number;
  formattedSubtotal: string;
  items: CartItem[];
}

export const cartApi = {
  getCart: (sessionId?: string): Promise<{ cart: ApiCart }> => {
    return apiClient<{ cart: ApiCart }>(`/cart${sessionId ? `?sessionId=${sessionId}` : ''}`);
  },

  addItem: (payload: { productId: string; variantId?: string; quantity?: number; sessionId?: string }): Promise<{ cart: ApiCart }> => {
    return apiClient<{ cart: ApiCart }>('/cart/items', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateItem: (itemId: string, quantity: number, sessionId?: string): Promise<{ cart: ApiCart }> => {
    return apiClient<{ cart: ApiCart }>(`/cart/items/${itemId}${sessionId ? `?sessionId=${sessionId}` : ''}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    });
  },

  removeItem: (itemId: string, sessionId?: string): Promise<{ cart: ApiCart }> => {
    return apiClient<{ cart: ApiCart }>(`/cart/items/${itemId}${sessionId ? `?sessionId=${sessionId}` : ''}`, {
      method: 'DELETE',
    });
  },

  mergeCart: (sessionId: string): Promise<{ cart: ApiCart }> => {
    return apiClient<{ cart: ApiCart }>('/cart/merge', {
      method: 'POST',
      body: JSON.stringify({ sessionId }),
    });
  },
};
