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
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Fetch categories for filter dropdown
  const { data: categoriesData } = useQuery(CategoriesDocument);

  // Determine which query to use based on filters
  const useSearchQuery = searchKeyword.trim() !== '';
  const useCategoryQuery = !useSearchQuery && selectedCategory !== '';
  const usePriceQuery = !useSearchQuery && !useCategoryQuery && minPrice !== '' && maxPrice !== '';

  // Search query
  const { data: searchData, loading: searchLoading, error: searchError } = useQuery(SearchProductsDocument, {
    variables: { keyword: searchKeyword, page, size },
    skip: !useSearchQuery,
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

  // Default query
  const { data: defaultData, loading: defaultLoading, error: defaultError } = useQuery(ProductsDocument, {
    variables: { page, size, sortBy: 'createdAt', sortDirection: 'DESC' },
    skip: useSearchQuery || useCategoryQuery || usePriceQuery,
  });

  // Select the appropriate data based on active query
  const data = useSearchQuery ? searchData?.searchProducts : useCategoryQuery ? categoryData?.productsByCategory : usePriceQuery ? priceData?.productsByPriceRange : defaultData;
  const loading = useSearchQuery ? searchLoading : useCategoryQuery ? categoryLoading : usePriceQuery ? priceLoading : defaultLoading;
  const error = useSearchQuery ? searchError : useCategoryQuery ? categoryError : usePriceQuery ? priceError : defaultError;

  const [deleteProduct, { loading: deleting }] = useMutation(DeleteProductDocument, {
    refetchQueries: [
      { query: ProductsDocument, variables: { page, size, sortBy: 'createdAt', sortDirection: 'DESC' } },
      ...(useSearchQuery ? [{ query: SearchProductsDocument, variables: { keyword: searchKeyword, page, size } }] : []),
      ...(useCategoryQuery ? [{ query: ProductsByCategoryDocument, variables: { categoryId: parseInt(selectedCategory), page, size } }] : []),
    ],
  });

  const handleClearFilters = () => {
    setSearchKeyword('');
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

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Input
              placeholder="Rechercher un produit..."
              icon={<Search className="h-5 w-5" />}
              value={searchKeyword}
              onChange={(e) => {
                setSearchKeyword(e.target.value);
                setPage(0);
              }}
            />
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
