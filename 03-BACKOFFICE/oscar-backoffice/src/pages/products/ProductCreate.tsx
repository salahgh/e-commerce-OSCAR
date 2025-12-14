import React, { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import {
  ArrowLeft,
  ArrowRight,
  Save,
  Package,
  Globe,
  Image as ImageIcon,
  Layers,
  FolderTree,
  Upload,
  X,
  Plus,
  Trash2,
  Star,
  Check,
  GripVertical,
  AlertCircle,
} from 'lucide-react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { addToast } from '../../store/slices/uiSlice';
import {
  CreateProductDocument,
  CreateProductVariantsDocument,
  CreateAssetsDocument,
  AdminCollectionsWithFiltersDocument,
  UpdateCollectionFiltersDocument,
  AdminProductOptionGroupsDocument,
  AddOptionGroupToProductDocument,
  LanguageCode,
} from '../../graphql/generated/graphql';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { TextArea } from '../../components/ui/TextArea';
import { Badge } from '../../components/ui/Badge';

// Wizard steps
const STEPS = [
  { id: 'basic', label: 'Informations', icon: Package },
  { id: 'translations', label: 'Traductions', icon: Globe },
  { id: 'images', label: 'Images', icon: ImageIcon },
  { id: 'variants', label: 'Variantes', icon: Layers },
  { id: 'categories', label: 'Catégories', icon: FolderTree },
];

interface UploadedImage {
  id?: string;
  file?: File;
  preview: string;
  name: string;
  uploading?: boolean;
}

interface VariantConfig {
  sku: string;
  price: number;
  stock: number;
  options: Record<string, string>;
}

export const ProductCreate: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Current step
  const [currentStep, setCurrentStep] = useState(0);

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    enabled: true,
    nameFr: '',
    nameAr: '',
    descriptionFr: '',
    descriptionAr: '',
    isFeatured: false,
    weightKg: '',
    availableSizes: '',
    availableColors: '',
    salePrice: '',
  });

  // Images
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [featuredImageIndex, setFeaturedImageIndex] = useState<number>(0);
  const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Variants
  const [selectedOptionGroups, setSelectedOptionGroups] = useState<string[]>([]);
  const [variants, setVariants] = useState<VariantConfig[]>([
    { sku: '', price: 0, stock: 0, options: {} },
  ]);

  // Categories
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);

  // Loading states
  const [creating, setCreating] = useState(false);

  // Fetch data
  const { data: collectionsData } = useQuery(AdminCollectionsWithFiltersDocument, {
    variables: { options: { take: 100 } },
  });
  const { data: optionGroupsData } = useQuery(AdminProductOptionGroupsDocument);

  // Mutations
  const [createProduct] = useMutation(CreateProductDocument);
  const [createVariants] = useMutation(CreateProductVariantsDocument);
  const [createAssets] = useMutation(CreateAssetsDocument);
  const [updateCollectionFilters] = useMutation(UpdateCollectionFiltersDocument);
  const [addOptionGroupToProduct] = useMutation(AddOptionGroupToProductDocument);

  const collections = collectionsData?.collections?.items || [];
  const optionGroups = optionGroupsData?.productOptionGroups || [];

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[àáâãäå]/g, 'a')
      .replace(/[èéêë]/g, 'e')
      .replace(/[ìíîï]/g, 'i')
      .replace(/[òóôõö]/g, 'o')
      .replace(/[ùúûü]/g, 'u')
      .replace(/[ç]/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Auto-generate slug when name changes
    if (name === 'name' && !formData.slug) {
      setFormData((prev) => ({
        ...prev,
        slug: generateSlug(value),
      }));
    }
  };

  // Image handling
  const handleFileDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'));
    addImageFiles(files);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    addImageFiles(files);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const addImageFiles = (files: File[]) => {
    const newImages: UploadedImage[] = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
    }));
    setImages((prev) => [...prev, ...newImages]);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    if (featuredImageIndex === index) {
      setFeaturedImageIndex(0);
    } else if (featuredImageIndex > index) {
      setFeaturedImageIndex(featuredImageIndex - 1);
    }
  };

  // Image drag reordering
  const handleImageDragStart = (index: number) => {
    setDraggedImageIndex(index);
  };

  const handleImageDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedImageIndex === null || draggedImageIndex === index) return;

    const newImages = [...images];
    const draggedImage = newImages[draggedImageIndex];
    newImages.splice(draggedImageIndex, 1);
    newImages.splice(index, 0, draggedImage);
    setImages(newImages);

    // Update featured index if needed
    if (featuredImageIndex === draggedImageIndex) {
      setFeaturedImageIndex(index);
    } else if (draggedImageIndex < featuredImageIndex && index >= featuredImageIndex) {
      setFeaturedImageIndex(featuredImageIndex - 1);
    } else if (draggedImageIndex > featuredImageIndex && index <= featuredImageIndex) {
      setFeaturedImageIndex(featuredImageIndex + 1);
    }

    setDraggedImageIndex(index);
  };

  const handleImageDragEnd = () => {
    setDraggedImageIndex(null);
  };

  // Variant handling
  const addVariant = () => {
    setVariants((prev) => [...prev, { sku: '', price: 0, stock: 0, options: {} }]);
  };

  const removeVariant = (index: number) => {
    if (variants.length > 1) {
      setVariants((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const updateVariant = (index: number, field: keyof VariantConfig, value: any) => {
    setVariants((prev) => prev.map((v, i) => (i === index ? { ...v, [field]: value } : v)));
  };

  const updateVariantOption = (variantIndex: number, optionGroupId: string, optionId: string) => {
    setVariants((prev) =>
      prev.map((v, i) =>
        i === variantIndex ? { ...v, options: { ...v.options, [optionGroupId]: optionId } } : v
      )
    );
  };

  // Toggle option group selection
  const toggleOptionGroup = (groupId: string) => {
    setSelectedOptionGroups((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]
    );
  };

  // Helper to get product IDs from collection filters
  const getProductIdsFromCollection = (collection: any): string[] => {
    const productIdFilter = collection.filters?.find((f: any) => f.code === 'product-id-filter');
    if (!productIdFilter) return [];
    const productIdsArg = productIdFilter.args?.find((a: any) => a.name === 'productIds');
    if (!productIdsArg?.value) return [];
    try {
      return JSON.parse(productIdsArg.value);
    } catch {
      return [];
    }
  };

  // Create product
  const handleCreate = async () => {
    if (!formData.name || !formData.slug) {
      dispatch(addToast({ message: 'Nom et slug sont requis', type: 'error' }));
      return;
    }

    if (variants.every((v) => !v.sku)) {
      dispatch(addToast({ message: 'Au moins une variante avec SKU est requise', type: 'error' }));
      return;
    }

    setCreating(true);

    try {
      // Step 1: Upload images if any
      let uploadedAssetIds: string[] = [];
      let featuredAssetId: string | undefined;

      if (images.length > 0) {
        const filesToUpload = images.filter((img) => img.file);
        if (filesToUpload.length > 0) {
          const assetResult = await createAssets({
            variables: {
              input: filesToUpload.map((img) => ({ file: img.file })),
            },
          });

          const uploadedAssets = assetResult.data?.createAssets || [];
          uploadedAssetIds = uploadedAssets
            .filter((a: any) => a.__typename === 'Asset' || a.id)
            .map((a: any) => a.id);

          if (uploadedAssetIds.length > 0) {
            featuredAssetId = uploadedAssetIds[featuredImageIndex] || uploadedAssetIds[0];
          }
        }
      }

      // Step 2: Create the product
      const productResult = await createProduct({
        variables: {
          input: {
            enabled: formData.enabled,
            assetIds: uploadedAssetIds,
            featuredAssetId,
            translations: [
              {
                languageCode: LanguageCode.En,
                name: formData.name,
                slug: formData.slug,
                description: formData.description,
              },
            ],
            customFields: {
              nameFr: formData.nameFr || null,
              nameAr: formData.nameAr || null,
              descriptionFr: formData.descriptionFr || null,
              descriptionAr: formData.descriptionAr || null,
              isFeatured: formData.isFeatured,
              weightKg: formData.weightKg ? parseFloat(formData.weightKg) : null,
              salePrice: formData.salePrice
                ? Math.round(parseFloat(formData.salePrice) * 100)
                : null,
              availableSizes: formData.availableSizes
                ? formData.availableSizes
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean)
                : [],
              availableColors: formData.availableColors
                ? formData.availableColors
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean)
                : [],
            },
          },
        },
      });

      const productId = productResult.data?.createProduct?.id;
      if (!productId) {
        throw new Error('Echec de la creation du produit');
      }

      // Step 3: Add option groups to product
      for (const groupId of selectedOptionGroups) {
        await addOptionGroupToProduct({
          variables: {
            productId,
            optionGroupId: groupId,
          },
        });
      }

      // Step 4: Create variants
      const validVariants = variants.filter((v) => v.sku.trim());
      if (validVariants.length > 0) {
        await createVariants({
          variables: {
            input: validVariants.map((v) => ({
              productId,
              sku: v.sku,
              price: Math.round(v.price * 100),
              stockOnHand: v.stock,
              optionIds: Object.values(v.options).filter(Boolean),
              translations: [
                {
                  languageCode: LanguageCode.En,
                  name: v.sku,
                },
              ],
            })),
          },
        });
      }

      // Step 5: Add product to selected collections
      for (const collectionId of selectedCollections) {
        const collection = collections.find((c: any) => c.id === collectionId);
        if (!collection) continue;

        const currentProductIds = getProductIdsFromCollection(collection);
        const newProductIds = [...currentProductIds, productId];

        await updateCollectionFilters({
          variables: {
            id: collectionId,
            filters: [
              {
                code: 'product-id-filter',
                arguments: [{ name: 'productIds', value: JSON.stringify(newProductIds) }],
              },
            ],
          },
        });
      }

      dispatch(addToast({ message: 'Produit cree avec succes!', type: 'success' }));
      navigate(`/products/${productId}`);
    } catch (err: any) {
      console.error('Create product error:', err);
      dispatch(addToast({ message: err.message || 'Erreur lors de la creation', type: 'error' }));
    } finally {
      setCreating(false);
    }
  };

  // Step navigation
  const goToStep = (step: number) => {
    if (step >= 0 && step < STEPS.length) {
      setCurrentStep(step);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return formData.name.trim() && formData.slug.trim();
      case 1:
      case 2:
      case 4:
        return true;
      case 3:
        return variants.some((v) => v.sku.trim());
      default:
        return true;
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Nom du produit *"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Ex: T-shirt Premium"
                required
              />
              <Input
                label="Slug (URL) *"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                placeholder="t-shirt-premium"
                helperText="Identifiant URL unique"
                required
              />
            </div>

            <TextArea
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              placeholder="Description detaillee du produit..."
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input
                label="Poids (kg)"
                name="weightKg"
                type="number"
                step="0.1"
                value={formData.weightKg}
                onChange={handleInputChange}
                placeholder="0.5"
              />
              <Input
                label="Prix promo (DZD)"
                name="salePrice"
                type="number"
                value={formData.salePrice}
                onChange={handleInputChange}
                placeholder="Laisser vide si pas de promo"
              />
              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-3 p-3 bg-muted rounded-lg cursor-pointer hover:bg-accent">
                  <input
                    type="checkbox"
                    name="enabled"
                    checked={formData.enabled}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-primary border-border rounded bg-card"
                  />
                  <span className="text-sm font-medium text-muted-foreground">Produit actif</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Tailles disponibles"
                name="availableSizes"
                value={formData.availableSizes}
                onChange={handleInputChange}
                placeholder="S, M, L, XL, XXL"
                helperText="Separer par des virgules"
              />
              <Input
                label="Couleurs disponibles"
                name="availableColors"
                value={formData.availableColors}
                onChange={handleInputChange}
                placeholder="Noir, Blanc, Bleu"
                helperText="Separer par des virgules"
              />
            </div>

            <label className="flex items-center gap-3 p-4 bg-yellow-900/30 border border-yellow-700 rounded-lg cursor-pointer hover:bg-yellow-900/50">
              <input
                type="checkbox"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleInputChange}
                className="h-5 w-5 text-yellow-600 border-border rounded bg-card"
              />
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <span className="font-medium text-foreground">Produit vedette</span>
              </div>
            </label>
          </div>
        );

      case 1:
        return (
          <div className="space-y-8">
            <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
              <p className="text-sm text-blue-300">
                <Globe className="inline h-4 w-4 mr-2" />
                Configurez les traductions francaise et arabe pour ce produit. Ces champs sont
                optionnels.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <span>FR</span> Francais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    label="Nom"
                    name="nameFr"
                    value={formData.nameFr}
                    onChange={handleInputChange}
                    placeholder="Nom du produit en francais"
                  />
                  <TextArea
                    label="Description"
                    name="descriptionFr"
                    value={formData.descriptionFr}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Description en francais"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <span>AR</span> Arabe
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    label="Nom"
                    name="nameAr"
                    value={formData.nameAr}
                    onChange={handleInputChange}
                    placeholder="اسم المنتج بالعربية"
                    dir="rtl"
                  />
                  <TextArea
                    label="Description"
                    name="descriptionAr"
                    value={formData.descriptionAr}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="وصف المنتج بالعربية"
                    dir="rtl"
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            {/* Drop zone */}
            <div
              onDrop={handleFileDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingOver(true);
              }}
              onDragLeave={() => setIsDraggingOver(false)}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                isDraggingOver
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary hover:bg-muted/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
              <Upload
                className={`h-12 w-12 mx-auto mb-4 ${isDraggingOver ? 'text-primary' : 'text-muted-foreground'}`}
              />
              <p className="text-lg font-medium text-foreground">Glissez-deposez vos images ici</p>
              <p className="text-sm text-muted-foreground mt-2">
                ou cliquez pour selectionner des fichiers
              </p>
              <p className="text-xs text-muted-foreground/70 mt-4">PNG, JPG, WEBP jusqu a 10MB chacun</p>
            </div>

            {/* Image gallery */}
            {images.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-foreground">Images ({images.length})</h3>
                  <p className="text-xs text-muted-foreground">
                    Glissez pour reorganiser - Cliquez sur <Star className="inline h-3 w-3" /> pour
                    definir l image principale
                  </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {images.map((image, index) => (
                    <div
                      key={index}
                      draggable
                      onDragStart={() => handleImageDragStart(index)}
                      onDragOver={(e) => handleImageDragOver(e, index)}
                      onDragEnd={handleImageDragEnd}
                      className={`relative group rounded-lg overflow-hidden border-2 cursor-move ${
                        featuredImageIndex === index
                          ? 'border-yellow-500 ring-2 ring-yellow-500/30'
                          : 'border-border'
                      } ${draggedImageIndex === index ? 'opacity-50' : ''}`}
                    >
                      <img
                        src={image.preview}
                        alt={image.name}
                        className="h-32 w-full object-cover"
                      />
                      <div className="absolute top-1 left-1 p-1 bg-background/80 rounded opacity-0 group-hover:opacity-100">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                      </div>
                      {featuredImageIndex === index && (
                        <Badge variant="warning" className="absolute top-1 right-1 text-xs">
                          <Star className="h-3 w-3" />
                        </Badge>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                        {featuredImageIndex !== index && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFeaturedImageIndex(index);
                            }}
                            className="p-2 bg-yellow-500 text-white rounded-full hover:bg-yellow-600"
                            title="Definir comme principale"
                          >
                            <Star className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage(index);
                          }}
                          className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {images.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <ImageIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                <p>Aucune image ajoutee</p>
                <p className="text-sm text-muted-foreground/70">Les images sont optionnelles mais recommandees</p>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            {/* Option groups selection */}
            {optionGroups.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Groupes d options (optionnel)</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Selectionnez les groupes d options pour creer des variantes (ex: Taille,
                    Couleur)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {optionGroups.map((group: any) => (
                      <button
                        key={group.id}
                        type="button"
                        onClick={() => toggleOptionGroup(group.id)}
                        className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                          selectedOptionGroups.includes(group.id)
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border hover:border-muted-foreground text-muted-foreground'
                        }`}
                      >
                        {selectedOptionGroups.includes(group.id) && (
                          <Check className="inline h-4 w-4 mr-1" />
                        )}
                        {group.name}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Variants table */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Variantes du produit</CardTitle>
                <Button
                  type="button"
                  size="sm"
                  onClick={addVariant}
                  icon={<Plus className="h-4 w-4" />}
                >
                  Ajouter une variante
                </Button>
              </CardHeader>
              <CardContent>
                <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-3 mb-4">
                  <p className="text-sm text-yellow-300 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Chaque produit doit avoir au moins une variante avec un SKU unique.
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-border">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                          SKU *
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                          Prix (DZD)
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                          Stock
                        </th>
                        {selectedOptionGroups.map((groupId) => {
                          const group = optionGroups.find((g: any) => g.id === groupId);
                          return (
                            <th
                              key={groupId}
                              className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase"
                            >
                              {group?.name || 'Option'}
                            </th>
                          );
                        })}
                        <th className="px-4 py-3 w-16"></th>
                      </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-border">
                      {variants.map((variant, index) => (
                        <tr key={index} className="hover:bg-accent">
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={variant.sku}
                              onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                              placeholder="SKU-001"
                              className="w-full px-3 py-2 bg-muted border border-border text-foreground placeholder-muted-foreground rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              value={variant.price || ''}
                              onChange={(e) =>
                                updateVariant(index, 'price', parseFloat(e.target.value) || 0)
                              }
                              placeholder="0"
                              min="0"
                              className="w-28 px-3 py-2 bg-muted border border-border text-foreground placeholder-muted-foreground rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              value={variant.stock || ''}
                              onChange={(e) =>
                                updateVariant(index, 'stock', parseInt(e.target.value) || 0)
                              }
                              placeholder="0"
                              min="0"
                              className="w-20 px-3 py-2 bg-muted border border-border text-foreground placeholder-muted-foreground rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                            />
                          </td>
                          {selectedOptionGroups.map((groupId) => {
                            const group = optionGroups.find((g: any) => g.id === groupId);
                            return (
                              <td key={groupId} className="px-4 py-3">
                                <select
                                  value={variant.options[groupId] || ''}
                                  onChange={(e) =>
                                    updateVariantOption(index, groupId, e.target.value)
                                  }
                                  className="w-full px-3 py-2 bg-muted border border-border text-foreground rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                                >
                                  <option value="">--</option>
                                  {group?.options?.map((option: any) => (
                                    <option key={option.id} value={option.id}>
                                      {option.name}
                                    </option>
                                  ))}
                                </select>
                              </td>
                            );
                          })}
                          <td className="px-4 py-3">
                            {variants.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeVariant(index)}
                                className="p-2 text-red-400 hover:bg-red-900/30 rounded-lg"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
              <p className="text-sm text-blue-300">
                <FolderTree className="inline h-4 w-4 mr-2" />
                Selectionnez les categories ou ce produit sera visible.
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Categories</CardTitle>
              </CardHeader>
              <CardContent>
                {collections.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucune categorie disponible</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {collections.map((collection: any) => (
                      <label
                        key={collection.id}
                        className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                          selectedCollections.includes(collection.id)
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-muted-foreground'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedCollections.includes(collection.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCollections([...selectedCollections, collection.id]);
                            } else {
                              setSelectedCollections(
                                selectedCollections.filter((id) => id !== collection.id)
                              );
                            }
                          }}
                          className="h-5 w-5 text-primary border-border rounded bg-card"
                        />
                        <div>
                          <p className="font-medium text-foreground">{collection.name}</p>
                          {collection.slug && (
                            <p className="text-xs text-muted-foreground">/{collection.slug}</p>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Resume</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Produit</p>
                    <p className="font-semibold text-foreground">{formData.name || '-'}</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Images</p>
                    <p className="font-semibold text-foreground">{images.length}</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Variantes</p>
                    <p className="font-semibold text-foreground">
                      {variants.filter((v) => v.sku).length}
                    </p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Categories</p>
                    <p className="font-semibold text-foreground">{selectedCollections.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/products')}
            icon={<ArrowLeft className="h-4 w-4" />}
          >
            Retour
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Nouveau produit</h1>
        </div>
      </div>

      {/* Progress steps */}
      <div className="flex items-center justify-between bg-card rounded-xl p-4 shadow-sm overflow-x-auto border border-border">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;

          return (
            <React.Fragment key={step.id}>
              <button
                onClick={() => goToStep(index)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-primary/20 text-primary'
                    : isCompleted
                      ? 'bg-green-900/30 text-green-400 hover:bg-green-900/50'
                      : 'text-muted-foreground hover:bg-accent'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : isCompleted
                        ? 'bg-green-500 text-white'
                        : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                <span className="hidden md:block font-medium text-sm">{step.label}</span>
              </button>
              {index < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 min-w-[20px] ${
                    index < currentStep ? 'bg-green-500' : 'bg-muted'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Step content */}
      <Card>
        <CardContent className="p-6">{renderStepContent()}</CardContent>
      </Card>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="secondary"
          onClick={() => goToStep(currentStep - 1)}
          disabled={currentStep === 0}
          icon={<ArrowLeft className="h-4 w-4" />}
        >
          Precedent
        </Button>

        <div className="flex items-center gap-3">
          {currentStep < STEPS.length - 1 ? (
            <Button
              onClick={() => goToStep(currentStep + 1)}
              disabled={!canProceed()}
              icon={<ArrowRight className="h-4 w-4" />}
            >
              Suivant
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleCreate}
              loading={creating}
              disabled={!canProceed()}
              icon={<Save className="h-4 w-4" />}
            >
              Creer le produit
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
