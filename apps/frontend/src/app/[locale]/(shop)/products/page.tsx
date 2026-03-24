'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery, gql } from '@apollo/client';
import {
  Package,
  Heart,
  ShoppingCart,
  Grid3X3,
  LayoutGrid,
  Search,
  Loader2,
} from 'lucide-react';

import { Button, Skeleton } from '@/components/ui';
import { useCart } from '@/contexts/CartContext';
import { cn } from '@/lib/utils';

const PRODUCTS_PER_PAGE = 12;

// Direct products query (not using search index)
const GET_PRODUCTS = gql`
  query GetProducts($options: ProductListOptions) {
    products(options: $options) {
      items {
        id
        name
        slug
        description
        featuredAsset {
          id
          preview
        }
        variants {
          id
          priceWithTax
          currencyCode
          stockLevel
        }
      }
      totalItems
    }
  }
`;

// Helper to format price
function formatPrice(priceInCents: number, currencyCode: string = 'DZD'): string {
  const price = priceInCents / 100;
  return new Intl.NumberFormat('fr-DZ', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

// Product card component
function ProductCard({
  product,
  locale,
  viewMode,
}: {
  product: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    featuredAsset?: { id: string; preview: string } | null;
    variants: Array<{
      id: string;
      priceWithTax: number;
      currencyCode: string;
      stockLevel: string;
    }>;
  };
  locale: string;
  viewMode: 'grid' | 'compact';
}) {
  const { addToCart } = useCart();
  const minPrice = Math.min(...product.variants.map((v) => v.priceWithTax));
  const maxPrice = Math.max(...product.variants.map((v) => v.priceWithTax));
  const currencyCode = product.variants[0]?.currencyCode || 'DZD';
  const inStock = product.variants.some((v) => v.stockLevel !== 'OUT_OF_STOCK');

  const priceDisplay = minPrice === maxPrice
    ? formatPrice(minPrice, currencyCode)
    : `${formatPrice(minPrice, currencyCode)} - ${formatPrice(maxPrice, currencyCode)}`;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (product.variants[0]) {
      try {
        await addToCart(product.variants[0].id, 1);
      } catch (err) {
        console.error('Failed to add to cart:', err);
      }
    }
  };

  if (viewMode === 'compact') {
    return (
      <Link
        href={`/${locale}/products/${product.slug}`}
        className="group flex gap-4 p-4 bg-card rounded-xl border border-border hover:shadow-lg hover:border-primary/30 transition-all"
      >
        {/* Image */}
        <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
          {product.featuredAsset?.preview ? (
            <Image
              src={product.featuredAsset.preview}
              alt={product.name}
              fill
              className="object-contain group-hover:scale-105 transition-transform duration-300"
              sizes="96px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          {product.description && (
            <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
              {product.description.replace(/<[^>]*>/g, '').slice(0, 100)}
            </p>
          )}
          <div className="flex items-center justify-between mt-2">
            <span className="text-lg font-bold text-foreground">{priceDisplay}</span>
            <div className="flex items-center gap-2">
              {!inStock && (
                <span className="text-xs text-destructive bg-destructive/10 px-2 py-0.5 rounded">
                  Rupture
                </span>
              )}
              <Button
                size="sm"
                variant={inStock ? 'default' : 'outline'}
                disabled={!inStock}
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/${locale}/products/${product.slug}`}
      className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all duration-300"
    >
      {/* Product Image */}
      <div className="aspect-square relative overflow-hidden bg-muted">
        {product.featuredAsset?.preview ? (
          <Image
            src={product.featuredAsset.preview}
            alt={product.name}
            fill
            className="object-contain group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="h-12 w-12 text-muted-foreground/50" />
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Quick Actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            className="p-2.5 bg-background rounded-full shadow-lg hover:bg-muted"
            aria-label="Ajouter aux favoris"
            onClick={(e) => e.preventDefault()}
          >
            <Heart className="h-4 w-4 text-foreground" />
          </button>
        </div>

        {/* Stock Badge */}
        {!inStock && (
          <div className="absolute top-3 left-3 bg-foreground text-background text-xs font-medium px-3 py-1 rounded-full shadow-md">
            Rupture de stock
          </div>
        )}

        {/* Quick Add Button */}
        <button
          className="absolute bottom-3 left-3 right-3 py-2.5 bg-background/95 backdrop-blur-sm
                     text-foreground font-medium rounded-lg shadow-lg
                     opacity-0 group-hover:opacity-100 transition-all
                     flex items-center justify-center gap-2
                     hover:bg-foreground hover:text-background disabled:opacity-50"
          disabled={!inStock}
          onClick={handleAddToCart}
        >
          <ShoppingCart className="h-4 w-4" />
          Ajouter au panier
        </button>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors min-h-[2.5rem]">
          {product.name}
        </h3>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-xl font-bold text-foreground">{priceDisplay}</span>
        </div>
      </div>
    </Link>
  );
}

// Loading skeleton
function ProductGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border bg-card overflow-hidden">
          <Skeleton className="aspect-square" />
          <div className="p-4">
            <Skeleton className="h-5 w-3/4 mb-2" />
            <Skeleton className="h-6 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ProductsPage() {
  const locale = useLocale();
  const [viewMode, setViewMode] = useState<'grid' | 'compact'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);

  const { data, loading, error, fetchMore } = useQuery(GET_PRODUCTS, {
    variables: {
      options: {
        take: PRODUCTS_PER_PAGE,
        skip: 0,
      },
    },
    notifyOnNetworkStatusChange: true,
  });

  const products = data?.products?.items || [];
  const totalItems = data?.products?.totalItems || 0;

  // Update hasMore when data changes
  useEffect(() => {
    if (data?.products) {
      setHasMore(products.length < totalItems);
    }
  }, [data, products.length, totalItems]);

  // Filter products by search term (client-side)
  const filteredProducts = searchTerm
    ? products.filter((p: any) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : products;

  // Load more products
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore || loading) return;

    setIsLoadingMore(true);
    try {
      await fetchMore({
        variables: {
          options: {
            skip: products.length,
            take: PRODUCTS_PER_PAGE,
          },
        },
      });
      // Apollo cache merge will handle combining the results
      // Check if we've loaded all products
      setHasMore(products.length + PRODUCTS_PER_PAGE < totalItems);
    } catch (err) {
      console.error('Error loading more products:', err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [products.length, fetchMore, hasMore, isLoadingMore, loading, totalItems]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore && !loading) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, loading, loadMore]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Tous les Produits
          </h1>
          <p className="text-muted-foreground">
            {loading ? (
              <span className="animate-pulse">Chargement...</span>
            ) : (
              `${totalItems} produit${totalItems !== 1 ? 's' : ''} disponible${totalItems !== 1 ? 's' : ''}`
            )}
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher des produits..."
              className="w-full pl-12 pr-4 py-3 border border-border rounded-xl
                         focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                         bg-card text-foreground placeholder-muted-foreground"
            />
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-end mb-6 gap-4">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-muted rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-2 rounded-lg transition-all',
                viewMode === 'grid'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              aria-label="Vue grille"
            >
              <Grid3X3 className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('compact')}
              className={cn(
                'p-2 rounded-lg transition-all',
                viewMode === 'compact'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              aria-label="Vue compacte"
            >
              <LayoutGrid className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <ProductGridSkeleton count={12} />
        ) : error ? (
          <div className="bg-card rounded-xl border border-border p-12 text-center">
            <div className="text-destructive mb-4">
              <Package className="h-16 w-16 mx-auto opacity-50" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Erreur lors du chargement
            </h3>
            <p className="text-muted-foreground mb-4">{error.message}</p>
            <Button onClick={() => window.location.reload()}>Reessayer</Button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-12 text-center">
            <Package className="h-20 w-20 mx-auto text-muted-foreground/50 mb-6" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Aucun produit trouve
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm
                ? `Aucun produit ne correspond a "${searchTerm}"`
                : 'Aucun produit disponible.'}
            </p>
            {searchTerm && (
              <Button variant="outline" onClick={() => setSearchTerm('')}>
                Effacer la recherche
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Products Grid */}
            <div
              className={cn(
                viewMode === 'grid'
                  ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6'
                  : 'space-y-4'
              )}
            >
              {filteredProducts.map((product: any) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  locale={locale}
                  viewMode={viewMode}
                />
              ))}
            </div>

            {/* Infinite Scroll Loader */}
            {!searchTerm && (
              <div ref={loaderRef} className="mt-8 flex justify-center py-4">
                {isLoadingMore && (
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Chargement...</span>
                  </div>
                )}
                {!hasMore && products.length > 0 && (
                  <p className="text-muted-foreground text-sm">
                    Vous avez vu tous les {totalItems} produits
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
