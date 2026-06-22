import React, { createContext, useCallback, useEffect, useState } from 'react';
import {
  useGetActiveOrderQuery,
  useAddItemToOrderMutation,
  useAdjustOrderLineMutation,
  useRemoveOrderLineMutation,
  useRemoveAllOrderLinesMutation,
  GetActiveOrderDocument,
  Order,
  OrderLine,
  type OrderFieldsFragment,
  type GetActiveOrderQuery,
  type AddItemToOrderMutation,
  type AdjustOrderLineMutation,
  type RemoveOrderLineMutation,
  type RemoveAllOrderLinesMutation,
} from '../graphql/generated/graphql';
import { formatPrice } from '../utils/vendureAdapters';
import {
  applyAddItem,
  applyAdjustLine,
  applyRemoveLine,
  applyClear,
  type OptimisticCartVariant,
} from '../utils/optimisticCart';

interface CartItem {
  id: string;
  productVariantId: string;
  productId: string;
  productName: string;
  variantName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  /** Pre-discount list price, set only when the line carries a real per-item
   * discount (original > charged unit price); null otherwise. */
  originalUnitPrice: number | null;
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
  addToCart: (
    productVariantId: string,
    quantity: number,
    optimistic?: OptimisticCartVariant,
  ) => Promise<void>;
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
    async (productVariantId: string, quantity: number, optimistic?: OptimisticCartVariant) => {
      try {
        const currentOrder = (orderData?.activeOrder ?? null) as OrderFieldsFragment | null;
        const tempId = `temp-${productVariantId}-${Date.now()}`;
        const { data } = await addItemMutation({
          variables: { productVariantId, quantity },
          ...(optimistic
            ? {
                optimisticResponse: {
                  __typename: 'Mutation',
                  addItemToOrder: applyAddItem(currentOrder, optimistic, quantity, tempId),
                } as unknown as AddItemToOrderMutation,
              }
            : {}),
          update: (cache, { data: mutationData }) => {
            const res = mutationData?.addItemToOrder;
            if (res && 'id' in res && !('errorCode' in res)) {
              cache.writeQuery<GetActiveOrderQuery>({
                query: GetActiveOrderDocument,
                data: { activeOrder: res as OrderFieldsFragment },
              });
            }
          },
        });

        if (data?.addItemToOrder) {
          const result = data.addItemToOrder;
          if ('errorCode' in result) {
            const errorResult = result as { errorCode: string; message: string };
            throw new Error(errorResult.message || 'Failed to add item to cart');
          }
          // Auto-open the mini-cart sheet so the user sees the new line.
          setMiniCartOpen(true);
        }
      } catch (error) {
        console.error('Add to cart error:', error);
        throw error;
      }
    },
    [addItemMutation, orderData],
  );

  const updateQuantity = useCallback(
    async (orderLineId: string, quantity: number) => {
      try {
        const currentOrder = (orderData?.activeOrder ?? null) as OrderFieldsFragment | null;
        const { data } = await adjustLineMutation({
          variables: { orderLineId, quantity },
          ...(currentOrder
            ? {
                optimisticResponse: {
                  __typename: 'Mutation',
                  adjustOrderLine: applyAdjustLine(currentOrder, orderLineId, quantity),
                } as unknown as AdjustOrderLineMutation,
              }
            : {}),
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
    [adjustLineMutation, orderData],
  );

  const removeFromCart = useCallback(
    async (orderLineId: string) => {
      try {
        const currentOrder = (orderData?.activeOrder ?? null) as OrderFieldsFragment | null;
        const { data } = await removeLineMutation({
          variables: { orderLineId },
          ...(currentOrder
            ? {
                optimisticResponse: {
                  __typename: 'Mutation',
                  removeOrderLine: applyRemoveLine(currentOrder, orderLineId),
                } as unknown as RemoveOrderLineMutation,
              }
            : {}),
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
    [removeLineMutation, orderData],
  );

  const clearCart = useCallback(async () => {
    try {
      const currentOrder = (orderData?.activeOrder ?? null) as OrderFieldsFragment | null;
      const { data } = await removeAllLinesMutation({
        ...(currentOrder
          ? {
              optimisticResponse: {
                __typename: 'Mutation',
                removeAllOrderLines: applyClear(currentOrder),
              } as unknown as RemoveAllOrderLinesMutation,
            }
          : {}),
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
  }, [removeAllLinesMutation, orderData]);

  const order = orderData?.activeOrder || null;

  const items: CartItem[] = (order?.lines || []).map((line: any) => ({
    id: line.id,
    productVariantId: line.productVariant?.id || '',
    productId: line.productVariant?.product?.id || '',
    productName: line.productVariant?.product?.name || '',
    variantName: line.productVariant?.name || '',
    sku: line.productVariant?.sku || '',
    quantity: line.quantity,
    unitPrice: formatPrice(line.discountedUnitPriceWithTax ?? line.unitPriceWithTax),
    originalUnitPrice:
      line.discountedUnitPriceWithTax != null &&
      line.discountedUnitPriceWithTax < line.unitPriceWithTax
        ? formatPrice(line.unitPriceWithTax)
        : null,
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
