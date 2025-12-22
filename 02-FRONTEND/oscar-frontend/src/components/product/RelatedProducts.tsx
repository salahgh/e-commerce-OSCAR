'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLocale } from 'next-intl';
import { useQuery, gql } from '@apollo/client';
import { Package, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button, Skeleton } from '@/components/ui';
import { useCart } from '@/contexts/CartContext';
import { cn } from '@/lib/utils';

const GET_RELATED_PRODUCTS = gql`
  query GetRelatedProducts($productId: ID!, $take: Int) {
    product(id: $productId) {
      id
      collections {
        id
        products(options: { take: $take }) {
          items {
            id
            name
            slug
            featuredAsset {
              preview
            }
            variants {
              id
              priceWithTax
              currencyCode
              stockLevel
            }
          }
        }
      }
    }
  }
`;

interface RelatedProductsProps {
  productId: string;
  currentProductSlug: string;
  title?: string;
  className?: string;
}

export function RelatedProducts({
  productId,
  currentProductSlug,
  title = 'Produits similaires',
  className,
}: RelatedProductsProps) {
  const locale = useLocale();
  const { addToCart } = useCart();
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const { data, loading } = useQuery(GET_RELATED_PRODUCTS, {
    variables: { productId, take: 12 },
    skip: !productId,
  });

  // Extract related products from collections
  const relatedProducts = React.useMemo(() => {
    if (!data?.product?.collections) return [];

    const products = new Map();
    data.product.collections.forEach((collection: any) => {
      collection.products?.items?.forEach((product: any) => {
        if (product.slug !== currentProductSlug && !products.has(product.id)) {
          products.set(product.id, product);
        }
      });
    });

    return Array.from(products.values()).slice(0, 8);
  }, [data, currentProductSlug]);

  const formatPrice = (priceInCents: number, currency: string = 'DZD') => {
    return new Intl.NumberFormat('fr-DZ', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(priceInCents / 100);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (loading) {
    return (
      <div className={cn('space-y-6', className)}>
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="w-64 flex-shrink-0">
              <Skeleton className="aspect-square rounded-lg mb-3" />
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-6 w-1/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (relatedProducts.length === 0) return null;

  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{title}</h2>
        <div className="flex gap-2">
          <button
            onClick={() => scroll('left')}
            className="p-2 rounded-full border border-border hover:bg-muted transition-colors"
            aria-label="Defiler vers la gauche"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-2 rounded-full border border-border hover:bg-muted transition-colors"
            aria-label="Defiler vers la droite"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {relatedProducts.map((product: any) => {
          const minPrice = Math.min(...product.variants.map((v: any) => v.priceWithTax));
          const currency = product.variants[0]?.currencyCode || 'DZD';
          const inStock = product.variants.some((v: any) => v.stockLevel !== 'OUT_OF_STOCK');

          return (
            <Link
              key={product.id}
              href={`/${locale}/products/${product.slug}`}
              className="group w-64 flex-shrink-0 bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all"
            >
              <div className="aspect-square relative bg-muted">
                {product.featuredAsset?.preview ? (
                  <Image
                    src={product.featuredAsset.preview}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="256px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-12 w-12 text-muted-foreground/50" />
                  </div>
                )}

                {!inStock && (
                  <div className="absolute top-2 left-2 bg-foreground text-background text-xs font-medium px-2 py-1 rounded">
                    Rupture
                  </div>
                )}
              </div>

              <div className="p-4">
                <h3 className="font-medium line-clamp-2 group-hover:text-primary transition-colors mb-2">
                  {product.name}
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-primary">
                    {formatPrice(minPrice, currency)}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={!inStock}
                    onClick={(e) => {
                      e.preventDefault();
                      if (product.variants[0]) {
                        addToCart(product.variants[0].id, 1);
                      }
                    }}
                  >
                    <ShoppingCart className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
