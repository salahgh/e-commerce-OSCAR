import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  ArrowLeft,
  Save,
  Package,
  Globe,
  DollarSign,
  Plus,
  Trash2,
} from 'lucide-react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { addToast } from '../../store/slices/uiSlice';
import {
  CreateProductDocument,
  CreateProductVariantsDocument,
} from '../../graphql/generated/graphql';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { TextArea } from '../../components/ui/TextArea';
import { Tabs } from '../../components/ui/Tabs';

// Validation schema
const ProductCreateSchema = Yup.object().shape({
  name: Yup.string().required('Nom requis'),
  slug: Yup.string().required('Slug requis'),
  description: Yup.string(),
  enabled: Yup.boolean(),
  nameFr: Yup.string(),
  nameAr: Yup.string(),
  descriptionFr: Yup.string(),
  descriptionAr: Yup.string(),
  salePrice: Yup.number().nullable().min(0, 'Prix doit être positif'),
  isFeatured: Yup.boolean(),
  weightKg: Yup.number().nullable().min(0, 'Poids doit être positif'),
  availableSizes: Yup.string(),
  availableColors: Yup.string(),
});

interface VariantForm {
  sku: string;
  price: number;
  stockOnHand: number;
}

export const ProductCreate: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [variants, setVariants] = useState<VariantForm[]>([
    { sku: '', price: 0, stockOnHand: 0 },
  ]);

  // Mutations
  const [createProduct, { loading: creatingProduct }] = useMutation(CreateProductDocument);
  const [createVariants, { loading: creatingVariants }] = useMutation(CreateProductVariantsDocument);

  const loading = creatingProduct || creatingVariants;

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const formik = useFormik({
    initialValues: {
      name: '',
      slug: '',
      description: '',
      enabled: true,
      nameFr: '',
      nameAr: '',
      descriptionFr: '',
      descriptionAr: '',
      salePrice: null as number | null,
      isFeatured: false,
      weightKg: null as number | null,
      availableSizes: '',
      availableColors: '',
    },
    validationSchema: ProductCreateSchema,
    onSubmit: async (values) => {
      try {
        // Validate variants
        const validVariants = variants.filter((v) => v.sku.trim());
        if (validVariants.length === 0) {
          dispatch(addToast({ message: 'Au moins une variante avec SKU est requise', type: 'error' }));
          return;
        }

        // Create product first
        const productResult = await createProduct({
          variables: {
            input: {
              enabled: values.enabled,
              customFields: {
                nameFr: values.nameFr || null,
                nameAr: values.nameAr || null,
                descriptionFr: values.descriptionFr || null,
                descriptionAr: values.descriptionAr || null,
                salePrice: values.salePrice ? Math.round(values.salePrice * 100) : null,
                isFeatured: values.isFeatured,
                weightKg: values.weightKg || null,
                availableSizes: values.availableSizes
                  ? values.availableSizes.split(',').map((s) => s.trim()).filter(Boolean)
                  : [],
                availableColors: values.availableColors
                  ? values.availableColors.split(',').map((s) => s.trim()).filter(Boolean)
                  : [],
              },
              translations: [
                {
                  languageCode: 'en' as any,
                  name: values.name,
                  slug: values.slug,
                  description: values.description || '',
                },
              ],
            },
          },
        });

        const productId = productResult.data?.createProduct?.id;
        if (!productId) {
          throw new Error('Erreur lors de la création du produit');
        }

        // Create variants
        await createVariants({
          variables: {
            input: validVariants.map((v) => ({
              productId,
              sku: v.sku,
              price: Math.round(v.price * 100),
              stockOnHand: v.stockOnHand,
              translations: [
                {
                  languageCode: 'en' as any,
                  name: v.sku,
                },
              ],
            })),
          },
        });

        dispatch(addToast({ message: 'Produit créé avec succès!', type: 'success' }));
        navigate(`/products/${productId}`);
      } catch (err: any) {
        console.error('Error creating product:', err);
        dispatch(addToast({ message: err.message || 'Erreur lors de la création', type: 'error' }));
      }
    },
  });

  // Handle variant changes
  const handleVariantChange = (index: number, field: keyof VariantForm, value: string | number) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setVariants(newVariants);
  };

  const addVariant = () => {
    setVariants([...variants, { sku: '', price: 0, stockOnHand: 0 }]);
  };

  const removeVariant = (index: number) => {
    if (variants.length > 1) {
      setVariants(variants.filter((_, i) => i !== index));
    }
  };

  // Tab content components
  const GeneralTab = (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Nom du produit *"
          value={formik.values.name}
          onChange={(e) => {
            formik.handleChange(e);
            // Auto-generate slug
            if (!formik.touched.slug) {
              formik.setFieldValue('slug', generateSlug(e.target.value));
            }
          }}
          name="name"
          placeholder="T-shirt Coton Premium"
          error={formik.touched.name ? formik.errors.name : undefined}
        />
        <Input
          label="Slug *"
          value={formik.values.slug}
          onChange={formik.handleChange}
          name="slug"
          placeholder="t-shirt-coton-premium"
          error={formik.touched.slug ? formik.errors.slug : undefined}
          helperText="URL-friendly identifier"
        />
      </div>
      <TextArea
        label="Description"
        value={formik.values.description}
        onChange={formik.handleChange}
        name="description"
        rows={4}
        placeholder="Description du produit..."
      />
      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formik.values.enabled}
            onChange={(e) => formik.setFieldValue('enabled', e.target.checked)}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">Produit actif</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formik.values.isFeatured}
            onChange={(e) => formik.setFieldValue('isFeatured', e.target.checked)}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">Produit vedette</span>
        </label>
      </div>
    </div>
  );

  const LocalizationTab = (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800">
          <Globe className="inline h-4 w-4 mr-2" />
          Configurez les traductions française et arabe pour ce produit.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* French */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Français</h3>
          <Input
            label="Nom (Français)"
            value={formik.values.nameFr}
            onChange={formik.handleChange}
            name="nameFr"
            placeholder="Nom du produit en français"
          />
          <TextArea
            label="Description (Français)"
            value={formik.values.descriptionFr}
            onChange={formik.handleChange}
            name="descriptionFr"
            rows={4}
            placeholder="Description en français"
          />
        </div>

        {/* Arabic */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Arabe</h3>
          <Input
            label="Nom (Arabe)"
            value={formik.values.nameAr}
            onChange={formik.handleChange}
            name="nameAr"
            placeholder="اسم المنتج بالعربية"
            dir="rtl"
          />
          <TextArea
            label="Description (Arabe)"
            value={formik.values.descriptionAr}
            onChange={formik.handleChange}
            name="descriptionAr"
            rows={4}
            placeholder="وصف المنتج بالعربية"
            dir="rtl"
          />
        </div>
      </div>
    </div>
  );

  const VariantsTab = (
    <div className="space-y-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          <Package className="inline h-4 w-4 mr-2" />
          Chaque produit doit avoir au moins une variante. Les prix sont en DZD.
        </p>
      </div>

      <div className="space-y-4">
        {variants.map((variant, index) => (
          <div
            key={index}
            className="flex items-end gap-4 p-4 bg-gray-50 rounded-lg"
          >
            <div className="flex-1">
              <Input
                label="SKU *"
                value={variant.sku}
                onChange={(e) => handleVariantChange(index, 'sku', e.target.value)}
                placeholder="SKU-001"
              />
            </div>
            <div className="w-40">
              <Input
                label="Prix (DZD)"
                type="number"
                value={variant.price || ''}
                onChange={(e) => handleVariantChange(index, 'price', parseFloat(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
            <div className="w-32">
              <Input
                label="Stock"
                type="number"
                value={variant.stockOnHand || ''}
                onChange={(e) => handleVariantChange(index, 'stockOnHand', parseInt(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeVariant(index)}
              disabled={variants.length === 1}
              className="mb-1"
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        ))}
      </div>

      <Button type="button" variant="outline" onClick={addVariant} icon={<Plus className="h-4 w-4" />}>
        Ajouter une variante
      </Button>
    </div>
  );

  const AttributesTab = (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Prix promo (DZD)"
          type="number"
          value={formik.values.salePrice ?? ''}
          onChange={formik.handleChange}
          name="salePrice"
          placeholder="0"
          helperText="Laisser vide si pas de promotion"
        />
        <Input
          label="Poids (kg)"
          type="number"
          step="0.1"
          value={formik.values.weightKg ?? ''}
          onChange={formik.handleChange}
          name="weightKg"
          placeholder="0.5"
        />
      </div>
      <Input
        label="Tailles disponibles"
        value={formik.values.availableSizes}
        onChange={formik.handleChange}
        name="availableSizes"
        placeholder="S, M, L, XL, XXL"
        helperText="Séparer par des virgules"
      />
      <Input
        label="Couleurs disponibles"
        value={formik.values.availableColors}
        onChange={formik.handleChange}
        name="availableColors"
        placeholder="Noir, Blanc, Bleu, Rouge"
        helperText="Séparer par des virgules"
      />
    </div>
  );

  const tabs = [
    { id: 'general', label: 'Général', content: GeneralTab, icon: <Package className="h-4 w-4" /> },
    { id: 'localization', label: 'Traductions', content: LocalizationTab, icon: <Globe className="h-4 w-4" /> },
    { id: 'variants', label: 'Variantes', content: VariantsTab, icon: <DollarSign className="h-4 w-4" /> },
    { id: 'attributes', label: 'Attributs', content: AttributesTab, icon: <Package className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/products')} icon={<ArrowLeft className="h-4 w-4" />}>
            Retour
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Nouveau Produit</h1>
            <p className="text-sm text-gray-500 mt-1">
              Créez un nouveau produit avec ses variantes
            </p>
          </div>
        </div>
        <Button
          variant="primary"
          icon={<Save className="h-4 w-4" />}
          onClick={() => formik.handleSubmit()}
          loading={loading}
        >
          Créer le produit
        </Button>
      </div>

      {/* Form */}
      <Card>
        <CardContent className="p-0">
          <form onSubmit={formik.handleSubmit}>
            <Tabs tabs={tabs} defaultTab="general" className="px-6" />
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
