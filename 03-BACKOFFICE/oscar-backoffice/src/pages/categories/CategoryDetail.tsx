import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import {
  ArrowLeft,
  Save,
  FolderTree,
  Image,
  Globe,
  Settings,
  Eye,
  EyeOff,
  ChevronRight,
  Package,
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { addToast } from '../../store/slices/uiSlice';
import {
  AdminCollectionDocument,
  AdminCollectionsDocument,
  CreateCollectionDocument,
  UpdateCollectionDocument,
} from '../../graphql/generated/graphql';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { Spinner } from '../../components/ui/Spinner';
import { Tabs } from '../../components/ui/Tabs';
import { Badge } from '../../components/ui/Badge';

const validationSchema = Yup.object({
  name: Yup.string().required('Nom requis'),
  slug: Yup.string().required('Slug requis'),
});

interface FormValues {
  name: string;
  slug: string;
  description: string;
  nameFr: string;
  nameAr: string;
  descriptionFr: string;
  descriptionAr: string;
  parentId: string;
  isPrivate: boolean;
  displayOrder: number;
}

export const CategoryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isNew = id === 'new';

  // Fetch current collection (if editing)
  const { data, loading, error } = useQuery(AdminCollectionDocument, {
    variables: { id: id! },
    skip: isNew,
  });

  // Fetch all collections for parent dropdown
  const { data: collectionsData } = useQuery(AdminCollectionsDocument, {
    variables: { options: { take: 100 } },
  });

  const [createCollection, { loading: creating }] = useMutation(CreateCollectionDocument);
  const [updateCollection, { loading: updating }] = useMutation(UpdateCollectionDocument);

  const collection = data?.collection;
  const allCollections = collectionsData?.collections?.items || [];

  // Build parent options (excluding current collection and its children)
  const getParentOptions = () => {
    const options = [{ value: '', label: 'Aucun (racine)' }];

    const excludeIds = new Set<string>();
    if (!isNew && id) {
      excludeIds.add(id);
      // Also exclude children to prevent circular reference
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
        const prefix = '  '.repeat(depth);
        options.push({
          value: c.id,
          label: `${prefix}${c.name}`,
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

  const handleSubmit = async (values: FormValues) => {
    try {
      const input = {
        ...(isNew ? {} : { id }),
        translations: [
          {
            languageCode: 'en' as any,
            name: values.name,
            slug: values.slug,
            description: values.description,
          },
        ],
        filters: [],
        parentId: values.parentId || undefined,
        isPrivate: values.isPrivate,
        customFields: {
          nameFr: values.nameFr || null,
          nameAr: values.nameAr || null,
          descriptionFr: values.descriptionFr || null,
          descriptionAr: values.descriptionAr || null,
          displayOrder: values.displayOrder,
        },
      };

      if (isNew) {
        await createCollection({ variables: { input } });
        dispatch(addToast({
          message: 'Catégorie créée avec succès',
          type: 'success',
        }));
      } else {
        await updateCollection({ variables: { input: { ...input, id: id! } } });
        dispatch(addToast({
          message: 'Catégorie mise à jour avec succès',
          type: 'success',
        }));
      }

      navigate('/categories');
    } catch (err: any) {
      dispatch(addToast({
        message: err.message || 'Erreur lors de la sauvegarde',
        type: 'error',
      }));
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
          <p className="text-red-500 text-lg">
            {error ? `Erreur: ${error.message}` : 'Catégorie non trouvée'}
          </p>
          <Button variant="secondary" onClick={() => navigate('/categories')} className="mt-4">
            Retour à la liste
          </Button>
        </div>
      </div>
    );
  }

  const initialValues: FormValues = {
    name: collection?.name || '',
    slug: collection?.slug || '',
    description: collection?.description || '',
    nameFr: collection?.customFields?.nameFr || '',
    nameAr: collection?.customFields?.nameAr || '',
    descriptionFr: collection?.customFields?.descriptionFr || '',
    descriptionAr: collection?.customFields?.descriptionAr || '',
    parentId: collection?.parentId || '',
    isPrivate: collection?.isPrivate || false,
    displayOrder: collection?.customFields?.displayOrder || 0,
  };

  const tabs = [
    {
      id: 'general',
      label: 'Général',
      icon: <Settings className="h-4 w-4" />,
      content: (
        <div className="space-y-6">
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ values, errors, touched, handleChange, handleBlur, setFieldValue }) => (
              <Form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Nom"
                    name="name"
                    value={values.name}
                    onChange={(e) => {
                      handleChange(e);
                      if (isNew && !touched.slug) {
                        setFieldValue('slug', generateSlug(e.target.value));
                      }
                    }}
                    onBlur={handleBlur}
                    error={touched.name && errors.name ? String(errors.name) : undefined}
                    required
                  />
                  <Input
                    label="Slug (URL)"
                    name="slug"
                    value={values.slug}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.slug && errors.slug ? String(errors.slug) : undefined}
                    required
                  />
                </div>

                <Textarea
                  label="Description"
                  name="description"
                  value={values.description}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  rows={3}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Select
                    label="Catégorie parente"
                    name="parentId"
                    value={values.parentId}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    options={getParentOptions()}
                  />
                  <Input
                    label="Ordre d'affichage"
                    name="displayOrder"
                    type="number"
                    value={String(values.displayOrder)}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isPrivate"
                      checked={values.isPrivate}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Catégorie privée (non visible sur le site)</span>
                  </label>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Traductions
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-700">Français</h4>
                      <Input
                        label="Nom (FR)"
                        name="nameFr"
                        value={values.nameFr}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                      <Textarea
                        label="Description (FR)"
                        name="descriptionFr"
                        value={values.descriptionFr}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        rows={3}
                      />
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-700">العربية</h4>
                      <Input
                        label="الاسم (AR)"
                        name="nameAr"
                        value={values.nameAr}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        dir="rtl"
                      />
                      <Textarea
                        label="الوصف (AR)"
                        name="descriptionAr"
                        value={values.descriptionAr}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        rows={3}
                        dir="rtl"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => navigate('/categories')}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    loading={creating || updating}
                    icon={<Save className="h-4 w-4" />}
                  >
                    {isNew ? 'Créer' : 'Enregistrer'}
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      ),
    },
  ];

  // Add children tab if editing and has children
  if (!isNew && collection?.children && collection.children.length > 0) {
    tabs.push({
      id: 'children',
      label: `Sous-catégories (${collection.children.length})`,
      icon: <FolderTree className="h-4 w-4" />,
      content: (
        <div className="space-y-4">
          {collection.children.map((child) => (
            <div
              key={child.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
            >
              <div className="flex items-center gap-3">
                <ChevronRight className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">{child.name}</p>
                  <p className="text-sm text-gray-500">
                    {child.customFields?.nameFr && `FR: ${child.customFields.nameFr}`}
                    {child.customFields?.nameFr && child.customFields?.nameAr && ' • '}
                    {child.customFields?.nameAr && <span dir="rtl">AR: {child.customFields.nameAr}</span>}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Package className="h-4 w-4" />
                  <span>{child.productVariants?.totalItems || 0}</span>
                </div>
                <Badge variant="default">Pos: {child.position}</Badge>
                <Button
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
      ),
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/categories')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">
            {isNew ? 'Nouvelle catégorie' : collection?.name}
          </h1>
          {!isNew && collection && (
            <div className="flex items-center gap-2 mt-1 text-gray-600">
              {collection.breadcrumbs?.map((crumb, index) => (
                <React.Fragment key={crumb.id}>
                  {index > 0 && <ChevronRight className="h-4 w-4" />}
                  <span>{crumb.name}</span>
                </React.Fragment>
              ))}
              {collection.isPrivate && (
                <Badge variant="warning" className="ml-2">
                  <EyeOff className="h-3 w-3 mr-1" />
                  Privé
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Info Card (only when editing) */}
      {!isNew && collection && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-start gap-6">
            <div className="h-20 w-20 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {collection.featuredAsset?.preview ? (
                <img
                  src={collection.featuredAsset.preview}
                  alt={collection.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Image className="h-8 w-8 text-gray-400" />
              )}
            </div>
            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Position</p>
                <p className="font-medium">{collection.position}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Produits</p>
                <p className="font-medium">{collection.productVariants?.totalItems || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Sous-catégories</p>
                <p className="font-medium">{collection.children?.length || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Visibilité</p>
                <Badge variant={collection.isPrivate ? 'warning' : 'success'}>
                  {collection.isPrivate ? 'Privé' : 'Public'}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <Tabs tabs={tabs} defaultTab="general" />
      </div>
    </div>
  );
};
