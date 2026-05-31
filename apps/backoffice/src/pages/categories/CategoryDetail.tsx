import React, { useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useLazyQuery } from '@apollo/client';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  ArrowLeft,
  Save,
  Copy,
  FolderTree,
  Image as ImageIcon,
  Globe,
  Settings,
  Eye,
  EyeOff,
  ChevronRight,
  Package,
  Upload,
  X,
  Trash2,
  GripVertical,
  Sparkles,
  Info,
  AlertCircle,
  FolderOpen,
  Filter,
  Radio,
  Plus,
  Minus,
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { addToast } from '../../store/slices/uiSlice';
import {
  AdminCollectionDocument,
  AdminCollectionsDocument,
  AdminChannelsDocument,
  CreateCollectionDocument,
  UpdateCollectionDocument,
  MoveCollectionDocument,
  CreateAssetsDocument,
  AssignCollectionsToChannelDocument,
  RemoveCollectionsFromChannelDocument,
  PreviewCollectionProductsDocument,
  DuplicateEntityDocument,
  EntityDuplicatorsDocument,
  LanguageCode,
} from '../../graphql/generated/graphql';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { TextArea } from '../../components/ui/TextArea';
import { Select } from '../../components/ui/Select';
import { Spinner } from '../../components/ui/Spinner';
import { Tabs } from '../../components/ui/Tabs';
import { Badge } from '../../components/ui/Badge';
import { AssetPickerModal } from '../../components/ui/AssetPickerModal';
import { CollectionFilterBuilder } from '../../components/collections/CollectionFilterBuilder';
import { cn } from '../../lib/utils';

// Helper to get translation by language
const getTranslation = (translations: any[] | undefined, lang: string, field: string): string => {
  if (!translations) return '';
  const translation = translations.find((t: any) => t.languageCode === lang);
  return translation?.[field] || '';
};

const validationSchema = Yup.object({
  name: Yup.string().required('Nom requis').min(2, 'Minimum 2 caracteres'),
  slug: Yup.string()
    .required('Slug requis')
    .matches(/^[a-z0-9-]+$/, 'Slug invalide (lettres minuscules, chiffres et tirets uniquement)'),
});

interface FormValues {
  name: string; // Primary language: French
  slug: string;
  description: string;
  nameEn: string; // Translation: English
  slugEn: string;
  descriptionEn: string;
  nameAr: string; // Translation: Arabic
  slugAr: string;
  descriptionAr: string;
  parentId: string;
  isPrivate: boolean;
  inheritFilters: boolean;
  displayOrder: number;
}

interface ImageFile {
  file?: File;
  preview: string;
  isExisting?: boolean;
  id?: string;
}

export const CategoryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isNew = !id || id === 'new';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [featuredImage, setFeaturedImage] = useState<ImageFile | null>(null);
  const [galleryAssets, setGalleryAssets] = useState<Array<{ id: string; preview: string }>>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [showAssetPicker, setShowAssetPicker] = useState(false);
  const [showGalleryPicker, setShowGalleryPicker] = useState(false);
  const [collectionFilters, setCollectionFilters] = useState<Array<{
    code: string;
    arguments: Array<{ name: string; value: string }>;
  }>>([]);

  // Fetch current collection (if editing)
  const { data, loading, error } = useQuery(AdminCollectionDocument, {
    variables: { id: isNew ? '0' : id! },
    skip: isNew,
    onCompleted: (data) => {
      if (data?.collection?.featuredAsset) {
        setFeaturedImage({
          preview: data.collection.featuredAsset.preview,
          isExisting: true,
          id: data.collection.featuredAsset.id,
        });
      }
      // Initialize filters from collection
      if (data?.collection?.filters) {
        setCollectionFilters(
          data.collection.filters.map((f: any) => ({
            code: f.code,
            arguments: f.args.map((a: any) => ({ name: a.name, value: a.value })),
          }))
        );
      }
      // Initialize gallery assets
      if (data?.collection?.assets) {
        setGalleryAssets(
          data.collection.assets.map((a) => ({ id: a.id, preview: a.preview }))
        );
      }
    },
  });

  // Fetch all collections for parent dropdown
  const { data: collectionsData } = useQuery(AdminCollectionsDocument, {
    variables: { options: { take: 100 } },
  });

  const [createCollection, { loading: creating }] = useMutation(CreateCollectionDocument);
  const [updateCollection, { loading: updating }] = useMutation(UpdateCollectionDocument);
  const [moveCollection] = useMutation(MoveCollectionDocument);
  const [createAssets] = useMutation(CreateAssetsDocument);

  // Channel administration (multi-channel) — Vendure scopes channel visibility
  // via the `vendure-token` request header, so we cannot read which channels a
  // collection currently belongs to. The UI is action-only: pick channels,
  // assign or remove. Hidden when only the default channel exists.
  const { data: channelsData } = useQuery(AdminChannelsDocument, {
    variables: { options: { take: 100 } },
  });
  const channels = channelsData?.channels?.items || [];
  const [selectedChannelIds, setSelectedChannelIds] = useState<string[]>([]);
  const [assignToChannel, { loading: assigningChannel }] = useMutation(
    AssignCollectionsToChannelDocument
  );
  const [removeFromChannel, { loading: removingChannel }] = useMutation(
    RemoveCollectionsFromChannelDocument
  );

  // Entity duplication (Collection)
  const { data: duplicatorsData } = useQuery(EntityDuplicatorsDocument);
  const [duplicateEntity, { loading: duplicating }] = useMutation(DuplicateEntityDocument);

  const handleDuplicate = async () => {
    if (!id || isNew) return;
    const duplicator = (duplicatorsData?.entityDuplicators || []).find((d) =>
      d.forEntities.includes('Collection')
    );
    if (!duplicator) {
      dispatch(addToast({ message: 'Aucun duplicateur disponible', type: 'error' }));
      return;
    }
    try {
      const args = duplicator.args.map((a) => ({
        name: a.name,
        value: a.defaultValue ?? (a.type === 'boolean' ? 'false' : ''),
      }));
      const res = await duplicateEntity({
        variables: {
          input: {
            entityName: 'Collection',
            entityId: id,
            duplicatorInput: { code: duplicator.code, arguments: args },
          },
        },
      });
      const data = res.data?.duplicateEntity;
      if (data?.__typename === 'DuplicateEntitySuccess') {
        dispatch(addToast({ message: 'Catégorie dupliquée', type: 'success' }));
        navigate(`/categories/${data.newEntityId}`);
      } else if (data?.__typename === 'DuplicateEntityError') {
        dispatch(addToast({ message: data.message, type: 'error' }));
      }
    } catch (err: any) {
      dispatch(addToast({ message: err.message || 'Erreur de duplication', type: 'error' }));
    }
  };

  // Live preview of products that match the configured filters
  const [runPreview, previewState] = useLazyQuery(PreviewCollectionProductsDocument);
  const previewCount = previewState.data?.previewCollectionVariants?.totalItems;
  const previewItems = previewState.data?.previewCollectionVariants?.items ?? [];

  const collection = data?.collection;
  const allCollections = collectionsData?.collections?.items || [];

  // Handle image selection
  const handleImageSelect = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) {
        dispatch(addToast({ message: 'Veuillez selectionner une image valide', type: 'error' }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        dispatch(addToast({ message: 'Image trop volumineuse (max 5MB)', type: 'error' }));
        return;
      }

      const preview = URL.createObjectURL(file);
      setFeaturedImage({ file, preview, isExisting: false });
    },
    [dispatch]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleImageSelect(file);
    },
    [handleImageSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const removeImage = useCallback(() => {
    if (featuredImage?.preview && !featuredImage.isExisting) {
      URL.revokeObjectURL(featuredImage.preview);
    }
    setFeaturedImage(null);
  }, [featuredImage]);

  // Build parent options (excluding current collection and its children)
  const getParentOptions = () => {
    const options = [{ value: '', label: 'Aucun (racine)' }];

    const excludeIds = new Set<string>();
    if (!isNew && id) {
      excludeIds.add(id);
      const addChildren = (parentId: string) => {
        allCollections.forEach((c) => {
          if (c.parentId === parentId) {
            excludeIds.add(c.id);
            addChildren(c.id);
          }
        });
      };
      addChildren(id);
    }

    allCollections
      .filter((c) => !excludeIds.has(c.id))
      .forEach((c) => {
        const depth = c.breadcrumbs ? c.breadcrumbs.length - 1 : 0;
        const prefix = '\u00A0\u00A0'.repeat(depth);
        const icon = depth > 0 ? '└ ' : '';
        options.push({
          value: c.id,
          label: `${prefix}${icon}${c.name}`,
        });
      });

    return options;
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const triggerPreview = useCallback(
    (
      filters: Array<{ code: string; arguments: Array<{ name: string; value: string }> }>,
      parentId: string,
      inheritFilters: boolean
    ) => {
      if (filters.length === 0) return;
      runPreview({
        variables: {
          input: {
            filters: filters.map((f) => ({ code: f.code, arguments: f.arguments })),
            inheritFilters,
            parentId: parentId || undefined,
          },
          options: { take: 24 },
        },
      });
    },
    [runPreview]
  );

  const handleAssignToChannels = async (action: 'assign' | 'remove') => {
    if (!id || isNew || selectedChannelIds.length === 0) return;
    const mutate = action === 'assign' ? assignToChannel : removeFromChannel;
    try {
      for (const channelId of selectedChannelIds) {
        await mutate({
          variables: {
            input: { channelId, collectionIds: [id] },
          },
        });
      }
      const channelNames = selectedChannelIds
        .map((cid) => channels.find((c) => c.id === cid)?.code)
        .filter(Boolean)
        .join(', ');
      dispatch(
        addToast({
          message:
            action === 'assign'
              ? `Catégorie assignée à ${channelNames}`
              : `Catégorie retirée de ${channelNames}`,
          type: 'success',
        })
      );
      setSelectedChannelIds([]);
    } catch (err: any) {
      dispatch(
        addToast({
          message: err.message || 'Erreur lors de la mise à jour des canaux',
          type: 'error',
        })
      );
    }
  };

  const handleSubmit = async (values: FormValues) => {
    try {
      // Handle image upload if there's a new image
      let featuredAssetId: string | undefined;

      if (featuredImage?.file) {
        // Upload new image
        const assetResult = await createAssets({
          variables: {
            input: [{ file: featuredImage.file }],
          },
        });

        const uploadedAssets = assetResult.data?.createAssets || [];
        const uploadedAsset = uploadedAssets.find(
          (a: any) => a.__typename === 'Asset'
        ) as { id: string } | undefined;
        if (uploadedAsset) {
          featuredAssetId = uploadedAsset.id;
        }
      } else if (featuredImage?.isExisting && featuredImage.id) {
        // Keep existing image
        featuredAssetId = featuredImage.id;
      }
      // If featuredImage is null, no image (remove or none)

      const baseInput = {
        translations: [
          // Primary language: French
          {
            languageCode: LanguageCode.Fr,
            name: values.name,
            slug: values.slug,
            description: values.description,
          },
          // Add English translation if any English field is filled
          ...(values.nameEn || values.descriptionEn
            ? [
                {
                  languageCode: LanguageCode.En,
                  name: values.nameEn || values.name,
                  slug: values.slugEn || values.slug,
                  description: values.descriptionEn || values.description,
                },
              ]
            : []),
          // Add Arabic translation if any Arabic field is filled
          ...(values.nameAr || values.descriptionAr
            ? [
                {
                  languageCode: LanguageCode.Ar,
                  name: values.nameAr || values.name,
                  slug: values.slugAr || values.slug,
                  description: values.descriptionAr || values.description,
                },
              ]
            : []),
        ],
        filters: collectionFilters.map((f) => ({
          code: f.code,
          arguments: f.arguments,
        })),
        isPrivate: values.isPrivate,
        inheritFilters: values.inheritFilters,
        featuredAssetId: featuredAssetId || null,
        assetIds: galleryAssets.map((a) => a.id),
        customFields: {
          displayOrder: values.displayOrder,
        },
      };

      if (isNew) {
        const createInput = {
          ...baseInput,
          parentId: values.parentId || undefined,
        };
        await createCollection({ variables: { input: createInput } });
        dispatch(
          addToast({
            message: 'Catégorie créée avec succès',
            type: 'success',
          })
        );
      } else {
        await updateCollection({ variables: { input: { ...baseInput, id: id! } } });

        const currentParentId = collection?.parentId || '';
        const newParentId = values.parentId || '';
        if (currentParentId !== newParentId) {
          await moveCollection({
            variables: {
              input: {
                collectionId: id!,
                parentId: newParentId || '1',
                index: 0,
              },
            },
          });
        }

        dispatch(
          addToast({
            message: 'Catégorie mise à jour avec succès',
            type: 'success',
          })
        );
      }

      navigate('/categories');
    } catch (err: any) {
      dispatch(
        addToast({
          message: err.message || 'Erreur lors de la sauvegarde',
          type: 'error',
        })
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isNew && (error || !collection)) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <p className="text-destructive text-lg font-medium">
            {error ? `Erreur: ${error.message}` : 'Categorie non trouvee'}
          </p>
          <Button variant="secondary" onClick={() => navigate('/categories')} className="mt-4">
            Retour a la liste
          </Button>
        </div>
      </div>
    );
  }

  // French is primary language - read from 'fr' translation or fall back to default name
  const initialValues: FormValues = {
    name: getTranslation(collection?.translations, 'fr', 'name') || collection?.name || '',
    slug: getTranslation(collection?.translations, 'fr', 'slug') || collection?.slug || '',
    description: getTranslation(collection?.translations, 'fr', 'description') || collection?.description || '',
    nameEn: getTranslation(collection?.translations, 'en', 'name'),
    slugEn: getTranslation(collection?.translations, 'en', 'slug'),
    descriptionEn: getTranslation(collection?.translations, 'en', 'description'),
    nameAr: getTranslation(collection?.translations, 'ar', 'name'),
    slugAr: getTranslation(collection?.translations, 'ar', 'slug'),
    descriptionAr: getTranslation(collection?.translations, 'ar', 'description'),
    parentId: collection?.parentId || '',
    isPrivate: collection?.isPrivate || false,
    inheritFilters: collection?.inheritFilters ?? true,
    displayOrder: collection?.customFields?.displayOrder || 0,
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/categories')}
          className="p-2 hover:bg-accent rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">
            {isNew ? 'Nouvelle categorie' : collection?.name}
          </h1>
          {!isNew && collection && (
            <div className="flex items-center gap-2 mt-1 text-muted-foreground">
              {collection.breadcrumbs?.map((crumb, index) => (
                <React.Fragment key={crumb.id}>
                  {index > 0 && <ChevronRight className="h-4 w-4" />}
                  <span className="text-sm">{crumb.name}</span>
                </React.Fragment>
              ))}
              {collection.isPrivate && (
                <Badge variant="warning" className="ml-2">
                  <EyeOff className="h-3 w-3 mr-1" />
                  Prive
                </Badge>
              )}
            </div>
          )}
        </div>
        {!isNew && collection && (
          <Button
            type="button"
            variant="secondary"
            onClick={handleDuplicate}
            loading={duplicating}
            icon={<Copy className="h-4 w-4" />}
          >
            Dupliquer
          </Button>
        )}
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, errors, touched, handleChange, handleBlur, setFieldValue, isValid }) => (
          <Form className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Main Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Information Card */}
                <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                  <div className="px-6 py-4 border-b border-border bg-primary/5">
                    <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <Settings className="h-5 w-5 text-primary" />
                      Informations generales
                    </h2>
                  </div>
                  <div className="p-6 space-y-5">
                    <div className="flex items-center gap-2 pb-4 border-b border-border">
                      <span className="px-2 py-0.5 bg-blue-500/20 text-blue-500 rounded text-xs font-bold">FR</span>
                      <span className="font-medium text-foreground">Langue principale : Francais</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">
                          Nom <span className="text-destructive">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={values.name}
                          onChange={(e) => {
                            handleChange(e);
                            if (isNew && !touched.slug) {
                              setFieldValue('slug', generateSlug(e.target.value));
                            }
                          }}
                          onBlur={handleBlur}
                          placeholder="Ex: Vetements Homme"
                          className={cn(
                            'w-full px-4 py-2.5 border rounded-lg transition-all duration-200 bg-background text-foreground placeholder-muted-foreground',
                            'focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none',
                            touched.name && errors.name
                              ? 'border-destructive bg-destructive/10'
                              : 'border-border hover:border-muted-foreground'
                          )}
                        />
                        {touched.name && errors.name && (
                          <p className="mt-1.5 text-sm text-destructive flex items-center gap-1">
                            <AlertCircle className="h-3.5 w-3.5" />
                            {errors.name}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">
                          Slug (URL) <span className="text-destructive">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                            /categorie/
                          </span>
                          <input
                            type="text"
                            name="slug"
                            value={values.slug}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="vetements-homme"
                            className={cn(
                              'w-full pl-24 pr-4 py-2.5 border rounded-lg transition-all duration-200 bg-background text-foreground placeholder-muted-foreground',
                              'focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-mono text-sm',
                              touched.slug && errors.slug
                                ? 'border-destructive bg-destructive/10'
                                : 'border-border hover:border-muted-foreground'
                            )}
                          />
                        </div>
                        {touched.slug && errors.slug && (
                          <p className="mt-1.5 text-sm text-destructive flex items-center gap-1">
                            <AlertCircle className="h-3.5 w-3.5" />
                            {errors.slug}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={values.description}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        rows={3}
                        placeholder="Description de la categorie..."
                        className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-200 hover:border-muted-foreground resize-none bg-background text-foreground placeholder-muted-foreground"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">
                          Categorie parente
                        </label>
                        <select
                          name="parentId"
                          value={values.parentId}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-200 hover:border-muted-foreground bg-background text-foreground"
                        >
                          {getParentOptions().map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">
                          Ordre d'affichage
                        </label>
                        <input
                          type="number"
                          name="displayOrder"
                          value={values.displayOrder}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          min={0}
                          className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-200 hover:border-muted-foreground bg-background text-foreground"
                        />
                      </div>
                    </div>

                    {/* Visibility Toggle */}
                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        {values.isPrivate ? (
                          <div className="p-2 bg-amber-500/20 rounded-lg">
                            <EyeOff className="h-5 w-5 text-amber-500" />
                          </div>
                        ) : (
                          <div className="p-2 bg-green-500/20 rounded-lg">
                            <Eye className="h-5 w-5 text-green-500" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-foreground">
                            {values.isPrivate ? 'Categorie privee' : 'Categorie publique'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {values.isPrivate ? 'Non visible sur le site' : 'Visible sur le site'}
                          </p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="isPrivate"
                          checked={values.isPrivate}
                          onChange={handleChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-muted-foreground/30 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                      </label>
                    </div>

                    {/* Inherit Filters Toggle */}
                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                          <Filter className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            Hériter les filtres du parent
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Les produits de la catégorie parente sont aussi inclus dans cette catégorie
                          </p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="inheritFilters"
                          checked={values.inheritFilters}
                          onChange={handleChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-muted-foreground/30 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Translations Card */}
                <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                  <div className="px-6 py-4 border-b border-border bg-purple-500/5">
                    <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <Globe className="h-5 w-5 text-purple-500" />
                      Traductions
                    </h2>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* English */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-border">
                          <span className="w-8 h-6 rounded bg-gradient-to-r from-blue-800 via-white to-red-600 flex-shrink-0"></span>
                          <span className="font-medium text-foreground">Anglais</span>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1.5">
                            Nom (EN)
                          </label>
                          <input
                            type="text"
                            name="nameEn"
                            value={values.nameEn}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="Name in English"
                            className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-200 hover:border-muted-foreground bg-background text-foreground placeholder-muted-foreground"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1.5">
                            Description (EN)
                          </label>
                          <textarea
                            name="descriptionEn"
                            value={values.descriptionEn}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            rows={3}
                            placeholder="Description in English..."
                            className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-200 hover:border-muted-foreground resize-none bg-background text-foreground placeholder-muted-foreground"
                          />
                        </div>
                      </div>

                      {/* Arabic */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-border">
                          <span className="w-8 h-6 rounded bg-gradient-to-r from-green-600 via-white to-green-600 flex-shrink-0"></span>
                          <span className="font-medium text-foreground">Arabe</span>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1.5">
                            Nom (AR)
                          </label>
                          <input
                            type="text"
                            name="nameAr"
                            value={values.nameAr}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            dir="rtl"
                            placeholder="الاسم بالعربية"
                            className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-200 hover:border-muted-foreground bg-background text-foreground placeholder-muted-foreground"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1.5">
                            Description (AR)
                          </label>
                          <textarea
                            name="descriptionAr"
                            value={values.descriptionAr}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            rows={3}
                            dir="rtl"
                            placeholder="الوصف بالعربية..."
                            className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-200 hover:border-muted-foreground resize-none bg-background text-foreground placeholder-muted-foreground"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Product Filters Card */}
                <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                  <div className="px-6 py-4 border-b border-border bg-blue-500/5">
                    <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <Filter className="h-5 w-5 text-blue-500" />
                      Filtres de produits
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Definissez quels produits appartiennent a cette categorie
                    </p>
                  </div>
                  <div className="p-6">
                    <CollectionFilterBuilder
                      filters={collectionFilters}
                      onChange={setCollectionFilters}
                      previewCount={previewCount}
                      onPreview={() =>
                        triggerPreview(
                          collectionFilters,
                          values.parentId,
                          values.inheritFilters
                        )
                      }
                    />
                    {previewItems.length > 0 && (
                      <div className="mt-6 border-t border-border pt-6">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-medium text-foreground">
                            Aperçu ({previewCount ?? previewItems.length} variantes)
                          </h3>
                          {previewState.loading && <Spinner size="sm" />}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
                          {previewItems.map((v: any) => (
                            <div
                              key={v.id}
                              className="bg-muted rounded-lg p-3 flex flex-col items-center text-center"
                            >
                              {v.product?.featuredAsset?.preview ? (
                                <img
                                  src={v.product.featuredAsset.preview}
                                  alt={v.name}
                                  className="w-full aspect-square object-cover rounded-lg mb-2"
                                />
                              ) : (
                                <div className="w-full aspect-square bg-card rounded-lg mb-2 flex items-center justify-center">
                                  <Package className="h-8 w-8 text-muted-foreground" />
                                </div>
                              )}
                              <p className="text-sm font-medium text-foreground truncate w-full">
                                {v.product?.name}
                              </p>
                              <p className="text-xs text-muted-foreground truncate w-full">
                                {v.name}
                              </p>
                              <p className="text-xs text-muted-foreground font-mono mt-0.5">
                                {v.sku}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Children Card (only when editing and has children) */}
                {!isNew && collection?.children && collection.children.length > 0 && (
                  <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                    <div className="px-6 py-4 border-b border-border bg-green-500/5">
                      <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <FolderTree className="h-5 w-5 text-green-500" />
                        Sous-categories ({collection.children.length})
                      </h2>
                    </div>
                    <div className="p-4 space-y-2">
                      {collection.children.map((child, index) => (
                        <div
                          key={child.id}
                          className="flex items-center justify-between p-4 bg-muted rounded-lg hover:bg-accent transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 bg-card rounded-lg shadow-sm text-muted-foreground group-hover:text-foreground">
                              <GripVertical className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">
                                {getTranslation(child.translations, 'fr', 'name') || child.name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {getTranslation(child.translations, 'en', 'name') && (
                                  <span className="mr-2">EN: {getTranslation(child.translations, 'en', 'name')}</span>
                                )}
                                {getTranslation(child.translations, 'ar', 'name') && (
                                  <span dir="rtl">AR: {getTranslation(child.translations, 'ar', 'name')}</span>
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground bg-card px-2.5 py-1 rounded-full shadow-sm">
                              <Package className="h-4 w-4" />
                              <span>{child.productVariants?.totalItems || 0}</span>
                            </div>
                            <Badge variant="default">Pos: {child.position}</Badge>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/categories/${child.id}`)}
                            >
                              Modifier
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Image & Actions */}
              <div className="space-y-6">
                {/* Image Upload Card */}
                <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden sticky top-4">
                  <div className="px-6 py-4 border-b border-border bg-amber-500/5">
                    <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <ImageIcon className="h-5 w-5 text-amber-500" />
                      Image de la categorie
                    </h2>
                  </div>
                  <div className="p-6">
                    {featuredImage ? (
                      <div className="relative group">
                        <div className="aspect-square rounded-xl overflow-hidden bg-muted border-2 border-border">
                          <img
                            src={featuredImage.preview}
                            alt="Apercu"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 rounded-xl flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                            <button
                              type="button"
                              onClick={() => setShowAssetPicker(true)}
                              className="p-3 bg-card rounded-full shadow-lg hover:bg-accent transition-colors"
                              title="Choisir depuis la bibliotheque"
                            >
                              <FolderOpen className="h-5 w-5 text-foreground" />
                            </button>
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="p-3 bg-card rounded-full shadow-lg hover:bg-accent transition-colors"
                              title="Telecharger une nouvelle image"
                            >
                              <Upload className="h-5 w-5 text-foreground" />
                            </button>
                            <button
                              type="button"
                              onClick={removeImage}
                              className="p-3 bg-destructive rounded-full shadow-lg hover:bg-destructive/90 transition-colors"
                              title="Supprimer l'image"
                            >
                              <Trash2 className="h-5 w-5 text-white" />
                            </button>
                          </div>
                        </div>
                        {featuredImage.isExisting && (
                          <div className="absolute top-3 left-3">
                            <span className="px-2.5 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full shadow">
                              Image actuelle
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Drag and drop zone */}
                        <div
                          onDrop={handleDrop}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          className={cn(
                            'aspect-video rounded-xl border-2 border-dashed transition-all duration-300',
                            'flex flex-col items-center justify-center gap-3',
                            isDragging
                              ? 'border-primary bg-primary/10 scale-[1.02]'
                              : 'border-border'
                          )}
                        >
                          <div
                            className={cn(
                              'p-3 rounded-full transition-colors',
                              isDragging ? 'bg-primary/20' : 'bg-muted'
                            )}
                          >
                            <Upload
                              className={cn(
                                'h-6 w-6 transition-colors',
                                isDragging ? 'text-primary' : 'text-muted-foreground'
                              )}
                            />
                          </div>
                          <div className="text-center px-4">
                            <p className="text-sm text-muted-foreground">
                              {isDragging ? "Deposez l'image ici" : 'Glissez une image ici'}
                            </p>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setShowAssetPicker(true)}
                            className="flex flex-col items-center gap-2 p-4 bg-muted rounded-lg hover:bg-accent transition-colors border border-transparent hover:border-primary"
                          >
                            <FolderOpen className="h-6 w-6 text-primary" />
                            <span className="text-sm font-medium text-foreground">Bibliotheque</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex flex-col items-center gap-2 p-4 bg-muted rounded-lg hover:bg-accent transition-colors border border-transparent hover:border-primary"
                          >
                            <Upload className="h-6 w-6 text-primary" />
                            <span className="text-sm font-medium text-foreground">Telecharger</span>
                          </button>
                        </div>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageSelect(file);
                        e.target.value = '';
                      }}
                      className="hidden"
                    />

                    {/* Image Tips */}
                    <div className="mt-4 p-3 bg-primary/10 rounded-lg">
                      <div className="flex gap-2">
                        <Info className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <div className="text-xs text-primary">
                          <p className="font-medium">Conseils pour l'image :</p>
                          <ul className="mt-1 space-y-0.5 list-disc list-inside text-primary/80">
                            <li>Format carre recommande (1:1)</li>
                            <li>Resolution minimum 400x400px</li>
                            <li>Fond neutre ou transparent</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Gallery Card */}
                <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                  <div className="px-6 py-4 border-b border-border bg-amber-500/5 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <ImageIcon className="h-5 w-5 text-amber-500" />
                      Galerie ({galleryAssets.length})
                    </h2>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowGalleryPicker(true)}
                      icon={<Plus className="h-4 w-4" />}
                    >
                      Ajouter
                    </Button>
                  </div>
                  <div className="p-4">
                    {galleryAssets.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Aucune image dans la galerie
                      </p>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        {galleryAssets.map((a) => (
                          <div key={a.id} className="relative group aspect-square">
                            <img
                              src={a.preview}
                              alt=""
                              className="w-full h-full object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setGalleryAssets((prev) => prev.filter((g) => g.id !== a.id))
                              }
                              className="absolute top-1 right-1 p-1 bg-destructive rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Retirer"
                            >
                              <X className="h-3 w-3 text-white" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Stats (only when editing) */}
                {!isNew && collection && (
                  <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                    <div className="px-6 py-4 border-b border-border">
                      <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-indigo-500" />
                        Statistiques
                      </h2>
                    </div>
                    <div className="p-4 grid grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-500/10 rounded-lg text-center">
                        <p className="text-2xl font-bold text-blue-500">
                          {collection.productVariants?.totalItems || 0}
                        </p>
                        <p className="text-sm text-muted-foreground">Produits</p>
                      </div>
                      <div className="p-4 bg-green-500/10 rounded-lg text-center">
                        <p className="text-2xl font-bold text-green-500">
                          {collection.children?.length || 0}
                        </p>
                        <p className="text-sm text-muted-foreground">Sous-categories</p>
                      </div>
                      <div className="p-4 bg-purple-500/10 rounded-lg text-center">
                        <p className="text-2xl font-bold text-purple-500">{collection.position}</p>
                        <p className="text-sm text-muted-foreground">Position</p>
                      </div>
                      <div className="p-4 bg-amber-500/10 rounded-lg text-center">
                        <Badge
                          variant={collection.isPrivate ? 'warning' : 'success'}
                          className="text-sm"
                        >
                          {collection.isPrivate ? 'Prive' : 'Public'}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">Visibilite</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Channels Card (only when editing and >1 channel exists) */}
                {!isNew && collection && channels.length > 1 && (
                  <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                    <div className="px-6 py-4 border-b border-border bg-cyan-500/5">
                      <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <Radio className="h-5 w-5 text-cyan-500" />
                        Canaux
                      </h2>
                      <p className="text-xs text-muted-foreground mt-1">
                        Assigner ou retirer cette categorie d'un canal de vente
                      </p>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {channels.map((ch) => {
                          const checked = selectedChannelIds.includes(ch.id);
                          return (
                            <label
                              key={ch.id}
                              className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => {
                                  setSelectedChannelIds((ids) =>
                                    checked
                                      ? ids.filter((i) => i !== ch.id)
                                      : [...ids, ch.id]
                                  );
                                }}
                                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                              />
                              <span className="text-sm font-medium text-foreground">
                                {ch.code}
                              </span>
                              <span className="text-xs text-muted-foreground ml-auto">
                                {ch.defaultLanguageCode} · {ch.defaultCurrencyCode}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          loading={assigningChannel}
                          disabled={selectedChannelIds.length === 0}
                          onClick={() => handleAssignToChannels('assign')}
                          icon={<Plus className="h-4 w-4" />}
                        >
                          Assigner
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          loading={removingChannel}
                          disabled={selectedChannelIds.length === 0}
                          onClick={() => handleAssignToChannels('remove')}
                          icon={<Minus className="h-4 w-4" />}
                        >
                          Retirer
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="bg-card rounded-xl shadow-sm border border-border p-4 space-y-3">
                  <Button
                    type="submit"
                    className="w-full"
                    loading={creating || updating}
                    icon={<Save className="h-4 w-4" />}
                    disabled={!isValid}
                  >
                    {isNew ? 'Creer la categorie' : 'Enregistrer les modifications'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => navigate('/categories')}
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            </div>
          </Form>
        )}
      </Formik>

      {/* Asset Picker Modal */}
      <AssetPickerModal
        isOpen={showAssetPicker}
        onClose={() => setShowAssetPicker(false)}
        onSelect={(assets) => {
          if (assets.length > 0) {
            const asset = assets[0];
            setFeaturedImage({
              id: asset.id,
              preview: asset.preview,
              isExisting: true,
            });
          }
          setShowAssetPicker(false);
        }}
        multiple={false}
        selectedIds={featuredImage?.id ? [featuredImage.id] : []}
        title="Selectionner une image"
      />

      {/* Gallery Asset Picker (multi) */}
      <AssetPickerModal
        isOpen={showGalleryPicker}
        onClose={() => setShowGalleryPicker(false)}
        onSelect={(assets) => {
          setGalleryAssets((prev) => {
            const existing = new Set(prev.map((a) => a.id));
            const additions = assets
              .filter((a) => !existing.has(a.id))
              .map((a) => ({ id: a.id, preview: a.preview }));
            return [...prev, ...additions];
          });
          setShowGalleryPicker(false);
        }}
        multiple={true}
        selectedIds={galleryAssets.map((a) => a.id)}
        title="Selectionner des images pour la galerie"
      />
    </div>
  );
};
