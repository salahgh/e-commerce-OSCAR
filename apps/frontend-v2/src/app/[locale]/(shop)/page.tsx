'use client';

import { ArrowRight, ArrowLeft } from 'lucide-react';
import { useGetProductsQuery, useGetRootCollectionsQuery } from '@oscar/graphql-shop/generated';
import { Link } from '@/i18n/routing';
import { Alert, Button } from '@/components/ui';
import { ProductCard, ProductCardSkeleton, ProductGrid, type ProductCardData } from '@/components/patterns';

function toCardData(p: {
  slug: string;
  name: string;
  featuredAsset?: { preview: string } | null;
  variants: Array<{ priceWithTax: number; currencyCode: string }>;
}): ProductCardData {
  const firstVariant = p.variants[0];
  return {
    slug: p.slug,
    name: p.name,
    imageUrl: p.featuredAsset?.preview ?? null,
    price: firstVariant?.priceWithTax ?? 0,
    currencyCode: firstVariant?.currencyCode ?? 'DZD',
  };
}

export default function HomePage() {
  const { data: productsData, loading: productsLoading, error: productsError } = useGetProductsQuery({
    variables: { options: { take: 8 } },
  });
  const { data: collectionsData, loading: collectionsLoading } = useGetRootCollectionsQuery();

  const products = productsData?.products.items ?? [];
  const collections = collectionsData?.collections.items ?? [];

  return (
    <div className="flex flex-col gap-16 pb-20">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-bg-subtle">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-20 md:grid-cols-2">
          <div className="flex flex-col gap-6">
            <p className="text-12 uppercase tracking-wide text-content-muted">Collection 2026</p>
            <h1 className="text-36 font-bold leading-tight text-content-strong md:text-[3.5rem] md:leading-[1.1]">
              مرحباً بك في OSCAR NAJAR
            </h1>
            <p className="text-18 text-content-muted">
              Découvrez la collection : élégance algérienne, qualité artisanale, livraison sous 48h
              dans toutes les wilayas.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/products">
                  <span className="inline-flex items-center gap-2">
                    <span>تسوّق الآن</span>
                    <ArrowRight className="h-5 w-5 ltr:inline rtl:hidden" />
                    <ArrowLeft className="h-5 w-5 ltr:hidden rtl:inline" />
                  </span>
                </Link>
              </Button>
              <Button asChild intent="secondary" size="lg">
                <Link href="/categories">Toutes les catégories</Link>
              </Button>
            </div>
          </div>

          <div className="relative h-[420px] overflow-hidden rounded bg-bg-muted">
            <div aria-hidden="true" className="absolute inset-0 grid grid-cols-3 gap-3 p-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="rounded bg-bg-elevated" />
              ))}
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-tr from-bg-muted/60 to-transparent">
              <span className="text-32 font-bold tracking-wider text-content-strong">
                OSCAR · NAJAR
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="mx-auto w-full max-w-7xl px-6">
        <header className="flex items-end justify-between gap-4 pb-6">
          <div className="flex flex-col gap-1">
            <p className="text-12 uppercase tracking-wide text-content-muted">المنتجات المميّزة</p>
            <h2 className="text-24 font-bold text-content-strong">Produits en vedette</h2>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-14 font-medium text-content-strong hover:underline"
          >
            Voir tout
            <ArrowRight className="h-4 w-4 ltr:inline rtl:hidden" />
            <ArrowLeft className="h-4 w-4 ltr:hidden rtl:inline" />
          </Link>
        </header>

        {productsError && (
          <Alert intent="danger" title="Erreur de chargement">
            Impossible de récupérer les produits. Vérifiez que le serveur Vendure est démarré.
          </Alert>
        )}

        <ProductGrid columns={4}>
          {productsLoading
            ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : products.map((p) => <ProductCard key={p.id} product={toCardData(p)} />)}
        </ProductGrid>
      </section>

      {/* Collections */}
      {!collectionsLoading && collections.length > 0 && (
        <section className="mx-auto w-full max-w-7xl px-6">
          <header className="flex items-end justify-between gap-4 pb-6">
            <div className="flex flex-col gap-1">
              <p className="text-12 uppercase tracking-wide text-content-muted">الفئات</p>
              <h2 className="text-24 font-bold text-content-strong">Explorer par catégorie</h2>
            </div>
          </header>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {collections.slice(0, 8).map((c) => (
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
        </section>
      )}

      {/* Brand belt */}
      <section className="mx-auto w-full max-w-7xl px-6">
        <div className="overflow-hidden rounded bg-accent">
          <div className="grid items-center gap-6 px-8 py-12 md:grid-cols-[1fr_auto]">
            <div className="flex flex-col gap-2 text-accent-content">
              <p className="text-12 uppercase tracking-wide opacity-70">Livraison · Paiement à la livraison</p>
              <h2 className="text-32 font-bold leading-tight">
                Toutes les wilayas, sous 48-72h
              </h2>
              <p className="text-16 opacity-80">
                CIB, Baridimob, ou paiement à la livraison. Vous choisissez ce qui vous convient.
              </p>
            </div>
            <Button asChild intent="secondary" size="lg">
              <Link href="/shipping">En savoir plus</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
