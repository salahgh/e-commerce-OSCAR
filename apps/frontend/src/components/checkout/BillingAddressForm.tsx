'use client';

import React, { useState, useEffect } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { Button, Input, Card } from '@/components/ui';
import { MapPin, User, Phone } from 'lucide-react';
import { wilayas, getCommunesByWilayaCode } from '@/lib/data/algeria';
import { cn } from '@/lib/utils';

interface BillingAddressFormProps {
  // The shipping-step values (wilaya/commune codes); used for the "same as
  // shipping" summary and as the default base for a different billing address.
  shippingValues: any;
  initialValues?: any;
  // null  => use the shipping address; values => a distinct billing address.
  onSubmit: (values: any | null) => void;
  onBack?: () => void;
  isSubmitting?: boolean;
}

const validationSchema = Yup.object({
  firstName: Yup.string()
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .required('Le prénom est requis'),
  lastName: Yup.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .required('Le nom est requis'),
  phone: Yup.string()
    .matches(
      /^(0)(5|6|7)[0-9]{8}$/,
      'Numéro de téléphone invalide (ex: 05XXXXXXXX, 06XXXXXXXX ou 07XXXXXXXX)'
    )
    .required('Le numéro de téléphone est requis'),
  address: Yup.string()
    .min(10, 'L\'adresse doit contenir au moins 10 caractères')
    .required('L\'adresse est requise'),
  wilaya: Yup.string().required('La wilaya est requise'),
  commune: Yup.string().required('La commune est requise'),
  postalCode: Yup.string()
    .matches(/^[0-9]{5}$/, 'Code postal invalide (5 chiffres)')
    .required('Le code postal est requis'),
  notes: Yup.string().max(200, 'Les notes ne peuvent pas dépasser 200 caractères'),
});

interface BillingFormValues {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  wilaya: string;
  commune: string;
  postalCode: string;
  notes: string;
}

const defaultValues: BillingFormValues = {
  firstName: '',
  lastName: '',
  phone: '',
  address: '',
  wilaya: '',
  commune: '',
  postalCode: '',
  notes: '',
};

export default function BillingAddressForm({
  shippingValues,
  initialValues,
  onSubmit,
  onBack,
  isSubmitting = false,
}: BillingAddressFormProps) {
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const base: Partial<BillingFormValues> = initialValues ?? shippingValues ?? {};
  const [selectedWilayaCode, setSelectedWilayaCode] = useState(base?.wilaya || '');

  // Display names for the "same as shipping" summary.
  const shipWilayaName =
    wilayas.find((w) => w.code === shippingValues?.wilaya)?.name || shippingValues?.wilaya || '';
  const shipCommuneName =
    getCommunesByWilayaCode(shippingValues?.wilaya || '').find(
      (c) => c.code === shippingValues?.commune
    )?.name || shippingValues?.commune || '';

  const communes = getCommunesByWilayaCode(selectedWilayaCode);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Adresse de facturation</h2>
        <p className="text-muted-foreground">Où devons-nous envoyer votre facture ?</p>
      </div>

      {/* Same-as-shipping toggle */}
      <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
        <input
          type="checkbox"
          id="sameAsShipping"
          checked={sameAsShipping}
          onChange={(e) => setSameAsShipping(e.target.checked)}
          className="w-4 h-4 rounded border-input text-primary focus:ring-primary"
        />
        <label htmlFor="sameAsShipping" className="text-sm cursor-pointer">
          <span className="font-medium">Utiliser l'adresse de livraison</span>
          <span className="text-muted-foreground ml-1">pour la facturation</span>
        </label>
      </div>

      {sameAsShipping ? (
        <>
          {/* Read-only summary of the shipping address */}
          {shippingValues && (
            <Card>
              <Card.Content className="p-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div className="text-sm space-y-1">
                    <p className="font-medium">
                      {shippingValues.firstName} {shippingValues.lastName}
                    </p>
                    <p className="text-muted-foreground">{shippingValues.address}</p>
                    <p className="text-muted-foreground">
                      {shipCommuneName}, {shipWilayaName} {shippingValues.postalCode}
                    </p>
                    <p className="text-muted-foreground">{shippingValues.phone}</p>
                  </div>
                </div>
              </Card.Content>
            </Card>
          )}

          <div className="flex gap-3 pt-6 border-t">
            {onBack && (
              <Button type="button" variant="outline" onClick={onBack} className="flex-1">
                Retour
              </Button>
            )}
            <Button
              type="button"
              onClick={() => onSubmit(null)}
              loading={isSubmitting}
              className="flex-1"
            >
              Continuer
            </Button>
          </div>
        </>
      ) : (
        <Formik
          initialValues={{ ...defaultValues, ...base }}
          validationSchema={validationSchema}
          onSubmit={(values) => onSubmit(values)}
          enableReinitialize
        >
          {({ errors, touched, values, setFieldValue }) => {
            // Reset commune + auto-fill postal code when the wilaya changes.
            useEffect(() => {
              if (values.wilaya !== selectedWilayaCode) {
                setSelectedWilayaCode(values.wilaya);
                setFieldValue('commune', '');
                const wilaya = wilayas.find((w) => w.code === values.wilaya);
                if (wilaya && wilaya.communes.length > 0) {
                  setFieldValue('postalCode', wilaya.communes[0].postalCode);
                }
              }
            }, [values.wilaya, setFieldValue]);

            // Keep postal code in sync with the selected commune.
            useEffect(() => {
              if (values.commune && values.wilaya) {
                const commune = getCommunesByWilayaCode(values.wilaya).find(
                  (c) => c.code === values.commune
                );
                if (commune) {
                  setFieldValue('postalCode', commune.postalCode);
                }
              }
            }, [values.commune, values.wilaya, setFieldValue]);

            return (
              <Form className="space-y-6">
                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="billFirstName" className="block text-sm font-medium mb-2">
                      Prénom <span className="text-destructive">*</span>
                    </label>
                    <Field name="firstName">
                      {({ field }: any) => (
                        <Input
                          {...field}
                          id="billFirstName"
                          type="text"
                          placeholder="Prénom"
                          leftIcon={<User className="h-5 w-5 text-muted-foreground" />}
                          error={touched.firstName && errors.firstName ? errors.firstName : ''}
                        />
                      )}
                    </Field>
                  </div>

                  <div>
                    <label htmlFor="billLastName" className="block text-sm font-medium mb-2">
                      Nom <span className="text-destructive">*</span>
                    </label>
                    <Field name="lastName">
                      {({ field }: any) => (
                        <Input
                          {...field}
                          id="billLastName"
                          type="text"
                          placeholder="Nom"
                          leftIcon={<User className="h-5 w-5 text-muted-foreground" />}
                          error={touched.lastName && errors.lastName ? errors.lastName : ''}
                        />
                      )}
                    </Field>
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="billPhone" className="block text-sm font-medium mb-2">
                    Téléphone <span className="text-destructive">*</span>
                  </label>
                  <Field name="phone">
                    {({ field }: any) => (
                      <Input
                        {...field}
                        id="billPhone"
                        type="tel"
                        placeholder="05XXXXXXXX"
                        leftIcon={<Phone className="h-5 w-5 text-muted-foreground" />}
                        error={touched.phone && errors.phone ? errors.phone : ''}
                      />
                    )}
                  </Field>
                </div>

                {/* Address */}
                <div>
                  <label htmlFor="billAddress" className="block text-sm font-medium mb-2">
                    Adresse complète <span className="text-destructive">*</span>
                  </label>
                  <Field name="address">
                    {({ field }: any) => (
                      <Input
                        {...field}
                        id="billAddress"
                        type="text"
                        placeholder="Numéro, rue, bâtiment, étage, appartement..."
                        leftIcon={<MapPin className="h-5 w-5 text-muted-foreground" />}
                        error={touched.address && errors.address ? errors.address : ''}
                      />
                    )}
                  </Field>
                </div>

                {/* Location Fields */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="billWilaya" className="block text-sm font-medium mb-2">
                      Wilaya <span className="text-destructive">*</span>
                    </label>
                    <Field name="wilaya">
                      {({ field }: any) => (
                        <select
                          {...field}
                          id="billWilaya"
                          className={cn(
                            'w-full px-4 py-2.5 border bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
                            touched.wilaya && errors.wilaya ? 'border-destructive' : 'border-input'
                          )}
                        >
                          <option value="">Sélectionner une wilaya</option>
                          {wilayas.map((wilaya) => (
                            <option key={wilaya.code} value={wilaya.code}>
                              {wilaya.code} - {wilaya.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </Field>
                    {touched.wilaya && errors.wilaya && (
                      <p className="text-sm text-destructive mt-1">{errors.wilaya}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="billCommune" className="block text-sm font-medium mb-2">
                      Commune <span className="text-destructive">*</span>
                    </label>
                    <Field name="commune">
                      {({ field }: any) => (
                        <select
                          {...field}
                          id="billCommune"
                          disabled={!values.wilaya}
                          className={cn(
                            'w-full px-4 py-2.5 border bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed',
                            touched.commune && errors.commune ? 'border-destructive' : 'border-input'
                          )}
                        >
                          <option value="">
                            {values.wilaya
                              ? 'Sélectionner une commune'
                              : 'Sélectionnez d\'abord une wilaya'}
                          </option>
                          {communes.map((commune) => (
                            <option key={commune.code} value={commune.code}>
                              {commune.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </Field>
                    {touched.commune && errors.commune && (
                      <p className="text-sm text-destructive mt-1">{errors.commune}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="billPostalCode" className="block text-sm font-medium mb-2">
                      Code postal <span className="text-destructive">*</span>
                    </label>
                    <Field name="postalCode">
                      {({ field }: any) => (
                        <Input
                          {...field}
                          id="billPostalCode"
                          type="text"
                          placeholder="00000"
                          maxLength={5}
                          error={touched.postalCode && errors.postalCode ? errors.postalCode : ''}
                        />
                      )}
                    </Field>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label htmlFor="billNotes" className="block text-sm font-medium mb-2">
                    Complément <span className="text-muted-foreground">(optionnel)</span>
                  </label>
                  <Field name="notes">
                    {({ field }: any) => (
                      <textarea
                        {...field}
                        id="billNotes"
                        rows={2}
                        placeholder="Informations complémentaires de facturation..."
                        className={cn(
                          'w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none',
                          touched.notes && errors.notes ? 'border-destructive' : 'border-input'
                        )}
                        maxLength={200}
                      />
                    )}
                  </Field>
                  {touched.notes && errors.notes && (
                    <p className="text-sm text-destructive mt-1">{errors.notes}</p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-6 border-t">
                  {onBack && (
                    <Button type="button" variant="outline" onClick={onBack} className="flex-1">
                      Retour
                    </Button>
                  )}
                  <Button type="submit" loading={isSubmitting} className="flex-1">
                    Continuer
                  </Button>
                </div>
              </Form>
            );
          }}
        </Formik>
      )}
    </div>
  );
}
