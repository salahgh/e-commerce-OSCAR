'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { gql, useQuery } from '@apollo/client';
import {
  useGetRootCollectionsQuery,
  useGetProductsQuery,
} from '@/graphql/generated/graphql';
import { Skeleton } from '@/components/ui';
import { formatPrice } from '@/lib/utils/formatters';
import { parseProductDiscount } from '@/lib/utils/discountParser';
import { ProductCard, type HomeProduct } from '@/components/home';
import { cn } from '@/lib/utils';

function normalizeUrl(url?: string | null) {
  return url?.replace(/\\/g, '/') ?? null;
}

function transformProduct(product: any): HomeProduct {
  const defaultVariant = product.variants?.[0];
  const priceInCents = defaultVariant?.priceWithTax ?? 0;
  const discount = parseProductDiscount(product.collections, priceInCents);
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    imageUrl: normalizeUrl(product.featuredAsset?.preview),
    price: formatPrice(discount.salePrice / 100),
    originalPrice: discount.hasDiscount ? formatPrice(discount.originalPrice / 100) : null,
    discountPercent: discount.hasDiscount ? discount.percentage : null,
    inStock: defaultVariant?.stockLevel !== 'OUT_OF_STOCK',
    rating: 4,
    reviewCount: 2,
  };
}

export default function ProductsPage() {
  const t = useTranslations('products');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);

  // Fetch root collections for category tabs
  const { data: collectionsData } = useGetRootCollectionsQuery();

  // Fetch products (filtered by collection if selected)
  const { data: productsData, loading: productsLoading } = useGetProductsQuery({
    variables: {
      options: {
        take: 50,
        ...(selectedCategory ? { filter: {} } : {}),
      },
    },
  });

  // For collection-based filtering, use a separate query
  const GET_COLLECTION_PRODUCTS = gql`
    query GetCollectionProducts($slug: String!, $take: Int) {
      collection(slug: $slug) {
        id
        productVariants(options: { take: $take }) {
          items {
            id
            product {
              id
              name
              slug
              featuredAsset { id, preview }
              variants { id, priceWithTax, stockLevel }
              collections { id, slug, name }
            }
          }
        }
      }
    }
  `;

  const { data: collectionProductsData, loading: collectionLoading } = useQuery(
    GET_COLLECTION_PRODUCTS,
    {
      variables: { slug: selectedCategory, take: 50 },
      skip: !selectedCategory,
    }
  );

  const categories = useMemo(() => {
    const items = collectionsData?.collections?.items ?? [];
    return items.filter((c: any) => c.slug !== 'banners');
  }, [collectionsData]);

  const products: HomeProduct[] = useMemo(() => {
    if (selectedCategory && collectionProductsData?.collection?.productVariants?.items) {
      const seen = new Set<string>();
      return collectionProductsData.collection.productVariants.items
        .map((pv: any) => pv.product)
        .filter((p: any) => {
          if (seen.has(p.id)) return false;
          seen.add(p.id);
          return true;
        })
        .map(transformProduct);
    }
    return (productsData?.products?.items ?? []).map(transformProduct);
  }, [selectedCategory, collectionProductsData, productsData]);

  const isLoading = selectedCategory ? collectionLoading : productsLoading;

  return (
    <div className="bg-background min-h-screen">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-8">
        {/* Category Tabs */}
        <div className="flex gap-3 overflow-x-auto pb-4 mb-6" style={{ scrollbarWidth: 'none' }}>
          <button
            onClick={() => setSelectedCategory(undefined)}
            className={cn(
              'px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border',
              !selectedCategory
                ? 'bg-[#1E1E1E] text-white border-[#1E1E1E]'
                : 'bg-card text-foreground border-border hover:border-gray-400'
            )}
          >
            {t('all')}
          </button>
          {categories.map((cat: any) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={cn(
                'px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border',
                selectedCategory === cat.slug
                  ? 'bg-[#1E1E1E] text-white border-[#1E1E1E]'
                  : 'bg-card text-foreground border-border hover:border-gray-400'
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Page Title */}
        <h1 className="text-3xl font-bold text-foreground mb-8">{t('shopProducts')}</h1>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="aspect-square rounded-lg mb-3" />
                <Skeleton className="h-10 w-full mb-2" />
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg text-muted-foreground">{t('noProducts')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
