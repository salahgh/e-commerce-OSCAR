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
  Tag,
  Upload,
  Trash2,
  Star,
  Check,
  GripVertical,
  ImagePlus,
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
  CreateProductOptionGroupDocument,
  CreateProductOptionDocument,
  UpdateProductFacetsDocument,
  LanguageCode,
} from '../../graphql/generated/graphql';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { TextArea } from '../../components/ui/TextArea';
import { Badge } from '../../components/ui/Badge';
import { VariantManagerCreate } from '../../components/products/VariantManagerCreate';
import type { LocalOptionGroup, LocalVariant } from '../../components/products/VariantManagerCreate';
import { FacetSelector } from '../../components/products/FacetSelector';
import { AssetPickerModal } from '../../components/ui/AssetPickerModal';

// Wizard steps
const STEPS = [
  { id: 'basic', label: 'Informations', icon: Package },
  { id: 'translations', label: 'Traductions', icon: Globe },
  { id: 'images', label: 'Images', icon: ImageIcon },
  { id: 'variants', label: 'Variantes', icon: Layers },
  { id: 'facets', label: 'Attributs', icon: Tag },
  { id: 'categories', label: 'Catégories', icon: FolderTree },
];

interface UploadedImage {
  id?: string;
  file?: File;
  preview: string;
  name: string;
  uploading?: boolean;
  assetId?: string; // For images selected from the library
}

export const ProductCreate: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Current step
  const [currentStep, setCurrentStep] = useState(0);

  // Form data - using native Vendure translations (French is primary)
  const [formData, setFormData] = useState({
    name: '', // Primary language: French
    slug: '',
    description: '',
    enabled: true,
    // English translations
    nameEn: '',
    slugEn: '',
    descriptionEn: '',
    // Arabic translations
    nameAr: '',
    slugAr: '',
    descriptionAr: '',
  });

  // Images
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [featuredImageIndex, setFeaturedImageIndex] = useState<number>(0);
  const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [showAssetPicker, setShowAssetPicker] = useState(false);

  // Variants - using local state types from VariantManagerCreate
  const [selectedOptionGroups, setSelectedOptionGroups] = useState<LocalOptionGroup[]>([]);
  const [pendingVariants, setPendingVariants] = useState<LocalVariant[]>([]);

  // Categories
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);

  // Facet values (attributes)
  const [selectedFacetValueIds, setSelectedFacetValueIds] = useState<string[]>([]);

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
  const [createProductOptionGroup] = useMutation(CreateProductOptionGroupDocument);
  const [createProductOption] = useMutation(CreateProductOptionDocument);
  const [updateProductFacets] = useMutation(UpdateProductFacetsDocument);

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

  // Handle selecting assets from the library picker
  const handleSelectFromLibrary = (selectedAssets: any[]) => {
    if (selectedAssets.length === 0) {
      setShowAssetPicker(false);
      return;
    }

    // Convert selected assets to UploadedImage format
    const existingIds = images.map((img) => img.assetId).filter(Boolean);
    const newImages: UploadedImage[] = selectedAssets
      .filter((asset) => !existingIds.includes(asset.id)) // Avoid duplicates
      .map((asset) => ({
        file: null as any, // No file for library assets
        preview: asset.preview,
        assetId: asset.id,
        name: asset.name,
      }));

    if (newImages.length === 0) {
      dispatch(addToast({ message: 'Ces images sont déjà sélectionnées', type: 'info' }));
    } else {
      setImages([...images, ...newImages]);
      dispatch(
        addToast({ message: `${newImages.length} image(s) ajoutée(s) depuis la bibliothèque!`, type: 'success' })
      );
    }
    setShowAssetPicker(false);
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

    // If there are option groups, we need at least one variant
    if (selectedOptionGroups.length > 0 && pendingVariants.length === 0) {
      dispatch(addToast({ message: 'Au moins une variante est requise', type: 'error' }));
      return;
    }

    // If no option groups, we still need at least one variant with SKU
    if (selectedOptionGroups.length === 0 && pendingVariants.every((v) => !v.sku.trim())) {
      dispatch(addToast({ message: 'Au moins une variante avec SKU est requise', type: 'error' }));
      return;
    }

    setCreating(true);

    try {
      // Step 1: Handle images - upload new files and collect library asset IDs
      let allAssetIds: string[] = [];
      let featuredAssetId: string | undefined;

      if (images.length > 0) {
        // Separate images: those from library (have assetId) vs those to upload (have file)
        const filesToUpload = images.filter((img) => img.file && !img.assetId);

        // Upload new files if any
        let newUploadedIds: string[] = [];
        if (filesToUpload.length > 0) {
          const assetResult = await createAssets({
            variables: {
              input: filesToUpload.map((img) => ({ file: img.file })),
            },
          });

          const uploadedAssets = assetResult.data?.createAssets || [];
          newUploadedIds = uploadedAssets
            .filter((a: any) => a.__typename === 'Asset' || a.id)
            .map((a: any) => a.id);
        }

        // Build final asset IDs list maintaining original order
        let uploadIndex = 0;
        allAssetIds = images.map((img) => {
          if (img.assetId) return img.assetId;
          return newUploadedIds[uploadIndex++] || '';
        }).filter(Boolean);

        if (allAssetIds.length > 0) {
          featuredAssetId = allAssetIds[featuredImageIndex] || allAssetIds[0];
        }
      }

      // Step 2: Create the product with multi-language translations (French is primary)
      const translations = [
        {
          languageCode: LanguageCode.Fr,
          name: formData.name,
          slug: formData.slug,
          description: formData.description,
        },
      ];

      // Add English translation if any English field is filled
      if (formData.nameEn || formData.descriptionEn) {
        translations.push({
          languageCode: LanguageCode.En,
          name: formData.nameEn || formData.name,
          slug: formData.slugEn || formData.slug,
          description: formData.descriptionEn || formData.description,
        });
      }

      // Add Arabic translation if any Arabic field is filled
      if (formData.nameAr || formData.descriptionAr) {
        translations.push({
          languageCode: LanguageCode.Ar,
          name: formData.nameAr || formData.name,
          slug: formData.slugAr || formData.slug,
          description: formData.descriptionAr || formData.description,
        });
      }

      const productResult = await createProduct({
        variables: {
          input: {
            enabled: formData.enabled,
            assetIds: allAssetIds,
            featuredAssetId,
            translations,
          },
        },
      });

      const productId = productResult.data?.createProduct?.id;
      if (!productId) {
        throw new Error('Echec de la creation du produit');
      }

      // Step 3: Process option groups and build ID mappings
      // Map temp IDs to real IDs for both groups and options
      const optionIdMap = new Map<string, string>(); // tempId -> realId

      for (const group of selectedOptionGroups) {
        let realGroupId = group.id;

        if (group.isNew) {
          // Create new option group
          const groupResult = await createProductOptionGroup({
            variables: {
              input: {
                code: group.code,
                translations: [
                  {
                    languageCode: LanguageCode.En,
                    name: group.name,
                  },
                ],
                options: [], // We'll create options separately
              },
            },
          });
          realGroupId = groupResult.data?.createProductOptionGroup?.id || '';
          if (!realGroupId) {
            throw new Error(`Echec de la creation du groupe d'options: ${group.name}`);
          }
        }

        // Add option group to product
        await addOptionGroupToProduct({
          variables: {
            productId,
            optionGroupId: realGroupId,
          },
        });

        // Process options for this group
        for (const option of group.options) {
          if (option.isNew) {
            // Create new option
            const optionResult = await createProductOption({
              variables: {
                input: {
                  productOptionGroupId: realGroupId,
                  code: option.code,
                  translations: [
                    {
                      languageCode: LanguageCode.En,
                      name: option.name,
                    },
                  ],
                },
              },
            });
            const realOptionId = optionResult.data?.createProductOption?.id || '';
            if (realOptionId) {
              optionIdMap.set(option.id, realOptionId);
            }
          } else {
            // Existing option - ID stays the same
            optionIdMap.set(option.id, option.id);
          }
        }
      }

      // Step 4: Create variants with resolved option IDs
      if (pendingVariants.length > 0) {
        const variantInputs = pendingVariants
          .filter((v) => v.sku.trim())
          .map((v) => ({
            productId,
            sku: v.sku,
            price: Math.round(v.price * 100), // Convert to cents
            stockOnHand: v.stock,
            optionIds: v.optionIds
              .map((tempId) => optionIdMap.get(tempId) || tempId)
              .filter(Boolean),
            translations: [
              {
                languageCode: LanguageCode.En,
                name: v.optionLabels || v.sku,
              },
            ],
          }));

        if (variantInputs.length > 0) {
          await createVariants({
            variables: {
              input: variantInputs,
            },
          });
        }
      }

      // Step 5: Update product facets (attributes)
      if (selectedFacetValueIds.length > 0) {
        await updateProductFacets({
          variables: {
            productId,
            facetValueIds: selectedFacetValueIds,
          },
        });
      }

      // Step 6: Add product to selected collections
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
      case 5:
        return true;
      case 3:
        // If no option groups, allow to proceed (variants optional for simple products)
        // If option groups exist, need at least one variant
        if (selectedOptionGroups.length === 0) return true;
        return pendingVariants.length > 0;
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
            <div className="flex items-center gap-2 pb-4 border-b border-border">
              <span className="px-2 py-0.5 bg-blue-500/20 text-blue-500 rounded text-xs font-bold">FR</span>
              <span className="font-medium text-foreground">Langue principale : Francais</span>
            </div>

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

            <label className="flex items-center gap-3 p-3 bg-muted rounded-lg cursor-pointer hover:bg-accent w-fit">
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
        );

      case 1:
        return (
          <div className="space-y-8">
            <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
              <p className="text-sm text-blue-300">
                <Globe className="inline h-4 w-4 mr-2" />
                Configurez les traductions anglaise et arabe pour ce produit. Ces champs sont
                optionnels.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-500 rounded text-xs font-bold">EN</span> Anglais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    label="Nom"
                    name="nameEn"
                    value={formData.nameEn}
                    onChange={(e) => {
                      handleInputChange(e);
                      // Auto-generate English slug if empty
                      if (!formData.slugEn) {
                        setFormData(prev => ({
                          ...prev,
                          slugEn: generateSlug(e.target.value),
                        }));
                      }
                    }}
                    placeholder="Product name in English"
                  />
                  <Input
                    label="Slug (URL)"
                    name="slugEn"
                    value={formData.slugEn}
                    onChange={handleInputChange}
                    placeholder="my-product-en"
                  />
                  <TextArea
                    label="Description"
                    name="descriptionEn"
                    value={formData.descriptionEn}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Description in English"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <span className="px-2 py-0.5 bg-green-500/20 text-green-500 rounded text-xs font-bold">AR</span> Arabe
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
                  <Input
                    label="Slug (URL)"
                    name="slugAr"
                    value={formData.slugAr}
                    onChange={handleInputChange}
                    placeholder="mon-produit-ar"
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
              <p className="text-xs text-muted-foreground/70 mt-4">
                PNG, JPG, WEBP jusqu a 10MB chacun
              </p>
            </div>

            {/* Select from Library Button */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setShowAssetPicker(true)}
                className="flex items-center gap-2 px-6 py-3 border-2 border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors font-medium"
              >
                <ImagePlus className="h-5 w-5" />
                Sélectionner depuis la bibliothèque
              </button>
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
                        className="h-32 w-full object-contain"
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
                <p className="text-sm text-muted-foreground/70">
                  Les images sont optionnelles mais recommandees
                </p>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <VariantManagerCreate
            productName={formData.name}
            allOptionGroups={optionGroups.map((g: any) => ({
              id: g.id,
              code: g.code,
              name: g.name,
              options: g.options?.map((o: any) => ({
                id: o.id,
                code: o.code,
                name: o.name,
              })) || [],
            }))}
            selectedOptionGroups={selectedOptionGroups}
            pendingVariants={pendingVariants}
            onOptionGroupsChange={setSelectedOptionGroups}
            onVariantsChange={setPendingVariants}
          />
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
              <p className="text-sm text-blue-300">
                <Tag className="inline h-4 w-4 mr-2" />
                Selectionnez les attributs (taille, couleur, etc.) pour ce produit.
              </p>
            </div>

            <FacetSelector
              selectedIds={selectedFacetValueIds}
              onChange={setSelectedFacetValueIds}
            />
          </div>
        );

      case 5:
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
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
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
                      {pendingVariants.filter((v) => v.sku).length}
                    </p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Attributs</p>
                    <p className="font-semibold text-foreground">{selectedFacetValueIds.length}</p>
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

      {/* Asset Picker Modal */}
      <AssetPickerModal
        isOpen={showAssetPicker}
        onClose={() => setShowAssetPicker(false)}
        onSelect={handleSelectFromLibrary}
        multiple={true}
        selectedIds={images.filter((img) => img.assetId).map((img) => img.assetId!)}
        title="Sélectionner des images"
      />
    </div>
  );
};
