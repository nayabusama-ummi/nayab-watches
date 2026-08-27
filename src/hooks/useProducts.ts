import { useQuery } from '@tanstack/react-query';
import { productsApi, ProductFilterParams } from '../api/products.api';

export const useProducts = (params: ProductFilterParams = {}) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productsApi.getAll(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useProduct = (slug: string) => {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: () => productsApi.getBySlug(slug),
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
  });
};
