import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useQuery, useMutation } from '@apollo/client';
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
import {
  CategoriesDocument,
  ProductDocument,
  CreateProductDocument,
  UpdateProductDocument,
  ProductsDocument,
} from '../../graphql/generated/graphql';

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

export const ProductForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  const isEditMode = Boolean(id);

  // Fetch categories for dropdown
  const { data: categoriesData } = useQuery(CategoriesDocument);

  // Fetch product data if in edit mode
  const { data: productData, loading: productLoading } = useQuery(ProductDocument, {
    variables: { id: id ? parseInt(id) : 0 },
    skip: !isEditMode,
  });

  // Mutations
  const [createProduct, { loading: creating }] = useMutation(CreateProductDocument, {
    refetchQueries: [{ query: ProductsDocument, variables: { page: 0, size: 20, sortBy: 'createdAt', sortDirection: 'DESC' } }],
  });

  const [updateProduct, { loading: updating }] = useMutation(UpdateProductDocument, {
    refetchQueries: [{ query: ProductsDocument, variables: { page: 0, size: 20, sortBy: 'createdAt', sortDirection: 'DESC' } }],
  });

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
        const input = {
          sku: values.sku,
          nameFr: values.nameFr,
          nameAr: values.nameAr,
          nameEn: values.nameEn || null,
          descriptionFr: values.descriptionFr || null,
          descriptionAr: values.descriptionAr || null,
          descriptionEn: values.descriptionEn || null,
          basePrice: values.basePrice,
          salePrice: values.salePrice,
          stockQuantity: values.stockQuantity,
          minStockAlert: values.minStockAlert,
          categoryId: parseInt(values.categoryId),
          weightKg: values.weightKg,
          isActive: values.isActive,
          isFeatured: values.isFeatured,
          imageUrls: values.imageUrls,
          availableSizes: selectedSizes,
          availableColors: selectedColors,
        };

        if (isEditMode && id) {
          await updateProduct({
            variables: {
              id: parseInt(id),
              input,
            },
          });
        } else {
          await createProduct({
            variables: { input },
          });
        }

        dispatch(
          addToast({
            message: isEditMode ? 'Produit modifié avec succès' : 'Produit créé avec succès',
            type: 'success',
          })
        );

        navigate('/products');
      } catch (error: any) {
        console.error('Product mutation error:', error);
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

  // Populate form with product data in edit mode
  useEffect(() => {
    if (productData?.product) {
      const product = productData.product;
      formik.setValues({
        sku: product.sku || '',
        nameFr: product.nameFr || '',
        nameAr: product.nameAr || '',
        nameEn: product.nameEn || '',
        descriptionFr: product.descriptionFr || '',
        descriptionAr: product.descriptionAr || '',
        descriptionEn: product.descriptionEn || '',
        basePrice: Number(product.basePrice) || 0,
        salePrice: product.salePrice ? Number(product.salePrice) : null,
        stockQuantity: product.stockQuantity || 0,
        minStockAlert: 10, // Not in schema, using default
        categoryId: product.categoryId ? String(product.categoryId) : '',
        weightKg: null, // Not in schema
        isActive: true, // Not in schema, using default
        isFeatured: product.isFeatured || false,
        imageUrls: product.imageUrls || [],
        availableSizes: product.availableSizes || [],
        availableColors: product.availableColors || [],
      });
      setSelectedSizes(product.availableSizes || []);
      setSelectedColors(product.availableColors || []);
    }
  }, [productData]);

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

  // Prepare categories for dropdown
  const categoryOptions = [
    { value: '', label: 'Sélectionner une catégorie' },
    ...(categoriesData?.categories?.map((cat) => ({
      value: String(cat.id),
      label: cat.nameFr || '',
    })) || []),
  ];

  // Show loading state when fetching product in edit mode
  if (isEditMode && productLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Chargement du produit...</div>
      </div>
    );
  }

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
                options={categoryOptions}
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
          <Button type="submit" loading={formik.isSubmitting || creating || updating}>
            {isEditMode ? 'Enregistrer les modifications' : 'Créer le produit'}
          </Button>
        </div>
      </form>
    </div>
  );
};
