import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import {
  ArrowLeft,
  Save,
  Tag,
  Globe,
  Settings,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  AlertCircle,
  Palette,
  Info,
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { addToast } from '../../store/slices/uiSlice';
import {
  AdminFacetDocument,
  CreateFacetDocument,
  UpdateFacetDocument,
  CreateFacetValuesDocument,
  UpdateFacetValuesDocument,
  DeleteFacetValuesDocument,
  AdminChannelsDocument,
  AssignFacetsToChannelDocument,
  RemoveFacetsFromChannelDocument,
  LanguageCode,
} from '../../graphql/generated/graphql';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { Badge } from '../../components/ui/Badge';
import { FacetValueEditor } from '../../components/facets/FacetValueEditor';
import type { FacetValueData } from '../../components/facets/FacetValueEditor';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Modal, ModalContent, ModalFooter } from '../../components/ui/Modal';
import { PermissionGate } from '../../components/auth/PermissionGate';
import { cn } from '../../lib/utils';

// Helper to get translation by language
const getTranslation = (translations: any[] | undefined, lang: string, field: string): string => {
  if (!translations) return '';
  const translation = translations.find((t: any) => t.languageCode === lang);
  return translation?.[field] || '';
};

const validationSchema = Yup.object({
  name: Yup.string().required('Nom requis').min(2, 'Minimum 2 caracteres'),
  code: Yup.string()
    .required('Code requis')
    .matches(/^[a-z0-9-]+$/, 'Code invalide (lettres minuscules, chiffres et tirets uniquement)'),
});

interface FormValues {
  name: string;
  code: string;
  nameEn: string;
  nameAr: string;
  isPrivate: boolean;
}

const generateCode = (name: string): string => {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const FacetDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isNew = !id || id === 'new';

  const [facetValues, setFacetValues] = useState<FacetValueData[]>([]);
  const [deletedValueIds, setDeletedValueIds] = useState<string[]>([]);
  const [codeManuallyEdited, setCodeManuallyEdited] = useState(false);
  const [deletingValue, setDeletingValue] = useState<{ index: number; name: string } | null>(null);
  const [forceDeleteState, setForceDeleteState] = useState<{
    ids: string[];
    messages: string[];
  } | null>(null);

  // Fetch current facet (if editing)
  const { data, loading, error } = useQuery(AdminFacetDocument, {
    variables: { id: isNew ? '0' : id! },
    skip: isNew,
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      if (data?.facet?.values) {
        setFacetValues(
          data.facet.values.map((v: any) => ({
            id: v.id,
            name: getTranslation(v.translations, 'fr', 'name') || v.name,
            code: v.code,
            nameEn: getTranslation(v.translations, 'en', 'name'),
            nameAr: getTranslation(v.translations, 'ar', 'name'),
            colorHex: v.customFields?.colorHex || '',
            isNew: false,
          }))
        );
      }
    },
  });

  // Mutations
  const [createFacet, { loading: creating }] = useMutation(CreateFacetDocument);
  const [updateFacet, { loading: updating }] = useMutation(UpdateFacetDocument);
  const [createFacetValues] = useMutation(CreateFacetValuesDocument);
  const [updateFacetValues] = useMutation(UpdateFacetValuesDocument);
  const [deleteFacetValues] = useMutation(DeleteFacetValuesDocument);

  // Channels (multi-channel admin) — action-only; Facet has no channels field
  const { data: channelsData } = useQuery(AdminChannelsDocument, {
    variables: { options: { take: 100 } },
  });
  const channels = channelsData?.channels?.items || [];
  const [selectedChannelIds, setSelectedChannelIds] = useState<string[]>([]);
  const [assignFacetsToChannel, { loading: assigningChannel }] = useMutation(
    AssignFacetsToChannelDocument
  );
  const [removeFacetsFromChannel, { loading: removingChannel }] = useMutation(
    RemoveFacetsFromChannelDocument
  );

  const handleAssignFacetToChannels = async (action: 'assign' | 'remove') => {
    if (!facet || isNew || selectedChannelIds.length === 0) return;
    try {
      for (const channelId of selectedChannelIds) {
        if (action === 'assign') {
          await assignFacetsToChannel({
            variables: { input: { channelId, facetIds: [facet.id] } },
          });
        } else {
          const res = await removeFacetsFromChannel({
            variables: { input: { channelId, facetIds: [facet.id], force: false } },
          });
          const result = res.data?.removeFacetsFromChannel?.[0];
          if (result?.__typename === 'FacetInUseError') {
            dispatch(
              addToast({
                message: `Facet utilisée par ${result.productCount} produit(s) et ${result.variantCount} variante(s)`,
                type: 'error',
              })
            );
            return;
          }
        }
      }
      const names = selectedChannelIds
        .map((cid) => channels.find((c) => c.id === cid)?.code)
        .filter(Boolean)
        .join(', ');
      dispatch(
        addToast({
          message:
            action === 'assign'
              ? `Attribut assigné à ${names}`
              : `Attribut retiré de ${names}`,
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

  const facet = data?.facet;

  // Determine if this is a color facet
  const isColorFacet = facetValues.some((v) => v.colorHex);

  // Handle add new value
  const handleAddValue = () => {
    setFacetValues([
      ...facetValues,
      {
        name: '',
        code: '',
        nameEn: '',
        nameAr: '',
        colorHex: isColorFacet ? '' : undefined,
        isNew: true,
      },
    ]);
  };

  // Bulk import: parse pasted CSV/TSV text and append to facetValues
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [bulkImportText, setBulkImportText] = useState('');

  const handleBulkImport = () => {
    const rows = bulkImportText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    if (rows.length === 0) {
      dispatch(addToast({ message: 'Aucune ligne à importer', type: 'error' }));
      return;
    }
    const parsed: FacetValueData[] = [];
    let lineNumber = 0;
    for (const row of rows) {
      lineNumber++;
      // Support both comma and tab as separators
      const cols = row.split(/\t|,/).map((c) => c.trim());
      const [code, nameFr, nameEn, nameAr, colorHex] = cols;
      if (!code || !nameFr) {
        dispatch(
          addToast({
            message: `Ligne ${lineNumber}: code et nom français requis`,
            type: 'error',
          })
        );
        return;
      }
      parsed.push({
        name: nameFr,
        code,
        nameEn: nameEn || '',
        nameAr: nameAr || '',
        colorHex: isColorFacet ? colorHex || '' : undefined,
        isNew: true,
      });
    }
    setFacetValues([...facetValues, ...parsed]);
    setBulkImportText('');
    setShowBulkImport(false);
    dispatch(
      addToast({
        message: `${parsed.length} valeur(s) ajoutée(s). Cliquez Enregistrer pour confirmer.`,
        type: 'success',
      })
    );
  };

  // Handle update value
  const handleUpdateValue = (index: number, value: FacetValueData) => {
    const newValues = [...facetValues];
    newValues[index] = value;
    setFacetValues(newValues);
  };

  const handleForceDelete = async () => {
    if (!forceDeleteState) return;
    try {
      await deleteFacetValues({
        variables: { ids: forceDeleteState.ids, force: true },
      });
      dispatch(
        addToast({
          message: `${forceDeleteState.ids.length} valeur(s) supprimée(s) (forcé)`,
          type: 'success',
        })
      );
    } catch (err: any) {
      dispatch(
        addToast({ message: err.message || 'Erreur lors de la suppression forcée', type: 'error' })
      );
    }
    setForceDeleteState(null);
  };

  // Handle delete value
  const handleDeleteValue = (index: number) => {
    const value = facetValues[index];
    if (value.id) {
      setDeletedValueIds([...deletedValueIds, value.id]);
    }
    setFacetValues(facetValues.filter((_, i) => i !== index));
    setDeletingValue(null);
  };

  // Handle form submit
  const handleSubmit = async (values: FormValues) => {
    try {
      const translations = [
        { languageCode: LanguageCode.Fr, name: values.name },
        ...(values.nameEn ? [{ languageCode: LanguageCode.En, name: values.nameEn }] : []),
        ...(values.nameAr ? [{ languageCode: LanguageCode.Ar, name: values.nameAr }] : []),
      ];

      if (isNew) {
        // Create facet
        const result = await createFacet({
          variables: {
            input: {
              code: values.code,
              isPrivate: values.isPrivate,
              translations,
              values: facetValues
                .filter((v) => v.name && v.code)
                .map((v) => ({
                  code: v.code,
                  translations: [
                    { languageCode: LanguageCode.Fr, name: v.name },
                    ...(v.nameEn ? [{ languageCode: LanguageCode.En, name: v.nameEn }] : []),
                    ...(v.nameAr ? [{ languageCode: LanguageCode.Ar, name: v.nameAr }] : []),
                  ],
                  customFields: v.colorHex ? { colorHex: v.colorHex } : undefined,
                })),
            },
          },
        });

        dispatch(
          addToast({
            message: 'Attribut cree avec succes',
            type: 'success',
          })
        );

        // Navigate to edit page
        if (result.data?.createFacet?.id) {
          navigate(`/facets/${result.data.createFacet.id}`, { replace: true });
        } else {
          navigate('/facets');
        }
      } else {
        // Update facet
        await updateFacet({
          variables: {
            input: {
              id: id!,
              code: values.code,
              isPrivate: values.isPrivate,
              translations,
            },
          },
        });

        // Handle deleted values — if any are blocked (NOT_DELETED), surface
        // a confirm dialog offering force delete instead of silently failing.
        if (deletedValueIds.length > 0) {
          const res = await deleteFacetValues({
            variables: { ids: deletedValueIds, force: false },
          });
          const blocked = (res.data?.deleteFacetValues || [])
            .map((r, i) => ({ id: deletedValueIds[i], result: r.result, message: r.message || '' }))
            .filter((r) => r.result === 'NOT_DELETED');
          if (blocked.length > 0) {
            setForceDeleteState({
              ids: blocked.map((b) => b.id),
              messages: blocked.map((b) => b.message),
            });
            // Bail out of the rest of the submit flow so the admin can decide
            // whether to force the deletion.
            return;
          }
        }

        // Handle new values
        const newValues = facetValues.filter((v) => v.isNew && v.name && v.code);
        if (newValues.length > 0) {
          await createFacetValues({
            variables: {
              input: newValues.map((v) => ({
                facetId: id!,
                code: v.code,
                translations: [
                  { languageCode: LanguageCode.Fr, name: v.name },
                  ...(v.nameEn ? [{ languageCode: LanguageCode.En, name: v.nameEn }] : []),
                  ...(v.nameAr ? [{ languageCode: LanguageCode.Ar, name: v.nameAr }] : []),
                ],
                customFields: v.colorHex ? { colorHex: v.colorHex } : undefined,
              })),
            },
          });
        }

        // Handle updated values
        const existingValues = facetValues.filter((v) => !v.isNew && v.id);
        if (existingValues.length > 0) {
          await updateFacetValues({
            variables: {
              input: existingValues.map((v) => ({
                id: v.id!,
                code: v.code,
                translations: [
                  { languageCode: LanguageCode.Fr, name: v.name },
                  ...(v.nameEn ? [{ languageCode: LanguageCode.En, name: v.nameEn }] : []),
                  ...(v.nameAr ? [{ languageCode: LanguageCode.Ar, name: v.nameAr }] : []),
                ],
                customFields: v.colorHex !== undefined ? { colorHex: v.colorHex || null } : undefined,
              })),
            },
          });
        }

        dispatch(
          addToast({
            message: 'Attribut mis a jour avec succes',
            type: 'success',
          })
        );

        navigate('/facets');
      }
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

  if (!isNew && (error || !facet)) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <p className="text-destructive text-lg font-medium">
            {error ? `Erreur: ${error.message}` : 'Attribut non trouve'}
          </p>
          <Button variant="secondary" onClick={() => navigate('/facets')} className="mt-4">
            Retour a la liste
          </Button>
        </div>
      </div>
    );
  }

  const initialValues: FormValues = {
    name: getTranslation(facet?.translations, 'fr', 'name') || facet?.name || '',
    code: facet?.code || '',
    nameEn: getTranslation(facet?.translations, 'en', 'name'),
    nameAr: getTranslation(facet?.translations, 'ar', 'name'),
    isPrivate: facet?.isPrivate || false,
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/facets')}
          className="p-2 hover:bg-accent rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">
            {isNew ? 'Nouvel attribut' : facet?.name}
          </h1>
          {!isNew && facet && (
            <div className="flex items-center gap-2 mt-1 text-muted-foreground">
              <span className="font-mono text-sm">{facet.code}</span>
              {facet.isPrivate && (
                <Badge variant="warning" className="ml-2">
                  <EyeOff className="h-3 w-3 mr-1" />
                  Prive
                </Badge>
              )}
              {isColorFacet && (
                <Badge variant="info" className="ml-2">
                  <Palette className="h-3 w-3 mr-1" />
                  Couleurs
                </Badge>
              )}
            </div>
          )}
        </div>
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
                      <span className="px-2 py-0.5 bg-blue-500/20 text-blue-500 rounded text-xs font-bold">
                        FR
                      </span>
                      <span className="font-medium text-foreground">
                        Langue principale : Francais
                      </span>
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
                            if (isNew && !codeManuallyEdited) {
                              setFieldValue('code', generateCode(e.target.value));
                            }
                          }}
                          onBlur={handleBlur}
                          placeholder="Ex: Couleur"
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
                          Code <span className="text-destructive">*</span>
                        </label>
                        <input
                          type="text"
                          name="code"
                          value={values.code}
                          onChange={(e) => {
                            setCodeManuallyEdited(true);
                            setFieldValue('code', generateCode(e.target.value) || e.target.value);
                          }}
                          onBlur={handleBlur}
                          placeholder="Ex: couleur"
                          disabled={!isNew}
                          className={cn(
                            'w-full px-4 py-2.5 border rounded-lg transition-all duration-200 bg-background text-foreground placeholder-muted-foreground font-mono',
                            'focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none',
                            'disabled:bg-muted disabled:cursor-not-allowed',
                            touched.code && errors.code
                              ? 'border-destructive bg-destructive/10'
                              : 'border-border hover:border-muted-foreground'
                          )}
                        />
                        {isNew && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            Auto-genere depuis le nom
                          </p>
                        )}
                        {touched.code && errors.code && (
                          <p className="mt-1.5 text-sm text-destructive flex items-center gap-1">
                            <AlertCircle className="h-3.5 w-3.5" />
                            {errors.code}
                          </p>
                        )}
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
                            {values.isPrivate ? 'Attribut prive' : 'Attribut public'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {values.isPrivate
                              ? 'Non visible dans les filtres'
                              : 'Visible dans les filtres'}
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
                      </div>
                    </div>
                  </div>
                </div>

                {/* Facet Values Card */}
                <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                  <div className="px-6 py-4 border-b border-border bg-blue-500/5">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <Tag className="h-5 w-5 text-blue-500" />
                        Valeurs ({facetValues.length})
                      </h2>
                      <div className="flex items-center gap-2">
                        <PermissionGate anyOf={['UpdateFacet', 'UpdateCatalog']} disableMode>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowBulkImport(true)}
                          >
                            Importer
                          </Button>
                        </PermissionGate>
                        <PermissionGate anyOf={['UpdateFacet', 'UpdateCatalog']} disableMode>
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            icon={<Plus className="h-4 w-4" />}
                            onClick={handleAddValue}
                          >
                            Ajouter une valeur
                          </Button>
                        </PermissionGate>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    {facetValues.length === 0 ? (
                      <div className="text-center py-8">
                        <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground">Aucune valeur definie</p>
                        <PermissionGate anyOf={['UpdateFacet', 'UpdateCatalog']} disableMode>
                          <Button
                            type="button"
                            variant="secondary"
                            className="mt-4"
                            icon={<Plus className="h-4 w-4" />}
                            onClick={handleAddValue}
                          >
                            Ajouter une valeur
                          </Button>
                        </PermissionGate>
                      </div>
                    ) : (
                      facetValues.map((value, index) => (
                        <FacetValueEditor
                          key={value.id || `new-${index}`}
                          value={value}
                          onChange={(v) => handleUpdateValue(index, v)}
                          onDelete={() => {
                            if (value.id) {
                              setDeletingValue({ index, name: value.name });
                            } else {
                              handleDeleteValue(index);
                            }
                          }}
                          isColorFacet={isColorFacet || facetValues.some((v) => v.colorHex)}
                        />
                      ))
                    )}

                    {facetValues.length > 0 && (
                      <div className="pt-4 border-t border-border">
                        <PermissionGate anyOf={['UpdateFacet', 'UpdateCatalog']} disableMode>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            icon={<Plus className="h-4 w-4" />}
                            onClick={handleAddValue}
                          >
                            Ajouter une valeur
                          </Button>
                        </PermissionGate>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Actions */}
              <div className="space-y-6">
                {/* Tips Card */}
                <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                  <div className="px-6 py-4 border-b border-border bg-amber-500/5">
                    <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <Info className="h-5 w-5 text-amber-500" />
                      Conseils
                    </h2>
                  </div>
                  <div className="p-4 space-y-3 text-sm text-muted-foreground">
                    <p>
                      <strong className="text-foreground">Attributs courants :</strong>
                    </p>
                    <ul className="list-disc list-inside space-y-1 pl-2">
                      <li>Couleur - avec codes hex</li>
                      <li>Taille - S, M, L, XL...</li>
                      <li>Materiau - Coton, Polyester...</li>
                      <li>Marque - Nike, Adidas...</li>
                    </ul>
                    <p className="pt-2">
                      <strong className="text-foreground">Astuce :</strong> Ajoutez un code hex pour
                      activer l'affichage couleur.
                    </p>
                  </div>
                </div>

                {/* Quick Stats (only when editing) */}
                {!isNew && facet && (
                  <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                    <div className="px-6 py-4 border-b border-border">
                      <h2 className="text-lg font-semibold text-foreground">Statistiques</h2>
                    </div>
                    <div className="p-4 grid grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-500/10 rounded-lg text-center">
                        <p className="text-2xl font-bold text-blue-500">{facetValues.length}</p>
                        <p className="text-sm text-muted-foreground">Valeurs</p>
                      </div>
                      <div className="p-4 bg-amber-500/10 rounded-lg text-center">
                        <Badge
                          variant={facet.isPrivate ? 'warning' : 'success'}
                          className="text-sm"
                        >
                          {facet.isPrivate ? 'Prive' : 'Public'}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">Visibilite</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Channels Card (only when editing and >1 channel) */}
                {!isNew && facet && channels.length > 1 && (
                  <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                    <div className="px-6 py-4 border-b border-border bg-cyan-500/5">
                      <h2 className="text-lg font-semibold text-foreground">Canaux</h2>
                      <p className="text-xs text-muted-foreground mt-1">
                        Assigner ou retirer cet attribut des canaux de vente
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
                                onChange={() =>
                                  setSelectedChannelIds((prev) =>
                                    checked
                                      ? prev.filter((id) => id !== ch.id)
                                      : [...prev, ch.id]
                                  )
                                }
                                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                              />
                              <span className="text-sm font-medium text-foreground">
                                {ch.code}
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
                          onClick={() => handleAssignFacetToChannels('assign')}
                        >
                          Assigner
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          loading={removingChannel}
                          disabled={selectedChannelIds.length === 0}
                          onClick={() => handleAssignFacetToChannels('remove')}
                        >
                          Retirer
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="bg-card rounded-xl shadow-sm border border-border p-4 space-y-3 sticky top-4">
                  <PermissionGate
                    anyOf={['CreateFacet', 'UpdateFacet', 'CreateCatalog', 'UpdateCatalog']}
                    disableMode
                  >
                    <Button
                      type="submit"
                      className="w-full"
                      loading={creating || updating}
                      icon={<Save className="h-4 w-4" />}
                      disabled={!isValid}
                    >
                      {isNew ? "Creer l'attribut" : 'Enregistrer les modifications'}
                    </Button>
                  </PermissionGate>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => navigate('/facets')}
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            </div>
          </Form>
        )}
      </Formik>

      {/* Delete Value Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingValue}
        onClose={() => setDeletingValue(null)}
        onConfirm={() => deletingValue && handleDeleteValue(deletingValue.index)}
        title="Supprimer la valeur"
        message={`Etes-vous sur de vouloir supprimer la valeur "${deletingValue?.name}"? Cette action est irreversible.`}
        confirmText="Supprimer"
        variant="danger"
      />

      {/* Bulk import modal */}
      <Modal
        isOpen={showBulkImport}
        onClose={() => setShowBulkImport(false)}
        title="Importer des valeurs"
        size="md"
      >
        <ModalContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Une valeur par ligne. Colonnes séparées par <strong>virgule</strong> ou{' '}
            <strong>tabulation</strong>:
            <br />
            <code className="text-xs bg-muted px-2 py-1 rounded mt-1 inline-block">
              code, nom (FR), nom (EN), nom (AR){isColorFacet ? ', couleur hex (#000000)' : ''}
            </code>
          </p>
          <textarea
            value={bulkImportText}
            onChange={(e) => setBulkImportText(e.target.value)}
            rows={10}
            placeholder={
              isColorFacet
                ? 'rouge, Rouge, Red, أحمر, #DC2626\nbleu, Bleu, Blue, أزرق, #2563EB'
                : 's, S, Small, صغير\nm, M, Medium, متوسط'
            }
            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground font-mono text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
          <p className="text-xs text-muted-foreground">
            Les valeurs apparaîtront en bas de la liste et seront créées au prochain
            enregistrement de l'attribut.
          </p>
        </ModalContent>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowBulkImport(false)}>
            Annuler
          </Button>
          <PermissionGate anyOf={['UpdateFacet', 'UpdateCatalog']} disableMode>
            <Button variant="primary" onClick={handleBulkImport}>
              Ajouter
            </Button>
          </PermissionGate>
        </ModalFooter>
      </Modal>

      {/* Force-delete confirmation when values are still in use */}
      <ConfirmDialog
        isOpen={forceDeleteState !== null}
        onClose={() => setForceDeleteState(null)}
        onConfirm={handleForceDelete}
        title="Valeur(s) utilisée(s)"
        message={
          <div>
            <p>
              {forceDeleteState?.ids.length} valeur(s) ne peuvent pas être supprimées car elles
              sont encore utilisées.
            </p>
            {forceDeleteState?.messages.filter(Boolean).slice(0, 5).map((m, i) => (
              <p key={i} className="mt-1 text-sm text-muted-foreground">
                • {m}
              </p>
            ))}
            <p className="mt-2 text-amber-600">
              Forcer la suppression retirera ces valeurs de tous les produits / variantes concernés.
            </p>
          </div>
        }
        confirmText="Forcer la suppression"
        variant="danger"
      />
    </div>
  );
};

export default FacetDetail;
