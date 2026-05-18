'use client';

import * as React from 'react';
import { useGetProductsQuery, SortOrder } from '@oscar/graphql-shop/generated';
import { Alert, Pagination, Select, Field } from '@/components/ui';
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

export default function ProductsPage() {
  const [page, setPage] = React.useState(1);
  const [sort, setSort] = React.useState<'name-asc' | 'name-desc'>('name-asc');

  const { data, loading, error } = useGetProductsQuery({
    variables: {
      options: {
        take: PER_PAGE,
        skip: (page - 1) * PER_PAGE,
        sort: { name: sort === 'name-asc' ? SortOrder.Asc : SortOrder.Desc },
      },
    },
  });

  const total = data?.products.totalItems ?? 0;
  const items = data?.products.items ?? [];
  const pageCount = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <div className="flex flex-col">
      <PageHeader
        breadcrumbs={[{ label: 'Accueil', href: '/' }, { label: 'Tous les produits' }]}
        title="Tous les produits"
        description={total > 0 ? `${total} produit${total > 1 ? 's' : ''}` : undefined}
        actions={
          <Field label="">
            <Select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}>
              <option value="name-asc">Nom (A → Z)</option>
              <option value="name-desc">Nom (Z → A)</option>
            </Select>
          </Field>
        }
      />

      <div className="mx-auto w-full max-w-7xl px-6 py-8">
        {error && (
          <Alert intent="danger" title="Erreur de chargement" className="mb-6">
            {error.message}
          </Alert>
        )}

        <ProductGrid columns={4}>
          {loading
            ? Array.from({ length: PER_PAGE }).map((_, i) => <ProductCardSkeleton key={i} />)
            : items.map((p) => <ProductCard key={p.id} product={toCardData(p)} />)}
        </ProductGrid>

        {!loading && items.length === 0 && (
          <p className="py-12 text-center text-content-muted">Aucun produit trouvé.</p>
        )}

        {pageCount > 1 && (
          <div className="mt-10">
            <Pagination page={page} pageCount={pageCount} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
}
