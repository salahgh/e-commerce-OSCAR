'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from '@/components/ui/Toast';
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
  const toast = useToast();
  const [cart, setCart] = useState<Cart | null>(null);

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
          toast.error(`Stock insuffisant. Disponible: ${(response as { quantityAvailable?: number }).quantityAvailable ?? 0}`);
        } else {
          toast.error((response as { message?: string }).message ?? 'Erreur ajout panier');
        }
        return;
      }
      if ('id' in response) {
        setCart(mapOrderToCart(response as OrderFieldsFragment));
        toast.success('Produit ajouté au panier');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur ajout panier');
    }
  };

  const updateQuantity = async (orderLineId: string, quantity: number) => {
    if (quantity < 1) return removeItem(orderLineId);
    try {
      const { data: result } = await adjustLineMutation({ variables: { orderLineId, quantity } });
      const response = result?.adjustOrderLine;
      if (!response) return;
      if ('errorCode' in response) {
        toast.error((response as { message?: string }).message ?? 'Erreur mise à jour');
        return;
      }
      if ('id' in response) setCart(mapOrderToCart(response as OrderFieldsFragment));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur mise à jour');
    }
  };

  const removeItem = async (orderLineId: string) => {
    try {
      const { data: result } = await removeLineMutation({ variables: { orderLineId } });
      const response = result?.removeOrderLine;
      if (!response) return;
      if ('errorCode' in response) {
        toast.error((response as { message?: string }).message ?? 'Erreur suppression');
        return;
      }
      if ('id' in response) setCart(mapOrderToCart(response as OrderFieldsFragment));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur suppression');
    }
  };

  const clearCart = async () => {
    try {
      const { data: result } = await removeAllLinesMutation();
      const response = result?.removeAllOrderLines;
      if (!response) return;
      if ('errorCode' in response) {
        toast.error((response as { message?: string }).message ?? 'Erreur vidage panier');
        return;
      }
      if ('id' in response) setCart(mapOrderToCart(response as OrderFieldsFragment));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur vidage panier');
    }
  };

  const applyCoupon = async (couponCode: string): Promise<boolean> => {
    try {
      const { data: result } = await applyCouponMutation({ variables: { couponCode } });
      const response = result?.applyCouponCode;
      if (!response) return false;
      if ('errorCode' in response) {
        const messages: Record<string, string> = {
          COUPON_CODE_INVALID_ERROR: 'Code promo invalide',
          COUPON_CODE_EXPIRED_ERROR: 'Code promo expiré',
          COUPON_CODE_LIMIT_ERROR: "Code promo épuisé",
        };
        toast.error(messages[response.errorCode] ?? (response as { message?: string }).message ?? 'Code promo invalide');
        return false;
      }
      if ('id' in response) {
        setCart(mapOrderToCart(response as OrderFieldsFragment));
        toast.success('Code promo appliqué');
        return true;
      }
      return false;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur code promo');
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
      toast.error(error instanceof Error ? error.message : 'Erreur suppression code');
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
