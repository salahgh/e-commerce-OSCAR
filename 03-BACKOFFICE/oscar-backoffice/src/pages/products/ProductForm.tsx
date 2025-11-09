import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { ArrowLeft, Globe, Package, DollarSign, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { TextArea } from '../../components/ui/TextArea';
import { Select } from '../../components/ui/Select';
import { Tabs } from '../../components/ui/Tabs';
import { ImageUpload } from '../../components/ui/ImageUpload';
import { AVAILABLE_SIZES, AVAILABLE_COLORS } from '../../constants';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { addToast } from '../../store/slices/uiSlice';

const ProductSchema = Yup.object().shape({
  sku: Yup.string().required('SKU requis'),
  nameFr: Yup.string().required('Nom français requis'),
  nameAr: Yup.string().required('Nom arabe requis'),
  nameEn: Yup.string(),
  descriptionFr: Yup.string(),
  descriptionAr: Yup.string(),
  descriptionEn: Yup.string(),
  basePrice: Yup.number().min(0, 'Prix invalide').required('Prix de base requis'),
  salePrice: Yup.number().min(0, 'Prix invalide').nullable(),
  stockQuantity: Yup.number().min(0, 'Stock invalide').required('Stock requis'),
  minStockAlert: Yup.number().min(0, 'Valeur invalide').required('Alerte stock requise'),
  categoryId: Yup.string().required('Catégorie requise'),
  weightKg: Yup.number().min(0, 'Poids invalide').nullable(),
  isActive: Yup.boolean(),
  isFeatured: Yup.boolean(),
  imageUrls: Yup.array().of(Yup.string()),
  availableSizes: Yup.array().of(Yup.string()),
  availableColors: Yup.array().of(Yup.string()),
});

// Mock categories - TODO: Replace with GraphQL query
const mockCategories = [
  { value: '11', label: 'Hommes - T-Shirts' },
  { value: '12', label: 'Hommes - Chemises' },
  { value: '13', label: 'Hommes - Pantalons' },
  { value: '21', label: 'Femmes - Robes' },
  { value: '22', label: 'Femmes - Hauts' },
];

export const ProductForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  const isEditMode = Boolean(id);

  const formik = useFormik({
    initialValues: {
      sku: '',
      nameFr: '',
      nameAr: '',
      nameEn: '',
      descriptionFr: '',
      descriptionAr: '',
      descriptionEn: '',
      basePrice: 0,
      salePrice: null as number | null,
      stockQuantity: 0,
      minStockAlert: 10,
      categoryId: '',
      weightKg: null as number | null,
      isActive: true,
      isFeatured: false,
      imageUrls: [] as string[],
      availableSizes: [] as string[],
      availableColors: [] as string[],
    },
    validationSchema: ProductSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        // TODO: Replace with GraphQL mutation
        console.log('Product data:', { ...values, availableSizes: selectedSizes, availableColors: selectedColors });

        dispatch(
          addToast({
            message: isEditMode ? 'Produit modifié avec succès' : 'Produit créé avec succès',
            type: 'success',
          })
        );

        navigate('/products');
      } catch (error: any) {
        dispatch(
          addToast({
            message: error.message || 'Une erreur est survenue',
            type: 'error',
          })
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/products')} icon={<ArrowLeft className="h-5 w-5" />}>
          Retour
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditMode ? 'Modifier le produit' : 'Nouveau produit'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEditMode ? 'Modifiez les informations du produit' : 'Ajoutez un nouveau produit au catalogue'}
          </p>
        </div>
      </div>

      <form onSubmit={formik.handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              <CardTitle>Informations de base</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="SKU *"
                {...formik.getFieldProps('sku')}
                error={formik.touched.sku ? formik.errors.sku : undefined}
                placeholder="MTS-001-BLK"
              />
              <Select
                label="Catégorie *"
                {...formik.getFieldProps('categoryId')}
                options={[{ value: '', label: 'Sélectionner une catégorie' }, ...mockCategories]}
                error={formik.touched.categoryId ? formik.errors.categoryId : undefined}
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...formik.getFieldProps('isActive')}
                  checked={formik.values.isActive}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Produit actif</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...formik.getFieldProps('isFeatured')}
                  checked={formik.values.isFeatured}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Produit en vedette</span>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Multilingual Names & Descriptions */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-600" />
              <CardTitle>Noms et Descriptions (Multilingue)</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs
              tabs={[
                {
                  id: 'fr',
                  label: 'Français',
                  content: (
                    <div className="space-y-4">
                      <Input
                        label="Nom (Français) *"
                        {...formik.getFieldProps('nameFr')}
                        error={formik.touched.nameFr ? formik.errors.nameFr : undefined}
                        placeholder="T-Shirt Classique Noir"
                      />
                      <TextArea
                        label="Description (Français)"
                        {...formik.getFieldProps('descriptionFr')}
                        rows={4}
                        placeholder="Description détaillée du produit en français..."
                      />
                    </div>
                  ),
                },
                {
                  id: 'ar',
                  label: 'العربية',
                  content: (
                    <div className="space-y-4">
                      <Input
                        label="Nom (Arabe) *"
                        {...formik.getFieldProps('nameAr')}
                        error={formik.touched.nameAr ? formik.errors.nameAr : undefined}
                        placeholder="تي شيرت كلاسيكي أسود"
                        className="text-right"
                      />
                      <TextArea
                        label="Description (Arabe)"
                        {...formik.getFieldProps('descriptionAr')}
                        rows={4}
                        placeholder="وصف تفصيلي للمنتج بالعربية..."
                        className="text-right"
                      />
                    </div>
                  ),
                },
                {
                  id: 'en',
                  label: 'English',
                  content: (
                    <div className="space-y-4">
                      <Input
                        label="Name (English)"
                        {...formik.getFieldProps('nameEn')}
                        placeholder="Classic Black T-Shirt"
                      />
                      <TextArea
                        label="Description (English)"
                        {...formik.getFieldProps('descriptionEn')}
                        rows={4}
                        placeholder="Detailed product description in English..."
                      />
                    </div>
                  ),
                },
              ]}
            />
          </CardContent>
        </Card>

        {/* Pricing & Stock */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              <CardTitle>Prix et Stock</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                label="Prix de base (DZD) *"
                type="number"
                {...formik.getFieldProps('basePrice')}
                error={formik.touched.basePrice ? formik.errors.basePrice : undefined}
                placeholder="2500"
              />
              <Input
                label="Prix en promotion (DZD)"
                type="number"
                {...formik.getFieldProps('salePrice')}
                error={formik.touched.salePrice ? formik.errors.salePrice : undefined}
                placeholder="1999"
              />
              <Input
                label="Quantité en stock *"
                type="number"
                {...formik.getFieldProps('stockQuantity')}
                error={formik.touched.stockQuantity ? formik.errors.stockQuantity : undefined}
                placeholder="150"
              />
              <Input
                label="Alerte stock minimum *"
                type="number"
                {...formik.getFieldProps('minStockAlert')}
                error={formik.touched.minStockAlert ? formik.errors.minStockAlert : undefined}
                placeholder="10"
              />
            </div>
            <Input
              label="Poids (kg)"
              type="number"
              step="0.01"
              {...formik.getFieldProps('weightKg')}
              placeholder="0.25"
              className="max-w-xs"
            />
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-blue-600" />
              <CardTitle>Images du produit</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ImageUpload
              value={formik.values.imageUrls}
              onChange={(urls) => formik.setFieldValue('imageUrls', urls)}
              maxImages={5}
              label="Télécharger les images (max 5)"
            />
            <p className="text-sm text-gray-500 mt-2">La première image sera utilisée comme image principale</p>
          </CardContent>
        </Card>

        {/* Sizes */}
        <Card>
          <CardHeader>
            <CardTitle>Tailles disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_SIZES.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggleSize(size)}
                  className={`px-4 py-2 rounded-lg border-2 font-medium transition-colors ${
                    selectedSizes.includes(size)
                      ? 'border-blue-600 bg-blue-50 text-blue-600'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Colors */}
        <Card>
          <CardHeader>
            <CardTitle>Couleurs disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => toggleColor(color)}
                  className={`px-4 py-2 rounded-lg border-2 font-medium transition-colors ${
                    selectedColors.includes(color)
                      ? 'border-blue-600 bg-blue-50 text-blue-600'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Button type="button" variant="ghost" onClick={() => navigate('/products')}>
            Annuler
          </Button>
          <Button type="submit" loading={formik.isSubmitting}>
            {isEditMode ? 'Enregistrer les modifications' : 'Créer le produit'}
          </Button>
        </div>
      </form>
    </div>
  );
};
