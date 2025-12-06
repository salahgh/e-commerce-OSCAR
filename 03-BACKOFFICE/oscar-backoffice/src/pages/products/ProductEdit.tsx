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
  DollarSign,
  Settings,
  Layers,
  Image as ImageIcon,
  Trash2,
  Star,
  Eye,
  X,
  Edit3,
  FolderTree,
  Upload,
  Plus,
  Check,
  GripVertical,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { addToast } from '../../store/slices/uiSlice';
import {
  AdminProductDocument,
  UpdateProductDocument,
  UpdateProductVariantsDocument,
  DeleteProductDocument,
  SetProductFeaturedAssetDocument,
  AdminCollectionsWithFiltersDocument,
  UpdateCollectionFiltersDocument,
  CreateAssetsDocument,
  AddAssetsToProductDocument,
  CreateProductVariantsDocument,
  DeleteProductVariantDocument,
  AdminProductOptionGroupsDocument,
  AddOptionGroupToProductDocument,
  RemoveOptionGroupFromProductDocument,
  CreateProductOptionGroupDocument,
  CreateProductOptionDocument,
  DeleteProductOptionDocument,
  LanguageCode,
} from '../../graphql/generated/graphql';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { TextArea } from '../../components/ui/TextArea';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { formatPrice, formatDateTime } from '../../lib/utils';

// Wizard steps - matching ProductCreate
const STEPS = [
  { id: 'general', label: 'Informations', icon: Package },
  { id: 'translations', label: 'Traductions', icon: Globe },
  { id: 'images', label: 'Images', icon: ImageIcon },
  { id: 'variants', label: 'Variantes', icon: Layers },
  { id: 'categories', label: 'Catégories', icon: FolderTree },
];

// Validation schema for product form
const ProductSchema = Yup.object().shape({
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

interface NewVariant {
  sku: string;
  price: number;
  stock: number;
  options: Record<string, string>;
}

export const ProductEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step navigation state
  const [currentStep, setCurrentStep] = useState(0);

  // Dialog states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDeleteVariantDialog, setShowDeleteVariantDialog] = useState<string | null>(null);

  // Variant editing state
  const [editingVariant, setEditingVariant] = useState<string | null>(null);
  const [variantEdits, setVariantEdits] = useState<
    Record<string, { sku: string; price: number; stock: number; enabled: boolean }>
  >({});

  // Add variant state
  const [showAddVariant, setShowAddVariant] = useState(false);
  const [newVariant, setNewVariant] = useState<NewVariant>({
    sku: '',
    price: 0,
    stock: 0,
    options: {},
  });
  const [selectedOptionGroupsForVariant, setSelectedOptionGroupsForVariant] = useState<string[]>(
    []
  );

  // Image upload state
  const [uploadingImages, setUploadingImages] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null);

  // Collections state
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [savingCollections, setSavingCollections] = useState(false);

  // Option groups state
  const [showCreateOptionGroup, setShowCreateOptionGroup] = useState(false);
  const [newOptionGroupName, setNewOptionGroupName] = useState('');
  const [newOptionGroupCode, setNewOptionGroupCode] = useState('');
  const [showAddOption, setShowAddOption] = useState<string | null>(null);
  const [newOptionName, setNewOptionName] = useState('');
  const [newOptionCode, setNewOptionCode] = useState('');

  // Fetch product data
  const { data, loading, error, refetch } = useQuery(AdminProductDocument, {
    variables: { id: id! },
    skip: !id,
  });

  // Fetch all collections for category assignment
  const { data: collectionsData } = useQuery(AdminCollectionsWithFiltersDocument, {
    variables: { options: { take: 100 } },
  });

  // Fetch option groups
  const { data: optionGroupsData } = useQuery(AdminProductOptionGroupsDocument);

  // Mutations
  const [updateProduct, { loading: updating }] = useMutation(UpdateProductDocument);
  const [updateVariants, { loading: updatingVariants }] = useMutation(
    UpdateProductVariantsDocument
  );
  const [deleteProduct, { loading: deleting }] = useMutation(DeleteProductDocument);
  const [setFeaturedAsset] = useMutation(SetProductFeaturedAssetDocument);
  const [updateCollectionFilters] = useMutation(UpdateCollectionFiltersDocument);
  const [createAssets] = useMutation(CreateAssetsDocument);
  const [addAssetsToProduct] = useMutation(AddAssetsToProductDocument);
  const [createVariants, { loading: creatingVariant }] = useMutation(CreateProductVariantsDocument);
  const [deleteVariant, { loading: deletingVariant }] = useMutation(DeleteProductVariantDocument);
  const [addOptionGroupToProduct] = useMutation(AddOptionGroupToProductDocument);
  const [removeOptionGroupFromProduct, { loading: removingOptionGroup }] = useMutation(
    RemoveOptionGroupFromProductDocument
  );
  const [createOptionGroup, { loading: creatingOptionGroup }] = useMutation(
    CreateProductOptionGroupDocument
  );
  const [createOption, { loading: creatingOption }] = useMutation(CreateProductOptionDocument);
  const [deleteOption] = useMutation(DeleteProductOptionDocument);

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

  // Initialize formik with product data
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: product?.name || '',
      slug: product?.slug || '',
      description: product?.description || '',
      enabled: product?.enabled ?? true,
      nameFr: product?.customFields?.nameFr || '',
      nameAr: product?.customFields?.nameAr || '',
      descriptionFr: product?.customFields?.descriptionFr || '',
      descriptionAr: product?.customFields?.descriptionAr || '',
      salePrice: product?.customFields?.salePrice ? product.customFields.salePrice / 100 : null,
      isFeatured: product?.customFields?.isFeatured ?? false,
      weightKg: product?.customFields?.weightKg || null,
      availableSizes: product?.customFields?.availableSizes?.join(', ') || '',
      availableColors: product?.customFields?.availableColors?.join(', ') || '',
    },
    validationSchema: ProductSchema,
    onSubmit: async (values) => {
      try {
        await updateProduct({
          variables: {
            input: {
              id: id!,
              enabled: values.enabled,
              translations: [
                {
                  languageCode: LanguageCode.En,
                  name: values.name,
                  slug: values.slug,
                  description: values.description,
                },
              ],
              customFields: {
                nameFr: values.nameFr || null,
                nameAr: values.nameAr || null,
                descriptionFr: values.descriptionFr || null,
                descriptionAr: values.descriptionAr || null,
                salePrice: values.salePrice ? Math.round(values.salePrice * 100) : null,
                isFeatured: values.isFeatured,
                weightKg: values.weightKg || null,
                availableSizes: values.availableSizes
                  ? values.availableSizes
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean)
                  : [],
                availableColors: values.availableColors
                  ? values.availableColors
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean)
                  : [],
              },
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

  // Handle variant update (sku, stock, price, enabled)
  const handleVariantUpdate = async (variantId: string) => {
    const edits = variantEdits[variantId];
    if (!edits) return;

    try {
      const result = await updateVariants({
        variables: {
          input: [
            {
              id: variantId,
              sku: edits.sku,
              price: Math.round(edits.price * 100),
              stockOnHand: edits.stock,
              enabled: edits.enabled,
            },
          ],
        },
        refetchQueries: [{ query: AdminProductDocument, variables: { id: id! } }],
        awaitRefetchQueries: true,
      });

      // Check if update was successful (Vendure returns null for failed updates)
      const updatedVariants = result.data?.updateProductVariants?.filter(Boolean);
      if (!updatedVariants || updatedVariants.length === 0) {
        dispatch(addToast({ message: 'Erreur: la mise à jour a échoué', type: 'error' }));
        return;
      }

      dispatch(addToast({ message: 'Variante mise à jour!', type: 'success' }));
      setEditingVariant(null);
      setVariantEdits((prev) => {
        const newEdits = { ...prev };
        delete newEdits[variantId];
        return newEdits;
      });
    } catch (err: any) {
      dispatch(
        addToast({ message: err.message || 'Erreur lors de la mise à jour', type: 'error' })
      );
    }
  };

  // Start editing a variant
  const startEditingVariant = (variant: any) => {
    setEditingVariant(variant.id);
    setVariantEdits({
      ...variantEdits,
      [variant.id]: {
        sku: variant.sku,
        price: variant.price / 100,
        stock: variant.stockOnHand,
        enabled: variant.enabled,
      },
    });
  };

  // Cancel editing a variant
  const cancelEditingVariant = () => {
    if (editingVariant) {
      setVariantEdits((prev) => {
        const newEdits = { ...prev };
        delete newEdits[editingVariant];
        return newEdits;
      });
    }
    setEditingVariant(null);
  };

  // Handle adding new variant
  const handleAddVariant = async () => {
    if (!newVariant.sku.trim()) {
      dispatch(addToast({ message: 'Le SKU est requis', type: 'error' }));
      return;
    }

    try {
      // First, add option groups to product if needed
      const existingOptionGroupIds = product?.optionGroups?.map((g: any) => g.id) || [];
      for (const groupId of selectedOptionGroupsForVariant) {
        if (!existingOptionGroupIds.includes(groupId)) {
          await addOptionGroupToProduct({
            variables: {
              productId: id!,
              optionGroupId: groupId,
            },
          });
        }
      }

      const result = await createVariants({
        variables: {
          input: [
            {
              productId: id!,
              sku: newVariant.sku,
              price: Math.round(newVariant.price * 100),
              stockOnHand: newVariant.stock,
              optionIds: Object.values(newVariant.options).filter(Boolean),
              translations: [
                {
                  languageCode: LanguageCode.En,
                  name: newVariant.sku,
                },
              ],
            },
          ],
        },
        refetchQueries: [{ query: AdminProductDocument, variables: { id: id! } }],
        awaitRefetchQueries: true,
      });

      // Check if variant was actually created (Vendure returns null for failed variants)
      const createdVariants = result.data?.createProductVariants?.filter(Boolean);
      if (!createdVariants || createdVariants.length === 0) {
        dispatch(
          addToast({
            message: "Erreur: la variante n'a pas été créée. Vérifiez les options sélectionnées.",
            type: 'error',
          })
        );
        return;
      }

      dispatch(addToast({ message: 'Variante ajoutée!', type: 'success' }));
      setShowAddVariant(false);
      setNewVariant({ sku: '', price: 0, stock: 0, options: {} });
      setSelectedOptionGroupsForVariant([]);
    } catch (err: any) {
      dispatch(addToast({ message: err.message || "Erreur lors de l'ajout", type: 'error' }));
    }
  };

  // Handle deleting variant
  const handleDeleteVariant = async (variantId: string) => {
    try {
      const result = await deleteVariant({
        variables: { id: variantId },
        refetchQueries: [{ query: AdminProductDocument, variables: { id: id! } }],
        awaitRefetchQueries: true,
      });
      if (result.data?.deleteProductVariant?.result === 'DELETED') {
        dispatch(addToast({ message: 'Variante supprimée!', type: 'success' }));
      } else {
        const errorMessage =
          result.data?.deleteProductVariant?.message || 'Erreur lors de la suppression';
        dispatch(addToast({ message: errorMessage, type: 'error' }));
      }
    } catch (err: any) {
      // Extract the actual error message from GraphQL errors
      const graphqlError =
        err.graphQLErrors?.[0]?.message || err.message || 'Erreur lors de la suppression';
      dispatch(addToast({ message: graphqlError, type: 'error' }));
    }
    setShowDeleteVariantDialog(null);
  };

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

  // Toggle option group for new variant
  const toggleOptionGroupForVariant = (groupId: string) => {
    setSelectedOptionGroupsForVariant((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]
    );
  };

  // Update new variant option
  const updateNewVariantOption = (groupId: string, optionId: string) => {
    setNewVariant((prev) => ({
      ...prev,
      options: { ...prev.options, [groupId]: optionId },
    }));
  };

  // Handle creating a new option group
  const handleCreateOptionGroup = async () => {
    if (!newOptionGroupName.trim()) {
      dispatch(addToast({ message: 'Le nom est requis', type: 'error' }));
      return;
    }

    const code =
      newOptionGroupCode.trim() ||
      newOptionGroupName
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');

    try {
      const result = await createOptionGroup({
        variables: {
          input: {
            code,
            translations: [
              {
                languageCode: LanguageCode.En,
                name: newOptionGroupName.trim(),
              },
            ],
            options: [],
          },
        },
        refetchQueries: [{ query: AdminProductOptionGroupsDocument }],
      });

      if (result.data?.createProductOptionGroup?.id) {
        // Automatically add the new option group to the product
        await addOptionGroupToProduct({
          variables: {
            productId: id!,
            optionGroupId: result.data.createProductOptionGroup.id,
          },
        });
        dispatch(
          addToast({ message: "Groupe d'options créé et ajouté au produit!", type: 'success' })
        );
        setShowCreateOptionGroup(false);
        setNewOptionGroupName('');
        setNewOptionGroupCode('');
        refetch();
      }
    } catch (err: any) {
      dispatch(addToast({ message: err.message || 'Erreur lors de la création', type: 'error' }));
    }
  };

  // Handle adding option group to product
  const handleAddOptionGroupToProduct = async (optionGroupId: string) => {
    try {
      await addOptionGroupToProduct({
        variables: {
          productId: id!,
          optionGroupId,
        },
      });
      dispatch(addToast({ message: "Groupe d'options ajouté!", type: 'success' }));
      refetch();
    } catch (err: any) {
      dispatch(addToast({ message: err.message || 'Erreur', type: 'error' }));
    }
  };

  // Handle removing option group from product
  const handleRemoveOptionGroupFromProduct = async (optionGroupId: string) => {
    try {
      const result = await removeOptionGroupFromProduct({
        variables: {
          productId: id!,
          optionGroupId,
          force: false,
        },
      });

      // Check if there was an error (ProductOptionInUseError)
      if (result.data?.removeOptionGroupFromProduct?.__typename === 'ProductOptionInUseError') {
        const error = result.data.removeOptionGroupFromProduct as any;
        dispatch(
          addToast({
            message: `Ce groupe d'options est utilisé par ${error.productVariantCount} variante(s). Supprimez d'abord les variantes.`,
            type: 'error',
          })
        );
      } else {
        dispatch(addToast({ message: "Groupe d'options retiré!", type: 'success' }));
        refetch();
      }
    } catch (err: any) {
      dispatch(addToast({ message: err.message || 'Erreur', type: 'error' }));
    }
  };

  // Handle creating a new option within a group
  const handleCreateOption = async (groupId: string) => {
    if (!newOptionName.trim()) {
      dispatch(addToast({ message: 'Le nom est requis', type: 'error' }));
      return;
    }

    const code =
      newOptionCode.trim() ||
      newOptionName
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');

    try {
      await createOption({
        variables: {
          input: {
            productOptionGroupId: groupId,
            code,
            translations: [
              {
                languageCode: LanguageCode.En,
                name: newOptionName.trim(),
              },
            ],
          },
        },
        refetchQueries: [
          { query: AdminProductOptionGroupsDocument },
          { query: AdminProductDocument, variables: { id: id! } },
        ],
      });

      dispatch(addToast({ message: 'Option créée!', type: 'success' }));
      setShowAddOption(null);
      setNewOptionName('');
      setNewOptionCode('');
      refetch();
    } catch (err: any) {
      dispatch(addToast({ message: err.message || 'Erreur lors de la création', type: 'error' }));
    }
  };

  // Handle deleting an option
  const handleDeleteOption = async (optionId: string) => {
    try {
      const result = await deleteOption({
        variables: { id: optionId },
        refetchQueries: [
          { query: AdminProductOptionGroupsDocument },
          { query: AdminProductDocument, variables: { id: id! } },
        ],
      });

      if (result.data?.deleteProductOption?.result === 'DELETED') {
        dispatch(addToast({ message: 'Option supprimée!', type: 'success' }));
        refetch();
      } else {
        dispatch(
          addToast({
            message: result.data?.deleteProductOption?.message || 'Erreur lors de la suppression',
            type: 'error',
          })
        );
      }
    } catch (err: any) {
      dispatch(addToast({ message: err.message || 'Erreur', type: 'error' }));
    }
  };

  // Get option groups available to add (not already on product)
  const getAvailableOptionGroups = () => {
    const productOptionGroupIds = product?.optionGroups?.map((g: any) => g.id) || [];
    return allOptionGroups.filter((g: any) => !productOptionGroupIds.includes(g.id));
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
        <Package className="h-16 w-16 text-gray-300 mb-4" />
        <p className="text-gray-500 text-lg mb-4">Produit non trouvé</p>
        <Link to="/products" className="text-blue-600 hover:text-blue-700">
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Nom (Anglais) *"
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
          helperText="URL-friendly identifier"
        />
      </div>
      <TextArea
        label="Description (Anglais)"
        value={formik.values.description}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        name="description"
        rows={4}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Poids (kg)"
          type="number"
          step="0.1"
          value={formik.values.weightKg ?? ''}
          onChange={formik.handleChange}
          name="weightKg"
          placeholder="0.5"
          error={formik.touched.weightKg ? formik.errors.weightKg : undefined}
        />
        <Input
          label="Prix promo (DZD)"
          type="number"
          value={formik.values.salePrice ?? ''}
          onChange={formik.handleChange}
          name="salePrice"
          placeholder="Laisser vide si pas de promo"
          error={formik.touched.salePrice ? formik.errors.salePrice : undefined}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 p-3 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600">
          <input
            type="checkbox"
            checked={formik.values.enabled}
            onChange={(e) => formik.setFieldValue('enabled', e.target.checked)}
            className="h-4 w-4 text-blue-600 border-gray-500 rounded focus:ring-blue-500 bg-gray-600"
          />
          <span className="text-sm font-medium text-gray-300">Produit actif</span>
        </label>
        <label className="flex items-center gap-2 p-3 bg-yellow-900/30 border border-yellow-700 rounded-lg cursor-pointer hover:bg-yellow-900/50">
          <input
            type="checkbox"
            checked={formik.values.isFeatured}
            onChange={(e) => formik.setFieldValue('isFeatured', e.target.checked)}
            className="h-4 w-4 text-yellow-600 border-gray-500 rounded focus:ring-yellow-500 bg-gray-600"
          />
          <Star className="h-4 w-4 text-yellow-500" />
          <span className="text-sm font-medium text-gray-100">Produit vedette</span>
        </label>
      </div>
    </div>
  );

  const LocalizationTab = (
    <div className="space-y-6">
      <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-300">
          <Globe className="inline h-4 w-4 mr-2" />
          Configurez les traductions française et arabe pour ce produit.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <span>FR</span> Français
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
            ? 'border-blue-500 bg-blue-900/30'
            : 'border-gray-600 hover:border-blue-400 hover:bg-gray-700/50'
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
            <RefreshCw className="h-12 w-12 text-blue-500 animate-spin mb-4" />
            <p className="text-lg font-medium text-gray-300">Téléchargement en cours...</p>
          </div>
        ) : (
          <>
            <Upload
              className={`h-12 w-12 mx-auto mb-4 ${isDraggingOver ? 'text-blue-500' : 'text-gray-400'}`}
            />
            <p className="text-lg font-medium text-gray-300">Glissez-déposez vos images ici</p>
            <p className="text-sm text-gray-400 mt-2">ou cliquez pour sélectionner des fichiers</p>
            <p className="text-xs text-gray-500 mt-4">PNG, JPG, WEBP jusqu'à 10MB chacun</p>
          </>
        )}
      </div>

      {/* Featured Asset */}
      {product.featuredAsset && (
        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-3">Image principale</h3>
          <div className="relative inline-block">
            <img
              src={product.featuredAsset.preview}
              alt={product.featuredAsset.name}
              className="h-48 w-48 object-cover rounded-lg border-2 border-yellow-500 ring-2 ring-yellow-500/30"
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
          <h3 className="text-sm font-medium text-gray-300">
            Galerie ({product.assets?.length || 0} images)
          </h3>
          <p className="text-xs text-gray-400">
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
                      : 'border-gray-600 hover:border-gray-500'
                  } ${draggedImageIndex === index ? 'opacity-50 scale-95' : ''}`}
                >
                  <img src={asset.preview} alt={asset.name} className="h-32 w-full object-cover" />
                  <div className="absolute top-1 left-1 p-1 bg-gray-900/80 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    <GripVertical className="h-4 w-4 text-gray-400" />
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
          <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-8 text-center">
            <ImageIcon className="h-12 w-12 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-400">Aucune image disponible</p>
            <p className="text-sm text-gray-500 mt-2">
              Glissez-déposez des images ci-dessus ou cliquez pour ajouter
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const VariantsTab = (
    <div className="space-y-6">
      {/* Option Groups Management Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Groupes d'options du produit
            </span>
            <div className="flex gap-2">
              {getAvailableOptionGroups().length > 0 && (
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAddOptionGroupToProduct(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="text-sm bg-gray-700 border border-gray-600 text-gray-100 rounded-lg px-3 py-1.5"
                >
                  <option value="">Ajouter un groupe existant...</option>
                  {getAvailableOptionGroups().map((group: any) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              )}
              <Button
                type="button"
                size="sm"
                onClick={() => setShowCreateOptionGroup(true)}
                icon={<Plus className="h-3 w-3" />}
              >
                Nouveau groupe
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Create Option Group Form */}
          {showCreateOptionGroup && (
            <div className="bg-purple-900/30 border border-purple-700 rounded-lg p-4 mb-4">
              <h4 className="text-sm font-medium text-purple-300 mb-3">
                Créer un nouveau groupe d'options
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <input
                  type="text"
                  value={newOptionGroupName}
                  onChange={(e) => setNewOptionGroupName(e.target.value)}
                  placeholder="Nom (ex: Taille, Couleur)"
                  className="px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-500 rounded-lg text-sm"
                />
                <input
                  type="text"
                  value={newOptionGroupCode}
                  onChange={(e) => setNewOptionGroupCode(e.target.value)}
                  placeholder="Code (optionnel, ex: size)"
                  className="px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-500 rounded-lg text-sm"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={handleCreateOptionGroup}
                  loading={creatingOptionGroup}
                >
                  Créer
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setShowCreateOptionGroup(false);
                    setNewOptionGroupName('');
                    setNewOptionGroupCode('');
                  }}
                >
                  Annuler
                </Button>
              </div>
            </div>
          )}

          {/* Product's Option Groups */}
          {product.optionGroups && product.optionGroups.length > 0 ? (
            <div className="space-y-4">
              {product.optionGroups.map((group: any) => (
                <div key={group.id} className="border border-gray-600 rounded-lg p-4 bg-gray-700/30">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-100">{group.name}</h4>
                      <p className="text-xs text-gray-400">Code: {group.code}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => setShowAddOption(group.id)}
                        icon={<Plus className="h-3 w-3" />}
                      >
                        Ajouter option
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="danger"
                        onClick={() => handleRemoveOptionGroupFromProduct(group.id)}
                        loading={removingOptionGroup}
                        icon={<Trash2 className="h-3 w-3" />}
                      />
                    </div>
                  </div>

                  {/* Add Option Form */}
                  {showAddOption === group.id && (
                    <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-3 mb-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                        <input
                          type="text"
                          value={newOptionName}
                          onChange={(e) => setNewOptionName(e.target.value)}
                          placeholder="Nom de l'option (ex: S, M, L)"
                          className="px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-500 rounded-lg text-sm"
                        />
                        <input
                          type="text"
                          value={newOptionCode}
                          onChange={(e) => setNewOptionCode(e.target.value)}
                          placeholder="Code (optionnel)"
                          className="px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-500 rounded-lg text-sm"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => handleCreateOption(group.id)}
                          loading={creatingOption}
                        >
                          Ajouter
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setShowAddOption(null);
                            setNewOptionName('');
                            setNewOptionCode('');
                          }}
                        >
                          Annuler
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Options List */}
                  <div className="flex flex-wrap gap-2">
                    {group.options && group.options.length > 0 ? (
                      group.options.map((option: any) => (
                        <div
                          key={option.id}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-600 rounded-lg"
                        >
                          <span className="text-sm text-gray-200">{option.name}</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteOption(option.id)}
                            className="text-gray-400 hover:text-red-400 ml-1"
                            title="Supprimer cette option"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500 italic">
                        Aucune option - ajoutez-en
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-400">
              <Settings className="h-8 w-8 mx-auto mb-2 text-gray-500" />
              <p className="text-sm">Aucun groupe d'options sur ce produit</p>
              <p className="text-xs text-gray-500 mt-1">
                Ajoutez des groupes d'options (ex: Taille, Couleur) pour créer des variantes
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Header with Add Variant Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-100">Variantes du produit</h3>
          <p className="text-sm text-gray-400">
            Gérez les variantes: SKU, prix, stock, options et statut.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => setShowAddVariant(true)}
          icon={<Plus className="h-4 w-4" />}
        >
          Ajouter une variante
        </Button>
      </div>

      {/* Add Variant Form */}
      {showAddVariant && (
        <Card className="border-green-700 bg-green-900/30">
          <CardHeader>
            <CardTitle className="text-base text-green-300">Nouvelle variante</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Use product's option groups for new variant */}
            {product.optionGroups && product.optionGroups.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-300 mb-2">Options de la variante</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {product.optionGroups.map((group: any) => (
                    <div key={group.id}>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        {group.name}
                      </label>
                      <select
                        value={newVariant.options[group.id] || ''}
                        onChange={(e) => updateNewVariantOption(group.id, e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="">-- Sélectionner --</option>
                        {group.options?.map((option: any) => (
                          <option key={option.id} value={option.id}>
                            {option.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Variant Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">SKU *</label>
                <input
                  type="text"
                  value={newVariant.sku}
                  onChange={(e) => setNewVariant({ ...newVariant, sku: e.target.value })}
                  placeholder="SKU-001"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-500 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Prix (DZD)</label>
                <input
                  type="number"
                  value={newVariant.price || ''}
                  onChange={(e) =>
                    setNewVariant({ ...newVariant, price: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="0"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-500 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Stock</label>
                <input
                  type="number"
                  value={newVariant.stock || ''}
                  onChange={(e) =>
                    setNewVariant({ ...newVariant, stock: parseInt(e.target.value) || 0 })
                  }
                  placeholder="0"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-500 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  min="0"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setShowAddVariant(false);
                  setNewVariant({ sku: '', price: 0, stock: 0, options: {} });
                }}
              >
                Annuler
              </Button>
              <Button
                type="button"
                onClick={handleAddVariant}
                loading={creatingVariant}
                icon={<Plus className="h-4 w-4" />}
              >
                Ajouter
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Variants Table */}
      <div className="overflow-x-auto bg-gray-800 rounded-lg border border-gray-700">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                SKU
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                Options
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                Prix (DZD)
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                Stock
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                Statut
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {product.variants?.map((variant) => (
              <tr
                key={variant.id}
                className={`hover:bg-gray-700/50 ${editingVariant === variant.id ? 'bg-blue-900/30' : ''}`}
              >
                <td className="px-4 py-3">
                  {editingVariant === variant.id ? (
                    <input
                      type="text"
                      value={variantEdits[variant.id]?.sku ?? variant.sku}
                      onChange={(e) =>
                        setVariantEdits({
                          ...variantEdits,
                          [variant.id]: {
                            ...variantEdits[variant.id],
                            sku: e.target.value,
                          },
                        })
                      }
                      className="w-32 px-2 py-1 bg-gray-700 border border-gray-600 text-gray-100 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <div>
                      <span className="text-sm font-medium text-gray-100">{variant.sku}</span>
                      {variant.name !== variant.sku && (
                        <p className="text-xs text-gray-400">{variant.name}</p>
                      )}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-gray-400">
                  {variant.options && variant.options.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {variant.options.map((opt) => (
                        <Badge key={opt.id} variant="default" className="text-xs">
                          {opt.group?.name}: {opt.name}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {editingVariant === variant.id ? (
                    <input
                      type="number"
                      value={variantEdits[variant.id]?.price ?? variant.price / 100}
                      onChange={(e) =>
                        setVariantEdits({
                          ...variantEdits,
                          [variant.id]: {
                            ...variantEdits[variant.id],
                            price: parseFloat(e.target.value) || 0,
                          },
                        })
                      }
                      className="w-28 px-2 py-1 bg-gray-700 border border-gray-600 text-gray-100 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                      step="0.01"
                    />
                  ) : (
                    <span className="font-medium text-gray-100">
                      {formatPrice(variant.price / 100)}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {editingVariant === variant.id ? (
                    <input
                      type="number"
                      value={variantEdits[variant.id]?.stock ?? variant.stockOnHand}
                      onChange={(e) =>
                        setVariantEdits({
                          ...variantEdits,
                          [variant.id]: {
                            ...variantEdits[variant.id],
                            stock: parseInt(e.target.value) || 0,
                          },
                        })
                      }
                      className="w-20 px-2 py-1 bg-gray-700 border border-gray-600 text-gray-100 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                    />
                  ) : (
                    <span
                      className={`font-medium ${
                        variant.stockOnHand === 0
                          ? 'text-red-400'
                          : variant.stockOnHand < (variant.customFields?.minStockAlert || 10)
                            ? 'text-orange-400'
                            : 'text-green-400'
                      }`}
                    >
                      {variant.stockOnHand}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {editingVariant === variant.id ? (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={variantEdits[variant.id]?.enabled ?? variant.enabled}
                        onChange={(e) =>
                          setVariantEdits({
                            ...variantEdits,
                            [variant.id]: {
                              ...variantEdits[variant.id],
                              enabled: e.target.checked,
                            },
                          })
                        }
                        className="w-4 h-4 text-blue-600 border-gray-500 rounded bg-gray-600"
                      />
                      <span className="text-sm text-gray-300">Actif</span>
                    </label>
                  ) : (
                    <Badge variant={variant.enabled ? 'success' : 'default'}>
                      {variant.enabled ? 'Actif' : 'Inactif'}
                    </Badge>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {editingVariant === variant.id ? (
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleVariantUpdate(variant.id)}
                        loading={updatingVariants}
                        icon={<Check className="h-3 w-3" />}
                      >
                        Sauver
                      </Button>
                      <Button size="sm" variant="ghost" onClick={cancelEditingVariant}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => startEditingVariant(variant)}
                        icon={<Edit3 className="h-3 w-3" />}
                      >
                        Modifier
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => setShowDeleteVariantDialog(variant.id)}
                        icon={<Trash2 className="h-3 w-3" />}
                        title="Supprimer cette variante"
                      />
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
        <h3 className="text-lg font-medium text-gray-100">Catégories</h3>
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
        <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-8 text-center">
          <FolderTree className="h-12 w-12 text-gray-500 mx-auto mb-3" />
          <p className="text-gray-400">Aucune catégorie disponible</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {allCollections.map((collection: any) => (
            <label
              key={collection.id}
              className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                selectedCollections.includes(collection.id)
                  ? 'border-blue-500 bg-blue-900/30'
                  : 'border-gray-600 hover:border-gray-500'
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
                className="h-5 w-5 text-blue-600 border-gray-500 rounded bg-gray-600"
              />
              <div>
                <p className="font-medium text-gray-100">{collection.name}</p>
                {collection.slug && <p className="text-xs text-gray-400">/{collection.slug}</p>}
              </div>
            </label>
          ))}
        </div>
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
        return CategoriesTab;
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
              <h1 className="text-2xl font-bold text-gray-100">{product.name}</h1>
              <Badge variant={product.enabled ? 'success' : 'default'}>
                {product.enabled ? 'Actif' : 'Inactif'}
              </Badge>
              {product.customFields?.isFeatured && (
                <Badge variant="warning">
                  <Star className="h-3 w-3 mr-1" />
                  Vedette
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-400 mt-1">
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              {product.featuredAsset?.preview ? (
                <img
                  src={product.featuredAsset.preview}
                  alt=""
                  className="h-12 w-12 rounded-lg object-cover"
                />
              ) : (
                <div className="h-12 w-12 bg-gray-700 rounded-lg flex items-center justify-center">
                  <Package className="h-6 w-6 text-gray-400" />
                </div>
              )}
              <div>
                <p className="text-sm text-gray-400">SKU Principal</p>
                <p className="font-semibold text-gray-100">{mainVariant?.sku || '-'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-400">Prix</p>
            <p className="text-xl font-bold text-gray-100">
              {mainVariant?.price ? formatPrice(mainVariant.price / 100) : '-'}
            </p>
            {product.customFields?.salePrice && (
              <p className="text-sm text-green-400">
                Promo: {formatPrice(product.customFields.salePrice / 100)}
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-400">Stock Total</p>
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
            <p className="text-sm text-gray-500">{product.variants?.length || 0} variante(s)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-400">Vues</p>
            <p className="text-xl font-bold text-gray-100 flex items-center gap-2">
              <Eye className="h-5 w-5 text-gray-400" />
              {product.customFields?.viewCount || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress steps */}
      <div className="flex items-center justify-between bg-gray-800 rounded-xl p-4 shadow-sm overflow-x-auto border border-gray-700">
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
                    ? 'bg-blue-900/50 text-blue-400'
                    : isCompleted
                      ? 'bg-green-900/30 text-green-400 hover:bg-green-900/50'
                      : 'text-gray-400 hover:bg-gray-700'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : isCompleted
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-600 text-gray-400'
                  }`}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                <span className="hidden md:block font-medium text-sm">{step.label}</span>
              </button>
              {index < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 min-w-[20px] ${
                    index < currentStep ? 'bg-green-500' : 'bg-gray-600'
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
            <Button onClick={() => goToStep(currentStep + 1)}>
              Suivant
            </Button>
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

      {/* Delete Variant Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!showDeleteVariantDialog}
        onClose={() => setShowDeleteVariantDialog(null)}
        onConfirm={() => showDeleteVariantDialog && handleDeleteVariant(showDeleteVariantDialog)}
        title="Supprimer la variante"
        message="Êtes-vous sûr de vouloir supprimer cette variante? Cette action est irréversible."
        confirmText="Supprimer"
        variant="danger"
        loading={deletingVariant}
      />
    </div>
  );
};
