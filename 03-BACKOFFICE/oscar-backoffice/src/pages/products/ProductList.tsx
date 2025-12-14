import React, { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useNavigate, Link } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import {
  Package,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Plus,
  Edit3,
  Trash2,
  Info,
  Grid3X3,
  List,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { addToast } from '../../store/slices/uiSlice';
import { AdminProductsDocument, DeleteProductDocument } from '../../graphql/generated/graphql';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Tooltip, ProductTooltipContent } from '../../components/ui/Tooltip';
import { formatDate } from '../../lib/utils';
import { useProductFilters } from '../../hooks/useProductFilters';
import { useFacetedFilters } from '../../hooks/useFacetedFilters';
import { FilterPanel } from '../../components/products/FilterPanel';
import { FacetedFilterPanel } from '../../components/products/FacetedFilterPanel';
import { ActiveFilters } from '../../components/products/ActiveFilters';
import { PermissionGate } from '../../components/auth/PermissionGate';
import { usePermissions } from '../../hooks/usePermissions';

type ViewMode = 'table' | 'grid';
type FilterMode = 'basic' | 'faceted';

export const ProductList: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [currentPage, setCurrentPage] = useState(0);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [productToDelete, setProductToDelete] = useState<{ id: string; name: string } | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [filterMode, setFilterMode] = useState<FilterMode>('faceted'); // Default to new faceted mode
  const [isFacetedPanelOpen, setIsFacetedPanelOpen] = useState(false);
  const pageSize = viewMode === 'grid' ? 12 : 10;

  // Basic filter state (old mode)
  const {
    filters,
    updateFilter,
    resetFilters,
    clearFilter,
    activeFilterCount,
    hasActiveFilters,
    isFilterPanelOpen,
    setIsFilterPanelOpen,
  } = useProductFilters();

  // Faceted filter state (new mode)
  const facetedFilters = useFacetedFilters();

  // Determine if we need client-side filtering (faceted mode with advanced filters)
  const needsClientSideFiltering = useMemo(() => {
    if (filterMode !== 'faceted') return false;
    const { facetValueIds, collectionIds, stockStatus, priceMin, priceMax, isFeatured } =
      facetedFilters.state;
    return (
      facetValueIds.length > 0 ||
      collectionIds.length > 0 ||
      stockStatus !== undefined ||
      priceMin !== undefined ||
      priceMax !== undefined ||
      isFeatured !== undefined
    );
  }, [filterMode, facetedFilters.state]);

  // Build GraphQL filter from filter state (server-side filters)
  const graphqlFilter = useMemo(() => {
    const filter: Record<string, unknown> = {};

    // Use faceted filters when in faceted mode
    const searchTerm = filterMode === 'faceted' ? facetedFilters.state.searchTerm : filters.search;
    const enabledFilter = filterMode === 'faceted' ? facetedFilters.state.enabled : filters.enabled;

    if (searchTerm) {
      filter.name = { contains: searchTerm };
    }

    if (enabledFilter !== undefined) {
      filter.enabled = { eq: enabledFilter };
    }

    return Object.keys(filter).length > 0 ? filter : undefined;
  }, [
    filterMode,
    filters.search,
    filters.enabled,
    facetedFilters.state.searchTerm,
    facetedFilters.state.enabled,
  ]);

  // When client-side filtering is needed, fetch more products
  const fetchSize = needsClientSideFiltering ? 200 : pageSize;

  // Use server-side pagination (or fetch more for client-side filtering)
  const { data, loading, error } = useQuery(AdminProductsDocument, {
    variables: {
      options: {
        skip: needsClientSideFiltering ? 0 : currentPage * pageSize,
        take: fetchSize,
        filter: graphqlFilter,
        sort: { createdAt: 'DESC' as any },
      },
    },
  });

  // Apply client-side filters when in faceted mode
  const filteredProducts = useMemo(() => {
    let result = data?.products?.items || [];

    if (filterMode !== 'faceted' || !needsClientSideFiltering) {
      return result;
    }

    const { facetValueIds, collectionIds, stockStatus, priceMin, priceMax, isFeatured } =
      facetedFilters.state;

    // Filter by facet values (product or any of its variants must have at least one of the selected facet values)
    if (facetValueIds.length > 0) {
      result = result.filter((p: any) => {
        // Check product-level facet values
        const productHasFacet = p.facetValues?.some((fv: any) => facetValueIds.includes(fv.id));
        if (productHasFacet) return true;

        // Check variant-level facet values
        const variantHasFacet = p.variants?.some((v: any) =>
          v.facetValues?.some((fv: any) => facetValueIds.includes(fv.id))
        );
        return variantHasFacet;
      });
    }

    // Filter by collections
    if (collectionIds.length > 0) {
      result = result.filter((p: any) =>
        p.collections?.some((col: any) => collectionIds.includes(col.id))
      );
    }

    // Filter by featured
    if (isFeatured !== undefined) {
      result = result.filter((p: any) => p.customFields?.isFeatured === isFeatured);
    }

    // Filter by stock status
    if (stockStatus) {
      result = result.filter((p: any) => {
        const totalStock =
          p.variants?.reduce((sum: number, v: any) => sum + (v.stockOnHand || 0), 0) || 0;
        switch (stockStatus) {
          case 'in_stock':
            return totalStock > 10;
          case 'low_stock':
            return totalStock > 0 && totalStock <= 10;
          case 'out_of_stock':
            return totalStock === 0;
          default:
            return true;
        }
      });
    }

    // Filter by price range
    if (priceMin !== undefined || priceMax !== undefined) {
      result = result.filter((p: any) => {
        const minVariantPrice = p.variants?.length
          ? Math.min(...p.variants.map((v: any) => v.price || 0))
          : 0;
        const priceInCents = minVariantPrice;
        if (priceMin !== undefined && priceInCents < priceMin * 100) return false;
        if (priceMax !== undefined && priceInCents > priceMax * 100) return false;
        return true;
      });
    }

    return result;
  }, [data, filterMode, needsClientSideFiltering, facetedFilters.state]);

  // Calculate pagination based on filtered results
  const totalItems = needsClientSideFiltering
    ? filteredProducts.length
    : data?.products?.totalItems || 0;
  const totalPages = Math.ceil(totalItems / pageSize);

  // Paginate filtered results client-side when using client-side filtering
  const paginatedProducts = useMemo(() => {
    if (!needsClientSideFiltering) {
      return filteredProducts;
    }
    const start = currentPage * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, needsClientSideFiltering, currentPage, pageSize]);

  // Get unique collections from products for filter dropdown
  const collections = useMemo(() => {
    const collectionsMap = new Map<string, { id: string; name: string; slug: string }>();
    data?.products?.items?.forEach((product: any) => {
      product.collections?.forEach((col: any) => {
        if (!collectionsMap.has(col.id)) {
          collectionsMap.set(col.id, { id: col.id, name: col.name, slug: col.slug });
        }
      });
    });
    return Array.from(collectionsMap.values());
  }, [data]);

  const [deleteProduct, { loading: deleting }] = useMutation(DeleteProductDocument, {
    refetchQueries: [{ query: AdminProductsDocument }],
  });

  // Products to display (either paginated from API or client-side filtered)
  const products = paginatedProducts;

  const handleDeleteClick = (product: { id: string; name: string }) => {
    setProductToDelete(product);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    try {
      const result = await deleteProduct({ variables: { id: productToDelete.id } });
      if (result.data?.deleteProduct?.result === 'DELETED') {
        dispatch(addToast({ message: 'Produit supprimé avec succès!', type: 'success' }));
      } else {
        dispatch(
          addToast({
            message: result.data?.deleteProduct?.message || 'Erreur lors de la suppression',
            type: 'error',
          })
        );
      }
    } catch (err: any) {
      dispatch(
        addToast({ message: err.message || 'Erreur lors de la suppression', type: 'error' })
      );
    }
    setShowDeleteDialog(false);
    setProductToDelete(null);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0,
    }).format(price / 100);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <p className="text-red-500 text-lg">Erreur: {error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Produits</h1>
          <p className="text-muted-foreground mt-1">
            {totalItems} produit{totalItems > 1 ? 's' : ''} au total
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Filter Mode Toggle */}
          <div className="flex items-center bg-muted rounded-lg p-1" title="Mode de filtrage">
            <button
              onClick={() => setFilterMode('basic')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                filterMode === 'basic'
                  ? 'bg-card text-primary shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Basique
            </button>
            <button
              onClick={() => setFilterMode('faceted')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                filterMode === 'faceted'
                  ? 'bg-card text-primary shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Sparkles className="h-4 w-4" />
              Avancé
            </button>
          </div>
          {/* View Mode Toggle */}
          <div className="flex items-center bg-muted rounded-lg p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'table'
                  ? 'bg-card text-primary shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Vue tableau"
            >
              <List className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-card text-primary shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Vue grille"
            >
              <Grid3X3 className="h-5 w-5" />
            </button>
          </div>
          <PermissionGate permission="CreateCatalog" disableMode>
            <Link
              to="/products/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Nouveau produit
            </Link>
          </PermissionGate>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-card rounded-lg shadow p-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher un produit par nom, SKU..."
              value={filterMode === 'faceted' ? facetedFilters.state.searchTerm : filters.search}
              onChange={(e) => {
                if (filterMode === 'faceted') {
                  facetedFilters.setSearchTerm(e.target.value);
                } else {
                  updateFilter('search', e.target.value);
                }
                setCurrentPage(0);
              }}
              className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none"
            />
          </div>
          <button
            onClick={() => {
              if (filterMode === 'faceted') {
                setIsFacetedPanelOpen(true);
              } else {
                setIsFilterPanelOpen(true);
              }
            }}
            className={`flex items-center gap-2 px-4 py-3 border rounded-lg transition-colors relative ${
              (filterMode === 'faceted' ? facetedFilters.activeFilterCount : activeFilterCount) > 0
                ? 'border-primary text-primary bg-primary/10 hover:bg-primary/20'
                : 'border-border text-muted-foreground hover:bg-accent'
            }`}
          >
            {filterMode === 'faceted' ? (
              <Sparkles className="h-5 w-5" />
            ) : (
              <SlidersHorizontal className="h-5 w-5" />
            )}
            Filtres
            {(filterMode === 'faceted' ? facetedFilters.activeFilterCount : activeFilterCount) >
              0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                {filterMode === 'faceted' ? facetedFilters.activeFilterCount : activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Active Filters Display - Basic Mode */}
        {filterMode === 'basic' && hasActiveFilters && (
          <div className="mt-3 pt-3 border-t border-border">
            <ActiveFilters
              filters={filters}
              onClearFilter={clearFilter}
              onClearAll={resetFilters}
              collections={collections}
            />
          </div>
        )}

        {/* Active Filters Display - Faceted Mode */}
        {filterMode === 'faceted' && facetedFilters.activeFilterCount > 0 && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">Filtres actifs:</span>

              {/* Search term */}
              {facetedFilters.state.searchTerm && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-900/50 text-blue-300 rounded-full text-sm">
                  Recherche: "{facetedFilters.state.searchTerm}"
                  <button
                    onClick={() => facetedFilters.setSearchTerm('')}
                    className="hover:bg-blue-800 rounded-full p-0.5"
                  >
                    ×
                  </button>
                </span>
              )}

              {/* Enabled status */}
              {facetedFilters.state.enabled !== undefined && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-900/50 text-green-300 rounded-full text-sm">
                  {facetedFilters.state.enabled ? 'Actifs' : 'Inactifs'}
                  <button
                    onClick={() => facetedFilters.setEnabled(undefined)}
                    className="hover:bg-green-800 rounded-full p-0.5"
                  >
                    ×
                  </button>
                </span>
              )}

              {/* Featured */}
              {facetedFilters.state.isFeatured !== undefined && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-900/50 text-purple-300 rounded-full text-sm">
                  {facetedFilters.state.isFeatured ? 'Vedettes' : 'Non vedettes'}
                  <button
                    onClick={() => facetedFilters.setFeatured(undefined)}
                    className="hover:bg-purple-800 rounded-full p-0.5"
                  >
                    ×
                  </button>
                </span>
              )}

              {/* Stock status */}
              {facetedFilters.state.stockStatus && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-900/50 text-orange-300 rounded-full text-sm">
                  {facetedFilters.state.stockStatus === 'in_stock' && 'En stock'}
                  {facetedFilters.state.stockStatus === 'low_stock' && 'Stock bas'}
                  {facetedFilters.state.stockStatus === 'out_of_stock' && 'Rupture'}
                  <button
                    onClick={() => facetedFilters.setStockStatus(undefined)}
                    className="hover:bg-orange-800 rounded-full p-0.5"
                  >
                    ×
                  </button>
                </span>
              )}

              {/* Facet values */}
              {facetedFilters.state.facetValueIds.length > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-900/50 text-indigo-300 rounded-full text-sm">
                  {facetedFilters.state.facetValueIds.length} attribut(s)
                  <button
                    onClick={() => facetedFilters.setFacetValues([])}
                    className="hover:bg-indigo-800 rounded-full p-0.5"
                  >
                    ×
                  </button>
                </span>
              )}

              {/* Clear all button */}
              <button
                onClick={() => facetedFilters.clearAllFilters()}
                className="text-sm text-red-600 hover:text-red-700 hover:underline ml-2"
              >
                Tout effacer
              </button>
            </div>
          </div>
        )}

        <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
          <Info className="h-4 w-4" />
          <span>Survolez un produit pour voir tous ses détails</span>
        </div>
      </div>

      {/* Products View */}
      <div className="bg-card rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <svg
                className="animate-spin h-6 w-6 text-primary"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span className="text-muted-foreground">Chargement...</span>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Package className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg">Aucun produit trouvé</p>
            {(filterMode === 'basic' ? hasActiveFilters : facetedFilters.activeFilterCount > 0) && (
              <button
                onClick={() => {
                  if (filterMode === 'faceted') {
                    facetedFilters.clearAllFilters();
                  } else {
                    resetFilters();
                  }
                  setCurrentPage(0);
                }}
                className="mt-4 text-blue-600 hover:text-blue-700"
              >
                Effacer tous les filtres
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => {
                const mainVariant = product.variants?.[0];
                const totalStock =
                  product.variants?.reduce((sum, v) => sum + (v.stockOnHand || 0), 0) || 0;

                return (
                  <Tooltip
                    key={product.id}
                    position="right"
                    delay={300}
                    maxWidth="780px"
                    content={
                      <ProductTooltipContent
                        product={product as any}
                        formatPrice={formatPrice}
                        formatDate={formatDate}
                      />
                    }
                  >
                    <div className="bg-accent/50 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 border border-border hover:border-primary group">
                      {/* Image */}
                      <div className="aspect-[4/3] relative bg-muted">
                        {product.featuredAsset?.preview ? (
                          <img
                            src={product.featuredAsset.preview}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-10 w-10 text-muted-foreground" />
                          </div>
                        )}
                        {/* Status Badges */}
                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              product.enabled
                                ? 'bg-green-900/50 text-green-300'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {product.enabled ? 'Actif' : 'Inactif'}
                          </span>
                          {product.customFields?.isFeatured && (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-900/50 text-blue-300">
                              Vedette
                            </span>
                          )}
                        </div>
                        {/* Quick Actions */}
                        <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => navigate(`/products/${product.id}`)}
                            className="p-2 bg-white rounded-full shadow hover:bg-blue-50 text-blue-600"
                            title="Voir"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <PermissionGate permission="UpdateCatalog" disableMode>
                            <button
                              onClick={() => navigate(`/products/${product.id}/edit`)}
                              className="p-2 bg-white rounded-full shadow hover:bg-green-50 text-green-600"
                              title="Modifier"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                          </PermissionGate>
                        </div>
                      </div>
                      {/* Content */}
                      <div className="p-4">
                        <h3 className="font-medium text-foreground truncate mb-1">
                          {product.name}
                        </h3>
                        <p className="text-sm text-muted-foreground truncate mb-2">
                          {mainVariant?.sku || product.slug}
                        </p>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-lg font-bold text-foreground">
                              {mainVariant?.price ? formatPrice(mainVariant.price) : '-'}
                            </span>
                            {product.customFields?.salePrice && (
                              <span className="ml-2 text-sm text-green-600">
                                {formatPrice(product.customFields.salePrice)}
                              </span>
                            )}
                          </div>
                          <span
                            className={`text-sm font-medium px-2 py-1 rounded ${
                              totalStock > 10
                                ? 'bg-green-900/50 text-green-300'
                                : totalStock > 0
                                  ? 'bg-orange-900/50 text-orange-300'
                                  : 'bg-red-900/50 text-red-300'
                            }`}
                          >
                            {totalStock} en stock
                          </span>
                        </div>
                      </div>
                    </div>
                  </Tooltip>
                );
              })}
            </div>
          </div>
        ) : (
          /* Table View */
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-border table-fixed">
              <thead className="bg-background/50">
                <tr>
                  <th className="w-[22%] px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Produit
                  </th>
                  <th className="w-[16%] px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Traductions
                  </th>
                  <th className="w-[14%] px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    SKU / Variantes
                  </th>
                  <th className="w-[12%] px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Prix
                  </th>
                  <th className="w-[12%] px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="w-[12%] px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="w-[12%] px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {products.map((product) => {
                  const mainVariant = product.variants?.[0];
                  const totalStock =
                    product.variants?.reduce((sum, v) => sum + (v.stockOnHand || 0), 0) || 0;
                  const variantCount = product.variants?.length || 0;

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-primary/10 cursor-pointer transition-colors group"
                      onClick={() => navigate(`/products/${product.id}`)}
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Tooltip
                          position="right"
                          delay={400}
                          maxWidth="780px"
                          interactive
                          display="block"
                          content={
                            <ProductTooltipContent
                              product={product as any}
                              formatPrice={formatPrice}
                              formatDate={formatDate}
                            />
                          }
                        >
                          <div className="flex items-center w-full">
                            {product.featuredAsset?.preview ? (
                              <img
                                src={product.featuredAsset.preview}
                                alt={product.name}
                                className="h-12 w-12 rounded-lg object-cover border border-border"
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                                <Package className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                            <div className="ml-4">
                              <div className="text-sm font-medium text-foreground max-w-[200px] truncate">
                                {product.name}
                              </div>
                              <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                                {product.slug}
                              </div>
                            </div>
                          </div>
                        </Tooltip>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="space-y-1">
                          {product.customFields?.nameFr ? (
                            <div className="text-sm text-foreground truncate max-w-[150px]">
                              <span className="text-muted-foreground text-xs mr-1">FR</span>
                              {product.customFields.nameFr}
                            </div>
                          ) : (
                            <div className="text-sm text-muted-foreground">-</div>
                          )}
                          {product.customFields?.nameAr && (
                            <div
                              className="text-sm text-muted-foreground truncate max-w-[150px]"
                              dir="rtl"
                            >
                              <span className="text-muted-foreground text-xs ml-1">AR</span>
                              {product.customFields.nameAr}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-mono text-foreground">
                          {mainVariant?.sku || '-'}
                        </div>
                        {variantCount > 1 && (
                          <div className="text-xs text-primary mt-0.5">
                            +{variantCount - 1} variantes
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-semibold text-foreground">
                          {mainVariant?.price ? formatPrice(mainVariant.price) : '-'}
                        </div>
                        {product.customFields?.salePrice && (
                          <div className="text-xs text-green-600 font-medium">
                            Promo: {formatPrice(product.customFields.salePrice)}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium ${
                              totalStock > 10
                                ? 'bg-green-900/50 text-green-300'
                                : totalStock > 0
                                  ? 'bg-orange-900/50 text-orange-300'
                                  : 'bg-red-900/50 text-red-300'
                            }`}
                          >
                            {totalStock}
                          </span>
                          {totalStock <= 5 && totalStock > 0 && (
                            <span className="text-xs text-orange-600">Stock bas</span>
                          )}
                          {totalStock === 0 && (
                            <span className="text-xs text-red-600">Rupture</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              product.enabled
                                ? 'bg-green-900/50 text-green-300'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {product.enabled ? 'Actif' : 'Inactif'}
                          </span>
                          {product.customFields?.isFeatured && (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-900/50 text-blue-300">
                              Vedette
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/products/${product.id}`);
                            }}
                            className="text-primary hover:text-primary/80 p-2 rounded-lg hover:bg-primary/10"
                            title="Voir les details"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          <PermissionGate permission="UpdateCatalog" disableMode>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/products/${product.id}/edit`);
                              }}
                              className="text-success hover:text-success/80 p-2 rounded-lg hover:bg-success/20"
                              title="Modifier"
                            >
                              <Edit3 className="h-5 w-5" />
                            </button>
                          </PermissionGate>
                          <PermissionGate permission="DeleteCatalog" disableMode>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick({ id: product.id, name: product.name });
                              }}
                              className="text-destructive hover:text-destructive/80 p-2 rounded-lg hover:bg-destructive/20"
                              title="Supprimer"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </PermissionGate>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-background/50 px-6 py-4 flex items-center justify-between border-t border-border">
                <div className="text-sm text-muted-foreground">
                  Page {currentPage + 1} sur {totalPages} ({totalItems} produits)
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                    disabled={currentPage === 0}
                    className="px-3 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Précédent
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={currentPage >= totalPages - 1}
                    className="px-3 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    Suivant
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Grid Pagination */}
        {viewMode === 'grid' && totalPages > 1 && (
          <div className="bg-background/50 px-6 py-4 flex items-center justify-between border-t border-border">
            <div className="text-sm text-muted-foreground">
              Page {currentPage + 1} sur {totalPages} ({totalItems} produits)
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                className="px-3 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Précédent
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage >= totalPages - 1}
                className="px-3 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                Suivant
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setProductToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Supprimer le produit"
        message={`Êtes-vous sûr de vouloir supprimer "${productToDelete?.name}"? Cette action est irréversible.`}
        confirmText="Supprimer"
        variant="danger"
        loading={deleting}
      />

      {/* Basic Filter Panel */}
      <FilterPanel
        isOpen={isFilterPanelOpen}
        onClose={() => setIsFilterPanelOpen(false)}
        filters={filters}
        onFilterChange={updateFilter}
        onReset={resetFilters}
        collections={collections}
      />

      {/* Faceted Filter Panel */}
      <AnimatePresence>
        {isFacetedPanelOpen && (
          <FacetedFilterPanel
            isOpen={isFacetedPanelOpen}
            onClose={() => setIsFacetedPanelOpen(false)}
            state={facetedFilters.state}
            facetGroups={facetedFilters.facetGroups}
            collections={facetedFilters.collections}
            loading={facetedFilters.loading}
            onToggleFacetValue={facetedFilters.toggleFacetValue}
            onClearFacetGroup={facetedFilters.clearFacetGroup}
            onSetCollectionIds={facetedFilters.setCollectionIds}
            onSetEnabled={facetedFilters.setEnabled}
            onSetFeatured={facetedFilters.setFeatured}
            onSetStockStatus={facetedFilters.setStockStatus}
            onPriceChange={facetedFilters.setPriceRange}
            onClearAll={facetedFilters.clearAllFilters}
            activeFilterCount={facetedFilters.activeFilterCount}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
