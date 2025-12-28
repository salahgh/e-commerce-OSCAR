'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery, gql } from '@apollo/client';
import {
  Search,
  Package,
  X,
  SlidersHorizontal,
  Grid3X3,
  LayoutGrid,
  Loader2,
  TrendingUp,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { Button, Skeleton } from '@/components/ui';
import { useFacetedSearch } from '@/hooks/useFacetedSearch';
import { FacetedFilterSidebar } from '@/components/facets/FacetedFilterSidebar';
import { MobileFilterDrawer, MobileFilterButton } from '@/components/facets/MobileFilterDrawer';
import { ActiveFilterPills } from '@/components/facets/ActiveFilterPills';
import { SortDropdown } from '@/components/product/SortDropdown';
import Pagination from '@/components/common/Pagination';
import { useCart } from '@/contexts/CartContext';
import { cn } from '@/lib/utils';

// Search suggestions query
const SEARCH_SUGGESTIONS = gql`
  query SearchSuggestions($term: String!) {
    search(input: { term: $term, take: 5, groupByProduct: true }) {
      items {
        productId
        productName
        slug
        productAsset {
          preview
        }
        priceWithTax {
          ... on SinglePrice {
            value
          }
          ... on PriceRange {
            min
            max
          }
        }
      }
    }
  }
`;

// Popular searches (could be fetched from analytics)
const POPULAR_SEARCHES = [
  'chemise',
  'pantalon',
  'robe',
  'veste',
  'chaussures',
  'accessoires',
];

export default function SearchPage() {
  const locale = useLocale();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [searchInput, setSearchInput] = useState(initialQuery);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'compact'>('grid');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const { addToCart } = useCart();

  // Faceted search hook
  const {
    state,
    facetGroups,
    products,
    totalItems,
    loading,
    facetsLoading,
    setSearchTerm,
    toggleFacetValue,
    clearFacetGroup,
    setPriceRange,
    setSorting,
    setPage,
    clearAllFilters,
    getActiveFiltersCount,
  } = useFacetedSearch();

  // Search suggestions
  const { data: suggestionsData, loading: suggestionsLoading } = useQuery(SEARCH_SUGGESTIONS, {
    variables: { term: searchInput },
    skip: searchInput.length < 2,
  });

  const suggestions = suggestionsData?.search?.items || [];

  // Initialize search term from URL
  useEffect(() => {
    if (initialQuery && initialQuery !== state.searchTerm) {
      setSearchTerm(initialQuery);
    }
  }, [initialQuery]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchTerm(searchInput.trim());
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (term: string) => {
    setSearchInput(term);
    setSearchTerm(term);
    setShowSuggestions(false);
  };

  const formatPrice = (priceInCents: number, currency: string = 'DZD') => {
    return new Intl.NumberFormat('fr-DZ', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(priceInCents / 100);
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-6">Recherche</h1>

          {/* Search Input with Suggestions */}
          <div className="relative max-w-2xl">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  ref={searchInputRef}
                  type="search"
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="Rechercher des produits..."
                  className="w-full pl-12 pr-24 py-4 border border-border rounded-xl
                             focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                             bg-card text-foreground placeholder-muted-foreground text-lg"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput('');
                      searchInputRef.current?.focus();
                    }}
                    className="absolute right-20 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full"
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                )}
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  Rechercher
                </button>
              </div>
            </form>

            {/* Suggestions Dropdown */}
            {showSuggestions && (searchInput.length >= 2 || !state.searchTerm) && (
              <div
                ref={suggestionsRef}
                className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden"
              >
                {/* Loading */}
                {suggestionsLoading && searchInput.length >= 2 && (
                  <div className="p-4 flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Recherche...
                  </div>
                )}

                {/* Product Suggestions */}
                {suggestions.length > 0 && !suggestionsLoading && (
                  <div className="py-2">
                    <div className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase">
                      Produits
                    </div>
                    {suggestions.slice(0, 5).map((product: any) => (
                      <Link
                        key={product.productId}
                        href={`/${locale}/products/${product.slug}`}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-muted transition-colors"
                        onClick={() => setShowSuggestions(false)}
                      >
                        <div className="w-10 h-10 rounded bg-secondary overflow-hidden flex-shrink-0">
                          {product.productAsset?.preview ? (
                            <Image
                              src={product.productAsset.preview}
                              alt={product.productName}
                              width={40}
                              height={40}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{product.productName}</p>
                          <p className="text-xs text-primary font-semibold">
                            {product.priceWithTax.__typename === 'SinglePrice'
                              ? formatPrice(product.priceWithTax.value)
                              : `${formatPrice(product.priceWithTax.min)} - ${formatPrice(product.priceWithTax.max)}`}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </Link>
                    ))}
                    {suggestions.length > 0 && (
                      <button
                        onClick={() => handleSuggestionClick(searchInput)}
                        className="w-full px-4 py-2 text-sm text-primary hover:bg-muted transition-colors text-left"
                      >
                        Voir tous les resultats pour "{searchInput}"
                      </button>
                    )}
                  </div>
                )}

                {/* Popular Searches */}
                {!state.searchTerm && searchInput.length < 2 && (
                  <div className="py-2">
                    <div className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase flex items-center gap-2">
                      <TrendingUp className="h-3 w-3" />
                      Recherches populaires
                    </div>
                    {POPULAR_SEARCHES.map((term) => (
                      <button
                        key={term}
                        onClick={() => handleSuggestionClick(term)}
                        className="w-full flex items-center gap-3 px-4 py-2 hover:bg-muted transition-colors text-left"
                      >
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{term}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* No Results */}
                {searchInput.length >= 2 && suggestions.length === 0 && !suggestionsLoading && (
                  <div className="p-4 text-center text-muted-foreground">
                    <p className="text-sm">Aucune suggestion pour "{searchInput}"</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Search Results Section */}
        {state.searchTerm && (
          <>
            {/* Results Header */}
            <div className="mb-6">
              <p className="text-muted-foreground">
                {loading ? (
                  <span className="animate-pulse">Recherche en cours...</span>
                ) : (
                  <>
                    <span className="font-semibold text-foreground">{totalItems}</span> resultat
                    {totalItems !== 1 ? 's' : ''} pour "{state.searchTerm}"
                  </>
                )}
              </p>
            </div>

            {/* Active Filters */}
            {activeFiltersCount > 0 && (
              <div className="mb-6">
                <ActiveFilterPills
                  searchTerm={state.searchTerm}
                  facetGroups={facetGroups}
                  selectedFacetValueIds={state.facetValueIds}
                  priceMin={state.priceMin}
                  priceMax={state.priceMax}
                  onClearSearch={() => {
                    setSearchInput('');
                    setSearchTerm('');
                  }}
                  onRemoveFacetValue={toggleFacetValue}
                  onClearPrice={() => setPriceRange(undefined, undefined)}
                  onClearAll={clearAllFilters}
                />
              </div>
            )}

            {/* Toolbar */}
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                {/* Mobile Filter Button */}
                <MobileFilterButton
                  onClick={() => setMobileFiltersOpen(true)}
                  activeFiltersCount={activeFiltersCount}
                />
              </div>

              <div className="flex items-center gap-3">
                {/* Sort Dropdown */}
                <SortDropdown
                  currentSortBy={state.sortBy}
                  currentSortOrder={state.sortOrder}
                  onSortChange={setSorting}
                />

                {/* View Mode Toggle */}
                <div className="hidden sm:flex items-center bg-muted rounded-xl p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      'p-2 rounded-lg transition-all',
                      viewMode === 'grid'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
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
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                    aria-label="Vue compacte"
                  >
                    <LayoutGrid className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex gap-8">
              {/* Desktop Sidebar */}
              <aside className="hidden lg:block w-72 flex-shrink-0">
                <FacetedFilterSidebar
                  facetGroups={facetGroups}
                  state={state}
                  onToggleFacetValue={toggleFacetValue}
                  onClearFacetGroup={clearFacetGroup}
                  onPriceChange={setPriceRange}
                  onClearAll={clearAllFilters}
                  loading={facetsLoading}
                />
              </aside>

              {/* Products */}
              <div className="flex-1">
                {loading ? (
                  <div
                    className={cn(
                      viewMode === 'grid'
                        ? 'grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6'
                        : 'space-y-4'
                    )}
                  >
                    {Array.from({ length: 9 }).map((_, i) => (
                      <div key={i} className="rounded-xl border bg-card overflow-hidden">
                        <Skeleton className="aspect-square" />
                        <div className="p-4">
                          <Skeleton className="h-5 w-3/4 mb-2" />
                          <Skeleton className="h-6 w-1/3" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : products.length === 0 ? (
                  <div className="bg-card rounded-xl border border-border p-12 text-center">
                    <Package className="h-20 w-20 mx-auto text-muted-foreground/50 mb-6" />
                    <h3 className="text-xl font-semibold mb-2">Aucun resultat</h3>
                    <p className="text-muted-foreground mb-6">
                      Aucun produit ne correspond a votre recherche "{state.searchTerm}"
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      {activeFiltersCount > 0 && (
                        <Button variant="outline" onClick={clearAllFilters}>
                          Effacer les filtres
                        </Button>
                      )}
                      <Button
                        onClick={() => {
                          setSearchInput('');
                          setSearchTerm('');
                        }}
                      >
                        Nouvelle recherche
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div
                      className={cn(
                        viewMode === 'grid'
                          ? 'grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6'
                          : 'space-y-4'
                      )}
                    >
                      {products.map((product) => {
                        const price =
                          product.priceWithTax.__typename === 'SinglePrice'
                            ? product.priceWithTax.value
                            : product.priceWithTax.min;

                        return (
                          <Link
                            key={product.productId}
                            href={`/${locale}/products/${product.slug}`}
                            className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all"
                          >
                            <div className="aspect-square relative bg-muted">
                              {product.productAsset?.preview ? (
                                <Image
                                  src={product.productAsset.preview}
                                  alt={product.productName}
                                  fill
                                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                                  sizes="(max-width: 768px) 50vw, 33vw"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="h-12 w-12 text-muted-foreground/50" />
                                </div>
                              )}

                              {!product.inStock && (
                                <div className="absolute top-2 left-2 bg-foreground text-background text-xs font-medium px-2 py-1 rounded">
                                  Rupture
                                </div>
                              )}
                            </div>

                            <div className="p-4">
                              <h3 className="font-medium line-clamp-2 group-hover:text-primary transition-colors mb-2">
                                {product.productName}
                              </h3>
                              <span className="text-lg font-bold text-primary">
                                {formatPrice(price, product.currencyCode)}
                              </span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>

                    {/* Pagination */}
                    {totalItems > state.perPage && (
                      <div className="mt-8">
                        <Pagination
                          currentPage={state.page}
                          totalPages={Math.ceil(totalItems / state.perPage)}
                          onPageChange={setPage}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </>
        )}

        {/* Empty State - No Search */}
        {!state.searchTerm && (
          <div className="text-center py-12">
            <Search className="h-20 w-20 mx-auto text-muted-foreground/30 mb-6" />
            <h2 className="text-2xl font-semibold mb-2">Trouvez ce que vous cherchez</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Utilisez la barre de recherche ci-dessus pour decouvrir nos produits
            </p>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-4">
                Recherches populaires
              </h3>
              <div className="flex flex-wrap justify-center gap-2">
                {POPULAR_SEARCHES.map((term) => (
                  <button
                    key={term}
                    onClick={() => handleSuggestionClick(term)}
                    className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-full text-sm font-medium transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Filter Drawer */}
      <MobileFilterDrawer
        isOpen={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
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
