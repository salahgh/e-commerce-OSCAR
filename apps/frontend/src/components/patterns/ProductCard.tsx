'use client';

import * as React from 'react';
import Image from 'next/image';
import { Heart, Star } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { formatPrice } from '@oscar/shared';
import { useWishlist } from '@/contexts/WishlistContext';
import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils/cn';

export interface ProductCardData {
  slug: string;
  name: string;
  imageUrl: string | null;
  price: number;
  originalPrice?: number | null;
  currencyCode: string;
  rating?: number | null;
  reviewCount?: number;
  discountPercent?: number | null;
  isFavorited?: boolean;
}

interface ProductCardProps {
  product: ProductCardData;
  /** When true, suppress the wishlist heart (e.g. inside the wishlist page itself). */
  hideWishlist?: boolean;
  className?: string;
}

export function ProductCard({ product, hideWishlist, className }: ProductCardProps) {
  const t = useTranslations('ProductCard');
  const wishlist = useWishlist();
  const { slug, name, imageUrl, price, originalPrice, currencyCode, rating, reviewCount, discountPercent } = product;
  const isFavorited = wishlist.has(slug);
  const onSale = originalPrice != null && originalPrice > price;

  return (
    <article
      className={cn(
        'group relative flex flex-col items-start gap-3 rounded-[12px] border border-hairline bg-bg-elevated p-3 text-start',
        className,
      )}
    >
      <div className="relative w-full">
        <Link href={`/products/${slug}`} className="block aspect-square w-full overflow-hidden rounded-[6px] bg-bg-muted">
          {imageUrl && (
            <Image
              src={imageUrl}
              alt={name}
              fill
              sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
              className="object-cover transition-transform duration-slow group-hover:scale-105"
            />
          )}
        </Link>

        {discountPercent != null && discountPercent > 0 && (
          <span className="pointer-events-none absolute end-3 top-3 rounded-md border-[1.5px] border-state-danger-border bg-state-danger-bg px-2.5 py-1 text-14 font-bold text-state-danger-content">
            -{discountPercent}%
          </span>
        )}

        {!hideWishlist && (
          <button
            type="button"
            aria-label={isFavorited ? t('favoriteRemove') : t('favoriteAdd')}
            aria-pressed={isFavorited}
            onClick={() => wishlist.toggle({ slug, name, imageUrl, price, currencyCode })}
            className={cn(
              'absolute bottom-3 start-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-bg-elevated text-content-strong shadow-card transition-colors hover:bg-bg-subtle',
              isFavorited && 'text-state-danger-border',
            )}
          >
            <Heart className={cn('h-[18px] w-[18px]', isFavorited && 'fill-current')} strokeWidth={1.5} />
          </button>
        )}
      </div>

      <Link
        href={`/products/${slug}`}
        className="line-clamp-2 w-full text-18 font-medium text-content-strong hover:underline"
      >
        {name}
      </Link>

      <div className="flex items-center gap-1.5">
        <span className="font-dm text-12 font-medium text-content-strong">({reviewCount ?? 0})</span>
        <div className="flex items-center">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                'h-[17px] w-[17px]',
                i < Math.round(rating ?? 0) ? 'fill-rating text-rating' : 'fill-bg-muted text-bg-muted',
              )}
            />
          ))}
        </div>
      </div>

      <div className="flex items-baseline gap-2" dir="ltr">
        {onSale && (
          <span className="font-dm text-14 font-medium text-content-muted line-through">
            {formatPrice(originalPrice!, currencyCode)}
          </span>
        )}
        <span className="font-dm text-[22px] font-extrabold text-content-strong">
          {formatPrice(price, currencyCode)}
        </span>
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <article className="flex flex-col gap-3 rounded-[12px] border border-hairline bg-bg-elevated p-3">
      <div className="aspect-square w-full animate-pulse rounded-[6px] bg-bg-muted" />
      <div className="h-5 w-3/4 animate-pulse rounded bg-bg-muted" />
      <div className="h-4 w-1/2 animate-pulse rounded bg-bg-muted" />
      <div className="h-6 w-1/3 animate-pulse rounded bg-bg-muted" />
    </article>
  );
}
