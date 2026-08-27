import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { wishlistApi } from '../api/wishlist.api';
import { useAuth } from '../context/AuthContext';

export const useWishlist = () => {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => wishlistApi.getWishlist(),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 2,
  });

  const addMutation = useMutation({
    mutationFn: (productId: string) => wishlistApi.addItem(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (productId: string) => wishlistApi.removeItem(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });

  const items = data?.items ?? [];
  const isInWishlist = (productId: string) => items.some((item) => item.productId === productId);

  return {
    items,
    isLoading: isAuthenticated ? isLoading : false,
    isInWishlist,
    addToWishlist: (productId: string) => addMutation.mutateAsync(productId),
    removeFromWishlist: (productId: string) => removeMutation.mutateAsync(productId),
  };
};
