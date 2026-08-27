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

export const ordersApi = {
  create: (payload: CreateOrderPayload): Promise<{ order: ApiOrder }> => {
    return apiClient<{ order: ApiOrder }>('/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  list: (params: { page?: number; limit?: number; status?: OrderStatus } = {}) => {
    const search = new URLSearchParams();
    if (params.page) search.set('page', String(params.page));
    if (params.limit) search.set('limit', String(params.limit));
    if (params.status) search.set('status', params.status);
    const qs = search.toString();

    return apiClient<{ orders: ApiOrder[]; pagination: OrderPagination }>(
      `/orders${qs ? `?${qs}` : ''}`
    );
  },

  /** Accepts either the opaque id or the human order number. */
  getOne: (id: string): Promise<{ order: ApiOrder }> => {
    return apiClient<{ order: ApiOrder }>(`/orders/${encodeURIComponent(id)}`);
  },

  cancel: (id: string): Promise<{ order: ApiOrder }> => {
    return apiClient<{ order: ApiOrder }>(
      `/orders/${encodeURIComponent(id)}/cancel`,
      { method: 'POST' }
    );
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
