'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLocale } from 'next-intl';
import { Package, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'recently_viewed_products';
const MAX_ITEMS = 10;

export interface RecentlyViewedProduct {
  id: string;
  slug: string;
  name: string;
  imageUrl?: string;
  price: number;
  currency: string;
  viewedAt: number;
}

// Hook to manage recently viewed products
export function useRecentlyViewed() {
  const [products, setProducts] = useState<RecentlyViewedProduct[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setProducts(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse recently viewed products');
      }
    }
  }, []);

  const addProduct = (product: Omit<RecentlyViewedProduct, 'viewedAt'>) => {
    setProducts((prev) => {
      // Remove if already exists
      const filtered = prev.filter((p) => p.id !== product.id);
      // Add to beginning
      const updated = [{ ...product, viewedAt: Date.now() }, ...filtered].slice(0, MAX_ITEMS);
      // Persist
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const clearAll = () => {
    localStorage.removeItem(STORAGE_KEY);
    setProducts([]);
  };

  return { products, addProduct, clearAll };
}

interface RecentlyViewedProps {
  currentProductId?: string;
  title?: string;
  className?: string;
}

export function RecentlyViewed({
  currentProductId,
  title = 'Recemment consultes',
  className,
}: RecentlyViewedProps) {
  const locale = useLocale();
  const { products } = useRecentlyViewed();
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  // Filter out current product
  const displayProducts = products.filter((p) => p.id !== currentProductId);

  const formatPrice = (priceInCents: number, currency: string = 'DZD') => {
    return new Intl.NumberFormat('fr-DZ', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(priceInCents / 100);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (displayProducts.length === 0) return null;

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-xl font-bold">{title}</h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => scroll('left')}
            className="p-1.5 rounded-full border border-border hover:bg-muted transition-colors"
            aria-label="Defiler vers la gauche"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-1.5 rounded-full border border-border hover:bg-muted transition-colors"
            aria-label="Defiler vers la droite"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {displayProducts.map((product) => (
          <Link
            key={product.id}
            href={`/${locale}/products/${product.slug}`}
            className="group flex-shrink-0 w-40 bg-card rounded-lg border border-border overflow-hidden hover:shadow-md hover:border-primary/30 transition-all"
          >
            <div className="aspect-square relative bg-muted">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="160px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="h-8 w-8 text-muted-foreground/50" />
                </div>
              )}
            </div>

            <div className="p-3">
              <h3 className="text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors">
                {product.name}
              </h3>
              <span className="text-sm font-bold text-primary mt-1 block">
                {formatPrice(product.price, product.currency)}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
