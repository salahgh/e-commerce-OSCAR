'use client';

import React from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { Button, Card } from '@/components/ui';
import { Banknote, CreditCard, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: 'cash' | 'card' | 'digital';
  available: boolean;
}

interface PaymentMethodFormProps {
  paymentMethods: PaymentMethod[];
  initialMethod?: string;
  onSubmit: (methodId: string) => void;
  onBack: () => void;
}

const validationSchema = Yup.object({
  paymentMethodId: Yup.string().required('Veuillez sélectionner un mode de paiement'),
});

const iconMap = {
  cash: Banknote,
  card: CreditCard,
  digital: Wallet,
};

export default function PaymentMethodForm({
  paymentMethods,
  initialMethod,
  onSubmit,
  onBack,
}: PaymentMethodFormProps) {
  return (
    <Formik
      initialValues={{ paymentMethodId: initialMethod || '' }}
      validationSchema={validationSchema}
      onSubmit={(values) => onSubmit(values.paymentMethodId)}
    >
      {({ values, setFieldValue, isSubmitting, errors, touched }) => (
        <Form className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Mode de paiement</h2>
            <p className="text-muted-foreground mb-6">Choisissez votre mode de paiement</p>

            <div className="space-y-3">
              {paymentMethods.map((method) => {
                const Icon = iconMap[method.icon];
                const isSelected = values.paymentMethodId === method.id;

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
                    onClick={() => method.available && setFieldValue('paymentMethodId', method.id)}
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
                          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                            <Icon className="h-6 w-6 text-primary" />
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-semibold text-foreground">{method.name}</h3>
                              <p className="text-sm text-muted-foreground mt-1">{method.description}</p>
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

            {touched.paymentMethodId && errors.paymentMethodId && (
              <p className="text-sm text-error mt-2">{errors.paymentMethodId}</p>
            )}

            {/* Payment Info */}
            {values.paymentMethodId === 'cash_on_delivery' && (
              <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2">
                  Informations sur le paiement à la livraison
                </h4>
                <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
                  <li>• Payez en espèces lors de la réception de votre commande</li>
                  <li>• Vérifiez votre commande avant de payer</li>
                  <li>• Ayez le montant exact si possible</li>
                </ul>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onBack} className="flex-1">
              Retour
            </Button>
            <Button type="submit" loading={isSubmitting} className="flex-1">
              Vérifier la commande
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
