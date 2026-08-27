import { useQuery } from '@tanstack/react-query';
import { collectionsApi } from '../api/collections.api';

export const useCollections = () => {
  return useQuery({
    queryKey: ['collections'],
    queryFn: () => collectionsApi.getAll(),
    staleTime: 1000 * 60 * 10,
  });
};

export const useCollection = (slug: string) => {
  return useQuery({
    queryKey: ['collection', slug],
    queryFn: () => collectionsApi.getBySlug(slug),
    enabled: !!slug,
    staleTime: 1000 * 60 * 10,
  });
};
