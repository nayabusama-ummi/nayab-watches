import { z } from 'zod';

/**
 * Pakistan's four provinces plus the two federal territories, which is the
 * complete set NAYAB ships to. A closed list rather than free text so the
 * address snapshot on an order is never ambiguous.
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

const trimmed = (max: number) => z.string().trim().max(max);

/**
 * Pakistani mobile and landline formats, tolerant of the ways people actually
 * type them: +92 300 1234567, 0300-1234567, 03001234567.
 */
const phoneField = trimmed(24)
  .min(10, 'Please enter a complete phone number')
  .regex(
    /^(\+92|0)[\s-]?\d{2,4}[\s-]?\d{6,8}$/,
    'Please enter a valid Pakistani phone number, e.g. +92 300 1234567'
  );

export const addressBodySchema = z.object({
  fullName: trimmed(80).min(2, 'Recipient name is required'),
  phone: phoneField,
  addressLine1: trimmed(120).min(5, 'Street address is required'),
  addressLine2: trimmed(120).optional().or(z.literal('')),
  city: trimmed(60).min(2, 'City is required'),
  province: z.enum(PROVINCES, {
    errorMap: () => ({ message: 'Please select a province or territory' }),
  }),
  // Pakistan Post uses five digits. Optional because rural addresses often omit it.
  postalCode: trimmed(10)
    .regex(/^\d{5}$/, 'Postal code must be 5 digits')
    .optional()
    .or(z.literal('')),
  // Fixed for now: NAYAB delivers domestically only, and accepting a country
  // from the client would imply international shipping that does not exist.
  country: z.literal('Pakistan').optional().default('Pakistan'),
  isDefault: z.boolean().optional().default(false),
});

export const updateAddressSchema = addressBodySchema.partial();

/**
 * Checkout takes EITHER a saved address id OR a full inline address — never
 * both, never neither. Note what is absent: no prices, no subtotal, no total,
 * no item list. The server reads the bag and the catalogue itself, so there is
 * nothing here for a client to falsify.
 */
export const createOrderSchema = z
  .object({
    addressId: z.string().trim().min(1).optional(),
    address: addressBodySchema.optional(),
    saveAddress: z.boolean().optional().default(false),
    /**
     * Simulated payment only — no real funds move. `SIMULATED` is the honest
     * name and the only accepted value; see README.
     */
    paymentMethod: z.literal('SIMULATED').optional().default('SIMULATED'),
    notes: trimmed(500).optional(),
  })
  .refine((data) => Boolean(data.addressId) !== Boolean(data.address), {
    message: 'Provide either a saved address or a new delivery address',
    path: ['addressId'],
  });

export const ORDER_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
] as const;

export const updateOrderStatusSchema = z.object({
  status: z.enum(ORDER_STATUSES, {
    errorMap: () => ({ message: 'Unrecognised order status' }),
  }),
});

export const listOrdersQuerySchema = z.object({
  status: z.enum(ORDER_STATUSES).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export type AddressInput = z.infer<typeof addressBodySchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type ListOrdersQuery = z.infer<typeof listOrdersQuerySchema>;
