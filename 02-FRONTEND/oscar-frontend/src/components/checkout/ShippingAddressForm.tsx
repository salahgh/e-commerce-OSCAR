'use client';

import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Button, Input } from '@/components/ui';
import { MapPin, User, Phone, Mail } from 'lucide-react';

interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  wilaya: string;
  city: string;
  postalCode: string;
  notes?: string;
}

interface ShippingAddressFormProps {
  initialValues?: Partial<ShippingAddress>;
  onSubmit: (values: ShippingAddress) => void;
  onBack?: () => void;
}

const validationSchema = Yup.object({
  firstName: Yup.string().required('Le prénom est requis'),
  lastName: Yup.string().required('Le nom est requis'),
  email: Yup.string().email('Email invalide').required('L\'email est requis'),
  phone: Yup.string()
    .matches(/^(05|06|07)[0-9]{8}$/, 'Numéro de téléphone invalide (ex: 0XXXXXXXXX)')
    .required('Le téléphone est requis'),
  address: Yup.string().required('L\'adresse est requise'),
  wilaya: Yup.string().required('La wilaya est requise'),
  city: Yup.string().required('La ville est requise'),
  postalCode: Yup.string()
    .matches(/^[0-9]{5}$/, 'Code postal invalide (5 chiffres)')
    .required('Le code postal est requis'),
  notes: Yup.string(),
});

const defaultValues: ShippingAddress = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  wilaya: '',
  city: '',
  postalCode: '',
  notes: '',
};

export default function ShippingAddressForm({
  initialValues,
  onSubmit,
  onBack,
}: ShippingAddressFormProps) {
  return (
    <Formik
      initialValues={{ ...defaultValues, ...initialValues }}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {({ errors, touched, isSubmitting }) => (
        <Form className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-6">Adresse de livraison</h2>

            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium mb-2">
                  Prénom <span className="text-error">*</span>
                </label>
                <Field name="firstName">
                  {({ field }: any) => (
                    <Input
                      {...field}
                      id="firstName"
                      type="text"
                      placeholder="Votre prénom"
                      leftIcon={<User className="h-5 w-5 text-muted-foreground" />}
                      error={touched.firstName && errors.firstName ? errors.firstName : ''}
                    />
                  )}
                </Field>
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium mb-2">
                  Nom <span className="text-error">*</span>
                </label>
                <Field name="lastName">
                  {({ field }: any) => (
                    <Input
                      {...field}
                      id="lastName"
                      type="text"
                      placeholder="Votre nom"
                      leftIcon={<User className="h-5 w-5 text-muted-foreground" />}
                      error={touched.lastName && errors.lastName ? errors.lastName : ''}
                    />
                  )}
                </Field>
              </div>
            </div>

            {/* Contact Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email <span className="text-error">*</span>
                </label>
                <Field name="email">
                  {({ field }: any) => (
                    <Input
                      {...field}
                      id="email"
                      type="email"
                      placeholder="votre@email.com"
                      leftIcon={<Mail className="h-5 w-5 text-muted-foreground" />}
                      error={touched.email && errors.email ? errors.email : ''}
                    />
                  )}
                </Field>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-2">
                  Téléphone <span className="text-error">*</span>
                </label>
                <Field name="phone">
                  {({ field }: any) => (
                    <Input
                      {...field}
                      id="phone"
                      type="tel"
                      placeholder="0X XX XX XX XX"
                      leftIcon={<Phone className="h-5 w-5 text-muted-foreground" />}
                      error={touched.phone && errors.phone ? errors.phone : ''}
                    />
                  )}
                </Field>
              </div>
            </div>

            {/* Address Field */}
            <div className="mb-4">
              <label htmlFor="address" className="block text-sm font-medium mb-2">
                Adresse <span className="text-error">*</span>
              </label>
              <Field name="address">
                {({ field }: any) => (
                  <Input
                    {...field}
                    id="address"
                    type="text"
                    placeholder="Rue, numéro, bâtiment..."
                    leftIcon={<MapPin className="h-5 w-5 text-muted-foreground" />}
                    error={touched.address && errors.address ? errors.address : ''}
                  />
                )}
              </Field>
            </div>

            {/* Location Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label htmlFor="wilaya" className="block text-sm font-medium mb-2">
                  Wilaya <span className="text-error">*</span>
                </label>
                <Field name="wilaya">
                  {({ field }: any) => (
                    <select
                      {...field}
                      id="wilaya"
                      className="w-full px-4 py-2.5 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">Sélectionner</option>
                      <option value="16">Alger</option>
                      <option value="31">Oran</option>
                      <option value="09">Blida</option>
                      {/* TODO: Add all wilayas */}
                    </select>
                  )}
                </Field>
                {touched.wilaya && errors.wilaya && (
                  <p className="text-sm text-error mt-1">{errors.wilaya}</p>
                )}
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-medium mb-2">
                  Ville <span className="text-error">*</span>
                </label>
                <Field name="city">
                  {({ field }: any) => (
                    <Input
                      {...field}
                      id="city"
                      type="text"
                      placeholder="Ville"
                      error={touched.city && errors.city ? errors.city : ''}
                    />
                  )}
                </Field>
              </div>

              <div>
                <label htmlFor="postalCode" className="block text-sm font-medium mb-2">
                  Code postal <span className="text-error">*</span>
                </label>
                <Field name="postalCode">
                  {({ field }: any) => (
                    <Input
                      {...field}
                      id="postalCode"
                      type="text"
                      placeholder="16000"
                      error={touched.postalCode && errors.postalCode ? errors.postalCode : ''}
                    />
                  )}
                </Field>
              </div>
            </div>

            {/* Notes Field */}
            <div className="mb-4">
              <label htmlFor="notes" className="block text-sm font-medium mb-2">
                Notes de livraison (optionnel)
              </label>
              <Field name="notes">
                {({ field }: any) => (
                  <textarea
                    {...field}
                    id="notes"
                    rows={3}
                    placeholder="Instructions spéciales pour la livraison..."
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  />
                )}
              </Field>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t">
            {onBack && (
              <Button type="button" variant="outline" onClick={onBack} className="flex-1">
                Retour
              </Button>
            )}
            <Button type="submit" loading={isSubmitting} className="flex-1">
              Continuer vers la livraison
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
