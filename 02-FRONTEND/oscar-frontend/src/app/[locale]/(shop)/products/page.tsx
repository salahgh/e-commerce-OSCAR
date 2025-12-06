'use client';

import { useState, Suspense } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Package,
  Heart,
  ShoppingCart,
  Grid3X3,
  LayoutGrid,
  Search,
  ArrowUpDown,
} from 'lucide-react';

import { Button, Skeleton } from '@/components/ui';
import { useCart } from '@/contexts/CartContext';
import { useFacetedSearch } from '@/hooks/useFacetedSearch';
import {
  FacetedFilterSidebar,
  MobileFilterDrawer,
  MobileFilterButton,
  ActiveFilterPills,
  ProductGridSkeleton,
} from '@/components/facets';
import { formatPrice } from '@/lib/facet-utils';
import { cn } from '@/lib/utils';

// Product card for search results
function SearchProductCard({
  product,
  locale,
  onAddToCart,
  viewMode,
}: {
  product: {
    productId: string;
    productName: string;
    slug: string;
    description?: string;
    productAsset?: { id: string; preview: string } | null;
    priceWithTax:
      | { __typename: 'SinglePrice'; value: number }
      | { __typename: 'PriceRange'; min: number; max: number };
    currencyCode: string;
    inStock: boolean;
  };
  locale: string;
  onAddToCart: (productId: string) => void;
  viewMode: 'grid' | 'compact';
}) {
  const getPrice = () => {
    if (product.priceWithTax.__typename === 'SinglePrice') {
      return formatPrice(product.priceWithTax.value, product.currencyCode);
    }
    const { min, max } = product.priceWithTax;
    if (min === max) {
      return formatPrice(min, product.currencyCode);
    }
    return `${formatPrice(min, product.currencyCode)} - ${formatPrice(max, product.currencyCode)}`;
  };

  if (viewMode === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="group flex gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:shadow-lg hover:border-primary-200 transition-all"
      >
        {/* Image */}
        <Link
          href={`/${locale}/products/${product.slug}`}
          className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100"
        >
          {product.productAsset?.preview ? (
            <Image
              src={product.productAsset.preview}
              alt={product.productName}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="96px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="h-8 w-8 text-gray-400" />
            </div>
          )}
        </Link>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <Link href={`/${locale}/products/${product.slug}`}>
            <h3 className="font-medium text-gray-900 line-clamp-1 group-hover:text-primary-600 transition-colors">
              {product.productName}
            </h3>
          </Link>
          {product.description && (
            <p className="text-sm text-gray-500 line-clamp-1 mt-1">
              {product.description.replace(/<[^>]*>/g, '').slice(0, 100)}
            </p>
          )}
          <div className="flex items-center justify-between mt-2">
            <span className="text-lg font-bold text-primary-600">{getPrice()}</span>
            <div className="flex items-center gap-2">
              {!product.inStock && (
                <span className="text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded">
                  Rupture
                </span>
              )}
              <Button
                size="sm"
                variant={product.inStock ? 'default' : 'outline'}
                disabled={!product.inStock}
                onClick={() => onAddToCart(product.productId)}
              >
                <ShoppingCart className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-xl hover:border-primary-200 transition-all duration-300"
    >
      {/* Product Image */}
      <Link
        href={`/${locale}/products/${product.slug}`}
        className="block aspect-square relative overflow-hidden bg-gray-50"
      >
        {product.productAsset?.preview ? (
          <Image
            src={product.productAsset.preview}
            alt={product.productName}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="h-12 w-12 text-gray-300" />
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Quick Actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2.5 bg-white rounded-full shadow-lg hover:bg-gray-50"
            aria-label="Ajouter aux favoris"
          >
            <Heart className="h-4 w-4 text-gray-600" />
          </motion.button>
        </div>

        {/* Stock Badge */}
        {!product.inStock && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-medium px-3 py-1 rounded-full shadow-md">
            Rupture de stock
          </div>
        )}

        {/* Quick Add Button */}
        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.95 }}
          className="absolute bottom-3 left-3 right-3 py-2.5 bg-white/95 backdrop-blur-sm
                     text-primary-600 font-medium rounded-lg shadow-lg
                     opacity-0 group-hover:opacity-100 transition-all
                     flex items-center justify-center gap-2
                     hover:bg-primary-600 hover:text-white disabled:opacity-50"
          disabled={!product.inStock}
          onClick={(e) => {
            e.preventDefault();
            onAddToCart(product.productId);
          }}
        >
          <ShoppingCart className="h-4 w-4" />
          Ajouter au panier
        </motion.button>
      </Link>

      {/* Product Info */}
      <div className="p-4">
        <Link href={`/${locale}/products/${product.slug}`}>
          <h3 className="font-medium text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors min-h-[2.5rem]">
            {product.productName}
          </h3>
        </Link>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-xl font-bold text-primary-600">{getPrice()}</span>
        </div>
      </div>
    </motion.div>
  );
}

function ProductsPageContent() {
  const locale = useLocale();
  const { addToCart } = useCart();
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'compact'>('grid');
  const [localSearchTerm, setLocalSearchTerm] = useState('');

  const {
    state,
    facetGroups,
    products,
    totalItems,
    loading,
    facetsLoading,
    error,
    setSearchTerm,
    toggleFacetValue,
    clearFacetGroup,
    setPriceRange,
    setSorting,
    setPage,
    clearAllFilters,
    getActiveFiltersCount,
  } = useFacetedSearch();

  const pageSize = state.perPage;
  const totalPages = Math.ceil(totalItems / pageSize);
  const activeFiltersCount = getActiveFiltersCount();

  const handleAddToCart = async (productId: string) => {
    try {
      // Note: In a real app, you'd need to get the variant ID
      // For now, we're using productId as a placeholder
      await addToCart(productId, 1);
    } catch (err) {
      console.error('Failed to add to cart:', err);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(localSearchTerm);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {state.searchTerm
              ? `Resultats pour "${state.searchTerm}"`
              : 'Tous les Produits'}
          </h1>
          <p className="text-gray-500">
            {loading ? (
              <span className="animate-pulse">Chargement...</span>
            ) : (
              `${totalItems} produit${totalItems !== 1 ? 's' : ''} disponible${totalItems !== 1 ? 's' : ''}`
            )}
          </p>
        </div>

        {/* Search Bar (Full Width) */}
        <div className="mb-6">
          <form onSubmit={handleSearchSubmit} className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="search"
              value={localSearchTerm}
              onChange={(e) => setLocalSearchTerm(e.target.value)}
              placeholder="Rechercher des produits..."
              className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl
                         focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500
                         bg-white shadow-sm text-gray-900 placeholder-gray-400"
            />
            {localSearchTerm && (
              <button
                type="button"
                onClick={() => {
                  setLocalSearchTerm('');
                  setSearchTerm('');
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Effacer</span>
                ×
              </button>
            )}
          </form>
        </div>

        {/* Active Filters */}
        <AnimatePresence>
          {activeFiltersCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6"
            >
              <ActiveFilterPills
                searchTerm={state.searchTerm}
                facetGroups={facetGroups}
                selectedFacetValueIds={state.facetValueIds}
                priceMin={state.priceMin}
                priceMax={state.priceMax}
                onClearSearch={() => {
                  setSearchTerm('');
                  setLocalSearchTerm('');
                }}
                onRemoveFacetValue={toggleFacetValue}
                onClearPrice={() => setPriceRange(undefined, undefined)}
                onClearAll={clearAllFilters}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6 gap-4">
          {/* Mobile Filter Button */}
          <MobileFilterButton
            onClick={() => setShowMobileFilters(true)}
            activeFiltersCount={activeFiltersCount}
          />

          {/* Sort & View Controls */}
          <div className="flex items-center gap-3 ml-auto">
            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={`${state.sortBy}-${state.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('-') as [
                    'name' | 'price' | 'createdAt',
                    'ASC' | 'DESC'
                  ];
                  setSorting(sortBy, sortOrder);
                }}
                className="appearance-none pl-4 pr-10 py-2.5 border border-gray-200 rounded-xl
                           bg-white text-sm font-medium text-gray-700
                           focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500
                           cursor-pointer"
              >
                <option value="name-ASC">Nom A-Z</option>
                <option value="name-DESC">Nom Z-A</option>
                <option value="price-ASC">Prix croissant</option>
                <option value="price-DESC">Prix decroissant</option>
                <option value="createdAt-DESC">Plus recents</option>
                <option value="createdAt-ASC">Plus anciens</option>
              </select>
              <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>

            {/* View Mode Toggle */}
            <div className="hidden md:flex items-center bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'p-2 rounded-lg transition-all',
                  viewMode === 'grid'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                )}
                aria-label="Vue grille"
              >
                <Grid3X3 className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('compact')}
                className={cn(
                  'p-2 rounded-lg transition-all',
                  viewMode === 'compact'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                )}
                aria-label="Vue compacte"
              >
                <LayoutGrid className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar (Desktop) */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24">
              <FacetedFilterSidebar
                facetGroups={facetGroups}
                state={state}
                onToggleFacetValue={toggleFacetValue}
                onClearFacetGroup={clearFacetGroup}
                onPriceChange={setPriceRange}
                onClearAll={clearAllFilters}
                loading={facetsLoading}
              />
            </div>
          </aside>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <ProductGridSkeleton count={12} />
            ) : error ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <div className="text-red-500 mb-4">
                  <Package className="h-16 w-16 mx-auto opacity-50" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Erreur lors du chargement
                </h3>
                <p className="text-gray-500 mb-4">{error.message}</p>
                <Button onClick={() => window.location.reload()}>Reessayer</Button>
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <Package className="h-20 w-20 mx-auto text-gray-300 mb-6" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Aucun produit trouve
                </h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  {state.searchTerm
                    ? `Aucun produit ne correspond a "${state.searchTerm}"`
                    : 'Aucun produit disponible avec les filtres selectionnes.'}
                </p>
                {activeFiltersCount > 0 && (
                  <Button variant="outline" onClick={clearAllFilters}>
                    Effacer les filtres
                  </Button>
                )}
              </div>
            ) : (
              <>
                {/* Products */}
                <div
                  className={cn(
                    viewMode === 'grid'
                      ? 'grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6'
                      : 'space-y-4'
                  )}
                >
                  <AnimatePresence mode="popLayout">
                    {products.map((product) => (
                      <SearchProductCard
                        key={product.productId}
                        product={product}
                        locale={locale}
                        onAddToCart={handleAddToCart}
                        viewMode={viewMode}
                      />
                    ))}
                  </AnimatePresence>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-12">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(state.page - 1)}
                      disabled={state.page === 1}
                      className="rounded-lg"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Precedent
                    </Button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        let pageNum = i + 1;
                        if (totalPages > 5) {
                          if (state.page < 3) {
                            pageNum = i + 1;
                          } else if (state.page > totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = state.page - 2 + i;
                          }
                        }
                        return (
                          <Button
                            key={pageNum}
                            variant={pageNum === state.page ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handlePageChange(pageNum)}
                            className="min-w-[40px] rounded-lg"
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(state.page + 1)}
                      disabled={state.page >= totalPages}
                      className="rounded-lg"
                    >
                      Suivant
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <MobileFilterDrawer
        isOpen={showMobileFilters}
        onClose={() => setShowMobileFilters(false)}
        facetGroups={facetGroups}
        state={state}
        totalProducts={totalItems}
        onToggleFacetValue={toggleFacetValue}
        onClearFacetGroup={clearFacetGroup}
        onPriceChange={setPriceRange}
        onClearAll={clearAllFilters}
        loading={facetsLoading}
      />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8">
          <ProductGridSkeleton count={12} />
        </div>
      }
    >
      <ProductsPageContent />
    </Suspense>
  );
}
