import React, { createContext, useCallback, useEffect, useState } from 'react';
import {
  useGetActiveOrderQuery,
  useAddItemToOrderMutation,
  useAdjustOrderLineMutation,
  useRemoveOrderLineMutation,
  useRemoveAllOrderLinesMutation,
  Order,
  OrderLine,
} from '../graphql/generated/graphql';
import { formatPrice } from '../utils/vendureAdapters';

interface CartItem {
  id: string;
  productVariantId: string;
  productId: string;
  productName: string;
  variantName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  linePrice: number;
  imageUrl: string | null;
}

interface CartContextValue {
  order: Order | null;
  items: CartItem[];
  itemCount: number;
  subTotal: number;
  shipping: number;
  total: number;
  loading: boolean;
  error: any;
  addToCart: (productVariantId: string, quantity: number) => Promise<void>;
  updateQuantity: (orderLineId: string, quantity: number) => Promise<void>;
  removeFromCart: (orderLineId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refetchCart: () => void;
  /** Mini-cart bottom-sheet open state, controlled from the Header/CartButton or auto-opened on add-to-cart. */
  isMiniCartOpen: boolean;
  openMiniCart: () => void;
  closeMiniCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    data: orderData,
    loading: orderLoading,
    error: orderError,
    refetch: refetchCart,
  } = useGetActiveOrderQuery({
    fetchPolicy: 'cache-and-network',
  });

  const [addItemMutation, { loading: addLoading }] = useAddItemToOrderMutation();
  const [adjustLineMutation, { loading: adjustLoading }] = useAdjustOrderLineMutation();
  const [removeLineMutation, { loading: removeLoading }] = useRemoveOrderLineMutation();
  const [removeAllLinesMutation, { loading: clearLoading }] = useRemoveAllOrderLinesMutation();

  const [isMiniCartOpen, setMiniCartOpen] = useState(false);

  const addToCart = useCallback(
    async (productVariantId: string, quantity: number) => {
      try {
        const { data } = await addItemMutation({
          variables: { productVariantId, quantity },
          refetchQueries: ['GetActiveOrder'],
        });

        if (data?.addItemToOrder) {
          const result = data.addItemToOrder;
          if ('errorCode' in result) {
            const errorResult = result as { errorCode: string; message: string };
            throw new Error(errorResult.message || 'Failed to add item to cart');
          }
          // Auto-open the mini-cart sheet so the user sees the new line
          // without leaving the PDP. Closed by the user or by navigating away.
          setMiniCartOpen(true);
        }
      } catch (error) {
        console.error('Add to cart error:', error);
        throw error;
      }
    },
    [addItemMutation]
  );

  const updateQuantity = useCallback(
    async (orderLineId: string, quantity: number) => {
      try {
        const { data } = await adjustLineMutation({
          variables: { orderLineId, quantity },
          refetchQueries: ['GetActiveOrder'],
        });

        if (data?.adjustOrderLine) {
          const result = data.adjustOrderLine;
          if ('errorCode' in result) {
            const errorResult = result as { errorCode: string; message: string };
            throw new Error(errorResult.message || 'Failed to update cart item');
          }
        }
      } catch (error) {
        console.error('Update cart item error:', error);
        throw error;
      }
    },
    [adjustLineMutation]
  );

  const removeFromCart = useCallback(
    async (orderLineId: string) => {
      try {
        const { data } = await removeLineMutation({
          variables: { orderLineId },
          refetchQueries: ['GetActiveOrder'],
        });

        if (data?.removeOrderLine) {
          const result = data.removeOrderLine;
          if ('errorCode' in result) {
            const errorResult = result as { errorCode: string; message: string };
            throw new Error(errorResult.message || 'Failed to remove item from cart');
          }
        }
      } catch (error) {
        console.error('Remove from cart error:', error);
        throw error;
      }
    },
    [removeLineMutation]
  );

  const clearCart = useCallback(async () => {
    try {
      const { data } = await removeAllLinesMutation({
        refetchQueries: ['GetActiveOrder'],
      });

      if (data?.removeAllOrderLines) {
        const result = data.removeAllOrderLines;
        if ('errorCode' in result) {
          const errorResult = result as { errorCode: string; message: string };
          throw new Error(errorResult.message || 'Failed to clear cart');
        }
      }
    } catch (error) {
      console.error('Clear cart error:', error);
      throw error;
    }
  }, [removeAllLinesMutation]);

  const order = orderData?.activeOrder || null;

  const items: CartItem[] = (order?.lines || []).map((line: any) => ({
    id: line.id,
    productVariantId: line.productVariant?.id || '',
    productId: line.productVariant?.product?.id || '',
    productName: line.productVariant?.product?.name || '',
    variantName: line.productVariant?.name || '',
    sku: line.productVariant?.sku || '',
    quantity: line.quantity,
    unitPrice: formatPrice(line.unitPriceWithTax),
    linePrice: formatPrice(line.linePriceWithTax),
    imageUrl: line.featuredAsset?.preview || line.productVariant?.product?.featuredAsset?.preview || null,
  }));

  const itemCount = order?.totalQuantity || 0;
  const subTotal = order ? formatPrice(order.subTotalWithTax) : 0;
  const shipping = order ? formatPrice(order.shippingWithTax) : 0;
  const total = order ? formatPrice(order.totalWithTax) : 0;
  const loading = orderLoading || addLoading || adjustLoading || removeLoading || clearLoading;

  const value: CartContextValue = {
    order: order as Order | null,
    items,
    itemCount,
    subTotal,
    shipping,
    total,
    loading,
    error: orderError,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refetchCart,
    isMiniCartOpen,
    openMiniCart: () => setMiniCartOpen(true),
    closeMiniCart: () => setMiniCartOpen(false),
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
