import { apiClient } from './client';

/**
 * The complete set of destinations NAYAB ships to — Pakistan's four provinces
 * plus its federal territories. Mirrors PROVINCES in the backend validator; a
 * value outside this list is rejected server-side.
 */
export const PROVINCES = [
  'Punjab',
  'Sindh',
  'Khyber Pakhtunkhwa',
  'Balochistan',
  'Islamabad Capital Territory',
  'Gilgit-Baltistan',
  'Azad Jammu & Kashmir',
] as const;

export type Province = (typeof PROVINCES)[number];

export interface ApiAddress {
  id: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  province: Province;
  postalCode: string | null;
  country: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AddressPayload {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  province: Province | '';
  postalCode?: string;
  country?: 'Pakistan';
  isDefault?: boolean;
}

export const addressesApi = {
  list: (): Promise<{ addresses: ApiAddress[] }> => {
    return apiClient<{ addresses: ApiAddress[] }>('/addresses');
  },

  create: (payload: AddressPayload): Promise<{ address: ApiAddress }> => {
    return apiClient<{ address: ApiAddress }>('/addresses', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  update: (
    id: string,
    payload: Partial<AddressPayload>
  ): Promise<{ address: ApiAddress }> => {
    return apiClient<{ address: ApiAddress }>(`/addresses/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  remove: (id: string): Promise<{ message?: string }> => {
    return apiClient<{ message?: string }>(`/addresses/${id}`, {
      method: 'DELETE',
    });
  },
};

/** One line, the way it would be written on an envelope. */
export const formatAddressLine = (address: {
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  province: string;
  postalCode?: string | null;
}) =>
  [
    address.addressLine1,
    address.addressLine2,
    address.city,
    address.province,
    address.postalCode,
  ]
    .filter(Boolean)
    .join(', ');
