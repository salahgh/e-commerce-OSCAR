'use client';

import { useGetProductsQuery, SortOrder } from '@oscar/graphql-shop/generated';
import { ProductCard, ProductCardSkeleton, type ProductCardData } from '@/components/patterns';
import { variantDiscount } from '@/lib/format/discount';
import { productOutOfStock } from '@/lib/format/stock';

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

/** 5-column product grid (Figma 4×5 block). */
export function ProductGridSection({ take = 20 }: { take?: number }) {
  const { data, loading } = useGetProductsQuery({
    variables: { options: { take, sort: { name: SortOrder.Asc } } },
  });
  const products = data?.products.items ?? [];

  return (
    <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {loading
        ? Array.from({ length: 10 }).map((_, i) => <ProductCardSkeleton key={i} />)
        : products.map((p) => <ProductCard key={p.id} product={toCardData(p)} />)}
    </section>
  );
}
