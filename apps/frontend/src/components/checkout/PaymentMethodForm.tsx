'use client';

import React, { useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { Button, Card } from '@/components/ui';
import { CreditCard, Wallet, Banknote, Shield, Clock, AlertCircle, CheckCircle2, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface PaymentMethod {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: 'cib' | 'baridimob' | 'cash';
  available: boolean;
  fees?: string;
  processingTime?: string;
}

interface PaymentMethodFormProps {
  paymentMethods?: PaymentMethod[];
  initialMethod?: string;
  onSubmit: (methodCode: string, termsAccepted: boolean) => void;
  onBack: () => void;
  isSubmitting?: boolean;
}

// Default payment methods for Algeria
const defaultPaymentMethods: PaymentMethod[] = [
  {
    id: 'cib',
    code: 'cib-card',
    name: 'Carte CIB / EDAHABIA',
    description: 'Paiement sécurisé par carte bancaire CIB ou EDAHABIA via la plateforme SATIM',
    icon: 'cib',
    available: true,
    fees: 'Sans frais',
    processingTime: 'Instantané',
  },
  {
    id: 'baridimob',
    code: 'baridimob',
    name: 'BaridiMob',
    description: 'Paiement mobile via l\'application BaridiMob d\'Algérie Poste',
    icon: 'baridimob',
    available: true,
    fees: 'Sans frais',
    processingTime: 'Instantané',
  },
  {
    id: 'cod',
    code: 'cash-on-delivery',
    name: 'Paiement à la livraison',
    description: 'Payez en espèces lors de la réception de votre commande',
    icon: 'cash',
    available: true,
    fees: 'Sans frais',
    processingTime: 'À la livraison',
  },
];

const iconMap = {
  cib: CreditCard,
  baridimob: Smartphone,
  cash: Banknote,
};

const validationSchema = Yup.object({
  paymentMethodCode: Yup.string().required('Veuillez sélectionner un mode de paiement'),
  termsAccepted: Yup.boolean()
    .oneOf([true], 'Vous devez accepter les conditions générales de vente')
    .required('Vous devez accepter les conditions générales de vente'),
});

export default function PaymentMethodForm({
  paymentMethods,
  initialMethod,
  onSubmit,
  onBack,
  isSubmitting = false,
}: PaymentMethodFormProps) {
  const methods = paymentMethods && paymentMethods.length > 0 ? paymentMethods : defaultPaymentMethods;

  return (
    <Formik
      initialValues={{
        paymentMethodCode: initialMethod || '',
        termsAccepted: false,
      }}
      validationSchema={validationSchema}
      onSubmit={(values) => onSubmit(values.paymentMethodCode, values.termsAccepted)}
    >
      {({ values, setFieldValue, errors, touched }) => (
        <Form className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Mode de paiement</h2>
            <p className="text-muted-foreground">Comment souhaitez-vous payer ?</p>
          </div>

          {/* Security Badge */}
          <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
            <Shield className="h-5 w-5 text-green-600" />
            <span className="text-sm text-green-700 dark:text-green-300">
              Tous les paiements sont sécurisés et cryptés
            </span>
          </div>

          {/* Payment Methods */}
          <div className="space-y-4">
            {methods.map((method) => {
              const Icon = iconMap[method.icon];
              const isSelected = values.paymentMethodCode === method.code;

              return (
                <Card
                  key={method.id}
                  className={cn(
                    'transition-all',
                    method.available
                      ? 'cursor-pointer hover:border-primary'
                      : 'opacity-50 cursor-not-allowed',
                    isSelected && method.available && 'border-primary ring-2 ring-primary/20'
                  )}
                  onClick={() => method.available && setFieldValue('paymentMethodCode', method.code)}
                >
                  <Card.Content className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Radio Button */}
                      <div className="flex-shrink-0 mt-1">
                        <div
                          className={cn(
                            'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors',
                            isSelected && method.available
                              ? 'border-primary bg-primary'
                              : 'border-input bg-background'
                          )}
                        >
                          {isSelected && method.available && (
                            <div className="w-2 h-2 bg-primary-foreground rounded-full" />
                          )}
                        </div>
                      </div>

                      {/* Icon */}
                      <div className="flex-shrink-0">
                        <div
                          className={cn(
                            'w-14 h-14 rounded-xl flex items-center justify-center',
                            method.icon === 'cib' && 'bg-blue-100 dark:bg-blue-900',
                            method.icon === 'baridimob' && 'bg-yellow-100 dark:bg-yellow-900',
                            method.icon === 'cash' && 'bg-green-100 dark:bg-green-900'
                          )}
                        >
                          <Icon
                            className={cn(
                              'h-7 w-7',
                              method.icon === 'cib' && 'text-blue-600',
                              method.icon === 'baridimob' && 'text-yellow-600',
                              method.icon === 'cash' && 'text-green-600'
                            )}
                          />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-foreground">{method.name}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{method.description}</p>
                            <div className="flex items-center gap-4 mt-2">
                              {method.fees && (
                                <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                                  <CheckCircle2 className="h-3 w-3" />
                                  {method.fees}
                                </span>
                              )}
                              {method.processingTime && (
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {method.processingTime}
                                </span>
                              )}
                            </div>
                          </div>
                          {!method.available && (
                            <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
                              Bientôt disponible
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card.Content>
                </Card>
              );
            })}
          </div>

          {touched.paymentMethodCode && errors.paymentMethodCode && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.paymentMethodCode}
            </p>
          )}

          {/* Payment Info based on selection */}
          {values.paymentMethodCode === 'cib-card' && (
            <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Paiement par carte CIB / EDAHABIA
              </h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Vous serez redirigé vers la plateforme sécurisée SATIM</li>
                <li>• Entrez les informations de votre carte CIB ou EDAHABIA</li>
                <li>• Validez le paiement avec votre code de confirmation SMS</li>
                <li>• Votre commande sera confirmée instantanément</li>
              </ul>
            </div>
          )}

          {values.paymentMethodCode === 'baridimob' && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2 flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Paiement par BaridiMob
              </h4>
              <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                <li>• Ouvrez l'application BaridiMob sur votre téléphone</li>
                <li>• Scannez le QR code ou utilisez le numéro de référence</li>
                <li>• Confirmez le paiement dans l'application</li>
                <li>• Votre commande sera confirmée instantanément</li>
              </ul>
            </div>
          )}

          {values.paymentMethodCode === 'cash-on-delivery' && (
            <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
              <h4 className="font-medium text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
                <Banknote className="h-5 w-5" />
                Paiement à la livraison
              </h4>
              <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                <li>• Payez en espèces lors de la réception de votre commande</li>
                <li>• Vérifiez votre commande avant de payer</li>
                <li>• Préparez le montant exact si possible</li>
                <li>• Un reçu vous sera remis par le livreur</li>
              </ul>
            </div>
          )}

          {/* Terms and Conditions Checkbox */}
          <div className="space-y-4">
            <div
              className={cn(
                'flex items-start gap-3 p-4 rounded-lg border',
                touched.termsAccepted && errors.termsAccepted
                  ? 'border-destructive bg-destructive/5'
                  : 'border-input bg-muted/50'
              )}
            >
              <input
                type="checkbox"
                id="termsAccepted"
                checked={values.termsAccepted}
                onChange={(e) => setFieldValue('termsAccepted', e.target.checked)}
                className="w-5 h-5 mt-0.5 rounded border-input text-primary focus:ring-primary cursor-pointer"
              />
              <label htmlFor="termsAccepted" className="text-sm cursor-pointer">
                <span>J'ai lu et j'accepte les </span>
                <Link href="/legal/terms" className="text-primary hover:underline font-medium" target="_blank">
                  conditions générales de vente
                </Link>
                <span>, la </span>
                <Link href="/legal/privacy" className="text-primary hover:underline font-medium" target="_blank">
                  politique de confidentialité
                </Link>
                <span> et la </span>
                <Link href="/legal/returns" className="text-primary hover:underline font-medium" target="_blank">
                  politique de retour
                </Link>
                <span className="text-destructive ml-1">*</span>
              </label>
            </div>
            {touched.termsAccepted && errors.termsAccepted && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.termsAccepted}
              </p>
            )}
          </div>

          {/* Newsletter Opt-in (Optional) */}
          <div className="flex items-start gap-3 p-4 rounded-lg border border-input bg-muted/50">
            <input
              type="checkbox"
              id="newsletter"
              className="w-5 h-5 mt-0.5 rounded border-input text-primary focus:ring-primary cursor-pointer"
            />
            <label htmlFor="newsletter" className="text-sm cursor-pointer text-muted-foreground">
              Je souhaite recevoir les offres exclusives et les nouveautés par email (optionnel)
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onBack} className="flex-1">
              Retour
            </Button>
            <Button
              type="submit"
              loading={isSubmitting}
              disabled={!values.paymentMethodCode || !values.termsAccepted}
              className="flex-1"
            >
              Vérifier la commande
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
