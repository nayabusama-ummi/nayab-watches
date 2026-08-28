import { apiClient } from './client';
import { ApiProduct } from './products.api';
import { mockStore } from '../data/mockStore';

export interface ApiCollection {
  id: string;
  slug: string;
  name: string;
  tagline?: string;
  description?: string;
  heroImage?: string;
  accentColor?: string;
  displayOrder: number;
  productCount?: number;
  products?: ApiProduct[];
}

export const collectionsApi = {
  getAll: async (): Promise<{ collections: ApiCollection[] }> => {
    try {
      const res = await apiClient<{ collections: ApiCollection[] }>('/collections');
      if (res && Array.isArray(res.collections) && res.collections.length > 0) {
        return res;
      }
      return { collections: mockStore.getCollections() };
    } catch {
      return { collections: mockStore.getCollections() };
    }
  },

  getBySlug: async (slug: string): Promise<{ collection: ApiCollection }> => {
    try {
      const res = await apiClient<{ collection: ApiCollection }>(`/collections/${slug}`);
      if (res && res.collection) {
        return res;
      }
      const fallback = mockStore.getCollectionBySlug(slug);
      if (fallback) return { collection: fallback };
      throw new Error('Collection not found');
    } catch {
      const fallback = mockStore.getCollectionBySlug(slug);
      if (fallback) return { collection: fallback };
      throw new Error('Collection not found');
    }
  },
};
