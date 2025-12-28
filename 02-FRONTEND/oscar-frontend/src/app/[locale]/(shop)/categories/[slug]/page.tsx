'use client';

import { useParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { useGetCollectionWithProductsQuery } from '@/graphql/generated/graphql';
import { CategoryBreadcrumb, CategoryCard } from '@/components/category';
import { Button, Skeleton } from '@/components/ui';
import { Folder, ChevronLeft, Package, Grid3X3, List, ShoppingCart, Heart } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const PRODUCTS_PER_PAGE = 12;

// Helper function to format price from cents to currency
function formatPrice(priceInCents: number, currencyCode: string = 'MAD'): string {
  const price = priceInCents / 100;
  return new Intl.NumberFormat('fr-MA', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
}

// Simple product card for category page
function ProductItem({
  product,
  locale,
}: {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string;
    featuredAsset?: { preview: string } | null;
    variants: Array<{
      id: string;
      priceWithTax: number;
      currencyCode: string;
    }>;
  };
  locale: string;
}) {
  const minPrice = Math.min(...product.variants.map((v) => v.priceWithTax));
  const currencyCode = product.variants[0]?.currencyCode || 'MAD';

  return (
    <Link
      href={`/${locale}/products/${product.slug}`}
      className="group block bg-card rounded-lg border overflow-hidden hover:shadow-lg transition-shadow"
    >
      {/* Product Image */}
      <div className="aspect-square relative overflow-hidden bg-muted">
        {product.featuredAsset?.preview ? (
          <Image
            src={product.featuredAsset.preview}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="h-12 w-12 text-muted-foreground" />
          </div>
        )}

        {/* Quick Action Buttons */}
        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            className="p-2 bg-background rounded-full shadow-md hover:bg-muted"
            aria-label="Ajouter aux favoris"
            onClick={(e) => {
              e.preventDefault();
              // TODO: Add to wishlist
            }}
          >
            <Heart className="h-4 w-4 text-foreground" />
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors mb-2">
          {product.name}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {product.description?.replace(/<[^>]*>/g, '').slice(0, 100)}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-primary">
            {formatPrice(minPrice, currencyCode)}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.preventDefault();
              // TODO: Add to cart
            }}
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Link>
  );
}

export default function CategoryDetailPage() {
  const params = useParams();
  const locale = useLocale();
  const slug = params.slug as string;
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);

  const { data, loading, error, fetchMore } = useGetCollectionWithProductsQuery({
    variables: {
      slug,
      take: PRODUCTS_PER_PAGE,
      skip: 0,
    },
  });

  const collection = data?.collection;
  const productVariants = collection?.productVariants?.items || [];
  const totalProducts = collection?.productVariants?.totalItems || 0;
  const hasChildren = collection?.children && collection.children.length > 0;
  const breadcrumbs = collection?.breadcrumbs || [];

  // Deduplicate products (since we get variants, we might have duplicate products)
  const seenProductIds = new Set<string>();
  const uniqueProducts = productVariants
    .map((variant) => variant.product)
    .filter((product) => {
      if (seenProductIds.has(product.id)) return false;
      seenProductIds.add(product.id);
      return true;
    });

  const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);

  const handleLoadMore = () => {
    const newPage = page + 1;
    fetchMore({
      variables: {
        skip: (newPage - 1) * PRODUCTS_PER_PAGE,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult?.collection?.productVariants) return prev;
        return {
          ...prev,
          collection: {
            ...prev.collection!,
            productVariants: {
              ...prev.collection!.productVariants,
              items: [
                ...prev.collection!.productVariants.items,
                ...fetchMoreResult.collection.productVariants.items,
              ],
            },
          },
        };
      },
    });
    setPage(newPage);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb Skeleton */}
        <Skeleton className="h-6 w-64 mb-6" />

        {/* Header Skeleton */}
        <div className="mb-8">
          <Skeleton className="h-10 w-48 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-lg border bg-card overflow-hidden">
              <Skeleton className="aspect-square" />
              <div className="p-4">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-3" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-destructive/10 text-destructive rounded-lg p-6 text-center">
          <p>Erreur lors du chargement de la catégorie</p>
          <p className="text-sm mt-2">{error.message}</p>
          <Link href={`/${locale}/categories`} className="mt-4 inline-block">
            <Button variant="outline">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Retour aux catégories
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <Folder className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Catégorie introuvable</h2>
          <p className="text-muted-foreground mb-4">
            La catégorie que vous recherchez n'existe pas.
          </p>
          <Link href={`/${locale}/categories`}>
            <Button variant="outline">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Retour aux catégories
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <CategoryBreadcrumb breadcrumbs={breadcrumbs} locale={locale} className="mb-6" />

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start gap-6">
          {collection.featuredAsset?.preview && (
            <div className="hidden md:block w-32 h-32 rounded-lg overflow-hidden bg-muted flex-shrink-0">
              <Image
                src={collection.featuredAsset.preview}
                alt={collection.name}
                width={128}
                height={128}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{collection.name}</h1>
            {collection.description && (
              <p className="text-muted-foreground">{collection.description}</p>
            )}
            <p className="text-sm text-muted-foreground mt-2">
              {totalProducts} produit{totalProducts !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Subcategories */}
      {hasChildren && (
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Sous-catégories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {collection.children!.map((child) => (
              <CategoryCard
                key={child.id}
                id={child.id}
                name={child.name}
                slug={child.slug}
                description={child.description || undefined}
                imageUrl={child.featuredAsset?.preview}
                locale={locale}
                variant="compact"
              />
            ))}
          </div>
        </div>
      )}

      {/* Products Section */}
      <div>
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b">
          <h2 className="text-xl font-semibold">Produits</h2>
          <div className="flex items-center gap-4">
            {/* View Mode Toggle */}
            <div className="flex items-center border rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'p-2 transition-colors',
                  viewMode === 'grid'
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                )}
                aria-label="Vue grille"
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'p-2 transition-colors',
                  viewMode === 'list'
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                )}
                aria-label="Vue liste"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid/List */}
        {uniqueProducts.length === 0 ? (
          <div className="text-center py-16 bg-muted/30 rounded-lg">
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun produit</h3>
            <p className="text-muted-foreground">
              {hasChildren
                ? 'Explorez les sous-catégories pour trouver des produits.'
                : "Cette catégorie ne contient pas encore de produits."}
            </p>
          </div>
        ) : (
          <>
            <div
              className={cn(
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                  : 'space-y-4'
              )}
            >
              {uniqueProducts.map((product) => (
                <ProductItem key={product.id} product={product} locale={locale} />
              ))}
            </div>

            {/* Load More */}
            {page < totalPages && (
              <div className="mt-8 text-center">
                <Button variant="outline" onClick={handleLoadMore}>
                  Voir plus de produits
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Back Link */}
      {collection.parent && collection.parent.slug !== '__root_collection__' && (
        <div className="mt-12 pt-6 border-t">
          <Link
            href={`/${locale}/categories/${collection.parent.slug}`}
            className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Retour à {collection.parent.name}
          </Link>
        </div>
      )}
    </div>
  );
}
