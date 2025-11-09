import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Eye, Package2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Tabs } from '../../components/ui/Tabs';
import { formatPrice, formatDate } from '../../lib/utils';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { addToast } from '../../store/slices/uiSlice';
import { ProductDocument, DeleteProductDocument, ProductsDocument } from '../../graphql/generated/graphql';
import { Spinner } from '../../components/ui/Spinner';
import { useMutation, useQuery } from '@apollo/client';

export const ProductDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Fetch product data
  const { data, loading, error } = useQuery(ProductDocument, {
    variables: { id: id ? parseInt(id) : 0 },
    skip: !id,
  });

  const [deleteProduct, { loading: deleting }] = useMutation(DeleteProductDocument, {
    refetchQueries: [{ query: ProductsDocument, variables: { page: 0, size: 20, sortBy: 'createdAt', sortDirection: 'DESC' } }],
  });

  const handleDelete = async () => {
    if (!id) return;

    try {
      await deleteProduct({
        variables: { id: parseInt(id) },
      });

      dispatch(addToast({ message: 'Produit supprimé avec succès', type: 'success' }));
      navigate('/products');
    } catch (error: any) {
      console.error('Delete product error:', error);
      dispatch(addToast({ message: error.message || 'Erreur lors de la suppression', type: 'error' }));
    } finally {
      setShowDeleteDialog(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !data?.product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-500 text-lg mb-4">Erreur: {error?.message || 'Produit non trouvé'}</p>
        <Button onClick={() => navigate('/products')}>Retour aux produits</Button>
      </div>
    );
  }

  const product = data.product;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/products')} icon={<ArrowLeft className="h-5 w-5" />}>
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{product.nameFr}</h1>
            <p className="text-gray-600 mt-1">SKU: {product.sku}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/products/edit/${id}`)} icon={<Edit className="h-5 w-5" />}>
            Modifier
          </Button>
          <Button variant="danger" onClick={() => setShowDeleteDialog(true)} icon={<Trash2 className="h-5 w-5" />}>
            Supprimer
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle>Images</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {product.imageUrls && product.imageUrls.length > 0 ? (
                  product.imageUrls.map((url, index) => (
                    <div key={index} className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                      <img src={url || ''} alt={`Product ${index + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 col-span-4">Aucune image disponible</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Multilingual Content */}
          <Card>
            <CardHeader>
              <CardTitle>Descriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs
                tabs={[
                  {
                    id: 'fr',
                    label: 'Français',
                    content: (
                      <div>
                        <h3 className="font-semibold text-lg mb-2">{product.nameFr}</h3>
                        <p className="text-gray-600">{product.descriptionFr || 'Aucune description'}</p>
                      </div>
                    ),
                  },
                  {
                    id: 'ar',
                    label: 'العربية',
                    content: (
                      <div className="text-right">
                        <h3 className="font-semibold text-lg mb-2">{product.nameAr}</h3>
                        <p className="text-gray-600">{product.descriptionAr || 'لا يوجد وصف'}</p>
                      </div>
                    ),
                  },
                  {
                    id: 'en',
                    label: 'English',
                    content: (
                      <div>
                        <h3 className="font-semibold text-lg mb-2">{product.nameEn || 'N/A'}</h3>
                        <p className="text-gray-600">{product.descriptionEn || 'No description'}</p>
                      </div>
                    ),
                  },
                ]}
              />
            </CardContent>
          </Card>

          {/* Variants */}
          <Card>
            <CardHeader>
              <CardTitle>Variantes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Tailles disponibles</h4>
                <div className="flex flex-wrap gap-2">
                  {product.availableSizes && product.availableSizes.length > 0 ? (
                    product.availableSizes.map((size) => (
                      <Badge key={size} variant="default">
                        {size}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-gray-500 text-sm">Aucune taille disponible</span>
                  )}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Couleurs disponibles</h4>
                <div className="flex flex-wrap gap-2">
                  {product.availableColors && product.availableColors.length > 0 ? (
                    product.availableColors.map((color) => (
                      <Badge key={color} variant="default">
                        {color}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-gray-500 text-sm">Aucune couleur disponible</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Statut</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">En vedette</span>
                <Badge variant={product.isFeatured ? 'info' : 'default'}>
                  {product.isFeatured ? 'Oui' : 'Non'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Vues</span>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">{product.viewCount || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Prix</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Prix de base</span>
                <span className="font-semibold">{formatPrice(Number(product.basePrice))}</span>
              </div>
              {product.salePrice && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Prix en promo</span>
                  <span className="font-semibold text-green-600">{formatPrice(Number(product.salePrice))}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stock */}
          <Card>
            <CardHeader>
              <CardTitle>Stock</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Quantité</span>
                <Badge variant={(product.stockQuantity || 0) > 50 ? 'success' : 'warning'}>
                  {product.stockQuantity || 0} unités
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Category */}
          <Card>
            <CardHeader>
              <CardTitle>Catégorie</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Package2 className="h-5 w-5 text-gray-400" />
                <span className="font-medium">{product.categoryName || 'Non catégorisé'}</span>
              </div>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Créé le:</span>
                <p className="font-medium">{formatDate(String(product.createdAt))}</p>
              </div>
              <div>
                <span className="text-gray-600">Modifié le:</span>
                <p className="font-medium">{formatDate(String(product.updatedAt))}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Supprimer le produit"
        message={`Êtes-vous sûr de vouloir supprimer "${product.nameFr}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        loading={deleting}
      />
    </div>
  );
};
