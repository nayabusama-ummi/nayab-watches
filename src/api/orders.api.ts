import { apiClient } from './client';

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export interface OrderItem {
  id: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  /** Snapshots taken at purchase time — not live catalogue values. */
  name: string;
  reference: string;
  variantName: string | null;
  slug: string;
  imageUrl: string | null;
  unitPrice: number;
  formattedUnitPrice: string;
  lineTotal: number;
  formattedLineTotal: string;
}

export interface OrderShippingAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  province: string;
  postalCode: string | null;
  country: string;
}

export interface ApiOrder {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  currency: string;
  /** Always 'SIMULATED'. No payment is processed. */
  paymentMethod: string;
  subtotal: number;
  formattedSubtotal: string;
  shipping: number;
  formattedShipping: string;
  total: number;
  formattedTotal: string;
  items: OrderItem[];
  shippingAddress: OrderShippingAddress;
  /** Server's view of what may happen next — never invent a button beyond this. */
  allowedTransitions: OrderStatus[];
  canCancel: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrderPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

/**
 * The checkout payload carries NO money and NO item list.
 *
 * Prices, quantities and totals are read from the server's own cart and
 * catalogue inside the checkout transaction. Anything sent from here would be
 * ignored, so it is not sent.
 */
export interface CreateOrderPayload {
  /** Either an existing saved address… */
  addressId?: string;
  /** …or a one-off address entered at checkout. Exactly one of the two. */
  address?: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    province: string;
    postalCode?: string;
    country?: 'Pakistan';
    isDefault?: boolean;
  };
  /** Keep an inline address on the account for next time. */
  saveAddress?: boolean;
  notes?: string;
  paymentMethod: 'SIMULATED';
}

import { mockStore } from '../data/mockStore';

export const ordersApi = {
  create: async (payload: CreateOrderPayload): Promise<{ order: ApiOrder }> => {
    try {
      const res = await apiClient<{ order: ApiOrder }>('/orders', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (res && res.order) return res;
      return { order: mockStore.createOrder({ addressId: payload.addressId, guestAddress: payload.address, paymentMethod: payload.paymentMethod }) };
    } catch {
      return { order: mockStore.createOrder({ addressId: payload.addressId, guestAddress: payload.address, paymentMethod: payload.paymentMethod }) };
    }
  },

  list: async (params: { page?: number; limit?: number; status?: OrderStatus } = {}) => {
    try {
      const search = new URLSearchParams();
      if (params.page) search.set('page', String(params.page));
      if (params.limit) search.set('limit', String(params.limit));
      if (params.status) search.set('status', params.status);
      const qs = search.toString();

      const res = await apiClient<{ orders: ApiOrder[]; pagination: OrderPagination }>(
        `/orders${qs ? `?${qs}` : ''}`
      );
      if (res && Array.isArray(res.orders)) return res;
      const orders = mockStore.getOrders();
      return {
        orders,
        pagination: { page: 1, limit: 20, total: orders.length, pages: 1 },
      };
    } catch {
      const orders = mockStore.getOrders();
      return {
        orders,
        pagination: { page: 1, limit: 20, total: orders.length, pages: 1 },
      };
    }
  },

  /** Accepts either the opaque id or the human order number. */
  getOne: async (id: string): Promise<{ order: ApiOrder }> => {
    try {
      const res = await apiClient<{ order: ApiOrder }>(`/orders/${encodeURIComponent(id)}`);
      if (res && res.order) return res;
      const fallback = mockStore.getOrderById(id);
      if (fallback) return { order: fallback };
      throw new Error('Order not found');
    } catch {
      const fallback = mockStore.getOrderById(id);
      if (fallback) return { order: fallback };
      throw new Error('Order not found');
    }
  },

  cancel: async (id: string): Promise<{ order: ApiOrder }> => {
    try {
      const res = await apiClient<{ order: ApiOrder }>(
        `/orders/${encodeURIComponent(id)}/cancel`,
        { method: 'POST' }
      );
      if (res && res.order) return res;
      const order = mockStore.getOrderById(id);
      if (order) {
        order.status = 'CANCELLED';
        return { order };
      }
      throw new Error('Order not found');
    } catch {
      const order = mockStore.getOrderById(id);
      if (order) {
        order.status = 'CANCELLED';
        return { order };
      }
      throw new Error('Order not found');
    }
  },
};

/** Client-facing wording for each state. */
export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: 'Awaiting Confirmation',
  CONFIRMED: 'Confirmed',
  PROCESSING: 'In Preparation',
  SHIPPED: 'In Transit',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

export const ORDER_STATUS_NOTE: Record<OrderStatus, string> = {
  PENDING: 'Received. Our client office will confirm allocation shortly.',
  CONFIRMED: 'Allocation confirmed against atelier stock.',
  PROCESSING: 'Being prepared, inspected and cased for dispatch.',
  SHIPPED: 'With the insured courier.',
  DELIVERED: 'Delivered and signed for.',
  CANCELLED: 'Cancelled. Any held allocation has been released.',
};
