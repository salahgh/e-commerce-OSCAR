'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Plus, Minus } from 'lucide-react';
import { Button, Badge } from '@/components/ui';
import { formatPrice } from '@/lib/utils/formatters';
import { useCart } from '@/contexts/CartContext';
import { cn } from '@/lib/utils';

interface CartItemProps {
  item: {
    id: string;
    product: {
      id: string;
      slug: string;
      name: {
        ar: string;
        fr: string;
        en: string;
      };
      basePrice: number;
      salePrice?: number;
      images: Array<{
        url: string;
        alt?: string;
        isPrimary: boolean;
      }>;
    };
    variant?: {
      id: string;
      size?: string;
      color?: string;
      price: number;
    };
    quantity: number;
    price: number;
    total: number;
  };
  locale?: 'ar' | 'fr' | 'en';
  editable?: boolean;
}

export default function CartItem({ item, locale = 'fr', editable = true }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [isRemoving, setIsRemoving] = React.useState(false);

  const primaryImage = item.product.images.find((img) => img.isPrimary) || item.product.images[0];
  const productName = item.product.name[locale];

  const hasDiscount = item.product.salePrice && item.product.salePrice < item.product.basePrice;
  const discountPercent = hasDiscount
    ? Math.round(((item.product.basePrice - item.product.salePrice!) / item.product.basePrice) * 100)
    : 0;

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

  return (
    <div
      className={cn(
        'flex gap-4 p-4 bg-white rounded-lg border transition-all',
        isRemoving && 'opacity-50 pointer-events-none'
      )}
    >
      {/* Product Image */}
      <Link
        href={`/products/${item.product.slug}`}
        className="relative flex-shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-md overflow-hidden bg-gray-100 hover:opacity-75 transition-opacity"
      >
        {primaryImage && (
          <Image
            src={primaryImage.url}
            alt={primaryImage.alt || productName}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 96px, 112px"
          />
        )}
        {hasDiscount && (
          <Badge variant="error" className="absolute top-2 right-2 text-xs">
            -{discountPercent}%
          </Badge>
        )}
      </Link>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <Link
              href={`/products/${item.product.slug}`}
              className="font-medium text-gray-900 hover:text-primary transition-colors line-clamp-2"
            >
              {productName}
            </Link>
            {item.variant && (
              <div className="flex flex-wrap gap-2 mt-1 text-sm text-gray-600">
                {item.variant.size && <span>Taille: {item.variant.size}</span>}
                {item.variant.color && <span>Couleur: {item.variant.color}</span>}
              </div>
            )}
          </div>

          {/* Remove Button */}
          {editable && (
            <button
              onClick={handleRemove}
              disabled={isRemoving}
              className="flex-shrink-0 p-1 text-gray-400 hover:text-error transition-colors disabled:opacity-50"
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
                className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-300 hover:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Diminuer la quantité"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center font-medium text-gray-900">{item.quantity}</span>
              <button
                onClick={() => handleUpdateQuantity(item.quantity + 1)}
                disabled={isUpdating}
                className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-300 hover:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Augmenter la quantité"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="text-sm text-gray-600">Quantité: {item.quantity}</div>
          )}

          {/* Price */}
          <div className="text-right">
            <div className="font-bold text-primary">{formatPrice(item.total)}</div>
            {hasDiscount && (
              <div className="text-sm text-gray-500 line-through">
                {formatPrice(item.product.basePrice * item.quantity)}
              </div>
            )}
            {item.quantity > 1 && (
              <div className="text-xs text-gray-500">{formatPrice(item.price)} / unité</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
