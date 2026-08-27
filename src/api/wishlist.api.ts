import { apiClient } from './client';
import { ApiProduct } from './products.api';

export interface WishlistItem {
  id: string;
  productId: string;
  createdAt: string;
  product: ApiProduct;
}

export const wishlistApi = {
  getWishlist: (): Promise<{ items: WishlistItem[] }> => {
    return apiClient<{ items: WishlistItem[] }>('/wishlist');
  },

  addItem: (productId: string): Promise<{ item: WishlistItem }> => {
    return apiClient<{ item: WishlistItem }>('/wishlist', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
  },

  removeItem: (productId: string): Promise<{ success: boolean; message: string }> => {
    return apiClient<{ success: boolean; message: string }>(`/wishlist/${productId}`, {
      method: 'DELETE',
    });
  },
};
