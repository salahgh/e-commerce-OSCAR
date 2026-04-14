'use client';

import { useMemo } from 'react';
import { gql, useQuery } from '@apollo/client';
import { useTranslations } from 'next-intl';
import {
  useGetRootCollectionsQuery,
  useGetProductsQuery,
  useSearchProductsQuery,
} from '@/graphql/generated/graphql';
import { formatPrice } from '@/lib/utils/formatters';
import { parseProductDiscount } from '@/lib/utils/discountParser';
import { Skeleton } from '@/components/ui';
import {
  HeroBanner,
  CategoryCircles,
  ProductRow,
  ProductGrid,
  SectionHeader,
  PromoBanner,
  type HomeProduct,
  type BannerSlide,
  type CategoryItem,
} from '@/components/home';

/** Vendure on Windows returns backslash paths in asset URLs — normalise them. */
function normalizeUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  return url.replace(/\\/g, '/');
}

// Banner query (not in codegen — uses collection customFields)
const GET_BANNER_SLIDES = gql`
  query GetBannerSlides {
    collection(slug: "banners") {
      id
      children {
        id
        name
        slug
        description
        featuredAsset {
          id
          preview
        }
      }
    }
  }
`;

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
    originalPrice: discount.hasDiscount
      ? formatPrice(discount.originalPrice / 100)
      : null,
    discountPercent: discount.hasDiscount ? discount.percentage : null,
    inStock: defaultVariant?.stockLevel !== 'OUT_OF_STOCK',
    rating: 4,
    reviewCount: 2,
  };
}

function transformSearchItem(item: any): HomeProduct {
  const price = item.priceWithTax;
  const priceValue =
    price?.__typename === 'SinglePrice' ? price.value : price?.min;
  return {
    id: item.productId,
    name: item.productName,
    slug: item.slug,
    imageUrl: normalizeUrl(item.productAsset?.preview),
    price: formatPrice((priceValue || 0) / 100),
    inStock: true,
    rating: 4,
    reviewCount: 2,
  };
}

function BannerSkeleton() {
  return <Skeleton className="w-full aspect-[1392/754] rounded-xl" />;
}

function CategorySkeleton() {
  return (
    <div className="flex gap-6 px-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-3 shrink-0">
          <Skeleton className="w-[120px] h-[120px] rounded-full" />
          <Skeleton className="w-16 h-4" />
        </div>
      ))}
    </div>
  );
}

function ProductRowSkeleton() {
  return (
    <div className="flex gap-4 px-6">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="shrink-0 w-[265px]">
          <Skeleton className="aspect-square rounded-lg" />
          <Skeleton className="mt-3 h-10 w-full" />
          <Skeleton className="mt-2 h-4 w-24" />
          <Skeleton className="mt-2 h-6 w-20" />
        </div>
      ))}
    </div>
  );
}

export function HomePageContent() {
  const t = useTranslations('home');

  // 1. Banner slides
  const { data: bannerData, loading: bannerLoading } = useQuery(
    GET_BANNER_SLIDES
  );

  // 2. Root collections (categories)
  const { data: collectionsData, loading: collectionsLoading } =
    useGetRootCollectionsQuery();

  // 3. New arrivals (latest products)
  const { data: newArrivalsData, loading: newArrivalsLoading } =
    useGetProductsQuery({
      variables: {
        options: {
          take: 10,
          sort: { createdAt: 'DESC' as any },
        },
      },
    });

  // 4. Featured/Best sellers
  const { data: featuredData, loading: featuredLoading } =
    useSearchProductsQuery({
      variables: {
        input: {
          take: 10,
          groupByProduct: true,
        },
      },
    });

  // Transform banner data
  const bannerSlides: BannerSlide[] = useMemo(() => {
    const children = bannerData?.collection?.children ?? [];
    return children
      .filter((child: any) => child.featuredAsset?.preview)
      .map((child: any) => ({
        id: child.id,
        name: child.name,
        slug: child.slug,
        description: child.description,
        imageUrl: normalizeUrl(child.featuredAsset!.preview)!,
      }));
  }, [bannerData]);

  // Transform categories (exclude "banners" collection)
  const categories: CategoryItem[] = useMemo(() => {
    const items = collectionsData?.collections?.items ?? [];
    return items
      .filter((col: any) => col.slug !== 'banners')
      .map((col: any) => ({
        id: col.id,
        name: col.name,
        slug: col.slug,
        imageUrl: normalizeUrl(col.featuredAsset?.preview),
      }));
  }, [collectionsData]);

  // Transform products
  const newArrivals: HomeProduct[] = useMemo(
    () =>
      (newArrivalsData?.products?.items ?? []).map(transformProduct),
    [newArrivalsData]
  );

  const bestSellers: HomeProduct[] = useMemo(
    () =>
      (featuredData?.search?.items ?? []).map(transformSearchItem),
    [featuredData]
  );

  // Combined "picked for you" — deduplicated mix of both
  const pickedForYou: HomeProduct[] = useMemo(() => {
    const combined = [...newArrivals, ...bestSellers];
    const seen = new Set<string>();
    return combined.filter((p) => {
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    }).slice(0, 10);
  }, [newArrivals, bestSellers]);

  return (
    <div className="flex flex-col gap-10 pb-12">
      {/* 1. Hero Banner */}
      <section className="px-6">
        {bannerLoading ? (
          <BannerSkeleton />
        ) : (
          <HeroBanner slides={bannerSlides} />
        )}
      </section>

      {/* 2. Category Circles */}
      <section>
        {collectionsLoading ? (
          <CategorySkeleton />
        ) : (
          <CategoryCircles categories={categories} />
        )}
      </section>

      {/* 3. New Arrivals */}
      <section>
        <SectionHeader
          title={t('newArrivals')}
          href="/products?sort=newest"
        />
        {newArrivalsLoading ? (
          <ProductRowSkeleton />
        ) : (
          <ProductRow products={newArrivals} />
        )}
      </section>

      {/* 4. Best Sellers */}
      <section>
        <SectionHeader
          title={t('bestSellers')}
          href="/products?featured=true"
        />
        {featuredLoading ? (
          <ProductRowSkeleton />
        ) : (
          <ProductRow products={bestSellers} />
        )}
      </section>

      {/* 5. Promo Banner */}
      {bannerSlides.length > 1 && (
        <section className="px-6">
          <PromoBanner
            imageUrl={bannerSlides[bannerSlides.length - 1].imageUrl}
            alt={bannerSlides[bannerSlides.length - 1].name}
            href="/products"
          />
        </section>
      )}

      {/* 6. Picked For You — Grid */}
      {pickedForYou.length > 0 && (
        <section>
          <SectionHeader title={t('pickedForYou')} />
          <ProductGrid products={pickedForYou} />
        </section>
      )}
    </div>
  );
}
