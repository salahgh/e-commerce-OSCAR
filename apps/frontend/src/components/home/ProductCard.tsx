'use client';

import { useState } from 'react';
import { Link } from '@/i18n/routing';
import { Heart, Star, ImageOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface HomeProduct {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
  price: string;
  originalPrice?: string | null;
  discountPercent?: number | null;
  inStock: boolean;
  rating: number;
  reviewCount: number;
}

interface ProductCardProps {
  product: HomeProduct;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const [imgError, setImgError] = useState(false);
  const showImage = product.imageUrl && !imgError;

  return (
    <Link
      href={`/products/${product.slug}`}
      className={cn(
        'group flex flex-col bg-card border border-border rounded-xl p-3 hover:shadow-lg transition-shadow',
        className
      )}
    >
      {/* Image */}
      <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl!}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <ImageOff className="w-8 h-8" />
          </div>
        )}

        {/* Discount Badge */}
        {product.discountPercent && (
          <div className="absolute top-2 start-2 bg-[#FFE5E5] border border-[#EB3E3E] rounded-md px-2 py-1">
            <span className="text-[#B22F2F] font-medium text-sm">
              -{product.discountPercent}%
            </span>
          </div>
        )}

        {/* Wishlist Heart */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className="absolute top-2 end-2 w-9 h-9 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
        >
          <Heart className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      {/* Product Info */}
      <div className="mt-3 flex flex-col gap-1.5">
        {/* Name */}
        <p className="text-[15px] font-medium text-foreground line-clamp-2 leading-snug">
          {product.name}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-1">
          <div className="flex items-center">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  'w-3.5 h-3.5',
                  i < Math.floor(product.rating)
                    ? 'fill-[#F2C94C] text-[#F2C94C]'
                    : 'fill-muted text-muted'
                )}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-lg font-extrabold text-foreground">
            {product.price}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {product.originalPrice}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
