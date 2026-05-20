'use client';

import { useTranslations } from 'next-intl';
import { useGetRootCollectionsQuery } from '@oscar/graphql-shop/generated';
import { Link } from '@/i18n/routing';
import { Alert, Skeleton } from '@/components/ui';
import { PageHeader } from '@/components/layout';

export default function CategoriesPage() {
  const t = useTranslations('CategoriesPage');
  const { data, loading, error } = useGetRootCollectionsQuery();
  const items = data?.collections.items ?? [];

  return (
    <div className="flex flex-col">
      <PageHeader
        breadcrumbs={[{ label: t('breadcrumbHome'), href: '/' }, { label: t('breadcrumbAll') }]}
        title={t('title')}
        description={t('subtitle')}
      />

      <div className="mx-auto w-full max-w-7xl px-6 py-8">
        {error && (
          <Alert intent="danger" title={t('errorTitle')} className="mb-6">
            {error.message}
          </Alert>
        )}

        {loading && (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/5] w-full" />
            ))}
          </div>
        )}

        {!loading && items.length === 0 && !error && (
          <p className="py-12 text-center text-content-muted">{t('empty')}</p>
        )}

        {items.length > 0 && (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {items.map((c) => (
              <Link
                key={c.id}
                href={`/categories/${c.slug}`}
                className="group relative aspect-[4/5] overflow-hidden rounded border border-border bg-bg-muted"
              >
                {c.featuredAsset?.preview && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={c.featuredAsset.preview}
                    alt={c.name}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-slow group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-content-strong/70 to-transparent" />
                <span className="absolute inset-x-4 bottom-4 text-18 font-bold text-content-inverse">
                  {c.name}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
