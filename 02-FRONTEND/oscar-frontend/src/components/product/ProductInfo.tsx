'use client';

import React, { useState } from 'react';
import { Button, Badge } from '@/components/ui';
import { ShoppingCart, Heart, Share2, Star, Truck, ShieldCheck } from 'lucide-react';
import { formatPrice } from '@/lib/utils/formatters';
import { useCart } from '@/contexts/CartContext';
import { cn } from '@/lib/utils';

interface ProductInfoProps {
  product: {
    id: string;
    name: {
      ar: string;
      fr: string;
      en: string;
    };
    description: {
      ar: string;
      fr: string;
      en: string;
    };
    basePrice: number;
    salePrice?: number;
    status: string;
    stockQuantity: number;
    sku: string;
    variants?: Array<{
      id: string;
      size?: string;
      color?: string;
      price: number;
      stockQuantity: number;
    }>;
    category?: {
      name: {
        ar: string;
        fr: string;
        en: string;
      };
    };
  };
  locale?: 'ar' | 'fr' | 'en';
}

export default function ProductInfo({ product, locale = 'fr' }: ProductInfoProps) {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const hasDiscount = product.salePrice && product.salePrice < product.basePrice;
  const discountPercent = hasDiscount
    ? Math.round(((product.basePrice - product.salePrice!) / product.basePrice) * 100)
    : 0;

  const price = product.salePrice || product.basePrice;

  // Extract unique sizes and colors from variants
  const sizes = Array.from(new Set(product.variants?.map((v) => v.size).filter(Boolean)));
  const colors = Array.from(new Set(product.variants?.map((v) => v.color).filter(Boolean)));

  const handleAddToCart = () => {
    const selectedVariant = product.variants?.find(
      (v) => v.size === selectedSize && v.color === selectedColor
    );
    // Use variant ID if available, otherwise product ID
    const variantId = selectedVariant?.id || product.id;
    addToCart(variantId, quantity);
  };

  const canAddToCart =
    product.stockQuantity > 0 &&
    (!sizes.length || selectedSize) &&
    (!colors.length || selectedColor);

  return (
    <div className="space-y-6">
      {/* Category */}
      {product.category && (
        <p className="text-sm text-muted-foreground">{product.category.name[locale]}</p>
      )}

      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">{product.name[locale]}</h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn('h-5 w-5', i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/50')}
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">(24 avis)</span>
        </div>
      </div>

      {/* Price */}
      <div className="flex items-center gap-3">
        {hasDiscount ? (
          <>
            <span className="text-3xl font-bold text-primary">
              {formatPrice(product.salePrice!)}
            </span>
            <span className="text-xl text-muted-foreground line-through">
              {formatPrice(product.basePrice)}
            </span>
            <Badge variant="error">-{discountPercent}%</Badge>
          </>
        ) : (
          <span className="text-3xl font-bold text-primary">{formatPrice(product.basePrice)}</span>
        )}
      </div>

      {/* Stock Status */}
      <div>
        {product.stockQuantity > 0 ? (
          <div className="flex items-center gap-2 text-green-600">
            <div className="h-2 w-2 bg-green-600 rounded-full" />
            <span className="text-sm font-medium">
              En stock ({product.stockQuantity} disponibles)
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-red-600">
            <div className="h-2 w-2 bg-red-600 rounded-full" />
            <span className="text-sm font-medium">Rupture de stock</span>
          </div>
        )}
      </div>

      {/* Description */}
      <div className="prose prose-sm">
        <p className="text-muted-foreground leading-relaxed">{product.description[locale]}</p>
      </div>

      {/* Size Selection */}
      {sizes.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Taille {selectedSize && `(${selectedSize})`}
          </label>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size!)}
                className={cn(
                  'px-4 py-2 rounded-md border transition-colors font-medium',
                  selectedSize === size
                    ? 'border-primary bg-primary text-white'
                    : 'border-input hover:border-primary'
                )}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Color Selection */}
      {colors.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Couleur {selectedColor && `(${selectedColor})`}
          </label>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color!)}
                className={cn(
                  'px-4 py-2 rounded-md border transition-colors',
                  selectedColor === color
                    ? 'border-primary bg-primary text-white'
                    : 'border-input hover:border-primary'
                )}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quantity */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Quantité</label>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-10 h-10 rounded-md border border-input hover:border-primary transition-colors"
          >
            -
          </button>
          <span className="w-12 text-center font-medium">{quantity}</span>
          <button
            onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
            className="w-10 h-10 rounded-md border border-input hover:border-primary transition-colors"
          >
            +
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          size="lg"
          className="flex-1"
          disabled={!canAddToCart}
          onClick={handleAddToCart}
          leftIcon={<ShoppingCart className="h-5 w-5" />}
        >
          {canAddToCart ? 'Ajouter au panier' : 'Sélectionner les options'}
        </Button>
        <Button variant="outline" size="lg" leftIcon={<Heart className="h-5 w-5" />}>
          Favoris
        </Button>
        <Button variant="outline" size="lg" leftIcon={<Share2 className="h-5 w-5" />}>
          Partager
        </Button>
      </div>

      {/* Features */}
      <div className="border-t pt-6 space-y-3">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Truck className="h-5 w-5" />
          <span>Livraison gratuite pour les commandes de plus de 5000 DA</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <ShieldCheck className="h-5 w-5" />
          <span>Garantie de remboursement sous 14 jours</span>
        </div>
      </div>

      {/* Product Details */}
      <div className="border-t pt-6 text-sm text-muted-foreground">
        <p>SKU: {product.sku}</p>
      </div>
    </div>
  );
}
