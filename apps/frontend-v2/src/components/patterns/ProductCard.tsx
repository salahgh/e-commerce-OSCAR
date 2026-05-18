'use client';

import * as React from 'react';
import Image from 'next/image';
import { Heart, Star } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { Badge, PriceDisplay } from '@/components/ui';
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
  onToggleFavorite?: (slug: string) => void;
  className?: string;
}

export function ProductCard({ product, onToggleFavorite, className }: ProductCardProps) {
  const { slug, name, imageUrl, price, originalPrice, currencyCode, rating, reviewCount, discountPercent, isFavorited } = product;
  return (
    <article
      className={cn(
        'group relative flex flex-col gap-3 rounded border border-border bg-bg-elevated p-3 shadow-card transition-shadow duration-fast hover:shadow-elevated',
        className,
      )}
    >
      <Link href={`/products/${slug}`} className="relative aspect-square overflow-hidden rounded bg-bg-muted">
        {discountPercent && discountPercent > 0 && (
          <Badge intent="danger" className="absolute start-2 top-2 z-10">
            -{discountPercent}%
          </Badge>
        )}
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform duration-slow group-hover:scale-105"
          />
        )}
      </Link>

      {onToggleFavorite && (
        <button
          type="button"
          aria-label={isFavorited ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          aria-pressed={isFavorited}
          onClick={() => onToggleFavorite(slug)}
          className={cn(
            'absolute end-5 top-5 inline-flex h-9 w-9 items-center justify-center rounded-full bg-bg-elevated/90 text-content-strong shadow-sm transition-colors hover:bg-bg-elevated',
            isFavorited && 'text-state-danger-border',
          )}
        >
          <Heart className={cn('h-5 w-5', isFavorited && 'fill-current')} />
        </button>
      )}

      <div className="flex flex-col gap-2">
        <Link href={`/products/${slug}`} className="text-14 text-content-strong hover:underline">
          {name}
        </Link>
        {rating != null && (
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  'h-3 w-3',
                  i < Math.round(rating) ? 'fill-state-warning-border text-state-warning-border' : 'text-content-subtle',
                )}
              />
            ))}
            {reviewCount != null && (
              <span className="ms-1 text-12 text-content-muted">({reviewCount})</span>
            )}
          </div>
        )}
        <PriceDisplay
          amount={price}
          originalAmount={originalPrice ?? undefined}
          currencyCode={currencyCode}
          size="md"
        />
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <article className="flex flex-col gap-3 rounded border border-border bg-bg-elevated p-3 shadow-card">
      <div className="aspect-square w-full animate-pulse rounded bg-bg-muted" />
      <div className="h-4 w-3/4 animate-pulse rounded bg-bg-muted" />
      <div className="h-3 w-1/2 animate-pulse rounded bg-bg-muted" />
      <div className="h-5 w-1/3 animate-pulse rounded bg-bg-muted" />
    </article>
  );
}
