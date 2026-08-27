import { apiClient } from './client';
import { ApiProduct } from './products.api';

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
  getAll: (): Promise<{ collections: ApiCollection[] }> => {
    return apiClient<{ collections: ApiCollection[] }>('/collections');
  },

  getBySlug: (slug: string): Promise<{ collection: ApiCollection }> => {
    return apiClient<{ collection: ApiCollection }>(`/collections/${slug}`);
  },
};
