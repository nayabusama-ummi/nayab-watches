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

import { mockStore } from '../data/mockStore';

export const addressesApi = {
  list: async (): Promise<{ addresses: ApiAddress[] }> => {
    try {
      const res = await apiClient<{ addresses: ApiAddress[] }>('/addresses');
      if (res && Array.isArray(res.addresses)) return res;
      return { addresses: mockStore.getAddresses() };
    } catch {
      return { addresses: mockStore.getAddresses() };
    }
  },

  create: async (payload: AddressPayload): Promise<{ address: ApiAddress }> => {
    try {
      const res = await apiClient<{ address: ApiAddress }>('/addresses', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (res && res.address) return res;
      const newAddr: ApiAddress = {
        id: `addr-${Date.now()}`,
        fullName: payload.fullName,
        phone: payload.phone,
        addressLine1: payload.addressLine1,
        addressLine2: payload.addressLine2 || null,
        city: payload.city,
        province: (payload.province || 'Punjab') as Province,
        postalCode: payload.postalCode || null,
        country: 'Pakistan',
        isDefault: Boolean(payload.isDefault),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const addresses = [...mockStore.getAddresses(), newAddr];
      mockStore.saveAddresses(addresses);
      return { address: newAddr };
    } catch {
      const newAddr: ApiAddress = {
        id: `addr-${Date.now()}`,
        fullName: payload.fullName,
        phone: payload.phone,
        addressLine1: payload.addressLine1,
        addressLine2: payload.addressLine2 || null,
        city: payload.city,
        province: (payload.province || 'Punjab') as Province,
        postalCode: payload.postalCode || null,
        country: 'Pakistan',
        isDefault: Boolean(payload.isDefault),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const addresses = [...mockStore.getAddresses(), newAddr];
      mockStore.saveAddresses(addresses);
      return { address: newAddr };
    }
  },

  update: async (
    id: string,
    payload: Partial<AddressPayload>
  ): Promise<{ address: ApiAddress }> => {
    try {
      const res = await apiClient<{ address: ApiAddress }>(`/addresses/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      if (res && res.address) return res;
      const addresses = mockStore.getAddresses();
      const idx = addresses.findIndex((a) => a.id === id);
      if (idx > -1) {
        addresses[idx] = {
          ...addresses[idx],
          ...payload,
          province: (payload.province || addresses[idx].province) as Province,
          addressLine2: payload.addressLine2 !== undefined ? payload.addressLine2 : addresses[idx].addressLine2,
          postalCode: payload.postalCode !== undefined ? payload.postalCode : addresses[idx].postalCode,
          updatedAt: new Date().toISOString(),
        };
        mockStore.saveAddresses(addresses);
        return { address: addresses[idx] };
      }
      throw new Error('Address not found');
    } catch {
      const addresses = mockStore.getAddresses();
      const idx = addresses.findIndex((a) => a.id === id);
      if (idx > -1) {
        addresses[idx] = {
          ...addresses[idx],
          ...payload,
          province: (payload.province || addresses[idx].province) as Province,
          addressLine2: payload.addressLine2 !== undefined ? payload.addressLine2 : addresses[idx].addressLine2,
          postalCode: payload.postalCode !== undefined ? payload.postalCode : addresses[idx].postalCode,
          updatedAt: new Date().toISOString(),
        };
        mockStore.saveAddresses(addresses);
        return { address: addresses[idx] };
      }
      throw new Error('Address not found');
    }
  },

  remove: async (id: string): Promise<{ message?: string }> => {
    try {
      const res = await apiClient<{ message?: string }>(`/addresses/${id}`, {
        method: 'DELETE',
      });
      if (res && res.message) return res;
      const addresses = mockStore.getAddresses().filter((a) => a.id !== id);
      mockStore.saveAddresses(addresses);
      return { message: 'Address removed' };
    } catch {
      const addresses = mockStore.getAddresses().filter((a) => a.id !== id);
      mockStore.saveAddresses(addresses);
      return { message: 'Address removed' };
    }
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
