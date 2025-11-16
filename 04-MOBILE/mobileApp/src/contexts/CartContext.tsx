import React, { createContext, useCallback, useEffect } from 'react';
import {
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveFromCartMutation,
  useClearCartMutation,
  CartResponse,
  CartItemResponse,
  AddToCartRequestInput,
  UpdateCartItemRequestInput,
} from '../graphql/generated/graphql';
import { useAuth } from './AuthContext';

interface CartContextValue {
  cart: CartResponse | null;
  items: CartItemResponse[];
  itemCount: number;
  totalAmount: number;
  loading: boolean;
  error: any;
  addToCart: (input: AddToCartRequestInput) => Promise<void>;
  updateCartItem: (itemId: number, input: UpdateCartItemRequestInput) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refetchCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  // Query cart
  const {
    data: cartData,
    loading: cartLoading,
    error: cartError,
    refetch: refetchCart,
  } = useGetCartQuery({
    skip: !isAuthenticated,
    fetchPolicy: 'cache-and-network',
  });

  // Mutations
  const [addToCartMutation, { loading: addLoading }] = useAddToCartMutation();
  const [updateCartItemMutation, { loading: updateLoading }] = useUpdateCartItemMutation();
  const [removeFromCartMutation, { loading: removeLoading }] = useRemoveFromCartMutation();
  const [clearCartMutation, { loading: clearLoading }] = useClearCartMutation();

  // Refetch cart when user logs in
  useEffect(() => {
    if (isAuthenticated) {
      refetchCart();
    }
  }, [isAuthenticated, refetchCart]);

  const addToCart = useCallback(
    async (input: AddToCartRequestInput) => {
      try {
        await addToCartMutation({
          variables: { input },
          refetchQueries: ['GetCart'],
        });
      } catch (error) {
        console.error('Add to cart error:', error);
        throw error;
      }
    },
    [addToCartMutation]
  );

  const updateCartItem = useCallback(
    async (itemId: number, input: UpdateCartItemRequestInput) => {
      try {
        await updateCartItemMutation({
          variables: { itemId, input },
          refetchQueries: ['GetCart'],
        });
      } catch (error) {
        console.error('Update cart item error:', error);
        throw error;
      }
    },
    [updateCartItemMutation]
  );

  const removeFromCart = useCallback(
    async (itemId: number) => {
      try {
        await removeFromCartMutation({
          variables: { itemId },
          refetchQueries: ['GetCart'],
        });
      } catch (error) {
        console.error('Remove from cart error:', error);
        throw error;
      }
    },
    [removeFromCartMutation]
  );

  const clearCart = useCallback(async () => {
    try {
      await clearCartMutation({
        refetchQueries: ['GetCart'],
      });
    } catch (error) {
      console.error('Clear cart error:', error);
      throw error;
    }
  }, [clearCartMutation]);

  const cart = cartData?.myCart || null;
  const items = (cart?.items as CartItemResponse[]) || [];
  const itemCount = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const totalAmount = cart?.totalAmount || 0;
  const loading = cartLoading || addLoading || updateLoading || removeLoading || clearLoading;

  const value: CartContextValue = {
    cart,
    items,
    itemCount,
    totalAmount,
    loading,
    error: cartError,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    refetchCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = React.useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
