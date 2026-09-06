'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from './AuthContext';
import { useToast } from '@/components/ui/Toast';
import { trackAddToCart } from '@/lib/analytics';
import {
  useGetActiveOrderQuery,
  useAddItemToOrderMutation,
  useAdjustOrderLineMutation,
  useRemoveOrderLineMutation,
  useRemoveAllOrderLinesMutation,
  useApplyCouponCodeMutation,
  useRemoveCouponCodeMutation,
  type OrderFieldsFragment,
} from '@oscar/graphql-shop/generated';

interface CartItem {
  id: string;
  productVariantId: string;
  productName: string;
  variantName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  linePrice: number;
  imageUrl?: string;
  productSlug?: string;
}

interface Discount {
  adjustmentSource: string;
  amount: number;
  amountWithTax: number;
  description: string;
  type: string;
}

interface Cart {
  id: string;
  code: string;
  state: string;
  items: CartItem[];
  totalQuantity: number;
  subTotal: number;
  shipping: number;
  total: number;
  currencyCode: string;
  couponCodes: string[];
  discounts: Discount[];
}

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  addToCart: (productVariantId: string, quantity: number) => Promise<void>;
  updateQuantity: (orderLineId: string, quantity: number) => Promise<void>;
  removeItem: (orderLineId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  applyCoupon: (couponCode: string) => Promise<boolean>;
  removeCoupon: (couponCode: string) => Promise<void>;
  itemCount: number;
  refetchCart: () => Promise<void>;
  /** Mini-cart drawer open state (Header controls this). */
  isMiniCartOpen: boolean;
  openMiniCart: () => void;
  closeMiniCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function mapOrderToCart(order: OrderFieldsFragment): Cart {
  return {
    id: order.id,
    code: order.code,
    state: order.state,
    items: order.lines.map((line) => ({
      id: line.id,
      productVariantId: line.productVariant.id,
      productName: line.productVariant.product.name,
      variantName: line.productVariant.name,
      sku: line.productVariant.sku,
      quantity: line.quantity,
      unitPrice: line.unitPriceWithTax / 100,
      linePrice: line.linePriceWithTax / 100,
      imageUrl:
        line.featuredAsset?.preview ?? line.productVariant.product.featuredAsset?.preview ?? undefined,
      productSlug: line.productVariant.product.slug,
    })),
    totalQuantity: order.totalQuantity,
    subTotal: order.subTotalWithTax / 100,
    shipping: order.shippingWithTax / 100,
    total: order.totalWithTax / 100,
    currencyCode: order.currencyCode,
    couponCodes: order.couponCodes ?? [],
    discounts: (order.discounts ?? []).map((d) => ({
      adjustmentSource: d.adjustmentSource,
      amount: d.amount / 100,
      amountWithTax: d.amountWithTax / 100,
      description: d.description,
      type: d.type,
    })),
  };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  useAuth();
  const tErrors = useTranslations('Cart.errors');
  const tToasts = useTranslations('Cart.toasts');
  const toast = useToast();
  const [cart, setCart] = useState<Cart | null>(null);
  const [isMiniCartOpen, setMiniCartOpen] = useState(false);

  const { data, loading, refetch } = useGetActiveOrderQuery({ fetchPolicy: 'cache-and-network' });

  const [addItemMutation] = useAddItemToOrderMutation();
  const [adjustLineMutation] = useAdjustOrderLineMutation();
  const [removeLineMutation] = useRemoveOrderLineMutation();
  const [removeAllLinesMutation] = useRemoveAllOrderLinesMutation();
  const [applyCouponMutation] = useApplyCouponCodeMutation();
  const [removeCouponMutation] = useRemoveCouponCodeMutation();

  useEffect(() => {
    setCart(data?.activeOrder ? mapOrderToCart(data.activeOrder) : null);
  }, [data]);

  const refetchCart = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const addToCart = async (productVariantId: string, quantity: number) => {
    try {
      const { data: result } = await addItemMutation({ variables: { productVariantId, quantity } });
      const response = result?.addItemToOrder;
      if (!response) return;
      if ('errorCode' in response) {
        if (response.errorCode === 'INSUFFICIENT_STOCK_ERROR') {
          toast.error(tErrors('insufficientStock', { available: (response as { quantityAvailable?: number }).quantityAvailable ?? 0 }));
        } else {
          toast.error((response as { message?: string }).message ?? tErrors('addFailed'));
        }
        return;
      }
      if ('id' in response) {
        const nextCart = mapOrderToCart(response as OrderFieldsFragment);
        setCart(nextCart);
        const line = nextCart.items.find((item) => item.productVariantId === productVariantId);
        if (line) {
          trackAddToCart({
            sku: line.sku,
            name: line.productName,
            quantity,
            value: line.unitPrice * quantity,
          });
        }
        toast.success(tToasts('added'));
        // Auto-open the mini-cart so the user sees the new item — feels
        // more like adding to a real cart than a toast that vanishes.
        setMiniCartOpen(true);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : tErrors('addFailed'));
    }
  };

  const updateQuantity = async (orderLineId: string, quantity: number) => {
    if (quantity < 1) return removeItem(orderLineId);
    try {
      const { data: result } = await adjustLineMutation({ variables: { orderLineId, quantity } });
      const response = result?.adjustOrderLine;
      if (!response) return;
      if ('errorCode' in response) {
        toast.error((response as { message?: string }).message ?? tErrors('updateFailed'));
        return;
      }
      if ('id' in response) setCart(mapOrderToCart(response as OrderFieldsFragment));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : tErrors('updateFailed'));
    }
  };

  const removeItem = async (orderLineId: string) => {
    try {
      const { data: result } = await removeLineMutation({ variables: { orderLineId } });
      const response = result?.removeOrderLine;
      if (!response) return;
      if ('errorCode' in response) {
        toast.error((response as { message?: string }).message ?? tErrors('removeFailed'));
        return;
      }
      if ('id' in response) setCart(mapOrderToCart(response as OrderFieldsFragment));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : tErrors('removeFailed'));
    }
  };

  const clearCart = async () => {
    try {
      const { data: result } = await removeAllLinesMutation();
      const response = result?.removeAllOrderLines;
      if (!response) return;
      if ('errorCode' in response) {
        toast.error((response as { message?: string }).message ?? tErrors('clearFailed'));
        return;
      }
      if ('id' in response) setCart(mapOrderToCart(response as OrderFieldsFragment));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : tErrors('clearFailed'));
    }
  };

  const applyCoupon = async (couponCode: string): Promise<boolean> => {
    try {
      const { data: result } = await applyCouponMutation({ variables: { couponCode } });
      const response = result?.applyCouponCode;
      if (!response) return false;
      if ('errorCode' in response) {
        const messages: Record<string, string> = {
          COUPON_CODE_INVALID_ERROR: tErrors('couponInvalid'),
          COUPON_CODE_EXPIRED_ERROR: tErrors('couponExpired'),
          COUPON_CODE_LIMIT_ERROR: tErrors('couponLimit'),
        };
        toast.error(messages[response.errorCode] ?? (response as { message?: string }).message ?? tErrors('couponInvalid'));
        return false;
      }
      if ('id' in response) {
        setCart(mapOrderToCart(response as OrderFieldsFragment));
        toast.success(tToasts('couponApplied'));
        return true;
      }
      return false;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : tErrors('couponFailed'));
      return false;
    }
  };

  const removeCoupon = async (couponCode: string) => {
    try {
      const { data: result } = await removeCouponMutation({ variables: { couponCode } });
      if (result?.removeCouponCode) {
        setCart(mapOrderToCart(result.removeCouponCode as OrderFieldsFragment));
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : tErrors('couponRemoveFailed'));
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        applyCoupon,
        removeCoupon,
        itemCount: cart?.totalQuantity ?? 0,
        refetchCart,
        isMiniCartOpen,
        openMiniCart: () => setMiniCartOpen(true),
        closeMiniCart: () => setMiniCartOpen(false),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
