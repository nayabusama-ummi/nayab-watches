import { apiClient } from './client';
import { ApiProduct } from './products.api';
import { mockStore, FALLBACK_PRODUCTS } from '../data/mockStore';

export interface WishlistItem {
  id: string;
  productId: string;
  createdAt: string;
  product: ApiProduct;
}

export const wishlistApi = {
  getWishlist: async (): Promise<{ items: WishlistItem[] }> => {
    try {
      const res = await apiClient<{ items: WishlistItem[] }>('/wishlist');
      if (res && Array.isArray(res.items)) return res;
      const ids = mockStore.getWishlist();
      const items = ids
        .map((id) => {
          const prod = FALLBACK_PRODUCTS.find((p) => p.id === id || p.slug === id);
          if (!prod) return null;
          return {
            id: `wish-${prod.id}`,
            productId: prod.id,
            createdAt: new Date().toISOString(),
            product: prod,
          };
        })
        .filter(Boolean) as WishlistItem[];
      return { items };
    } catch {
      const ids = mockStore.getWishlist();
      const items = ids
        .map((id) => {
          const prod = FALLBACK_PRODUCTS.find((p) => p.id === id || p.slug === id);
          if (!prod) return null;
          return {
            id: `wish-${prod.id}`,
            productId: prod.id,
            createdAt: new Date().toISOString(),
            product: prod,
          };
        })
        .filter(Boolean) as WishlistItem[];
      return { items };
    }
  },

  addItem: async (productId: string): Promise<{ item: WishlistItem }> => {
    try {
      const res = await apiClient<{ item: WishlistItem }>('/wishlist', {
        method: 'POST',
        body: JSON.stringify({ productId }),
      });
      if (res && res.item) return res;
      mockStore.toggleWishlist(productId);
      const prod = FALLBACK_PRODUCTS.find((p) => p.id === productId || p.slug === productId) || FALLBACK_PRODUCTS[0];
      return {
        item: {
          id: `wish-${prod.id}`,
          productId: prod.id,
          createdAt: new Date().toISOString(),
          product: prod,
        },
      };
    } catch {
      mockStore.toggleWishlist(productId);
      const prod = FALLBACK_PRODUCTS.find((p) => p.id === productId || p.slug === productId) || FALLBACK_PRODUCTS[0];
      return {
        item: {
          id: `wish-${prod.id}`,
          productId: prod.id,
          createdAt: new Date().toISOString(),
          product: prod,
        },
      };
    }
  },

  removeItem: async (productId: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await apiClient<{ success: boolean; message: string }>(`/wishlist/${productId}`, {
        method: 'DELETE',
      });
      if (res && res.success) return res;
      mockStore.toggleWishlist(productId);
      return { success: true, message: 'Removed from wishlist' };
    } catch {
      mockStore.toggleWishlist(productId);
      return { success: true, message: 'Removed from wishlist' };
    }
  },
};
