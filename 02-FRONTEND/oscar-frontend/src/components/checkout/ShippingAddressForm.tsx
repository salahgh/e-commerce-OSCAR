'use client';

import React, { useState, useEffect } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { Button, Input, Card } from '@/components/ui';
import { MapPin, User, Phone, Mail, Plus, Check, Home, Building, Bookmark } from 'lucide-react';
import { wilayas, getCommunesByWilayaCode, getShippingPrice, getShippingDelay } from '@/lib/data/algeria';
import { formatPrice } from '@/lib/utils/formatters';
import { cn } from '@/lib/utils';

export interface ShippingAddress {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  wilaya: string;
  commune: string;
  postalCode: string;
  notes?: string;
  isDefault?: boolean;
  label?: string; // 'home' | 'work' | 'other'
}

interface ShippingAddressFormProps {
  initialValues?: Partial<ShippingAddress>;
  savedAddresses?: ShippingAddress[];
  onSubmit: (values: ShippingAddress) => void;
  onBack?: () => void;
  isAuthenticated?: boolean;
  isSubmitting?: boolean;
}

const validationSchema = Yup.object({
  firstName: Yup.string()
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .required('Le prénom est requis'),
  lastName: Yup.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .required('Le nom est requis'),
  email: Yup.string()
    .email('Adresse email invalide')
    .required('L\'email est requis'),
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

const defaultValues: ShippingAddress = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  wilaya: '',
  commune: '',
  postalCode: '',
  notes: '',
  label: 'home',
};

const addressLabels = [
  { value: 'home', label: 'Domicile', icon: Home },
  { value: 'work', label: 'Travail', icon: Building },
  { value: 'other', label: 'Autre', icon: Bookmark },
];

export default function ShippingAddressForm({
  initialValues,
  savedAddresses = [],
  onSubmit,
  onBack,
  isAuthenticated = false,
  isSubmitting = false,
}: ShippingAddressFormProps) {
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(savedAddresses.length === 0);
  const [saveAddress, setSaveAddress] = useState(false);
  const [selectedWilayaCode, setSelectedWilayaCode] = useState(initialValues?.wilaya || '');

  const communes = getCommunesByWilayaCode(selectedWilayaCode);
  const shippingPrice = selectedWilayaCode ? getShippingPrice(selectedWilayaCode) : 0;
  const shippingDelay = selectedWilayaCode ? getShippingDelay(selectedWilayaCode) : '';

  // Handle selecting a saved address
  const handleSelectAddress = (address: ShippingAddress) => {
    setSelectedAddressId(address.id || null);
    setShowNewAddressForm(false);
  };

  const handleNewAddress = () => {
    setSelectedAddressId(null);
    setShowNewAddressForm(true);
  };

  const handleSubmitSavedAddress = () => {
    const selectedAddress = savedAddresses.find((a) => a.id === selectedAddressId);
    if (selectedAddress) {
      onSubmit(selectedAddress);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Adresse de livraison</h2>
        <p className="text-muted-foreground">Où souhaitez-vous être livré ?</p>
      </div>

      {/* Saved Addresses Section - Only show if authenticated and has addresses */}
      {isAuthenticated && savedAddresses.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground">Vos adresses enregistrées</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedAddresses.map((address) => {
              const LabelIcon = addressLabels.find((l) => l.value === address.label)?.icon || Home;
              const isSelected = selectedAddressId === address.id;

              return (
                <Card
                  key={address.id}
                  className={cn(
                    'cursor-pointer transition-all hover:border-primary',
                    isSelected && 'border-primary ring-2 ring-primary/20'
                  )}
                  onClick={() => handleSelectAddress(address)}
                >
                  <Card.Content className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Selection indicator */}
                      <div
                        className={cn(
                          'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1',
                          isSelected ? 'border-primary bg-primary' : 'border-input'
                        )}
                      >
                        {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <LabelIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-sm capitalize">
                            {addressLabels.find((l) => l.value === address.label)?.label || 'Autre'}
                          </span>
                          {address.isDefault && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                              Par défaut
                            </span>
                          )}
                        </div>
                        <p className="font-medium">
                          {address.firstName} {address.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground line-clamp-2">{address.address}</p>
                        <p className="text-sm text-muted-foreground">
                          {address.commune}, {wilayas.find((w) => w.code === address.wilaya)?.name}
                        </p>
                        <p className="text-sm text-muted-foreground">{address.phone}</p>
                      </div>
                    </div>
                  </Card.Content>
                </Card>
              );
            })}

            {/* Add New Address Card */}
            <Card
              className={cn(
                'cursor-pointer transition-all hover:border-primary border-dashed',
                showNewAddressForm && 'border-primary ring-2 ring-primary/20'
              )}
              onClick={handleNewAddress}
            >
              <Card.Content className="p-4 flex items-center justify-center min-h-[120px]">
                <div className="text-center">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                    <Plus className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Nouvelle adresse
                  </span>
                </div>
              </Card.Content>
            </Card>
          </div>

          {/* Submit button for saved address */}
          {selectedAddressId && !showNewAddressForm && (
            <div className="flex gap-3 pt-4">
              {onBack && (
                <Button type="button" variant="outline" onClick={onBack} className="flex-1">
                  Retour
                </Button>
              )}
              <Button
                onClick={handleSubmitSavedAddress}
                loading={isSubmitting}
                className="flex-1"
              >
                Continuer avec cette adresse
              </Button>
            </div>
          )}
        </div>
      )}

      {/* New Address Form */}
      {(showNewAddressForm || !isAuthenticated || savedAddresses.length === 0) && (
        <Formik
          initialValues={{ ...defaultValues, ...initialValues }}
          validationSchema={validationSchema}
          onSubmit={(values) => {
            onSubmit({ ...values, saveAddress } as any);
          }}
          enableReinitialize
        >
          {({ errors, touched, values, setFieldValue }) => {
            // Update communes when wilaya changes
            useEffect(() => {
              if (values.wilaya !== selectedWilayaCode) {
                setSelectedWilayaCode(values.wilaya);
                setFieldValue('commune', '');
                // Auto-set postal code if available
                const wilaya = wilayas.find((w) => w.code === values.wilaya);
                if (wilaya && wilaya.communes.length > 0) {
                  setFieldValue('postalCode', wilaya.communes[0].postalCode);
                }
              }
            }, [values.wilaya, setFieldValue]);

            // Update postal code when commune changes
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
                {isAuthenticated && savedAddresses.length > 0 && (
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <Plus className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Ajouter une nouvelle adresse</span>
                  </div>
                )}

                {/* Address Label Selection (for authenticated users) */}
                {isAuthenticated && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Type d'adresse</label>
                    <div className="flex gap-2">
                      {addressLabels.map((label) => {
                        const Icon = label.icon;
                        const isActive = values.label === label.value;
                        return (
                          <button
                            key={label.value}
                            type="button"
                            onClick={() => setFieldValue('label', label.value)}
                            className={cn(
                              'flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors',
                              isActive
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-input hover:border-primary/50'
                            )}
                          >
                            <Icon className="h-4 w-4" />
                            <span className="text-sm font-medium">{label.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium mb-2">
                      Prénom <span className="text-destructive">*</span>
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
                      Nom <span className="text-destructive">*</span>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                      Email <span className="text-destructive">*</span>
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
                      Téléphone <span className="text-destructive">*</span>
                    </label>
                    <Field name="phone">
                      {({ field }: any) => (
                        <Input
                          {...field}
                          id="phone"
                          type="tel"
                          placeholder="05XXXXXXXX"
                          leftIcon={<Phone className="h-5 w-5 text-muted-foreground" />}
                          error={touched.phone && errors.phone ? errors.phone : ''}
                        />
                      )}
                    </Field>
                    <p className="text-xs text-muted-foreground mt-1">
                      Format: 05, 06 ou 07 suivi de 8 chiffres
                    </p>
                  </div>
                </div>

                {/* Address Field */}
                <div>
                  <label htmlFor="address" className="block text-sm font-medium mb-2">
                    Adresse complète <span className="text-destructive">*</span>
                  </label>
                  <Field name="address">
                    {({ field }: any) => (
                      <Input
                        {...field}
                        id="address"
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
                  {/* Wilaya Dropdown */}
                  <div>
                    <label htmlFor="wilaya" className="block text-sm font-medium mb-2">
                      Wilaya <span className="text-destructive">*</span>
                    </label>
                    <Field name="wilaya">
                      {({ field }: any) => (
                        <select
                          {...field}
                          id="wilaya"
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

                  {/* Commune Dropdown */}
                  <div>
                    <label htmlFor="commune" className="block text-sm font-medium mb-2">
                      Commune <span className="text-destructive">*</span>
                    </label>
                    <Field name="commune">
                      {({ field }: any) => (
                        <select
                          {...field}
                          id="commune"
                          disabled={!values.wilaya}
                          className={cn(
                            'w-full px-4 py-2.5 border bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed',
                            touched.commune && errors.commune ? 'border-destructive' : 'border-input'
                          )}
                        >
                          <option value="">
                            {values.wilaya ? 'Sélectionner une commune' : 'Sélectionnez d\'abord une wilaya'}
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

                  {/* Postal Code */}
                  <div>
                    <label htmlFor="postalCode" className="block text-sm font-medium mb-2">
                      Code postal <span className="text-destructive">*</span>
                    </label>
                    <Field name="postalCode">
                      {({ field }: any) => (
                        <Input
                          {...field}
                          id="postalCode"
                          type="text"
                          placeholder="00000"
                          maxLength={5}
                          error={touched.postalCode && errors.postalCode ? errors.postalCode : ''}
                        />
                      )}
                    </Field>
                  </div>
                </div>

                {/* Shipping Info Banner */}
                {values.wilaya && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium text-blue-900 dark:text-blue-100">
                            Livraison vers {wilayas.find((w) => w.code === values.wilaya)?.name}
                          </p>
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            Délai estimé: {shippingDelay}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-900 dark:text-blue-100">
                          {formatPrice(shippingPrice)}
                        </p>
                        <p className="text-xs text-blue-700 dark:text-blue-300">Frais de livraison</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notes Field */}
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium mb-2">
                    Instructions de livraison <span className="text-muted-foreground">(optionnel)</span>
                  </label>
                  <Field name="notes">
                    {({ field }: any) => (
                      <textarea
                        {...field}
                        id="notes"
                        rows={3}
                        placeholder="Ex: Sonnez 2 fois, code d'entrée 1234, à côté de la pharmacie..."
                        className={cn(
                          'w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none',
                          touched.notes && errors.notes ? 'border-destructive' : 'border-input'
                        )}
                        maxLength={200}
                      />
                    )}
                  </Field>
                  <div className="flex justify-between mt-1">
                    {touched.notes && errors.notes && (
                      <p className="text-sm text-destructive">{errors.notes}</p>
                    )}
                    <p className="text-xs text-muted-foreground ml-auto">
                      {values.notes?.length || 0}/200
                    </p>
                  </div>
                </div>

                {/* Save Address Checkbox (for authenticated users) */}
                {isAuthenticated && (
                  <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                    <input
                      type="checkbox"
                      id="saveAddress"
                      checked={saveAddress}
                      onChange={(e) => setSaveAddress(e.target.checked)}
                      className="w-4 h-4 rounded border-input text-primary focus:ring-primary"
                    />
                    <label htmlFor="saveAddress" className="text-sm cursor-pointer">
                      <span className="font-medium">Enregistrer cette adresse</span>
                      <span className="text-muted-foreground ml-1">pour mes prochaines commandes</span>
                    </label>
                  </div>
                )}

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
            );
          }}
        </Formik>
      )}
    </div>
  );
}
