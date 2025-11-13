'use client';

import { useState } from 'react';
import { useGetProductsQuery, useGetCategoriesQuery } from '@/graphql/generated/graphql';
import { mapProduct } from '@/lib/utils/mappers';
import ProductCard from '@/components/product/ProductCard';
import { Button, Spinner } from '@/components/ui';
import { ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import type { Locale } from '@/lib/utils/mappers';

export default function ProductsPage() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const searchParams = useSearchParams();

  // Pagination and sorting state
  const [page, setPage] = useState(0);
  const [pageSize] = useState(20);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('DESC');

  // Fetch products
  const { data, loading, error } = useGetProductsQuery({
    variables: {
      page,
      size: pageSize,
      sortBy,
      sortDirection,
    },
  });

  // Fetch categories for filters
  const { data: categoriesData } = useGetCategoriesQuery();

  // Map products to frontend format
  const products = data?.products?.content?.map((product) =>
    mapProduct(product, locale)
  ) || [];

  const totalPages = data?.products?.totalPages || 0;
  const totalElements = data?.products?.totalElements || 0;

  const handleAddToCart = (productId: string) => {
    // TODO: Implement add to cart
    console.log('Add to cart:', productId);
  };

  const handleAddToWishlist = (productId: string) => {
    // TODO: Implement add to wishlist
    console.log('Add to wishlist:', productId);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container-custom py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Tous les Produits</h1>
        <p className="text-gray-600">
          {totalElements > 0 ? `${totalElements} produits disponibles` : 'Aucun produit trouvé'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <aside className="lg:col-span-1">
          <div className="card p-6 sticky top-4">
            <div className="flex items-center gap-2 mb-4">
              <SlidersHorizontal className="h-5 w-5" />
              <h2 className="font-semibold">Filtres</h2>
            </div>

            {/* Sort Options */}
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-3">Trier par</h3>
              <select
                value={`${sortBy}-${sortDirection}`}
                onChange={(e) => {
                  const [newSortBy, newSortDirection] = e.target.value.split('-');
                  setSortBy(newSortBy);
                  setSortDirection(newSortDirection);
                  setPage(0);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="createdAt-DESC">Plus récents</option>
                <option value="createdAt-ASC">Plus anciens</option>
                <option value="basePrice-ASC">Prix croissant</option>
                <option value="basePrice-DESC">Prix décroissant</option>
                <option value="nameFr-ASC">Nom A-Z</option>
                <option value="nameFr-DESC">Nom Z-A</option>
                <option value="viewCount-DESC">Plus populaires</option>
              </select>
            </div>

            {/* Categories Filter */}
            {categoriesData?.categories && categoriesData.categories.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-3">Catégories</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {categoriesData.categories.map((category) => (
                    <label key={category.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                      />
                      <span className="text-sm text-gray-700">
                        {category.nameFr || category.nameEn || category.nameAr}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Price Range Filter - Placeholder */}
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-3">Prix</h3>
              <p className="text-xs text-gray-500">Filtre de prix à venir</p>
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Spinner size="lg" />
            </div>
          ) : error ? (
            <div className="card p-8 text-center">
              <p className="text-red-600 mb-4">Erreur lors du chargement des produits</p>
              <p className="text-sm text-gray-600">{error.message}</p>
            </div>
          ) : products.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="text-gray-600">Aucun produit disponible pour le moment.</p>
            </div>
          ) : (
            <>
              {/* Products Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    locale={locale}
                    onAddToCart={handleAddToCart}
                    onAddToWishlist={handleAddToWishlist}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 0}
                    leftIcon={<ChevronLeft className="h-4 w-4" />}
                  >
                    Précédent
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i).map((pageNum) => {
                      // Show first page, last page, current page, and pages around current
                      if (
                        pageNum === 0 ||
                        pageNum === totalPages - 1 ||
                        Math.abs(pageNum - page) <= 1
                      ) {
                        return (
                          <Button
                            key={pageNum}
                            variant={pageNum === page ? 'primary' : 'outline'}
                            size="sm"
                            onClick={() => handlePageChange(pageNum)}
                            className="min-w-[40px]"
                          >
                            {pageNum + 1}
                          </Button>
                        );
                      } else if (Math.abs(pageNum - page) === 2) {
                        return <span key={pageNum} className="px-2">...</span>;
                      }
                      return null;
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= totalPages - 1}
                    rightIcon={<ChevronRight className="h-4 w-4" />}
                  >
                    Suivant
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
