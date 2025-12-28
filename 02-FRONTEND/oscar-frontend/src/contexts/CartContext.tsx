'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';
import {
  useGetActiveOrderQuery,
  useAddItemToOrderMutation,
  useAdjustOrderLineMutation,
  useRemoveOrderLineMutation,
  useRemoveAllOrderLinesMutation,
  useApplyCouponCodeMutation,
  useRemoveCouponCodeMutation,
  OrderFieldsFragment,
} from '@/graphql/generated/graphql';

// Simplified cart item type based on Vendure Order
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

// Map Vendure Order to our Cart type
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
      unitPrice: line.unitPriceWithTax / 100, // Convert from cents
      linePrice: line.linePriceWithTax / 100,
      imageUrl: line.featuredAsset?.preview || line.productVariant.product.featuredAsset?.preview,
      productSlug: line.productVariant.product.slug,
    })),
    totalQuantity: order.totalQuantity,
    subTotal: order.subTotalWithTax / 100,
    shipping: order.shippingWithTax / 100,
    total: order.totalWithTax / 100,
    currencyCode: order.currencyCode,
    couponCodes: order.couponCodes || [],
    discounts: (order.discounts || []).map((d) => ({
      adjustmentSource: d.adjustmentSource,
      amount: d.amount / 100,
      amountWithTax: d.amountWithTax / 100,
      description: d.description,
      type: d.type,
    })),
  };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);

  // GraphQL query for active order
  const { data, loading, refetch } = useGetActiveOrderQuery({
    fetchPolicy: 'cache-and-network',
  });

  // GraphQL mutations
  const [addItemMutation] = useAddItemToOrderMutation();
  const [adjustLineMutation] = useAdjustOrderLineMutation();
  const [removeLineMutation] = useRemoveOrderLineMutation();
  const [removeAllLinesMutation] = useRemoveAllOrderLinesMutation();
  const [applyCouponMutation] = useApplyCouponCodeMutation();
  const [removeCouponMutation] = useRemoveCouponCodeMutation();

  // Update cart when data changes
  useEffect(() => {
    if (data?.activeOrder) {
      setCart(mapOrderToCart(data.activeOrder));
    } else {
      setCart(null);
    }
  }, [data]);

  const refetchCart = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const addToCart = async (productVariantId: string, quantity: number) => {
    try {
      const { data: result } = await addItemMutation({
        variables: { productVariantId, quantity },
      });

      if (result?.addItemToOrder) {
        const response = result.addItemToOrder;

        // Check for errors
        if ('errorCode' in response) {
          if (response.errorCode === 'INSUFFICIENT_STOCK_ERROR') {
            toast.error(`Stock insuffisant. Disponible: ${(response as any).quantityAvailable}`);
          } else {
            toast.error((response as any).message || 'Erreur lors de l\'ajout au panier');
          }
          return;
        }

        // Success - update cart
        if ('id' in response) {
          setCart(mapOrderToCart(response as OrderFieldsFragment));
          toast.success('Produit ajouté au panier');
        }
      }
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      toast.error(error.message || 'Erreur lors de l\'ajout au panier');
    }
  };

  const updateQuantity = async (orderLineId: string, quantity: number) => {
    try {
      if (quantity < 1) {
        await removeItem(orderLineId);
        return;
      }

      const { data: result } = await adjustLineMutation({
        variables: { orderLineId, quantity },
      });

      if (result?.adjustOrderLine) {
        const response = result.adjustOrderLine;

        if ('errorCode' in response) {
          toast.error((response as any).message || 'Erreur lors de la mise à jour');
          return;
        }

        if ('id' in response) {
          setCart(mapOrderToCart(response as OrderFieldsFragment));
          toast.success('Quantité mise à jour');
        }
      }
    } catch (error: any) {
      console.error('Error updating quantity:', error);
      toast.error(error.message || 'Erreur lors de la mise à jour');
    }
  };

  const removeItem = async (orderLineId: string) => {
    try {
      const { data: result } = await removeLineMutation({
        variables: { orderLineId },
      });

      if (result?.removeOrderLine) {
        const response = result.removeOrderLine;

        if ('errorCode' in response) {
          toast.error((response as any).message || 'Erreur lors de la suppression');
          return;
        }

        if ('id' in response) {
          setCart(mapOrderToCart(response as OrderFieldsFragment));
          toast.success('Produit retiré du panier');
        }
      }
    } catch (error: any) {
      console.error('Error removing item:', error);
      toast.error(error.message || 'Erreur lors de la suppression');
    }
  };

  const clearCart = async () => {
    try {
      const { data: result } = await removeAllLinesMutation();

      if (result?.removeAllOrderLines) {
        const response = result.removeAllOrderLines;

        if ('errorCode' in response) {
          toast.error((response as any).message || 'Erreur lors du vidage du panier');
          return;
        }

        if ('id' in response) {
          setCart(mapOrderToCart(response as OrderFieldsFragment));
          toast.success('Panier vidé');
        }
      }
    } catch (error: any) {
      console.error('Error clearing cart:', error);
      toast.error(error.message || 'Erreur lors du vidage du panier');
    }
  };

  const applyCoupon = async (couponCode: string): Promise<boolean> => {
    try {
      const { data: result } = await applyCouponMutation({
        variables: { couponCode },
      });

      if (result?.applyCouponCode) {
        const response = result.applyCouponCode;

        if ('errorCode' in response) {
          // Handle specific error types
          if (response.errorCode === 'COUPON_CODE_INVALID_ERROR') {
            toast.error('Code promo invalide');
          } else if (response.errorCode === 'COUPON_CODE_EXPIRED_ERROR') {
            toast.error('Ce code promo a expiré');
          } else if (response.errorCode === 'COUPON_CODE_LIMIT_ERROR') {
            toast.error('Ce code promo a atteint sa limite d\'utilisation');
          } else {
            toast.error((response as any).message || 'Code promo invalide');
          }
          return false;
        }

        if ('id' in response) {
          setCart(mapOrderToCart(response as OrderFieldsFragment));
          toast.success('Code promo appliqué avec succès!');
          return true;
        }
      }
      return false;
    } catch (error: any) {
      console.error('Error applying coupon:', error);
      toast.error(error.message || 'Erreur lors de l\'application du code promo');
      return false;
    }
  };

  const removeCoupon = async (couponCode: string) => {
    try {
      const { data: result } = await removeCouponMutation({
        variables: { couponCode },
      });

      if (result?.removeCouponCode) {
        setCart(mapOrderToCart(result.removeCouponCode as OrderFieldsFragment));
        toast.success('Code promo retiré');
      }
    } catch (error: any) {
      console.error('Error removing coupon:', error);
      toast.error(error.message || 'Erreur lors de la suppression du code promo');
    }
  };

  const itemCount = cart?.totalQuantity || 0;

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
        itemCount,
        refetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
