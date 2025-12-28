'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { X, ShoppingBag, ArrowRight, Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui';
import { formatPrice } from '@/lib/utils/formatters';
import { useCart } from '@/contexts/CartContext';
import { cn } from '@/lib/utils';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as string) || 'fr';
  const { cart, updateQuantity, removeItem, loading } = useCart();

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const cartItems = cart?.items || [];
  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart?.subTotal || 0;

  const handleCheckout = () => {
    onClose();
    router.push(`/${locale}/checkout`);
  };

  const handleViewCart = () => {
    onClose();
    router.push(`/${locale}/cart`);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-50 bg-black/50 transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={cn(
          'fixed top-0 right-0 z-50 h-full w-full max-w-md bg-background shadow-xl',
          'transform transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Panier"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              <h2 className="text-lg font-semibold">
                Panier ({cartItemCount})
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-accent rounded-full transition-colors"
              aria-label="Fermer le panier"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <ShoppingBag className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium mb-2">Votre panier est vide</h3>
                <p className="text-muted-foreground mb-6">
                  Ajoutez des articles pour commencer vos achats
                </p>
                <Button onClick={onClose} asChild>
                  <Link href={`/${locale}/products`}>
                    Continuer les achats
                  </Link>
                </Button>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {cartItems.map((item) => (
                  <CartDrawerItem
                    key={item.id}
                    item={item}
                    locale={locale}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeItem}
                    disabled={loading}
                  />
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          {cartItems.length > 0 && (
            <div className="border-t border-border p-4 space-y-4">
              {/* Subtotal */}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Sous-total</span>
                <span className="text-lg font-bold">{formatPrice(subtotal)}</span>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Livraison et taxes calculees a la caisse
              </p>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" onClick={handleViewCart}>
                  Voir le panier
                </Button>
                <Button onClick={handleCheckout} rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Commander
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// Cart Drawer Item Component
interface CartDrawerItemProps {
  item: {
    id: string;
    productVariantId: string;
    productName: string;
    variantName: string;
    quantity: number;
    unitPrice: number;
    linePrice: number;
    imageUrl?: string;
    productSlug?: string;
  };
  locale: string;
  onUpdateQuantity: (lineId: string, quantity: number) => Promise<void>;
  onRemove: (lineId: string) => Promise<void>;
  disabled?: boolean;
}

function CartDrawerItem({
  item,
  locale,
  onUpdateQuantity,
  onRemove,
  disabled,
}: CartDrawerItemProps) {
  const [isUpdating, setIsUpdating] = React.useState(false);

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1 || isUpdating || disabled) return;
    setIsUpdating(true);
    try {
      await onUpdateQuantity(item.id, newQuantity);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    if (isUpdating || disabled) return;
    setIsUpdating(true);
    try {
      await onRemove(item.id);
    } finally {
      setIsUpdating(false);
    }
  };

  const productLink = item.productSlug ? `/${locale}/products/${item.productSlug}` : '#';

  return (
    <li
      className={cn(
        'flex gap-3 p-4 transition-opacity',
        isUpdating && 'opacity-50'
      )}
    >
      {/* Image */}
      <Link
        href={productLink}
        className="relative flex-shrink-0 w-20 h-20 rounded-md overflow-hidden bg-muted"
      >
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.productName}
            fill
            className="object-cover"
            sizes="80px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag className="h-8 w-8 text-muted-foreground/50" />
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <Link
          href={productLink}
          className="font-medium text-sm line-clamp-2 hover:text-primary transition-colors"
        >
          {item.productName}
        </Link>
        {item.variantName && (
          <p className="text-xs text-muted-foreground mt-0.5">{item.variantName}</p>
        )}

        <div className="flex items-center justify-between mt-2">
          {/* Quantity Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleQuantityChange(item.quantity - 1)}
              disabled={isUpdating || disabled || item.quantity <= 1}
              className="w-7 h-7 flex items-center justify-center rounded border border-border hover:border-primary transition-colors disabled:opacity-50"
              aria-label="Diminuer"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
            <button
              onClick={() => handleQuantityChange(item.quantity + 1)}
              disabled={isUpdating || disabled}
              className="w-7 h-7 flex items-center justify-center rounded border border-border hover:border-primary transition-colors disabled:opacity-50"
              aria-label="Augmenter"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>

          {/* Price */}
          <span className="font-semibold text-sm">{formatPrice(item.linePrice)}</span>
        </div>
      </div>

      {/* Remove Button */}
      <button
        onClick={handleRemove}
        disabled={isUpdating || disabled}
        className="p-1 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
        aria-label="Retirer"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </li>
  );
}
