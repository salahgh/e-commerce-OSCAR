'use client';

import { useGetProductsQuery, SortOrder, type ProductSortParameter } from '@oscar/graphql-shop/generated';
import { ProductCard, ProductCardSkeleton, type ProductCardData } from '@/components/patterns';
import { variantDiscount } from '@/lib/format/discount';
import { productOutOfStock } from '@/lib/format/stock';
import { SectionHeader } from './SectionHeader';

interface ProductRailProps {
  title: string;
  viewAllLabel: string;
  /** How many products to request for the rail. */
  take?: number;
  /** Distinct sort per rail — also keeps each query in its own Apollo cache entry. */
  sort?: ProductSortParameter;
}

function toCardData(p: {
  slug: string;
  name: string;
  featuredAsset?: { preview: string } | null;
  variants: Array<{ priceWithTax: number; currencyCode: string; stockLevel: string }>;
}): ProductCardData {
  const v = p.variants[0];
  return {
    slug: p.slug,
    name: p.name,
    imageUrl: p.featuredAsset?.preview ?? null,
    currencyCode: v?.currencyCode ?? 'DZD',
    outOfStock: productOutOfStock(p.variants),
    ...variantDiscount(v),
  };
}

/** Horizontal-scrolling product rail (Figma "وصل حديثا"). */
export function ProductRail({ title, viewAllLabel, take = 10, sort = { createdAt: SortOrder.Desc } }: ProductRailProps) {
  const { data, loading } = useGetProductsQuery({ variables: { options: { take, sort } } });
  const products = data?.products.items ?? [];

  return (
    <section className="flex flex-col gap-6">
      <SectionHeader title={title} viewAllHref="/products" viewAllLabel={viewAllLabel} />
      <div className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="w-[260px] shrink-0">
                <ProductCardSkeleton />
              </div>
            ))
          : products.map((p) => (
              <ProductCard key={p.id} product={toCardData(p)} className="w-[260px] shrink-0" />
            ))}
      </div>
    </section>
  );
}
