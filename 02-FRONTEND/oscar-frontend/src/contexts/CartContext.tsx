'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';
import type { Cart } from '@/types';
import {
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveFromCartMutation,
  useClearCartMutation,
  useGetCartQuery,
} from '@/graphql/generated/graphql';
import { apolloClient } from '@/lib/apollo/apollo-client';
import { mapCart } from '@/lib/utils/mappers';

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  addToCart: (
    productId: string,
    quantity: number,
    options?: { selectedSize?: string; selectedColor?: string }
  ) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => Promise<void>;
  itemCount: number;
  isInCart: (productId: string, variantId?: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);

  // GraphQL mutations
  const [addToCartMutation] = useAddToCartMutation();
  const [updateCartItemMutation] = useUpdateCartItemMutation();
  const [removeFromCartMutation] = useRemoveFromCartMutation();
  const [clearCartMutation] = useClearCartMutation();

  // Load cart from localStorage for guests or fetch from server for authenticated users
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      loadGuestCart();
    }
  }, [isAuthenticated]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const { data } = await apolloClient.query({
        query: useGetCartQuery.query,
        fetchPolicy: 'network-only',
      });

      if (data?.myCart) {
        const mappedCart = mapCart(data.myCart);
        setCart(mappedCart);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching cart:', error);
      setLoading(false);
    }
  };

  const loadGuestCart = () => {
    try {
      const storedCart = localStorage.getItem('guestCart');
      if (storedCart) {
        setCart(JSON.parse(storedCart));
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading guest cart:', error);
      setLoading(false);
    }
  };

  const saveGuestCart = (updatedCart: Cart) => {
    localStorage.setItem('guestCart', JSON.stringify(updatedCart));
  };

  const addToCart = async (
    productId: string,
    quantity: number,
    options?: { selectedSize?: string; selectedColor?: string }
  ) => {
    try {
      if (isAuthenticated) {
        const { data } = await addToCartMutation({
          variables: {
            input: {
              productId: Number(productId),
              quantity,
              selectedSize: options?.selectedSize,
              selectedColor: options?.selectedColor,
            },
          },
        });

        if (data?.addToCart) {
          const mappedCart = mapCart(data.addToCart);
          setCart(mappedCart);
          toast.success('Produit ajouté au panier');
        }
      } else {
        // Handle guest cart
        const currentCart = cart || {
          id: 'guest',
          items: [],
          subtotal: 0,
          discount: 0,
          shippingCost: 0,
          total: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Check if item already exists
        const existingItemIndex = currentCart.items.findIndex(
          (item) =>
            item.product.id === productId &&
            item.variant?.size === options?.selectedSize &&
            item.variant?.color === options?.selectedColor
        );

        if (existingItemIndex >= 0) {
          // Update quantity
          currentCart.items[existingItemIndex].quantity += quantity;
          currentCart.items[existingItemIndex].total =
            currentCart.items[existingItemIndex].price *
            currentCart.items[existingItemIndex].quantity;
        } else {
          // Add new item (simplified - in real app, fetch product details)
          currentCart.items.push({
            id: Date.now().toString(),
            productId,
            product: {
              id: productId,
              slug: productId,
              name: { ar: '', fr: 'Produit', en: '' },
              basePrice: 0,
              images: [],
            },
            quantity,
            price: 0,
            total: 0,
            variant: options?.selectedSize || options?.selectedColor
              ? {
                  id: `${productId}-variant`,
                  size: options?.selectedSize,
                  color: options?.selectedColor,
                  price: 0,
                }
              : undefined,
          });
        }

        // Recalculate totals
        currentCart.subtotal = currentCart.items.reduce((sum, item) => sum + item.total, 0);
        currentCart.total = currentCart.subtotal + currentCart.shippingCost - currentCart.discount;
        currentCart.updatedAt = new Date().toISOString();

        setCart(currentCart);
        saveGuestCart(currentCart);
        toast.success('Produit ajouté au panier');
      }
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      toast.error(error.message || "Erreur lors de l'ajout au panier");
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      if (quantity < 1) {
        await removeItem(itemId);
        return;
      }

      if (isAuthenticated) {
        const { data } = await updateCartItemMutation({
          variables: {
            itemId: Number(itemId),
            input: {
              quantity,
            },
          },
        });

        if (data?.updateCartItem) {
          const mappedCart = mapCart(data.updateCartItem);
          setCart(mappedCart);
          toast.success('Quantité mise à jour');
        }
      } else {
        if (cart) {
          const updatedCart = {
            ...cart,
            items: cart.items.map((item) => {
              if (item.id === itemId) {
                const updatedItem = { ...item, quantity };
                updatedItem.total = updatedItem.price * quantity;
                return updatedItem;
              }
              return item;
            }),
          };
          // Recalculate totals
          updatedCart.subtotal = updatedCart.items.reduce((sum, item) => sum + item.total, 0);
          updatedCart.total =
            updatedCart.subtotal + updatedCart.shippingCost - updatedCart.discount;
          updatedCart.updatedAt = new Date().toISOString();

          setCart(updatedCart);
          saveGuestCart(updatedCart);
          toast.success('Quantité mise à jour');
        }
      }
    } catch (error: any) {
      console.error('Error updating quantity:', error);
      toast.error(error.message || 'Erreur lors de la mise à jour');
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      if (isAuthenticated) {
        const { data } = await removeFromCartMutation({
          variables: {
            itemId: Number(itemId),
          },
        });

        if (data?.removeFromCart) {
          const mappedCart = mapCart(data.removeFromCart);
          setCart(mappedCart);
          toast.success('Produit retiré du panier');
        }
      } else {
        if (cart) {
          const updatedCart = {
            ...cart,
            items: cart.items.filter((item) => item.id !== itemId),
          };
          // Recalculate totals
          updatedCart.subtotal = updatedCart.items.reduce((sum, item) => sum + item.total, 0);
          updatedCart.total =
            updatedCart.subtotal + updatedCart.shippingCost - updatedCart.discount;
          updatedCart.updatedAt = new Date().toISOString();

          setCart(updatedCart);
          saveGuestCart(updatedCart);
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
      if (isAuthenticated) {
        await clearCartMutation();
      }
      setCart(null);
      localStorage.removeItem('guestCart');
      toast.success('Panier vidé');
    } catch (error: any) {
      console.error('Error clearing cart:', error);
      toast.error(error.message || 'Erreur lors du vidage du panier');
    }
  };

  const applyCoupon = async (code: string) => {
    try {
      // TODO: Implement with GraphQL mutation
      toast.success('Code promo appliqué');
    } catch (error) {
      console.error('Error applying coupon:', error);
      toast.error('Code promo invalide');
    }
  };

  const removeCoupon = async () => {
    try {
      // TODO: Implement with GraphQL mutation
      toast.success('Code promo retiré');
    } catch (error) {
      console.error('Error removing coupon:', error);
    }
  };

  const itemCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const isInCart = (productId: string, variantId?: string) => {
    if (!cart) return false;
    return cart.items.some(
      (item) =>
        item.product.id === productId && (!variantId || item.variant?.id === variantId)
    );
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
        itemCount,
        isInCart,
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
