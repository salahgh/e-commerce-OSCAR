import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  ArrowLeft,
  Save,
  Package,
  Globe,
  Layers,
  Image as ImageIcon,
  Trash2,
  Star,
  Eye,
  FolderTree,
  Tag,
  Upload,
  Check,
  GripVertical,
  RefreshCw,
  ImagePlus,
  Radio,
  Plus,
  Minus,
} from 'lucide-react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { addToast } from '../../store/slices/uiSlice';
import {
  AdminProductDocument,
  UpdateProductDocument,
  DeleteProductDocument,
  SetProductFeaturedAssetDocument,
  AdminCollectionsWithFiltersDocument,
  UpdateCollectionFiltersDocument,
  CreateAssetsDocument,
  AddAssetsToProductDocument,
  AdminProductOptionGroupsDocument,
  UpdateProductFacetsDocument,
  AdminChannelsDocument,
  AssignProductsToChannelDocument,
  RemoveProductsFromChannelDocument,
  LanguageCode,
} from '../../graphql/generated/graphql';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { TextArea } from '../../components/ui/TextArea';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { VariantManager } from '../../components/products/VariantManager';
import { FacetSelector } from '../../components/products/FacetSelector';
import { AssetPickerModal } from '../../components/ui/AssetPickerModal';
import { formatPrice, formatDateTime } from '../../lib/utils';

// Wizard steps - matching ProductCreate
const STEPS = [
  { id: 'general', label: 'Informations', icon: Package },
  { id: 'translations', label: 'Traductions', icon: Globe },
  { id: 'images', label: 'Images', icon: ImageIcon },
  { id: 'variants', label: 'Variantes', icon: Layers },
  { id: 'facets', label: 'Attributs', icon: Tag },
  { id: 'categories', label: 'Catégories', icon: FolderTree },
  { id: 'channels', label: 'Canaux', icon: Radio },
];

// Helper to get translation value from product translations array
const getTranslation = (translations: any[] | undefined, lang: string, field: string): string => {
  if (!translations) return '';
  const translation = translations.find((t: any) => t.languageCode === lang);
  return translation?.[field] || '';
};

// Validation schema for product form
const ProductSchema = Yup.object().shape({
  name: Yup.string().required('Nom requis'), // Primary language: French
  slug: Yup.string().required('Slug requis'),
  description: Yup.string(),
  enabled: Yup.boolean(),
  nameEn: Yup.string(), // English translation
  slugEn: Yup.string(),
  descriptionEn: Yup.string(),
  nameAr: Yup.string(), // Arabic translation
  slugAr: Yup.string(),
  descriptionAr: Yup.string(),
});

export const ProductEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step navigation state
  const [currentStep, setCurrentStep] = useState(0);

  // Dialog states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Image upload state
  const [uploadingImages, setUploadingImages] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null);
  const [showAssetPicker, setShowAssetPicker] = useState(false);

  // Collections state
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [savingCollections, setSavingCollections] = useState(false);

  // Facets state
  const [selectedFacetValueIds, setSelectedFacetValueIds] = useState<string[]>([]);
  const [savingFacets, setSavingFacets] = useState(false);

  // Channels state
  const [selectedChannelIds, setSelectedChannelIds] = useState<string[]>([]);

  // Fetch product data
  const { data, loading, error, refetch } = useQuery(AdminProductDocument, {
    variables: { id: id! },
    skip: !id,
    fetchPolicy: 'network-only', // Force fresh fetch to ensure assets are loaded
  });

  // Fetch all collections for category assignment
  const { data: collectionsData } = useQuery(AdminCollectionsWithFiltersDocument, {
    variables: { options: { take: 100 } },
  });

  // Fetch option groups
  const { data: optionGroupsData } = useQuery(AdminProductOptionGroupsDocument);

  // Mutations
  const [updateProduct, { loading: updating }] = useMutation(UpdateProductDocument);
  const [deleteProduct, { loading: deleting }] = useMutation(DeleteProductDocument);
  const [setFeaturedAsset] = useMutation(SetProductFeaturedAssetDocument);
  const [updateCollectionFilters] = useMutation(UpdateCollectionFiltersDocument);
  const [createAssets] = useMutation(CreateAssetsDocument);
  const [addAssetsToProduct] = useMutation(AddAssetsToProductDocument);
  const [updateProductFacets] = useMutation(UpdateProductFacetsDocument);
  const [assignProductsToChannel, { loading: assigningChannel }] = useMutation(
    AssignProductsToChannelDocument
  );
  const [removeProductsFromChannel, { loading: removingChannel }] = useMutation(
    RemoveProductsFromChannelDocument
  );

  // Channels list
  const { data: channelsData } = useQuery(AdminChannelsDocument, {
    variables: { options: { take: 100 } },
  });
  const channels = channelsData?.channels?.items || [];

  const product = data?.product;
  const allCollections = collectionsData?.collections?.items || [];
  const allOptionGroups = optionGroupsData?.productOptionGroups || [];

  // Helper function to get product IDs from a collection's filters
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

  // Determine which collections currently contain this product
  const getInitialSelectedCollections = (): string[] => {
    if (!id || !allCollections.length) return [];
    return allCollections
      .filter((col: any) => getProductIdsFromCollection(col).includes(id))
      .map((col: any) => col.id);
  };

  // Update selected collections when data is loaded
  useEffect(() => {
    if (allCollections.length && id) {
      setSelectedCollections(getInitialSelectedCollections());
    }
  }, [allCollections.length, id]);

  // Update selected facet values when product data is loaded
  useEffect(() => {
    if (product?.facetValues) {
      setSelectedFacetValueIds(product.facetValues.map((fv: any) => fv.id));
    }
  }, [product?.facetValues]);

  // Initialize formik with product data - using native Vendure translations (French is primary)
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      // Primary language: French - read from 'fr' translation or fall back to default name
      name: getTranslation(product?.translations, 'fr', 'name') || product?.name || '',
      slug: getTranslation(product?.translations, 'fr', 'slug') || product?.slug || '',
      description: getTranslation(product?.translations, 'fr', 'description') || product?.description || '',
      enabled: product?.enabled ?? true,
      // English translations
      nameEn: getTranslation(product?.translations, 'en', 'name'),
      slugEn: getTranslation(product?.translations, 'en', 'slug'),
      descriptionEn: getTranslation(product?.translations, 'en', 'description'),
      // Arabic translations
      nameAr: getTranslation(product?.translations, 'ar', 'name'),
      slugAr: getTranslation(product?.translations, 'ar', 'slug'),
      descriptionAr: getTranslation(product?.translations, 'ar', 'description'),
    },
    validationSchema: ProductSchema,
    onSubmit: async (values) => {
      try {
        // Build translations array with FR (primary), EN, AR
        const translations = [
          {
            languageCode: LanguageCode.Fr,
            name: values.name,
            slug: values.slug,
            description: values.description,
          },
        ];

        // Add English translation if any English field is filled
        if (values.nameEn || values.descriptionEn) {
          translations.push({
            languageCode: LanguageCode.En,
            name: values.nameEn || values.name,
            slug: values.slugEn || values.slug,
            description: values.descriptionEn || values.description,
          });
        }

        // Add Arabic translation if any Arabic field is filled
        if (values.nameAr || values.descriptionAr) {
          translations.push({
            languageCode: LanguageCode.Ar,
            name: values.nameAr || values.name,
            slug: values.slugAr || values.slug,
            description: values.descriptionAr || values.description,
          });
        }

        await updateProduct({
          variables: {
            input: {
              id: id!,
              enabled: values.enabled,
              translations,
            },
          },
        });
        dispatch(addToast({ message: 'Produit mis à jour avec succès!', type: 'success' }));
        refetch();
      } catch (err: any) {
        dispatch(
          addToast({ message: err.message || 'Erreur lors de la mise à jour', type: 'error' })
        );
      }
    },
  });

  // Handle setting featured asset
  const handleSetFeaturedAsset = async (assetId: string) => {
    try {
      await setFeaturedAsset({
        variables: { productId: id!, assetId },
      });
      dispatch(addToast({ message: 'Image principale définie!', type: 'success' }));
      refetch();
    } catch (err: any) {
      dispatch(addToast({ message: err.message || 'Erreur', type: 'error' }));
    }
  };

  // Handle removing asset from product
  const handleRemoveAsset = async (assetId: string) => {
    if (!product?.assets) return;

    try {
      const remainingAssetIds = product.assets.filter((a) => a.id !== assetId).map((a) => a.id);

      await updateProduct({
        variables: {
          input: {
            id: id!,
            assetIds: remainingAssetIds,
          },
        },
      });

      dispatch(addToast({ message: 'Image supprimée du produit!', type: 'success' }));
      refetch();
    } catch (err: any) {
      dispatch(addToast({ message: err.message || 'Erreur', type: 'error' }));
    }
  };

  // Handle file drop
  const handleFileDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDraggingOver(false);
      const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'));
      if (files.length > 0) {
        await uploadFiles(files);
      }
    },
    [id, product]
  );

  // Handle file select
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      await uploadFiles(files);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Upload files
  const uploadFiles = async (files: File[]) => {
    if (!product) return;

    setUploadingImages(true);
    try {
      const assetResult = await createAssets({
        variables: {
          input: files.map((file) => ({ file })),
        },
      });

      const uploadedAssets = assetResult.data?.createAssets || [];
      const newAssetIds = uploadedAssets
        .filter((a: any) => a.__typename === 'Asset' || a.id)
        .map((a: any) => a.id);

      if (newAssetIds.length === 0) {
        throw new Error('Aucune image téléchargée');
      }

      const existingAssetIds = product.assets?.map((a) => a.id) || [];
      await addAssetsToProduct({
        variables: {
          productId: id!,
          assetIds: [...existingAssetIds, ...newAssetIds],
        },
      });

      dispatch(
        addToast({ message: `${newAssetIds.length} image(s) ajoutée(s)!`, type: 'success' })
      );
      refetch();
    } catch (err: any) {
      console.error('Upload error:', err);
      dispatch(
        addToast({ message: err.message || 'Erreur lors du téléchargement', type: 'error' })
      );
    } finally {
      setUploadingImages(false);
    }
  };

  // Handle selecting assets from the library picker
  const handleSelectFromLibrary = async (selectedAssets: any[]) => {
    if (!product || selectedAssets.length === 0) {
      setShowAssetPicker(false);
      return;
    }

    try {
      const existingAssetIds = product.assets?.map((a) => a.id) || [];
      const newAssetIds = selectedAssets
        .map((a) => a.id)
        .filter((id) => !existingAssetIds.includes(id)); // Avoid duplicates

      if (newAssetIds.length === 0) {
        dispatch(addToast({ message: 'Ces images sont déjà associées au produit', type: 'info' }));
        setShowAssetPicker(false);
        return;
      }

      await addAssetsToProduct({
        variables: {
          productId: id!,
          assetIds: [...existingAssetIds, ...newAssetIds],
        },
      });

      dispatch(
        addToast({ message: `${newAssetIds.length} image(s) ajoutée(s) depuis la bibliothèque!`, type: 'success' })
      );
      refetch();
    } catch (err: any) {
      console.error('Add assets error:', err);
      dispatch(
        addToast({ message: err.message || 'Erreur lors de l\'ajout des images', type: 'error' })
      );
    } finally {
      setShowAssetPicker(false);
    }
  };

  // Handle image drag reordering
  const handleImageDragStart = (index: number) => {
    setDraggedImageIndex(index);
  };

  const handleImageDragOver = async (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedImageIndex === null || draggedImageIndex === index || !product?.assets) return;

    const assets = [...product.assets];
    const draggedAsset = assets[draggedImageIndex];
    assets.splice(draggedImageIndex, 1);
    assets.splice(index, 0, draggedAsset);

    // Update product with new asset order
    try {
      await updateProduct({
        variables: {
          input: {
            id: id!,
            assetIds: assets.map((a) => a.id),
          },
        },
      });
      setDraggedImageIndex(index);
      refetch();
    } catch (err) {
      console.error('Reorder error:', err);
    }
  };

  const handleImageDragEnd = () => {
    setDraggedImageIndex(null);
  };

  // Handle saving collection assignments
  const handleSaveCollections = async () => {
    if (!id) return;

    setSavingCollections(true);
    try {
      const initialCollections = getInitialSelectedCollections();
      const collectionsToAdd = selectedCollections.filter(
        (cid) => !initialCollections.includes(cid)
      );
      const collectionsToRemove = initialCollections.filter(
        (cid) => !selectedCollections.includes(cid)
      );

      for (const collectionId of collectionsToAdd) {
        const collection = allCollections.find((c: any) => c.id === collectionId);
        if (!collection) continue;

        const currentProductIds = getProductIdsFromCollection(collection);
        const newProductIds = [...currentProductIds, id];

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

      for (const collectionId of collectionsToRemove) {
        const collection = allCollections.find((c: any) => c.id === collectionId);
        if (!collection) continue;

        const currentProductIds = getProductIdsFromCollection(collection);
        const newProductIds = currentProductIds.filter((pid: string) => pid !== id);

        if (newProductIds.length > 0) {
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
        } else {
          await updateCollectionFilters({
            variables: {
              id: collectionId,
              filters: [],
            },
          });
        }
      }

      dispatch(addToast({ message: 'Catégories mises à jour!', type: 'success' }));
      refetch();
    } catch (err: any) {
      dispatch(
        addToast({
          message: err.message || 'Erreur lors de la mise à jour des catégories',
          type: 'error',
        })
      );
    } finally {
      setSavingCollections(false);
    }
  };

  // Handle saving facet values
  const handleSaveFacets = async () => {
    if (!id) return;

    setSavingFacets(true);
    try {
      await updateProductFacets({
        variables: {
          productId: id,
          facetValueIds: selectedFacetValueIds,
        },
      });

      dispatch(addToast({ message: 'Attributs mis à jour!', type: 'success' }));
      refetch();
    } catch (err: any) {
      dispatch(
        addToast({
          message: err.message || 'Erreur lors de la mise à jour des attributs',
          type: 'error',
        })
      );
    } finally {
      setSavingFacets(false);
    }
  };

  // Handle product deletion
  const handleDelete = async () => {
    try {
      const result = await deleteProduct({ variables: { id: id! } });
      if (result.data?.deleteProduct?.result === 'DELETED') {
        dispatch(addToast({ message: 'Produit supprimé avec succès!', type: 'success' }));
        navigate('/products');
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
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96">
        <Package className="h-16 w-16 text-muted-foreground mb-4" />
        <p className="text-muted-foreground text-lg mb-4">Produit non trouvé</p>
        <Link to="/products" className="text-primary hover:text-primary/80">
          Retour à la liste
        </Link>
      </div>
    );
  }

  const totalStock = product.variants?.reduce((sum, v) => sum + (v.stockOnHand || 0), 0) || 0;
  const mainVariant = product.variants?.[0];

  // Tab content components
  const GeneralTab = (
    <div className="space-y-6">
      <div className="flex items-center gap-2 pb-4 border-b border-border">
        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-500 rounded text-xs font-bold">FR</span>
        <span className="font-medium text-foreground">Langue principale : Francais</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Nom *"
          value={formik.values.name}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          name="name"
          error={formik.touched.name ? formik.errors.name : undefined}
          required
        />
        <Input
          label="Slug *"
          value={formik.values.slug}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          name="slug"
          error={formik.touched.slug ? formik.errors.slug : undefined}
          required
          helperText="Identifiant URL unique"
        />
      </div>
      <TextArea
        label="Description"
        value={formik.values.description}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        name="description"
        rows={4}
      />
      <label className="flex items-center gap-2 p-3 bg-muted rounded-lg cursor-pointer hover:bg-accent w-fit">
        <input
          type="checkbox"
          checked={formik.values.enabled}
          onChange={(e) => formik.setFieldValue('enabled', e.target.checked)}
          className="h-4 w-4 text-primary border-border rounded focus:ring-primary bg-card"
        />
        <span className="text-sm font-medium text-muted-foreground">Produit actif</span>
      </label>
    </div>
  );

  const LocalizationTab = (
    <div className="space-y-6">
      <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-300">
          <Globe className="inline h-4 w-4 mr-2" />
          Configurez les traductions anglaise et arabe pour ce produit.
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
              value={formik.values.nameEn}
              onChange={formik.handleChange}
              name="nameEn"
              placeholder="Product name in English"
            />
            <Input
              label="Slug (URL)"
              value={formik.values.slugEn}
              onChange={formik.handleChange}
              name="slugEn"
              placeholder="my-product-en"
            />
            <TextArea
              label="Description"
              value={formik.values.descriptionEn}
              onChange={formik.handleChange}
              name="descriptionEn"
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
              value={formik.values.nameAr}
              onChange={formik.handleChange}
              name="nameAr"
              placeholder="اسم المنتج بالعربية"
              dir="rtl"
            />
            <Input
              label="Slug (URL)"
              value={formik.values.slugAr}
              onChange={formik.handleChange}
              name="slugAr"
              placeholder="mon-produit-ar"
            />
            <TextArea
              label="Description"
              value={formik.values.descriptionAr}
              onChange={formik.handleChange}
              name="descriptionAr"
              rows={4}
              placeholder="وصف المنتج بالعربية"
              dir="rtl"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const ImagesTab = (
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
        {uploadingImages ? (
          <div className="flex flex-col items-center">
            <RefreshCw className="h-12 w-12 text-primary animate-spin mb-4" />
            <p className="text-lg font-medium text-foreground">Téléchargement en cours...</p>
          </div>
        ) : (
          <>
            <Upload
              className={`h-12 w-12 mx-auto mb-4 ${isDraggingOver ? 'text-primary' : 'text-muted-foreground'}`}
            />
            <p className="text-lg font-medium text-foreground">Glissez-déposez vos images ici</p>
            <p className="text-sm text-muted-foreground mt-2">
              ou cliquez pour sélectionner des fichiers
            </p>
            <p className="text-xs text-muted-foreground/70 mt-4">
              PNG, JPG, WEBP jusqu'à 10MB chacun
            </p>
          </>
        )}
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

      {/* Featured Asset */}
      {product.featuredAsset && (
        <div>
          <h3 className="text-sm font-medium text-foreground mb-3">Image principale</h3>
          <div className="relative inline-block">
            <img
              src={product.featuredAsset.preview}
              alt={product.featuredAsset.name}
              className="h-48 w-48 object-contain rounded-lg border-2 border-yellow-500 ring-2 ring-yellow-500/30"
            />
            <Badge variant="warning" className="absolute top-2 left-2">
              <Star className="h-3 w-3 mr-1" />
              Principale
            </Badge>
          </div>
        </div>
      )}

      {/* All Assets Gallery */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-foreground">
            Galerie ({product.assets?.length || 0} images)
          </h3>
          <p className="text-xs text-muted-foreground">
            Glissez pour réorganiser - Cliquez sur <Star className="inline h-3 w-3" /> pour définir
            l'image principale
          </p>
        </div>

        {product.assets && product.assets.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {product.assets.map((asset, index) => {
              const isFeatured = product.featuredAsset?.id === asset.id;
              return (
                <div
                  key={asset.id}
                  draggable
                  onDragStart={() => handleImageDragStart(index)}
                  onDragOver={(e) => handleImageDragOver(e, index)}
                  onDragEnd={handleImageDragEnd}
                  className={`relative group rounded-lg overflow-hidden border-2 cursor-move transition-all ${
                    isFeatured
                      ? 'border-yellow-500 ring-2 ring-yellow-500/30'
                      : 'border-border hover:border-muted-foreground'
                  } ${draggedImageIndex === index ? 'opacity-50 scale-95' : ''}`}
                >
                  <img src={asset.preview} alt={asset.name} className="h-32 w-full object-contain" />
                  <div className="absolute top-1 left-1 p-1 bg-background/80 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                  </div>
                  {isFeatured && (
                    <Badge variant="warning" className="absolute top-1 right-1 text-xs">
                      <Star className="h-2 w-2" />
                    </Badge>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    {!isFeatured && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetFeaturedAsset(asset.id);
                        }}
                        className="p-2 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition-colors"
                        title="Définir comme principale"
                      >
                        <Star className="h-4 w-4" />
                      </button>
                    )}
                    <a
                      href={asset.source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                      title="Voir l'original"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Eye className="h-4 w-4" />
                    </a>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveAsset(asset.id);
                      }}
                      className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                      title="Retirer du produit"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-muted/50 border border-border rounded-lg p-8 text-center">
            <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Aucune image disponible</p>
            <p className="text-sm text-muted-foreground/70 mt-2">
              Glissez-déposez des images ci-dessus ou cliquez pour ajouter
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const VariantsTab = (
    <VariantManager
      productId={id!}
      productName={product?.name || ''}
      optionGroups={product?.optionGroups || []}
      variants={product?.variants || []}
      allOptionGroups={allOptionGroups}
      onRefetch={refetch}
    />
  );

  const FacetsTab = (
    <div className="space-y-6">
      <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
        <p className="text-sm text-blue-300">
          <Tag className="inline h-4 w-4 mr-2" />
          Sélectionnez les attributs (taille, couleur, etc.) pour ce produit.
        </p>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-foreground">Attributs</h3>
        <Button
          onClick={handleSaveFacets}
          loading={savingFacets}
          disabled={savingFacets}
          icon={<Save className="h-4 w-4" />}
        >
          Sauvegarder les attributs
        </Button>
      </div>

      <FacetSelector
        selectedIds={selectedFacetValueIds}
        onChange={setSelectedFacetValueIds}
      />
    </div>
  );

  const CategoriesTab = (
    <div className="space-y-6">
      <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
        <p className="text-sm text-blue-300">
          <FolderTree className="inline h-4 w-4 mr-2" />
          Sélectionnez les catégories où ce produit sera visible.
        </p>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-foreground">Catégories</h3>
        <Button
          onClick={handleSaveCollections}
          loading={savingCollections}
          disabled={savingCollections}
          icon={<Save className="h-4 w-4" />}
        >
          Sauvegarder les catégories
        </Button>
      </div>

      {allCollections.length === 0 ? (
        <div className="bg-muted/50 border border-border rounded-lg p-8 text-center">
          <FolderTree className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Aucune catégorie disponible</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {allCollections.map((collection: any) => (
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
                      selectedCollections.filter((cid) => cid !== collection.id)
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
    </div>
  );

  const handleChannelAction = async (action: 'assign' | 'remove') => {
    if (!product || selectedChannelIds.length === 0) return;
    const mutate = action === 'assign' ? assignProductsToChannel : removeProductsFromChannel;
    try {
      for (const channelId of selectedChannelIds) {
        await mutate({
          variables: {
            input: { channelId, productIds: [product.id] },
          },
        });
      }
      const names = selectedChannelIds
        .map((cid) => channels.find((c) => c.id === cid)?.code)
        .filter(Boolean)
        .join(', ');
      dispatch(
        addToast({
          message:
            action === 'assign'
              ? `Produit assigné à ${names}`
              : `Produit retiré de ${names}`,
          type: 'success',
        })
      );
      setSelectedChannelIds([]);
      refetch();
    } catch (err: any) {
      dispatch(
        addToast({
          message: err.message || 'Erreur lors de la mise à jour des canaux',
          type: 'error',
        })
      );
    }
  };

  const productChannelIds = new Set((product?.channels || []).map((c) => c.id));

  const ChannelsTab = (
    <div className="space-y-6">
      <div className="bg-cyan-900/30 border border-cyan-700 rounded-lg p-4">
        <p className="text-sm text-cyan-300">
          <Radio className="inline h-4 w-4 mr-2" />
          Gérer la disponibilité de ce produit sur chacun de vos canaux de vente.
        </p>
      </div>

      {channels.length === 0 ? (
        <div className="bg-muted/50 border border-border rounded-lg p-8 text-center text-muted-foreground">
          Aucun canal disponible
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-foreground">Canaux actuels</h3>
            <div className="flex flex-wrap gap-2">
              {(product?.channels || []).map((c) => (
                <Badge key={c.id} variant="success">{c.code}</Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium text-foreground">Sélectionner des canaux</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {channels.map((ch) => {
                const checked = selectedChannelIds.includes(ch.id);
                const assigned = productChannelIds.has(ch.id);
                return (
                  <label
                    key={ch.id}
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      checked
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-muted-foreground'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        setSelectedChannelIds((prev) =>
                          checked ? prev.filter((id) => id !== ch.id) : [...prev, ch.id]
                        )
                      }
                      className="h-5 w-5 text-primary border-border rounded bg-card"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-foreground">
                        {ch.code}
                        {assigned && (
                          <Badge variant="success" className="ml-2">Assigné</Badge>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {ch.defaultLanguageCode} · {ch.defaultCurrencyCode}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                variant="primary"
                icon={<Plus className="h-4 w-4" />}
                disabled={selectedChannelIds.length === 0}
                loading={assigningChannel}
                onClick={() => handleChannelAction('assign')}
              >
                Assigner aux canaux sélectionnés
              </Button>
              <Button
                variant="secondary"
                icon={<Minus className="h-4 w-4" />}
                disabled={selectedChannelIds.length === 0}
                loading={removingChannel}
                onClick={() => handleChannelAction('remove')}
              >
                Retirer des canaux
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );

  // Step navigation
  const goToStep = (step: number) => {
    if (step >= 0 && step < STEPS.length) {
      setCurrentStep(step);
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return GeneralTab;
      case 1:
        return LocalizationTab;
      case 2:
        return ImagesTab;
      case 3:
        return VariantsTab;
      case 4:
        return FacetsTab;
      case 5:
        return CategoriesTab;
      case 6:
        return ChannelsTab;
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
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{product.name}</h1>
              <Badge variant={product.enabled ? 'success' : 'default'}>
                {product.enabled ? 'Actif' : 'Inactif'}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              ID: {product.id} | Créé le {formatDateTime(product.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="danger"
            icon={<Trash2 className="h-4 w-4" />}
            onClick={() => setShowDeleteDialog(true)}
          >
            Supprimer
          </Button>
          <Button
            variant="primary"
            icon={<Save className="h-4 w-4" />}
            onClick={() => formik.handleSubmit()}
            loading={updating}
          >
            Enregistrer
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              {product.featuredAsset?.preview ? (
                <img
                  src={product.featuredAsset.preview}
                  alt=""
                  className="h-12 w-12 rounded-lg object-contain"
                />
              ) : (
                <div className="h-12 w-12 bg-muted rounded-lg flex items-center justify-center">
                  <Package className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">SKU Principal</p>
                <p className="font-semibold text-foreground">{mainVariant?.sku || '-'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Prix</p>
            <p className="text-xl font-bold text-foreground">
              {mainVariant?.price ? formatPrice(mainVariant.price / 100) : '-'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Stock Total</p>
            <p
              className={`text-xl font-bold ${
                totalStock === 0
                  ? 'text-red-400'
                  : totalStock < 10
                    ? 'text-orange-400'
                    : 'text-green-400'
              }`}
            >
              {totalStock} unités
            </p>
            <p className="text-sm text-muted-foreground">
              {product.variants?.length || 0} variante(s)
            </p>
          </CardContent>
        </Card>
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
          Précédent
        </Button>

        <div className="flex items-center gap-3">
          {currentStep < STEPS.length - 1 ? (
            <Button onClick={() => goToStep(currentStep + 1)}>Suivant</Button>
          ) : (
            <Button
              onClick={() => formik.handleSubmit()}
              loading={updating}
              icon={<Save className="h-4 w-4" />}
            >
              Enregistrer
            </Button>
          )}
        </div>
      </div>

      {/* Delete Product Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Supprimer le produit"
        message={`Êtes-vous sûr de vouloir supprimer "${product.name}"? Cette action est irréversible.`}
        confirmText="Supprimer"
        variant="danger"
        loading={deleting}
      />

      {/* Asset Picker Modal */}
      <AssetPickerModal
        isOpen={showAssetPicker}
        onClose={() => setShowAssetPicker(false)}
        onSelect={handleSelectFromLibrary}
        multiple={true}
        selectedIds={product.assets?.map((a) => a.id) || []}
        title="Sélectionner des images"
      />
    </div>
  );
};
