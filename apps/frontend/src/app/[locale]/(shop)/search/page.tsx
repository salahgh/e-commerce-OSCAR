'use client';

import * as React from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Filter, X } from 'lucide-react';
import {
  useSearchProductsWithFacetsQuery,
} from '@oscar/graphql-shop/generated';
import {
  buildFacetValueFilters,
  detectFacetType,
  parseSearchParams,
  serializeSearchParams,
  type FacetGroup,
} from '@oscar/shared';
import { Alert, Button, Skeleton } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import {
  FacetFilters,
  ProductCard,
  ProductCardSkeleton,
  ProductGrid,
  LoadMore,
  type ProductCardData,
} from '@/components/patterns';

const PER_PAGE = 12;

export default function SearchPage() {
  return (
    <React.Suspense fallback={null}>
      <SearchPageContent />
    </React.Suspense>
  );
}

function SearchPageContent() {
  const t = useTranslations('SearchPage');
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const state = React.useMemo(() => parseSearchParams(new URLSearchParams(sp.toString())), [sp]);
  const query = state.searchTerm ?? '';
  const selectedIds = React.useMemo(() => new Set(state.facetValueIds ?? []), [state.facetValueIds]);
  const [loadingMore, setLoadingMore] = React.useState(false);

  // First fetch — get facetValues to build groups. Subsequent pages append via fetchMore.
  const { data, loading, error, fetchMore } = useSearchProductsWithFacetsQuery({
    variables: {
      input: {
        term: query,
        take: PER_PAGE,
        skip: 0,
        groupByProduct: true,
        facetValueFilters: buildFacetValueFilters([...selectedIds], []),
      },
    },
    skip: !query,
  });

  const items = data?.search.items ?? [];
  const total = data?.search.totalItems ?? 0;
  const hasMore = items.length < total;

  const onLoadMore = React.useCallback(() => {
    setLoadingMore(true);
    fetchMore({
      variables: {
        input: {
          term: query,
          take: PER_PAGE,
          skip: items.length,
          groupByProduct: true,
          facetValueFilters: buildFacetValueFilters([...selectedIds], []),
        },
      },
    }).finally(() => setLoadingMore(false));
  }, [fetchMore, query, items.length, selectedIds]);

  // Build FacetGroup[] from the search response
  const groups: FacetGroup[] = React.useMemo(() => {
    const byFacet = new Map<string, FacetGroup>();
    for (const fv of data?.search.facetValues ?? []) {
      const facet = fv.facetValue.facet;
      const existing = byFacet.get(facet.id) ?? {
        id: facet.id,
        name: facet.name,
        code: facet.code,
        displayType: detectFacetType(facet.code),
        values: [],
      };
      existing.values.push({
        id: fv.facetValue.id,
        name: fv.facetValue.name,
        code: fv.facetValue.code,
        count: fv.count,
      });
      byFacet.set(facet.id, existing);
    }
    return [...byFacet.values()];
  }, [data?.search.facetValues]);

  function pushUrl(next: URLSearchParams) {
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function onToggleFacet(valueId: string) {
    const nextSelected = new Set(selectedIds);
    if (nextSelected.has(valueId)) nextSelected.delete(valueId);
    else nextSelected.add(valueId);
    const next = serializeSearchParams({ ...state, facetValueIds: [...nextSelected], page: 1 }, groups);
    pushUrl(next);
  }

  function onClearFilters() {
    const next = serializeSearchParams({ ...state, facetValueIds: [], page: 1 }, groups);
    pushUrl(next);
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        breadcrumbs={[
          { label: t('breadcrumbHome'), href: '/' },
          { label: t('breadcrumbSearch') },
        ]}
        title={query ? `${t('title')} : "${query}"` : t('title')}
        description={query && total > 0 ? t('results', { count: total, query }) : undefined}
      />

      {!query ? (
        <div className="mx-auto w-full max-w-3xl px-6 py-24 text-center">
          <p className="text-content-muted">{t('noQuery')}</p>
        </div>
      ) : (
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-6 py-8 lg:grid-cols-[260px_1fr]">
          {/* Filters sidebar */}
          <aside className="flex flex-col gap-4">
            <header className="flex items-center justify-between">
              <h2 className="inline-flex items-center gap-2 text-16 font-bold text-content-strong">
                <Filter className="h-4 w-4" />
                {t('filtersTitle')}
              </h2>
              {selectedIds.size > 0 && (
                <button
                  type="button"
                  onClick={onClearFilters}
                  className="inline-flex items-center gap-1 text-12 text-content-muted hover:text-content-strong"
                >
                  <X className="h-3 w-3" />
                  {t('clearFilters')}
                </button>
              )}
            </header>
            {loading && groups.length === 0 ? (
              <div className="flex flex-col gap-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : (
              <FacetFilters groups={groups} selected={selectedIds} onToggle={onToggleFacet} />
            )}
          </aside>

          {/* Results */}
          <section className="flex flex-col gap-6">
            {error && (
              <Alert intent="danger" title={t('errorTitle')}>
                {error.message}
              </Alert>
            )}

            {!loading && items.length === 0 && (
              <div className="py-16 text-center">
                <p className="text-18 font-medium text-content-strong">{t('empty', { query })}</p>
                <p className="mt-2 text-14 text-content-muted">{t('emptyHint')}</p>
              </div>
            )}

            <ProductGrid columns={3}>
              {loading
                ? Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)
                : items.map((it) => {
                    const price = it.priceWithTax;
                    const data: ProductCardData = {
                      slug: it.slug,
                      name: it.productName,
                      imageUrl: it.productAsset?.preview ?? null,
                      price:
                        'value' in price ? price.value : 'min' in price ? price.min : 0,
                      currencyCode: it.currencyCode,
                    };
                    return <ProductCard key={it.productId} product={data} />;
                  })}
            </ProductGrid>

            <LoadMore
              hasMore={hasMore}
              loading={loadingMore}
              onLoadMore={onLoadMore}
              label={t('loadMore')}
              loadingLabel={t('loading')}
            />
          </section>
        </div>
      )}
    </div>
  );
}
