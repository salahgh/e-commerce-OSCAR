import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { Plus, Search, Eye, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { formatPrice } from '../../lib/utils';
import {
  ProductsDocument,
  DeleteProductDocument,
  SearchProductsDocument,
  CategoriesDocument,
  ProductsByCategoryDocument,
  ProductsByPriceRangeDocument,
  ProductBySkuDocument,
  FeaturedProductsDocument,
  NewArrivalsDocument,
} from '../../graphql/generated/graphql';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { addToast } from '../../store/slices/uiSlice';
import { Select } from '../../components/ui/Select';

export const ProductList: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [page, setPage] = useState(0);
  const [size] = useState(20);
  const [productToDelete, setProductToDelete] = useState<{ id: number; name: string } | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchType, setSearchType] = useState<'keyword' | 'sku'>('keyword');
  const [productTypeFilter, setProductTypeFilter] = useState<'all' | 'featured' | 'new'>('all');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Fetch categories for filter dropdown
  const { data: categoriesData } = useQuery(CategoriesDocument);

  // Determine which query to use based on filters
  const useSearchQuery = searchKeyword.trim() !== '' && searchType === 'keyword';
  const useSkuQuery = searchKeyword.trim() !== '' && searchType === 'sku';
  const useCategoryQuery = !useSearchQuery && !useSkuQuery && selectedCategory !== '';
  const usePriceQuery = !useSearchQuery && !useSkuQuery && !useCategoryQuery && minPrice !== '' && maxPrice !== '';
  const useFeaturedQuery = !useSearchQuery && !useSkuQuery && !useCategoryQuery && !usePriceQuery && productTypeFilter === 'featured';
  const useNewArrivalsQuery = !useSearchQuery && !useSkuQuery && !useCategoryQuery && !usePriceQuery && productTypeFilter === 'new';

  // Keyword search query
  const { data: searchData, loading: searchLoading, error: searchError } = useQuery(SearchProductsDocument, {
    variables: { keyword: searchKeyword, page, size },
    skip: !useSearchQuery,
  });

  // SKU search query
  const { data: skuData, loading: skuLoading, error: skuError } = useQuery(ProductBySkuDocument, {
    variables: { sku: searchKeyword },
    skip: !useSkuQuery,
  });

  // Category query
  const { data: categoryData, loading: categoryLoading, error: categoryError } = useQuery(ProductsByCategoryDocument, {
    variables: { categoryId: parseInt(selectedCategory), page, size },
    skip: !useCategoryQuery,
  });

  // Price range query
  const { data: priceData, loading: priceLoading, error: priceError } = useQuery(ProductsByPriceRangeDocument, {
    variables: { minPrice: parseFloat(minPrice), maxPrice: parseFloat(maxPrice), page, size },
    skip: !usePriceQuery,
  });

  // Featured products query
  const { data: featuredData, loading: featuredLoading, error: featuredError } = useQuery(FeaturedProductsDocument, {
    skip: !useFeaturedQuery,
  });

  // New arrivals query
  const { data: newArrivalsData, loading: newArrivalsLoading, error: newArrivalsError } = useQuery(NewArrivalsDocument, {
    variables: { page, size },
    skip: !useNewArrivalsQuery,
  });

  // Default query
  const { data: defaultData, loading: defaultLoading, error: defaultError } = useQuery(ProductsDocument, {
    variables: { page, size, sortBy: 'createdAt', sortDirection: 'DESC' },
    skip: useSearchQuery || useSkuQuery || useCategoryQuery || usePriceQuery || useFeaturedQuery || useNewArrivalsQuery,
  });

  // Select the appropriate data based on active query
  let data: any;
  let loading: boolean;
  let error: any;

  if (useSearchQuery) {
    data = searchData?.searchProducts;
    loading = searchLoading;
    error = searchError;
  } else if (useSkuQuery) {
    // SKU search returns single product, wrap in array
    data = skuData?.productBySku ? { content: [skuData.productBySku], totalElements: 1, totalPages: 1 } : { content: [], totalElements: 0, totalPages: 0 };
    loading = skuLoading;
    error = skuError;
  } else if (useCategoryQuery) {
    data = categoryData?.productsByCategory;
    loading = categoryLoading;
    error = categoryError;
  } else if (usePriceQuery) {
    data = priceData?.productsByPriceRange;
    loading = priceLoading;
    error = priceError;
  } else if (useFeaturedQuery) {
    // Featured products returns array, wrap in paginated structure
    data = featuredData?.featuredProducts ? { content: featuredData.featuredProducts, totalElements: featuredData.featuredProducts.length, totalPages: 1 } : { content: [], totalElements: 0, totalPages: 0 };
    loading = featuredLoading;
    error = featuredError;
  } else if (useNewArrivalsQuery) {
    data = newArrivalsData?.newArrivals;
    loading = newArrivalsLoading;
    error = newArrivalsError;
  } else {
    data = defaultData;
    loading = defaultLoading;
    error = defaultError;
  }

  const [deleteProduct, { loading: deleting }] = useMutation(DeleteProductDocument, {
    refetchQueries: [
      { query: ProductsDocument, variables: { page, size, sortBy: 'createdAt', sortDirection: 'DESC' } },
      ...(useSearchQuery ? [{ query: SearchProductsDocument, variables: { keyword: searchKeyword, page, size } }] : []),
      ...(useCategoryQuery ? [{ query: ProductsByCategoryDocument, variables: { categoryId: parseInt(selectedCategory), page, size } }] : []),
    ],
  });

  const handleClearFilters = () => {
    setSearchKeyword('');
    setSearchType('keyword');
    setProductTypeFilter('all');
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    setPage(0);
  };

  const handleDeleteClick = (id: number, name: string) => {
    setProductToDelete({ id, name });
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    try {
      await deleteProduct({
        variables: { id: productToDelete.id },
      });

      dispatch(
        addToast({
          message: 'Produit supprimé avec succès',
          type: 'success',
        })
      );
      setProductToDelete(null);
    } catch (error: any) {
      console.error('Delete product error:', error);
      dispatch(
        addToast({
          message: error.message || 'Erreur lors de la suppression',
          type: 'error',
        })
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Produits</h1>
          <p className="text-gray-600 mt-1">Gérez votre catalogue de produits</p>
        </div>
        <Button onClick={() => navigate('/products/new')} icon={<Plus className="h-5 w-5" />}>
          Nouveau Produit
        </Button>
      </div>

      {/* Product Type Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => { setProductTypeFilter('all'); setPage(0); }}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            productTypeFilter === 'all'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Tous les produits
        </button>
        <button
          onClick={() => { setProductTypeFilter('featured'); setPage(0); }}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            productTypeFilter === 'featured'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Produits vedettes
        </button>
        <button
          onClick={() => { setProductTypeFilter('new'); setPage(0); }}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            productTypeFilter === 'new'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Nouveautés
        </button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="md:col-span-2 flex gap-2">
              <Select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value as 'keyword' | 'sku')}
                options={[
                  { value: 'keyword', label: 'Par mot-clé' },
                  { value: 'sku', label: 'Par SKU' },
                ]}
                className="w-32"
              />
              <Input
                placeholder={searchType === 'sku' ? 'Rechercher par SKU...' : 'Rechercher un produit...'}
                icon={<Search className="h-5 w-5" />}
                value={searchKeyword}
                onChange={(e) => {
                  setSearchKeyword(e.target.value);
                  setPage(0);
                }}
                className="flex-1"
              />
            </div>
            <Select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(0);
              }}
              options={[
                { value: '', label: 'Toutes les catégories' },
                ...(categoriesData?.categories?.map((cat) => ({
                  value: String(cat.id),
                  label: cat.nameFr || '',
                })) || []),
              ]}
            />
            <Input
              type="number"
              placeholder="Prix min (DZD)"
              value={minPrice}
              onChange={(e) => {
                setMinPrice(e.target.value);
                setPage(0);
              }}
            />
            <Input
              type="number"
              placeholder="Prix max (DZD)"
              value={maxPrice}
              onChange={(e) => {
                setMaxPrice(e.target.value);
                setPage(0);
              }}
            />
            <Button variant="outline" onClick={handleClearFilters}>
              Réinitialiser
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {loading ? 'Chargement...' : error ? 'Erreur' : `${data?.totalElements || data?.products?.totalElements || 0} produits`}
            {searchKeyword && ` (recherche: "${searchKeyword}")`}
            {selectedCategory && ` (catégorie filtrée)`}
            {minPrice && maxPrice && ` (prix: ${minPrice}-${maxPrice} DZD)`}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">Chargement des produits...</div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center py-12">
              <div className="text-red-500">Erreur: {error.message}</div>
            </div>
          )}

          {!loading && !error && (data?.products?.content || data?.content) && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data?.products?.content || data?.content || []).map((product: any) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-mono text-xs">{product.sku}</TableCell>
                    <TableCell className="font-medium">{product.nameFr}</TableCell>
                    <TableCell className="text-sm text-gray-600">{product.categoryName || '-'}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        {product.salePrice ? (
                          <>
                            <span className="font-semibold">{formatPrice(Number(product.salePrice))}</span>
                            <span className="text-xs text-gray-500 line-through">
                              {formatPrice(Number(product.basePrice))}
                            </span>
                          </>
                        ) : (
                          <span className="font-semibold">{formatPrice(Number(product.basePrice))}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={(product.stockQuantity || 0) > 50 ? 'success' : 'warning'}>
                        {product.stockQuantity} unités
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/products/${product.id}`)}
                          icon={<Eye className="h-4 w-4" />}
                        >
                          Voir
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/products/edit/${product.id}`)}
                        >
                          Modifier
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(Number(product.id), product.nameFr || '')}
                          icon={<Trash2 className="h-4 w-4 text-red-600" />}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={productToDelete !== null}
        onClose={() => setProductToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Supprimer le produit"
        message={`Êtes-vous sûr de vouloir supprimer "${productToDelete?.name}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        loading={deleting}
      />
    </div>
  );
};
