import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartApi, ApiCart } from '../api/cart.api';
import { useAuth } from './AuthContext';

interface CartContextType {
  cart: ApiCart | null;
  isLoading: boolean;
  isBagOpen: boolean;
  openBag: () => void;
  closeBag: () => void;
  toggleBag: () => void;
  addItem: (productId: string, variantId?: string, quantity?: number) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isBagOpen, setIsBagOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const queryClient = useQueryClient();

  useEffect(() => {
    let sid = localStorage.getItem('nayab_guest_session_id');
    if (!sid) {
      sid = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem('nayab_guest_session_id', sid);
    }
    setSessionId(sid);
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ['cart', user?.id || sessionId],
    queryFn: async () => {
      const res = await cartApi.getCart(user ? undefined : sessionId);
      return res.cart;
    },
    enabled: !!sessionId || !!user,
  });

  const cart = data ?? null;

  const addMutation = useMutation({
    mutationFn: (variables: { productId: string; variantId?: string; quantity?: number }) => {
      return cartApi.addItem({
        ...variables,
        sessionId: user ? undefined : sessionId,
      });
    },
    onSuccess: (res) => {
      queryClient.setQueryData(['cart', user?.id || sessionId], res.cart);
      setIsBagOpen(true);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (variables: { itemId: string; quantity: number }) => {
      return cartApi.updateItem(variables.itemId, variables.quantity, user ? undefined : sessionId);
    },
    onSuccess: (res) => {
      queryClient.setQueryData(['cart', user?.id || sessionId], res.cart);
    },
  });

  const removeMutation = useMutation({
    mutationFn: (itemId: string) => {
      return cartApi.removeItem(itemId, user ? undefined : sessionId);
    },
    onSuccess: (res) => {
      queryClient.setQueryData(['cart', user?.id || sessionId], res.cart);
    },
  });

  const openBag = () => setIsBagOpen(true);
  const closeBag = () => setIsBagOpen(false);
  const toggleBag = () => setIsBagOpen((prev) => !prev);

  const addItem = async (productId: string, variantId?: string, quantity = 1) => {
    await addMutation.mutateAsync({ productId, variantId, quantity });
  };

  const updateItem = async (itemId: string, quantity: number) => {
    await updateMutation.mutateAsync({ itemId, quantity });
  };

  const removeItem = async (itemId: string) => {
    await removeMutation.mutateAsync(itemId);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        isBagOpen,
        openBag,
        closeBag,
        toggleBag,
        addItem,
        updateItem,
        removeItem,
        itemCount: cart?.totalQuantity ?? 0,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
