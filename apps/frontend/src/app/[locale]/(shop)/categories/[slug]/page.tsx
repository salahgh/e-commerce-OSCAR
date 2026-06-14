'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useGetCollectionWithProductsQuery } from '@oscar/graphql-shop/generated';
import { Alert, Pagination, Skeleton } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import {
  ProductCard,
  ProductCardSkeleton,
  ProductGrid,
  CategoryCircles,
  type ProductCardData,
} from '@/components/patterns';

const PER_PAGE = 12;

function toCardData(p: {
  slug: string;
  name: string;
  featuredAsset?: { preview: string } | null;
  variants: Array<{ priceWithTax: number; currencyCode: string }>;
}): ProductCardData {
  const v = p.variants[0];
  return {
    slug: p.slug,
    name: p.name,
    imageUrl: p.featuredAsset?.preview ?? null,
    price: v?.priceWithTax ?? 0,
    currencyCode: v?.currencyCode ?? 'DZD',
  };
}

export default function CategoryDetailPage() {
  const t = useTranslations('CategoryPage');
  const params = useParams<{ slug: string; locale: string }>();
  const slug = params?.slug as string;

  const [page, setPage] = React.useState(1);

  const { data, loading, error } = useGetCollectionWithProductsQuery({
    variables: { slug, take: PER_PAGE, skip: (page - 1) * PER_PAGE },
    skip: !slug,
  });

  const collection = data?.collection;
  const productsRaw = collection?.productVariants.items ?? [];
  const total = collection?.productVariants.totalItems ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PER_PAGE));

  // Dedupe products (variants → product collection may include duplicates)
  const seen = new Set<string>();
  const products = productsRaw.flatMap((v) => {
    if (!v.product || seen.has(v.product.id)) return [];
    seen.add(v.product.id);
    return [v.product];
  });

  // Breadcrumb is driven by Vendure's collection.breadcrumbs (full ancestor chain),
  // excluding the synthetic root collection. The last crumb (current category) has no link.
  const ROOT_SLUG = '__root_collection__';
  const categoryCrumbs = (collection?.breadcrumbs ?? [])
    .filter((b) => b.slug !== ROOT_SLUG)
    .map((b, i, arr) =>
      i === arr.length - 1 ? { label: b.name } : { label: b.name, href: `/categories/${b.slug}` },
    );
  const breadcrumbs = [
    { label: t('breadcrumbHome'), href: '/' },
    { label: t('breadcrumbCategories'), href: '/categories' },
    ...categoryCrumbs,
  ];

  if (!loading && (error || !collection)) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24">
        <Alert intent="danger" title={t('errorTitle')}>
          {error?.message ?? t('errorBody')}
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        breadcrumbs={breadcrumbs}
        title={collection?.name ?? <Skeleton className="h-9 w-64" />}
        description={collection?.description}
      />

      <div className="mx-auto w-full max-w-7xl px-6 py-8">
        {collection && (collection.children?.length ?? 0) > 0 && (
          <section className="mb-10">
            <h2 className="mb-4 text-18 font-bold text-content-strong">{t('subcategories')}</h2>
            <CategoryCircles items={collection.children ?? []} size={96} align="center" />
          </section>
        )}

        <section>
          <h2 className="mb-4 flex items-baseline justify-between text-18 font-bold text-content-strong">
            <span>{t('products')}</span>
            {total > 0 && (
              <span className="text-12 font-medium text-content-muted">{t('count', { count: total })}</span>
            )}
          </h2>

          <ProductGrid columns={4}>
            {loading
              ? Array.from({ length: PER_PAGE }).map((_, i) => <ProductCardSkeleton key={i} />)
              : products.map((p) => <ProductCard key={p.id} product={toCardData(p)} />)}
          </ProductGrid>

          {!loading && products.length === 0 && (
            <p className="py-12 text-center text-content-muted">{t('empty')}</p>
          )}

          {pageCount > 1 && (
            <div className="mt-10">
              <Pagination page={page} pageCount={pageCount} onPageChange={setPage} />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
