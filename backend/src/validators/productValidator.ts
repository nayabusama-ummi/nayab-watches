import { z } from 'zod';

export const productQuerySchema = z.object({
  collection: z.string().optional(),
  material: z.string().optional(),
  size: z.string().optional(),
  availability: z.enum(['AVAILABLE', 'LIMITED', 'OUT_OF_STOCK']).optional(),
  category: z.enum(['mens', 'womens', 'unisex']).optional(),
  search: z.string().optional(),
  sort: z.enum(['newest', 'price-asc', 'price-desc']).optional().default('newest'),
  limit: z.coerce.number().min(1).max(50).optional().default(20),
  page: z.coerce.number().min(1).optional().default(1),
});

export type ProductQueryInput = z.infer<typeof productQuerySchema>;
