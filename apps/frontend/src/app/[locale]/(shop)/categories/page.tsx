'use client';

import { useLocale } from 'next-intl';
import { useGetRootCollectionsQuery } from '@/graphql/generated/graphql';
import { CategoryCard } from '@/components/category';
import { Skeleton } from '@/components/ui';
import { Folder } from 'lucide-react';

export default function CategoriesPage() {
  const locale = useLocale();

  const { data, loading, error } = useGetRootCollectionsQuery();

  const collections = data?.collections?.items || [];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Catégories</h1>
        <p className="text-muted-foreground">
          Parcourez nos collections et trouvez ce que vous cherchez
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-lg border bg-card overflow-hidden">
              <Skeleton className="aspect-[3/2]" />
              <div className="p-4">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-destructive/10 text-destructive rounded-lg p-6 text-center">
          <p>Erreur lors du chargement des catégories</p>
          <p className="text-sm mt-2">{error.message}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && collections.length === 0 && (
        <div className="text-center py-16">
          <Folder className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Aucune catégorie</h2>
          <p className="text-muted-foreground">
            Aucune catégorie n'est disponible pour le moment.
          </p>
        </div>
      )}

      {/* Categories Grid */}
      {!loading && !error && collections.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {collections.map((collection) => (
            <CategoryCard
              key={collection.id}
              id={collection.id}
              name={collection.name}
              slug={collection.slug}
              description={collection.description || undefined}
              imageUrl={collection.featuredAsset?.preview}
              locale={locale}
              childCount={collection.children?.length}
              variant="default"
            />
          ))}
        </div>
      )}

      {/* Featured Subcategories Section */}
      {!loading && !error && collections.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Sous-catégories populaires</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {collections
              .flatMap((collection) =>
                (collection.children || []).slice(0, 2).map((child) => ({
                  ...child,
                  parentName: collection.name,
                }))
              )
              .slice(0, 12)
              .map((subcategory) => (
                <CategoryCard
                  key={subcategory.id}
                  id={subcategory.id}
                  name={subcategory.name}
                  slug={subcategory.slug}
                  imageUrl={subcategory.featuredAsset?.preview}
                  locale={locale}
                  variant="compact"
                />
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
