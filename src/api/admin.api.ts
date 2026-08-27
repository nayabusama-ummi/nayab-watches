import { apiClient } from './client';
import { ApiOrder, OrderPagination, OrderStatus } from './orders.api';

export interface AdminOverview {
  orders: {
    total: number;
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
  catalogue: { total: number; outOfStock: number; lowStock: number };
  customers: number;
  /**
   * Deliberately not called "revenue" — checkout is simulated, so nothing has
   * been collected. This is the value of non-cancelled orders.
   */
  committedValue: number;
  formattedCommittedValue: string;
  paymentNote: string;
}

/** An order as the atelier sees it: the customer is attached. */
export interface AdminOrder extends ApiOrder {
  user?: { id: string; name: string; email: string };
}

export interface AdminVariant {
  id: string;
  productId: string;
  name: string;
  sku: string;
  price: number;
  formattedPrice: string;
  stock: number;
  isActive: boolean;
}

export interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  reference: string;
  price: number;
  formattedPrice: string;
  stock: number;
  availability: 'AVAILABLE' | 'LIMITED' | 'OUT_OF_STOCK';
  isFeatured: boolean;
  isActive: boolean;
  variants: AdminVariant[];
  /** How many order lines reference it — non-zero means it cannot be deleted. */
  orderedCount: number;
}

export const adminApi = {
  overview: (): Promise<{ overview: AdminOverview }> => {
    return apiClient<{ overview: AdminOverview }>('/admin/overview');
  },

  listOrders: (
    params: { page?: number; limit?: number; status?: OrderStatus } = {}
  ) => {
    const search = new URLSearchParams();
    if (params.page) search.set('page', String(params.page));
    if (params.limit) search.set('limit', String(params.limit));
    if (params.status) search.set('status', params.status);
    const qs = search.toString();

    return apiClient<{ orders: AdminOrder[]; pagination: OrderPagination }>(
      `/admin/orders${qs ? `?${qs}` : ''}`
    );
  },

  getOrder: (id: string): Promise<{ order: AdminOrder }> => {
    return apiClient<{ order: AdminOrder }>(
      `/admin/orders/${encodeURIComponent(id)}`
    );
  },

  updateOrderStatus: (
    id: string,
    status: OrderStatus
  ): Promise<{ order: AdminOrder }> => {
    return apiClient<{ order: AdminOrder }>(`/admin/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  listProducts: (params: { page?: number; limit?: number; search?: string } = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.search) query.set('search', params.search);
    const qs = query.toString();

    return apiClient<{ products: AdminProduct[]; pagination: OrderPagination }>(
      `/admin/products${qs ? `?${qs}` : ''}`
    );
  },

  /**
   * `expectedStock` is the value the operator was looking at. The server refuses
   * the write if stock moved in the meantime, so two people editing at once
   * cannot silently overwrite one another.
   */
  adjustProductStock: (
    id: string,
    body: { stock: number; expectedStock?: number; reason?: string }
  ): Promise<{ product: AdminProduct }> => {
    return apiClient<{ product: AdminProduct }>(`/admin/products/${id}/stock`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  },

  adjustVariantStock: (
    id: string,
    body: { stock: number; expectedStock?: number; reason?: string }
  ): Promise<{ variant: AdminVariant }> => {
    return apiClient<{ variant: AdminVariant }>(`/admin/variants/${id}/stock`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  },

  updateProductFlags: (
    id: string,
    body: { isFeatured?: boolean; isActive?: boolean }
  ): Promise<{ product: AdminProduct }> => {
    return apiClient<{ product: AdminProduct }>(`/admin/products/${id}/flags`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  },

  retireProduct: (id: string): Promise<{ product: AdminProduct }> => {
    return apiClient<{ product: AdminProduct }>(`/admin/products/${id}/retire`, {
      method: 'POST',
    });
  },
};
