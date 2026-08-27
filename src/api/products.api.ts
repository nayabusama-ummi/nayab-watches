import { apiClient } from './client';

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  type: 'HERO' | 'FRONT' | 'SIDE' | 'WRIST' | 'MACRO' | 'CASEBACK' | 'EXPLODED' | 'LIFESTYLE';
  sortOrder: number;
}

export interface ProductVariant {
  id: string;
  sku: string;
  name: string;
  material: string;
  dialColor: string;
  strap: string;
  price: number;
  formattedPrice: string;
  stock: number;
}

export interface ApiProduct {
  id: string;
  slug: string;
  name: string;
  reference: string;
  collectionId: string;
  collection: {
    id: string;
    slug: string;
    name: string;
    tagline?: string;
  };
  tagline?: string;
  shortDescription: string;
  description: string;
  narrative?: string;
  price: number;
  formattedPrice: string;
  currency: string;
  caseMaterial: string;
  caseDiameter: string;
  caseThickness?: string;
  dial: string;
  movement: string;
  powerReserve?: string;
  waterResistance?: string;
  frequency?: string;
  jewels?: number;
  strapOrBracelet: string;
  availability: 'AVAILABLE' | 'LIMITED' | 'OUT_OF_STOCK';
  stock: number;
  featured: boolean;
  newModel: boolean;
  category: 'mens' | 'womens' | 'unisex';
  images: ProductImage[];
  variants: ProductVariant[];
}

export interface ProductsResponse {
  products: ApiProduct[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ProductFilterParams {
  collection?: string;
  material?: string;
  size?: string;
  availability?: string;
  category?: string;
  search?: string;
  sort?: 'newest' | 'price-asc' | 'price-desc';
  page?: number;
  limit?: number;
}

export const productsApi = {
  getAll: (params: ProductFilterParams = {}): Promise<ProductsResponse> => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') {
        query.append(k, String(v));
      }
    });
    const queryString = query.toString();
    return apiClient<ProductsResponse>(`/products${queryString ? `?${queryString}` : ''}`);
  },

  getBySlug: (slug: string): Promise<{ product: ApiProduct }> => {
    return apiClient<{ product: ApiProduct }>(`/products/${slug}`);
  },
};
