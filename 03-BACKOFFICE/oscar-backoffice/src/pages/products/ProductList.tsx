import React, { useState, useMemo } from 'react';
import { useMutation } from '@apollo/client';
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
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { addToast } from '../../store/slices/uiSlice';
import { DeleteProductDocument, AdminSearchProductsDocument } from '../../graphql/generated/graphql';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { formatDate } from '../../lib/utils';
import { useUnifiedSearch, type SortByField } from '../../hooks/useUnifiedSearch';
import { FilterPanel } from '../../components/products/FilterPanel';
import { FacetedFilterPanel } from '../../components/products/FacetedFilterPanel';
import { PermissionGate } from '../../components/auth/PermissionGate';

type ViewMode = 'table' | 'grid';
type FilterMode = 'basic' | 'faceted';

// Sort options for the dropdown
const SORT_OPTIONS: Array<{ value: SortByField; label: string }> = [
  { value: 'createdAt', label: 'Date de creation' },
  { value: 'name', label: 'Nom' },
  { value: 'price', label: 'Prix' },
];

export const ProductList: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [productToDelete, setProductToDelete] = useState<{ id: string; name: string } | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [filterMode, setFilterMode] = useState<FilterMode>('faceted');
  const [isFacetedPanelOpen, setIsFacetedPanelOpen] = useState(false);
  const [isBasicPanelOpen, setIsBasicPanelOpen] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);

  // Use the unified search hook for all filtering and search
  const search = useUnifiedSearch();

  // Calculate page size based on view mode
  const pageSize = viewMode === 'grid' ? 12 : 10;

  // Calculate total pages
  const totalPages = Math.ceil(search.totalItems / pageSize);

  // Delete mutation
  const [deleteProduct, { loading: deleting }] = useMutation(DeleteProductDocument, {
    refetchQueries: [{ query: AdminSearchProductsDocument }],
  });

  const handleDeleteClick = (product: { id: string; name: string }) => {
    setProductToDelete(product);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    try {
      const result = await deleteProduct({ variables: { id: productToDelete.id } });
      if (result.data?.deleteProduct?.result === 'DELETED') {
        dispatch(addToast({ message: 'Produit supprime avec succes!', type: 'success' }));
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

  const formatPrice = (price: number | { min: number; max: number }) => {
    const value = typeof price === 'number' ? price : price.min;
    return new Intl.NumberFormat('fr-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0,
    }).format(value / 100);
  };

  // Build filters object for basic filter panel compatibility
  const basicFilters = useMemo(() => ({
    search: search.state.term,
    enabled: search.state.enabled,
    isFeatured: search.state.isFeatured,
    categoryIds: search.state.collectionId ? [search.state.collectionId] : [],
    minPrice: search.state.priceMin ? search.state.priceMin / 100 : undefined,
    maxPrice: search.state.priceMax ? search.state.priceMax / 100 : undefined,
    sizes: [] as string[],
    colors: [] as string[],
    stockStatus: search.state.stockStatus,
  }), [search.state]);

  // Handler for basic filter changes
  const handleBasicFilterChange = <K extends keyof typeof basicFilters>(
    key: K,
    value: (typeof basicFilters)[K]
  ) => {
    switch (key) {
      case 'search':
        search.setTerm(value as string);
        break;
      case 'enabled':
        search.setEnabled(value as boolean | undefined);
        break;
      case 'isFeatured':
        search.setFeatured(value as boolean | undefined);
        break;
      case 'categoryIds':
        const ids = value as string[];
        search.setCollectionId(ids.length > 0 ? ids[0] : undefined);
        break;
      case 'minPrice':
        search.setPriceRange(
          value !== undefined ? (value as number) * 100 : undefined,
          search.state.priceMax
        );
        break;
      case 'maxPrice':
        search.setPriceRange(
          search.state.priceMin,
          value !== undefined ? (value as number) * 100 : undefined
        );
        break;
      case 'stockStatus':
        search.setStockStatus(value as typeof search.state.stockStatus);
        break;
    }
  };

  // Collections for filter panel
  const collections = useMemo(() => {
    return search.collections.map(c => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
    }));
  }, [search.collections]);

  // Handle sort change
  const handleSortChange = (sortBy: SortByField) => {
    if (search.state.sortBy === sortBy) {
      // Toggle sort order if same field
      search.setSorting(sortBy, search.state.sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      // Default to ASC for new field (except createdAt which defaults to DESC)
      search.setSorting(sortBy, sortBy === 'createdAt' ? 'DESC' : 'ASC');
    }
    setShowSortMenu(false);
  };

  if (search.error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <p className="text-red-500 text-lg">Erreur: {search.error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Reessayer
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
            {search.totalItems} produit{search.totalItems > 1 ? 's' : ''} au total
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Sort Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowUpDown className="h-4 w-4" />
              Trier
              {search.state.sortOrder === 'ASC' ? (
                <ArrowUp className="h-3 w-3" />
              ) : (
                <ArrowDown className="h-3 w-3" />
              )}
            </button>
            {showSortMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowSortMenu(false)}
                />
                <div className="absolute right-0 mt-1 w-48 bg-card border border-border rounded-lg shadow-lg z-20">
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleSortChange(option.value)}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-accent transition-colors first:rounded-t-lg last:rounded-b-lg flex items-center justify-between ${
                        search.state.sortBy === option.value
                          ? 'text-primary font-medium'
                          : 'text-foreground'
                      }`}
                    >
                      {option.label}
                      {search.state.sortBy === option.value && (
                        search.state.sortOrder === 'ASC' ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : (
                          <ArrowDown className="h-3 w-3" />
                        )
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

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
              Avance
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
              value={search.state.term}
              onChange={(e) => search.setTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none"
            />
          </div>
          <button
            onClick={() => {
              if (filterMode === 'faceted') {
                setIsFacetedPanelOpen(true);
              } else {
                setIsBasicPanelOpen(true);
              }
            }}
            className={`flex items-center gap-2 px-4 py-3 border rounded-lg transition-colors relative ${
              search.activeFilterCount > 0
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
            {search.activeFilterCount > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                {search.activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Active Filters Display */}
        {search.activeFilterCount > 0 && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">Filtres actifs:</span>

              {/* Search term */}
              {search.state.term && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-900/50 text-blue-300 rounded-full text-sm">
                  Recherche: "{search.state.term}"
                  <button
                    onClick={() => search.setTerm('')}
                    className="hover:bg-blue-800 rounded-full p-0.5"
                  >
                    x
                  </button>
                </span>
              )}

              {/* Enabled status */}
              {search.state.enabled !== undefined && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-900/50 text-green-300 rounded-full text-sm">
                  {search.state.enabled ? 'Actifs' : 'Inactifs'}
                  <button
                    onClick={() => search.setEnabled(undefined)}
                    className="hover:bg-green-800 rounded-full p-0.5"
                  >
                    x
                  </button>
                </span>
              )}

              {/* Featured */}
              {search.state.isFeatured !== undefined && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-900/50 text-purple-300 rounded-full text-sm">
                  {search.state.isFeatured ? 'Vedettes' : 'Non vedettes'}
                  <button
                    onClick={() => search.setFeatured(undefined)}
                    className="hover:bg-purple-800 rounded-full p-0.5"
                  >
                    x
                  </button>
                </span>
              )}

              {/* Stock status */}
              {search.state.stockStatus !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-900/50 text-orange-300 rounded-full text-sm">
                  {search.state.stockStatus === 'in_stock' && 'En stock'}
                  {search.state.stockStatus === 'low_stock' && 'Stock bas'}
                  {search.state.stockStatus === 'out_of_stock' && 'Rupture'}
                  <button
                    onClick={() => search.setStockStatus('all')}
                    className="hover:bg-orange-800 rounded-full p-0.5"
                  >
                    x
                  </button>
                </span>
              )}

              {/* Price range */}
              {(search.state.priceMin !== undefined || search.state.priceMax !== undefined) && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-900/50 text-yellow-300 rounded-full text-sm">
                  Prix: {search.state.priceMin ? `${search.state.priceMin / 100} DA` : '0'} - {search.state.priceMax ? `${search.state.priceMax / 100} DA` : '...'}
                  <button
                    onClick={() => search.setPriceRange(undefined, undefined)}
                    className="hover:bg-yellow-800 rounded-full p-0.5"
                  >
                    x
                  </button>
                </span>
              )}

              {/* Collection */}
              {search.state.collectionId && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-cyan-900/50 text-cyan-300 rounded-full text-sm">
                  Categorie
                  <button
                    onClick={() => search.setCollectionId(undefined)}
                    className="hover:bg-cyan-800 rounded-full p-0.5"
                  >
                    x
                  </button>
                </span>
              )}

              {/* Facet values */}
              {search.state.facetValueIds.length > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-900/50 text-indigo-300 rounded-full text-sm">
                  {search.state.facetValueIds.length} attribut(s)
                  <button
                    onClick={() => search.setFacetValues([])}
                    className="hover:bg-indigo-800 rounded-full p-0.5"
                  >
                    x
                  </button>
                </span>
              )}

              {/* Clear all button */}
              <button
                onClick={() => search.clearAllFilters()}
                className="text-sm text-red-600 hover:text-red-700 hover:underline ml-2"
              >
                Tout effacer
              </button>
            </div>
          </div>
        )}

        <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
          <Info className="h-4 w-4" />
          <span>La recherche inclut le nom du produit et le SKU</span>
        </div>
      </div>

      {/* Products View */}
      <div className="bg-card rounded-lg shadow overflow-hidden">
        {search.loading ? (
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
        ) : search.results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Package className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg">Aucun produit trouve</p>
            {search.activeFilterCount > 0 && (
              <button
                onClick={() => search.clearAllFilters()}
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
              {search.results.map((result) => (
                <div
                  key={`${result.productId}-${result.productVariantId}`}
                  className="bg-accent/50 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 border border-border hover:border-primary group cursor-pointer"
                  onClick={() => navigate(`/products/${result.productId}`)}
                >
                  {/* Image */}
                  <div className="aspect-[4/3] relative bg-muted">
                    {result.productAsset?.preview ? (
                      <img
                        src={result.productAsset.preview}
                        alt={result.productName}
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
                          result.enabled
                            ? 'bg-green-900/50 text-green-300'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {result.enabled ? 'Actif' : 'Inactif'}
                      </span>
                      {result.inStock && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-900/50 text-blue-300">
                          En stock
                        </span>
                      )}
                    </div>
                    {/* Quick Actions */}
                    <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/products/${result.productId}`);
                        }}
                        className="p-2 bg-white rounded-full shadow hover:bg-blue-50 text-blue-600"
                        title="Voir"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <PermissionGate permission="UpdateCatalog" disableMode>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/products/${result.productId}/edit`);
                          }}
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
                      {result.productName}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate mb-2">
                      {result.sku || result.slug}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-foreground">
                        {formatPrice(result.price)}
                      </span>
                      <span
                        className={`text-sm font-medium px-2 py-1 rounded ${
                          result.inStock
                            ? 'bg-green-900/50 text-green-300'
                            : 'bg-red-900/50 text-red-300'
                        }`}
                      >
                        {result.inStock ? 'En stock' : 'Rupture'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Table View */
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-border table-fixed">
              <thead className="bg-background/50">
                <tr>
                  <th className="w-[25%] px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Produit
                  </th>
                  <th className="w-[15%] px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="w-[15%] px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Prix
                  </th>
                  <th className="w-[15%] px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="w-[15%] px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="w-[15%] px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {search.results.map((result) => (
                  <tr
                    key={`${result.productId}-${result.productVariantId}`}
                    className="hover:bg-primary/10 cursor-pointer transition-colors group"
                    onClick={() => navigate(`/products/${result.productId}`)}
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center w-full">
                        {result.productAsset?.preview ? (
                          <img
                            src={result.productAsset.preview}
                            alt={result.productName}
                            className="h-12 w-12 rounded-lg object-cover border border-border"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                            <Package className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-foreground max-w-[200px] truncate">
                            {result.productName}
                          </div>
                          <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                            {result.slug}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-mono text-foreground">
                        {result.sku || '-'}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-semibold text-foreground">
                        {formatPrice(result.price)}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium ${
                          result.inStock
                            ? 'bg-green-900/50 text-green-300'
                            : 'bg-red-900/50 text-red-300'
                        }`}
                      >
                        {result.inStock ? 'En stock' : 'Rupture'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          result.enabled
                            ? 'bg-green-900/50 text-green-300'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {result.enabled ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/products/${result.productId}`);
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
                              navigate(`/products/${result.productId}/edit`);
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
                              handleDeleteClick({ id: result.productId, name: result.productName });
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
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-background/50 px-6 py-4 flex items-center justify-between border-t border-border">
                <div className="text-sm text-muted-foreground">
                  Page {search.state.page} sur {totalPages} ({search.totalItems} produits)
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => search.setPage(Math.max(1, search.state.page - 1))}
                    disabled={search.state.page === 1}
                    className="px-3 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Precedent
                  </button>
                  <button
                    onClick={() => search.setPage(Math.min(totalPages, search.state.page + 1))}
                    disabled={search.state.page >= totalPages}
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
              Page {search.state.page} sur {totalPages} ({search.totalItems} produits)
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => search.setPage(Math.max(1, search.state.page - 1))}
                disabled={search.state.page === 1}
                className="px-3 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Precedent
              </button>
              <button
                onClick={() => search.setPage(Math.min(totalPages, search.state.page + 1))}
                disabled={search.state.page >= totalPages}
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
        message={`Etes-vous sur de vouloir supprimer "${productToDelete?.name}"? Cette action est irreversible.`}
        confirmText="Supprimer"
        variant="danger"
        loading={deleting}
      />

      {/* Basic Filter Panel */}
      <FilterPanel
        isOpen={isBasicPanelOpen}
        onClose={() => setIsBasicPanelOpen(false)}
        filters={basicFilters}
        onFilterChange={handleBasicFilterChange}
        onReset={() => search.clearAllFilters()}
        collections={collections}
      />

      {/* Faceted Filter Panel */}
      <AnimatePresence>
        {isFacetedPanelOpen && (
          <FacetedFilterPanel
            isOpen={isFacetedPanelOpen}
            onClose={() => setIsFacetedPanelOpen(false)}
            state={{
              searchTerm: search.state.term,
              facetValueIds: search.state.facetValueIds,
              collectionIds: search.state.collectionId ? [search.state.collectionId] : [],
              enabled: search.state.enabled,
              isFeatured: search.state.isFeatured,
              stockStatus: search.state.stockStatus,
              priceMin: search.state.priceMin,
              priceMax: search.state.priceMax,
              sortBy: search.state.sortBy,
              sortOrder: search.state.sortOrder,
              page: search.state.page,
              perPage: search.state.perPage,
            }}
            facetGroups={search.facetGroups}
            collections={search.collections.map(c => ({ ...c, parentId: undefined }))}
            loading={search.facetsLoading}
            onToggleFacetValue={search.toggleFacetValue}
            onClearFacetGroup={search.clearFacetGroup}
            onSetCollectionIds={(ids) => search.setCollectionId(ids.length > 0 ? ids[0] : undefined)}
            onSetEnabled={search.setEnabled}
            onSetFeatured={search.setFeatured}
            onSetStockStatus={search.setStockStatus}
            onPriceChange={search.setPriceRange}
            onClearAll={search.clearAllFilters}
            activeFilterCount={search.activeFilterCount}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
