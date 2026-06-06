import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import {
  ArrowLeft,
  Tag,
  Save,
  Percent,
  DollarSign,
  Calendar,
  Users,
  RefreshCw,
  Info,
  ShoppingCart,
  Package,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { addToast } from '../../store/slices/uiSlice';
import {
  AdminPromotionDocument,
  CreatePromotionDocument,
  UpdatePromotionDocument,
  PromotionConditionsDocument,
  PromotionActionsDocument,
} from '../../graphql/generated/graphql';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { TextArea } from '../../components/ui/TextArea';
import { Select } from '../../components/ui/Select';
import { Spinner } from '../../components/ui/Spinner';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { PermissionGate } from '../../components/auth/PermissionGate';

// Generate random promo code
const generatePromoCode = (length: number = 8): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Icon mapping for known action codes
const ACTION_ICONS: Record<string, React.ReactNode> = {
  'order_percentage_discount': <Percent className="h-6 w-6" />,
  'order_fixed_discount': <DollarSign className="h-6 w-6" />,
  'collection-percentage-discount': <Package className="h-6 w-6" />,
  'products_percentage_discount': <ShoppingCart className="h-6 w-6" />,
  'facet_values_percentage_discount': <Tag className="h-6 w-6" />,
  'buy_x_get_y_free': <Sparkles className="h-6 w-6" />,
  'free_shipping': <Zap className="h-6 w-6" />,
};

// Friendly labels for known action codes
const ACTION_LABELS: Record<string, string> = {
  'order_percentage_discount': 'Pourcentage sur commande',
  'order_fixed_discount': 'Montant fixe sur commande',
  'collection-percentage-discount': 'Remise par collection (discount-XX)',
  'products_percentage_discount': 'Pourcentage sur produits',
  'facet_values_percentage_discount': 'Pourcentage par attribut',
  'buy_x_get_y_free': 'Achetez X, obtenez Y gratuit',
  'free_shipping': 'Livraison gratuite',
};

interface PromotionActionDef {
  code: string;
  description: string;
  args: Array<{
    name: string;
    type: string;
    required: boolean;
    defaultValue: string;
    list: boolean;
    ui: any;
    label: any;
  }>;
}

interface PromotionConditionDef {
  code: string;
  description: string;
  args: Array<{
    name: string;
    type: string;
    required: boolean;
    defaultValue: string;
    list: boolean;
    ui: any;
    label: any;
  }>;
}

interface FormValues {
  name: string;
  description: string;
  couponCode: string;
  selectedActionCode: string;
  actionArgs: Record<string, string>;
  selectedConditionCode: string;
  conditionArgs: Record<string, string>;
  usageLimit: number | null;
  perCustomerUsageLimit: number | null;
  startsAt: string;
  endsAt: string;
  enabled: boolean;
}

export const PromotionForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isEdit = Boolean(id);

  // Fetch existing promotion if editing
  const { data: promotionData, loading: loadingPromotion } = useQuery(AdminPromotionDocument, {
    variables: { id: id! },
    skip: !isEdit,
  });

  // Fetch available conditions and actions from Vendure
  const { data: conditionsData } = useQuery(PromotionConditionsDocument);
  const { data: actionsData } = useQuery(PromotionActionsDocument);

  const [createPromotion, { loading: creating }] = useMutation(CreatePromotionDocument);
  const [updatePromotion, { loading: updating }] = useMutation(UpdatePromotionDocument);

  const promotion = promotionData?.promotion;
  const availableActions: PromotionActionDef[] = (actionsData?.promotionActions as any[]) || [];
  const availableConditions: PromotionConditionDef[] = (conditionsData?.promotionConditions as any[]) || [];

  const getInitialValues = (): FormValues => {
    if (!promotion) {
      return {
        name: '',
        description: '',
        couponCode: '',
        selectedActionCode: availableActions[0]?.code || '',
        actionArgs: {},
        selectedConditionCode: '',
        conditionArgs: {},
        usageLimit: null,
        perCustomerUsageLimit: null,
        startsAt: '',
        endsAt: '',
        enabled: true,
      };
    }

    // Parse existing action
    const action = promotion.actions?.[0];
    const actionArgs: Record<string, string> = {};
    if (action?.args) {
      for (const arg of action.args) {
        actionArgs[arg.name] = arg.value;
      }
    }

    // Parse existing condition
    const condition = promotion.conditions?.[0];
    const condArgs: Record<string, string> = {};
    if (condition?.args) {
      for (const arg of condition.args) {
        condArgs[arg.name] = arg.value;
      }
    }

    return {
      name: promotion.name,
      description: promotion.description || '',
      couponCode: promotion.couponCode || '',
      selectedActionCode: action?.code || '',
      actionArgs,
      selectedConditionCode: condition?.code || '',
      conditionArgs: condArgs,
      usageLimit: promotion.usageLimit,
      perCustomerUsageLimit: promotion.perCustomerUsageLimit,
      startsAt: promotion.startsAt ? promotion.startsAt.split('T')[0] : '',
      endsAt: promotion.endsAt ? promotion.endsAt.split('T')[0] : '',
      enabled: promotion.enabled,
    };
  };

  const handleSubmit = async (values: FormValues) => {
    try {
      // Build conditions array
      const conditions: any[] = [];
      if (values.selectedConditionCode) {
        const condDef = availableConditions.find((c) => c.code === values.selectedConditionCode);
        if (condDef) {
          conditions.push({
            code: values.selectedConditionCode,
            arguments: condDef.args.map((a) => ({
              name: a.name,
              value: values.conditionArgs[a.name] || a.defaultValue || '',
            })),
          });
        }
      }

      // Build actions array
      const actions: any[] = [];
      if (values.selectedActionCode) {
        const actDef = availableActions.find((a) => a.code === values.selectedActionCode);
        if (actDef) {
          actions.push({
            code: values.selectedActionCode,
            arguments: actDef.args.map((a) => ({
              name: a.name,
              value: values.actionArgs[a.name] || a.defaultValue || '',
            })),
          });
        }
      }

      const input = {
        enabled: values.enabled,
        couponCode: values.couponCode || null,
        startsAt: values.startsAt ? new Date(values.startsAt).toISOString() : null,
        endsAt: values.endsAt ? new Date(values.endsAt).toISOString() : null,
        usageLimit: values.usageLimit || null,
        perCustomerUsageLimit: values.perCustomerUsageLimit || null,
        conditions,
        actions,
        translations: [
          {
            languageCode: 'en' as any,
            name: values.name,
            description: values.description || '',
          },
        ],
      };

      if (isEdit) {
        const result = await updatePromotion({
          variables: { input: { id: id!, ...input } },
        });
        if (result.data?.updatePromotion?.__typename === 'MissingConditionsError') {
          dispatch(addToast({ message: 'Erreur: conditions manquantes', type: 'error' }));
          return;
        }
        dispatch(addToast({ message: 'Promotion mise à jour', type: 'success' }));
      } else {
        const result = await createPromotion({
          variables: { input },
        });
        if (result.data?.createPromotion?.__typename === 'MissingConditionsError') {
          dispatch(addToast({ message: 'Erreur: conditions manquantes', type: 'error' }));
          return;
        }
        dispatch(addToast({ message: 'Promotion créée', type: 'success' }));
      }
      navigate('/promotions');
    } catch (err: any) {
      dispatch(addToast({ message: err.message || 'Erreur', type: 'error' }));
    }
  };

  if (isEdit && loadingPromotion) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  const getActionLabel = (code: string) => ACTION_LABELS[code] || code;
  const getActionIcon = (code: string) => ACTION_ICONS[code] || <Zap className="h-6 w-6" />;

  const renderArgInput = (
    arg: { name: string; type: string; required: boolean; defaultValue: string; ui: any; label: any },
    values: FormValues,
    setFieldValue: (field: string, value: any) => void,
    prefix: 'actionArgs' | 'conditionArgs'
  ) => {
    const value = values[prefix][arg.name] || arg.defaultValue || '';
    const label = arg.label?.[0]?.value || arg.name;
    const suffix = arg.ui?.suffix || '';

    return (
      <Input
        key={arg.name}
        label={`${label}${suffix ? ` (${suffix})` : ''}`}
        name={`${prefix}.${arg.name}`}
        type={arg.type === 'float' || arg.type === 'int' ? 'number' : 'text'}
        value={value}
        onChange={(e) => {
          setFieldValue(prefix, { ...values[prefix], [arg.name]: e.target.value });
        }}
        required={arg.required}
        placeholder={arg.defaultValue || ''}
      />
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/promotions')}
          className="p-2 bg-muted hover:bg-accent rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isEdit ? 'Modifier la Promotion' : 'Nouvelle Promotion'}
          </h1>
          <p className="text-muted-foreground">
            {isEdit ? `Modification de ${promotion?.name}` : 'Créer une nouvelle promotion'}
          </p>
        </div>
      </div>

      <Formik
        initialValues={getInitialValues()}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, errors, touched, handleChange, handleBlur, setFieldValue }) => (
          <Form className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-5 w-5 text-purple-400" />
                    Informations de base
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    label="Nom de la promotion"
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.name && errors.name ? String(errors.name) : undefined}
                    placeholder="Ex: Soldes d'été 2024"
                    required
                  />

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Code promotionnel
                    </label>
                    <div className="flex gap-2">
                      <Input
                        name="couponCode"
                        value={values.couponCode}
                        onChange={(e) =>
                          setFieldValue('couponCode', e.target.value.toUpperCase())
                        }
                        onBlur={handleBlur}
                        placeholder="Ex: SUMMER24"
                        className="font-mono uppercase"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setFieldValue('couponCode', generatePromoCode())}
                        title="Générer un code"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Laissez vide pour une promotion automatique (sans code)
                    </p>
                  </div>

                  <TextArea
                    label="Description"
                    name="description"
                    value={values.description}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    rows={3}
                    placeholder="Description interne de la promotion..."
                  />
                </CardContent>
              </Card>

              {/* Action Selection — Dynamic from Vendure */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-green-400" />
                    Action de réduction
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {availableActions.length === 0 ? (
                    <div className="flex items-center justify-center py-8">
                      <Spinner size="sm" />
                      <span className="ml-2 text-muted-foreground">Chargement des actions...</span>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        {availableActions.map((action) => (
                          <button
                            key={action.code}
                            type="button"
                            onClick={() => {
                              setFieldValue('selectedActionCode', action.code);
                              // Reset args with defaults
                              const defaults: Record<string, string> = {};
                              action.args.forEach((a) => {
                                defaults[a.name] = a.defaultValue || '';
                              });
                              setFieldValue('actionArgs', defaults);
                            }}
                            className={`p-3 rounded-xl border-2 transition-all flex items-center gap-3 text-left ${
                              values.selectedActionCode === action.code
                                ? 'border-primary bg-primary/10'
                                : 'border-border hover:border-muted-foreground'
                            }`}
                          >
                            <div
                              className={`p-2 rounded-lg shrink-0 ${
                                values.selectedActionCode === action.code
                                  ? 'bg-primary/20 text-primary'
                                  : 'bg-muted text-muted-foreground'
                              }`}
                            >
                              {getActionIcon(action.code)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-foreground text-sm truncate">
                                {getActionLabel(action.code)}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {action.description}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>

                      {/* Action Arguments */}
                      {values.selectedActionCode && (() => {
                        const selectedAction = availableActions.find(
                          (a) => a.code === values.selectedActionCode
                        );
                        if (!selectedAction || selectedAction.args.length === 0) {
                          if (values.selectedActionCode === 'collection-percentage-discount') {
                            return (
                              <div className="bg-muted/50 rounded-xl p-4 border border-border">
                                <p className="text-sm text-foreground font-medium mb-2">Remise automatique par collection</p>
                                <p className="text-sm text-muted-foreground">
                                  Le pourcentage est extrait du slug de la collection.
                                  Format: <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">discount-XX</code> (ex: discount-30 pour -30%).
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }
                        return (
                          <div className="space-y-3 pt-2">
                            {selectedAction.args.map((arg) =>
                              renderArgInput(arg, values, setFieldValue, 'actionArgs')
                            )}
                          </div>
                        );
                      })()}
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Condition Selection — Dynamic from Vendure */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-blue-400" />
                    Condition (optionnel)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select
                    label="Condition d'application"
                    name="selectedConditionCode"
                    value={values.selectedConditionCode}
                    onChange={(e) => {
                      setFieldValue('selectedConditionCode', e.target.value);
                      // Reset condition args
                      const cond = availableConditions.find((c) => c.code === e.target.value);
                      const defaults: Record<string, string> = {};
                      cond?.args.forEach((a) => {
                        defaults[a.name] = a.defaultValue || '';
                      });
                      setFieldValue('conditionArgs', defaults);
                    }}
                    options={[
                      { value: '', label: 'Aucune condition (toujours active)' },
                      ...availableConditions.map((c) => ({
                        value: c.code,
                        label: c.description || c.code,
                      })),
                    ]}
                  />

                  {/* Condition Arguments */}
                  {values.selectedConditionCode && (() => {
                    const selectedCond = availableConditions.find(
                      (c) => c.code === values.selectedConditionCode
                    );
                    if (!selectedCond || selectedCond.args.length === 0) return null;
                    return (
                      <div className="space-y-3">
                        {selectedCond.args.map((arg) =>
                          renderArgInput(arg, values, setFieldValue, 'conditionArgs')
                        )}
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>

              {/* Validity Period */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-400" />
                    Période de validité
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Date de début"
                      name="startsAt"
                      type="date"
                      value={values.startsAt}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    <Input
                      label="Date de fin"
                      name="endsAt"
                      type="date"
                      value={values.endsAt}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Info className="h-4 w-4" />
                    Laissez vide pour une validité illimitée
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Statut</CardTitle>
                </CardHeader>
                <CardContent>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="enabled"
                      checked={values.enabled}
                      onChange={handleChange}
                      className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                    />
                    <span className="text-foreground font-medium">Promotion active</span>
                  </label>
                  <p className="text-sm text-muted-foreground mt-2">
                    Désactivez pour suspendre la promotion
                  </p>
                </CardContent>
              </Card>

              {/* Usage Limits */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-orange-400" />
                    Limites d'utilisation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    label="Limite totale d'utilisations"
                    name="usageLimit"
                    type="number"
                    value={values.usageLimit || ''}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Illimité"
                    min={0}
                  />
                  <Input
                    label="Limite par client"
                    name="perCustomerUsageLimit"
                    type="number"
                    value={values.perCustomerUsageLimit || ''}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Illimité"
                    min={0}
                  />
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <PermissionGate anyOf={['CreatePromotion', 'UpdatePromotion']} disableMode>
                      <Button
                        type="submit"
                        variant="primary"
                        className="w-full"
                        loading={creating || updating}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {isEdit ? 'Enregistrer' : 'Créer la promotion'}
                      </Button>
                    </PermissionGate>
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full"
                      onClick={() => navigate('/promotions')}
                    >
                      Annuler
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Preview */}
              <Card>
                <CardHeader>
                  <CardTitle>Aperçu</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-4 border border-purple-500/30">
                    <div className="text-center">
                      {values.couponCode ? (
                        <p className="font-mono text-2xl font-bold text-foreground mb-2">
                          {values.couponCode}
                        </p>
                      ) : (
                        <p className="text-muted-foreground mb-2">Promotion automatique</p>
                      )}
                      <p className="text-lg font-bold text-green-400">
                        {getActionLabel(values.selectedActionCode)}
                      </p>
                      {values.selectedConditionCode && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Condition: {availableConditions.find((c) => c.code === values.selectedConditionCode)?.description || values.selectedConditionCode}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};
