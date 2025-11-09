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

// Mock data - TODO: Replace with GraphQL query
const mockProduct = {
  id: '101',
  sku: 'MTS-001-BLK',
  nameFr: 'T-Shirt Classique Noir',
  nameAr: 'تي شيرت كلاسيكي أسود',
  nameEn: 'Classic Black T-Shirt',
  descriptionFr: 'T-shirt en coton 100% de qualité supérieure',
  descriptionAr: 'تي شيرت قطن 100% عالي الجودة',
  descriptionEn: '100% premium cotton t-shirt',
  basePrice: 2500,
  salePrice: 1999,
  stockQuantity: 150,
  minStockAlert: 20,
  weightKg: 0.25,
  isActive: true,
  isFeatured: true,
  viewCount: 245,
  imageUrls: [
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab',
    'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a',
  ],
  availableSizes: ['S', 'M', 'L', 'XL', 'XXL'],
  availableColors: ['Noir', 'Blanc', 'Gris'],
  category: { id: '11', nameFr: 'Hommes - T-Shirts' },
  createdAt: '2024-11-01T10:00:00Z',
  updatedAt: '2024-11-08T15:30:00Z',
};

export const ProductDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      // TODO: Replace with GraphQL mutation
      await new Promise((resolve) => setTimeout(resolve, 1000));

      dispatch(addToast({ message: 'Produit supprimé avec succès', type: 'success' }));
      navigate('/products');
    } catch (error: any) {
      dispatch(addToast({ message: error.message || 'Erreur lors de la suppression', type: 'error' }));
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/products')} icon={<ArrowLeft className="h-5 w-5" />}>
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{mockProduct.nameFr}</h1>
            <p className="text-gray-600 mt-1">SKU: {mockProduct.sku}</p>
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
                {mockProduct.imageUrls.map((url, index) => (
                  <div key={index} className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                    <img src={url} alt={`Product ${index + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
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
                        <h3 className="font-semibold text-lg mb-2">{mockProduct.nameFr}</h3>
                        <p className="text-gray-600">{mockProduct.descriptionFr}</p>
                      </div>
                    ),
                  },
                  {
                    id: 'ar',
                    label: 'العربية',
                    content: (
                      <div className="text-right">
                        <h3 className="font-semibold text-lg mb-2">{mockProduct.nameAr}</h3>
                        <p className="text-gray-600">{mockProduct.descriptionAr}</p>
                      </div>
                    ),
                  },
                  {
                    id: 'en',
                    label: 'English',
                    content: (
                      <div>
                        <h3 className="font-semibold text-lg mb-2">{mockProduct.nameEn}</h3>
                        <p className="text-gray-600">{mockProduct.descriptionEn}</p>
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
                  {mockProduct.availableSizes.map((size) => (
                    <Badge key={size} variant="default">
                      {size}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Couleurs disponibles</h4>
                <div className="flex flex-wrap gap-2">
                  {mockProduct.availableColors.map((color) => (
                    <Badge key={color} variant="default">
                      {color}
                    </Badge>
                  ))}
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
                <span className="text-sm text-gray-600">État</span>
                <Badge variant={mockProduct.isActive ? 'success' : 'default'}>
                  {mockProduct.isActive ? 'Actif' : 'Inactif'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">En vedette</span>
                <Badge variant={mockProduct.isFeatured ? 'info' : 'default'}>
                  {mockProduct.isFeatured ? 'Oui' : 'Non'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Vues</span>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">{mockProduct.viewCount}</span>
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
                <span className="font-semibold">{formatPrice(mockProduct.basePrice)}</span>
              </div>
              {mockProduct.salePrice && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Prix en promo</span>
                  <span className="font-semibold text-green-600">{formatPrice(mockProduct.salePrice)}</span>
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
                <Badge variant={mockProduct.stockQuantity > 50 ? 'success' : 'warning'}>
                  {mockProduct.stockQuantity} unités
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Alerte minimum</span>
                <span className="font-medium">{mockProduct.minStockAlert}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Poids</span>
                <span className="font-medium">{mockProduct.weightKg} kg</span>
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
                <span className="font-medium">{mockProduct.category.nameFr}</span>
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
                <p className="font-medium">{formatDate(mockProduct.createdAt)}</p>
              </div>
              <div>
                <span className="text-gray-600">Modifié le:</span>
                <p className="font-medium">{formatDate(mockProduct.updatedAt)}</p>
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
        message={`Êtes-vous sûr de vouloir supprimer "${mockProduct.nameFr}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        loading={deleting}
      />
    </div>
  );
};
