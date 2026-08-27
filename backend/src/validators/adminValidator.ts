import { z } from 'zod';

/**
 * Inventory adjustment.
 *
 * `stock` is an ABSOLUTE count, not a delta. A delta API ("add 3") is ambiguous
 * when two people are counting the same shelf; an absolute value plus the
 * `expectedStock` guard below makes a concurrent edit fail loudly instead of
 * silently compounding.
 */
export const adjustStockSchema = z.object({
  stock: z
    .number()
    .int('Stock must be a whole number')
    .min(0, 'Stock cannot be negative')
    .max(9999, 'Stock figure looks implausible'),
  /**
   * Optimistic concurrency. When supplied, the write only lands if the current
   * value still matches what the administrator was shown.
   */
  expectedStock: z.number().int().min(0).optional(),
  reason: z.string().trim().max(200).optional(),
});

export const updateProductFlagsSchema = z
  .object({
    featured: z.boolean().optional(),
    newModel: z.boolean().optional(),
    availability: z.enum(['AVAILABLE', 'LIMITED', 'OUT_OF_STOCK']).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Provide at least one field to update',
  });

export const adminListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  search: z.string().trim().max(100).optional(),
});

export type AdjustStockInput = z.infer<typeof adjustStockSchema>;
export type UpdateProductFlagsInput = z.infer<typeof updateProductFlagsSchema>;
export type AdminListQuery = z.infer<typeof adminListQuerySchema>;
