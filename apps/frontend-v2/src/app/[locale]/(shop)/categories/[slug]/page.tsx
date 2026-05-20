'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useGetCollectionWithProductsQuery } from '@oscar/graphql-shop/generated';
import { Link } from '@/i18n/routing';
import { Alert, Pagination, Skeleton } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { ProductCard, ProductCardSkeleton, ProductGrid, type ProductCardData } from '@/components/patterns';

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

  const breadcrumbs = collection
    ? [
        { label: t('breadcrumbHome'), href: '/' },
        { label: t('breadcrumbCategories'), href: '/categories' },
        ...(collection.parent && collection.parent.slug !== '__root_collection__'
          ? [{ label: collection.parent.name, href: `/categories/${collection.parent.slug}` }]
          : []),
        { label: collection.name },
      ]
    : [
        { label: t('breadcrumbHome'), href: '/' },
        { label: t('breadcrumbCategories'), href: '/categories' },
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
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {collection.children!.map((child) => (
                <Link
                  key={child.id}
                  href={`/categories/${child.slug}`}
                  className="group relative aspect-[3/2] overflow-hidden rounded border border-border bg-bg-muted"
                >
                  {child.featuredAsset?.preview && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={child.featuredAsset.preview}
                      alt={child.name}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-slow group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-content-strong/70 to-transparent" />
                  <span className="absolute inset-x-3 bottom-3 text-14 font-bold text-content-inverse">
                    {child.name}
                  </span>
                </Link>
              ))}
            </div>
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
