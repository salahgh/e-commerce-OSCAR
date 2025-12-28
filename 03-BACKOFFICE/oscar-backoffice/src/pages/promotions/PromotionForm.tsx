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

// Generate random promo code
const generatePromoCode = (length: number = 8): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const validationSchema = Yup.object({
  name: Yup.string().required('Nom requis'),
  couponCode: Yup.string()
    .matches(/^[A-Z0-9]*$/, 'Uniquement lettres majuscules et chiffres')
    .nullable(),
  discountType: Yup.string().oneOf(['percentage', 'fixed']).required('Type de réduction requis'),
  discountValue: Yup.number()
    .min(0, 'Valeur positive requise')
    .required('Valeur de réduction requise'),
  minOrderAmount: Yup.number().min(0, 'Valeur positive requise').nullable(),
  usageLimit: Yup.number().min(0, 'Valeur positive requise').nullable(),
  perCustomerUsageLimit: Yup.number().min(0, 'Valeur positive requise').nullable(),
  startsAt: Yup.string().nullable(),
  endsAt: Yup.string().nullable(),
  enabled: Yup.boolean(),
});

interface FormValues {
  name: string;
  description: string;
  couponCode: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number | null;
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

  // Fetch available conditions and actions
  const { data: conditionsData } = useQuery(PromotionConditionsDocument);
  const { data: actionsData } = useQuery(PromotionActionsDocument);

  // Mutations
  const [createPromotion, { loading: creating }] = useMutation(CreatePromotionDocument);
  const [updatePromotion, { loading: updating }] = useMutation(UpdatePromotionDocument);

  const promotion = promotionData?.promotion;

  // Parse existing promotion data for form
  const getInitialValues = (): FormValues => {
    if (!promotion) {
      return {
        name: '',
        description: '',
        couponCode: '',
        discountType: 'percentage',
        discountValue: 10,
        minOrderAmount: null,
        usageLimit: null,
        perCustomerUsageLimit: null,
        startsAt: '',
        endsAt: '',
        enabled: true,
      };
    }

    // Parse discount from actions
    let discountType: 'percentage' | 'fixed' = 'percentage';
    let discountValue = 0;
    const action = promotion.actions?.[0];
    if (action) {
      if (action.code.includes('percentage') || action.code.includes('Percentage')) {
        discountType = 'percentage';
      } else {
        discountType = 'fixed';
      }
      const valueArg = action.args?.find(
        (a) => a.name === 'discount' || a.name === 'amount' || a.name === 'discountPercentage'
      );
      discountValue = valueArg ? parseInt(valueArg.value) : 0;
      // Convert cents to DA for fixed amounts
      if (discountType === 'fixed') {
        discountValue = discountValue / 100;
      }
    }

    // Parse min order from conditions
    let minOrderAmount: number | null = null;
    const condition = promotion.conditions?.find(
      (c) => c.code.includes('minimum') || c.code.includes('orderTotal')
    );
    if (condition) {
      const amountArg = condition.args?.find((a) => a.name === 'amount' || a.name === 'orderTotal');
      if (amountArg) {
        minOrderAmount = parseInt(amountArg.value) / 100; // Convert cents to DA
      }
    }

    return {
      name: promotion.name,
      description: promotion.description || '',
      couponCode: promotion.couponCode || '',
      discountType,
      discountValue,
      minOrderAmount,
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
      if (values.minOrderAmount && values.minOrderAmount > 0) {
        conditions.push({
          code: 'minimum_order_amount',
          arguments: [
            {
              name: 'amount',
              value: String(Math.round(values.minOrderAmount * 100)), // Convert DA to cents
            },
            {
              name: 'taxInclusive',
              value: 'true',
            },
          ],
        });
      }

      // Build actions array
      const actions: any[] = [];
      if (values.discountType === 'percentage') {
        actions.push({
          code: 'order_percentage_discount',
          arguments: [
            {
              name: 'discount',
              value: String(values.discountValue),
            },
          ],
        });
      } else {
        actions.push({
          code: 'order_fixed_discount',
          arguments: [
            {
              name: 'discount',
              value: String(Math.round(values.discountValue * 100)), // Convert DA to cents
            },
          ],
        });
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
        dispatch(addToast({ message: 'Code promo mis à jour', type: 'success' }));
      } else {
        const result = await createPromotion({
          variables: { input },
        });
        if (result.data?.createPromotion?.__typename === 'MissingConditionsError') {
          dispatch(addToast({ message: 'Erreur: conditions manquantes', type: 'error' }));
          return;
        }
        dispatch(addToast({ message: 'Code promo créé', type: 'success' }));
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
            {isEdit ? 'Modifier le Code Promo' : 'Nouveau Code Promo'}
          </h1>
          <p className="text-muted-foreground">
            {isEdit ? `Modification de ${promotion?.name}` : 'Créer un nouveau code promotionnel'}
          </p>
        </div>
      </div>

      <Formik
        initialValues={getInitialValues()}
        validationSchema={validationSchema}
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
                    label="Nom du code promo"
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
                        error={
                          touched.couponCode && errors.couponCode
                            ? String(errors.couponCode)
                            : undefined
                        }
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

              {/* Discount Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-green-400" />
                    Configuration de la réduction
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Type de réduction
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setFieldValue('discountType', 'percentage')}
                        className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                          values.discountType === 'percentage'
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-muted-foreground'
                        }`}
                      >
                        <div
                          className={`p-2 rounded-lg ${
                            values.discountType === 'percentage'
                              ? 'bg-primary/20'
                              : 'bg-muted'
                          }`}
                        >
                          <Percent
                            className={`h-6 w-6 ${
                              values.discountType === 'percentage'
                                ? 'text-primary'
                                : 'text-muted-foreground'
                            }`}
                          />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-foreground">Pourcentage</p>
                          <p className="text-sm text-muted-foreground">Ex: -20%</p>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFieldValue('discountType', 'fixed')}
                        className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                          values.discountType === 'fixed'
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-muted-foreground'
                        }`}
                      >
                        <div
                          className={`p-2 rounded-lg ${
                            values.discountType === 'fixed' ? 'bg-primary/20' : 'bg-muted'
                          }`}
                        >
                          <DollarSign
                            className={`h-6 w-6 ${
                              values.discountType === 'fixed'
                                ? 'text-primary'
                                : 'text-muted-foreground'
                            }`}
                          />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-foreground">Montant fixe</p>
                          <p className="text-sm text-muted-foreground">Ex: -500 DA</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  <Input
                    label={
                      values.discountType === 'percentage'
                        ? 'Pourcentage de réduction'
                        : 'Montant de la réduction (DA)'
                    }
                    name="discountValue"
                    type="number"
                    value={values.discountValue}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={
                      touched.discountValue && errors.discountValue
                        ? String(errors.discountValue)
                        : undefined
                    }
                    min={0}
                    max={values.discountType === 'percentage' ? 100 : undefined}
                    required
                  />

                  <Input
                    label="Montant minimum de commande (DA)"
                    name="minOrderAmount"
                    type="number"
                    value={values.minOrderAmount || ''}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Laisser vide pour aucun minimum"
                    min={0}
                  />
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
                    <span className="text-foreground font-medium">Code promo actif</span>
                  </label>
                  <p className="text-sm text-muted-foreground mt-2">
                    Désactivez pour empêcher l'utilisation du code
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
                    <Button
                      type="submit"
                      variant="primary"
                      className="w-full"
                      loading={creating || updating}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isEdit ? 'Enregistrer' : 'Créer le code promo'}
                    </Button>
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
                      <p className="text-3xl font-bold text-green-400">
                        {values.discountType === 'percentage'
                          ? `-${values.discountValue}%`
                          : `-${values.discountValue.toLocaleString('fr-DZ')} DA`}
                      </p>
                      {values.minOrderAmount && values.minOrderAmount > 0 && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Min. {values.minOrderAmount.toLocaleString('fr-DZ')} DA
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
