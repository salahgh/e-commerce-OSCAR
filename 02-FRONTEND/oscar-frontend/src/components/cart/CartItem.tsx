'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui';
import { formatPrice } from '@/lib/utils/formatters';
import { useCart } from '@/contexts/CartContext';
import { cn } from '@/lib/utils';

interface CartItemProps {
  item: {
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
  };
  locale?: 'ar' | 'fr' | 'en';
  editable?: boolean;
}

export default function CartItem({ item, locale = 'fr', editable = true }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [isRemoving, setIsRemoving] = React.useState(false);

  const handleUpdateQuantity = async (newQuantity: number) => {
    if (newQuantity < 1 || newQuantity === item.quantity) return;

    setIsUpdating(true);
    try {
      await updateQuantity(item.id, newQuantity);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      await removeItem(item.id);
    } finally {
      setIsRemoving(false);
    }
  };

  const productLink = item.productSlug ? `/products/${item.productSlug}` : '#';

  return (
    <div
      className={cn(
        'flex gap-4 p-4 bg-card rounded-lg border border-border transition-all',
        isRemoving && 'opacity-50 pointer-events-none'
      )}
    >
      {/* Product Image */}
      <Link
        href={productLink}
        className="relative flex-shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-md overflow-hidden bg-muted hover:opacity-75 transition-opacity"
      >
        {item.imageUrl && (
          <Image
            src={item.imageUrl}
            alt={item.productName}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 96px, 112px"
          />
        )}
      </Link>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <Link
              href={productLink}
              className="font-medium text-foreground hover:text-primary transition-colors line-clamp-2"
            >
              {item.productName}
            </Link>
            {item.variantName && (
              <div className="text-sm text-muted-foreground mt-1">{item.variantName}</div>
            )}
          </div>

          {/* Remove Button */}
          {editable && (
            <button
              onClick={handleRemove}
              disabled={isRemoving}
              className="flex-shrink-0 p-1 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
              aria-label="Retirer du panier"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Price and Quantity */}
        <div className="flex items-center justify-between gap-4 mt-3">
          {/* Quantity Controls */}
          {editable ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleUpdateQuantity(item.quantity - 1)}
                disabled={isUpdating || item.quantity <= 1}
                className="w-8 h-8 flex items-center justify-center rounded-md border border-border hover:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Diminuer la quantité"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center font-medium text-foreground">{item.quantity}</span>
              <button
                onClick={() => handleUpdateQuantity(item.quantity + 1)}
                disabled={isUpdating}
                className="w-8 h-8 flex items-center justify-center rounded-md border border-border hover:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Augmenter la quantité"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">Quantité: {item.quantity}</div>
          )}

          {/* Price */}
          <div className="text-right">
            <div className="font-bold text-primary">{formatPrice(item.linePrice)}</div>
            {item.quantity > 1 && (
              <div className="text-xs text-muted-foreground">{formatPrice(item.unitPrice)} / unité</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
