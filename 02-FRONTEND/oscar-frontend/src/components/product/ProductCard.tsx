import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button, Badge } from '@/components/ui';
import { Heart, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/utils/formatters';

interface ProductCardProps {
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
    status: string;
    stockQuantity: number;
    badge?: string;
  };
  locale?: 'ar' | 'fr' | 'en';
  onAddToCart?: (productId: string) => void;
  onAddToWishlist?: (productId: string) => void;
}

export default function ProductCard({
  product,
  locale = 'fr',
  onAddToCart,
  onAddToWishlist,
}: ProductCardProps) {
  const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0];
  const hasDiscount = product.salePrice && product.salePrice < product.basePrice;
  const discountPercent = hasDiscount
    ? Math.round(((product.basePrice - product.salePrice!) / product.basePrice) * 100)
    : 0;

  return (
    <div className="group relative bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Badges */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-2">
        {hasDiscount && (
          <Badge variant="error" size="sm">
            -{discountPercent}%
          </Badge>
        )}
        {product.badge && (
          <Badge variant="primary" size="sm">
            {product.badge}
          </Badge>
        )}
        {product.stockQuantity === 0 && (
          <Badge variant="secondary" size="sm">
            Rupture de stock
          </Badge>
        )}
      </div>

      {/* Wishlist Button */}
      <button
        onClick={() => onAddToWishlist?.(product.id)}
        className="absolute top-2 right-2 z-10 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100"
        aria-label="Ajouter aux favoris"
      >
        <Heart className="h-5 w-5 text-gray-600" />
      </button>

      {/* Product Image */}
      <Link href={`/products/${product.slug}`} className="block aspect-square relative overflow-hidden">
        {primaryImage ? (
          <Image
            src={primaryImage.url}
            alt={primaryImage.alt || product.name[locale]}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">No Image</span>
          </div>
        )}
      </Link>

      {/* Product Info */}
      <div className="p-4">
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-medium text-gray-900 line-clamp-2 hover:text-primary transition-colors mb-2">
            {product.name[locale]}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          {hasDiscount ? (
            <>
              <span className="text-lg font-bold text-primary">
                {formatPrice(product.salePrice!)}
              </span>
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(product.basePrice)}
              </span>
            </>
          ) : (
            <span className="text-lg font-bold text-primary">
              {formatPrice(product.basePrice)}
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <Button
          variant="primary"
          size="sm"
          className="w-full"
          disabled={product.stockQuantity === 0}
          onClick={() => onAddToCart?.(product.id)}
          leftIcon={<ShoppingCart className="h-4 w-4" />}
        >
          {product.stockQuantity === 0 ? 'Indisponible' : 'Ajouter au panier'}
        </Button>
      </div>
    </div>
  );
}
