'use client';

import React from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { Button, Card } from '@/components/ui';
import { Truck, Package, Zap } from 'lucide-react';
import { formatPrice } from '@/lib/utils/formatters';
import { cn } from '@/lib/utils';

interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
  icon: 'standard' | 'express' | 'economy';
}

interface ShippingMethodFormProps {
  shippingMethods: ShippingMethod[];
  initialMethod?: string;
  onSubmit: (methodId: string) => void;
  onBack: () => void;
}

const validationSchema = Yup.object({
  shippingMethodId: Yup.string().required('Veuillez sélectionner une méthode de livraison'),
});

const iconMap = {
  standard: Truck,
  express: Zap,
  economy: Package,
};

export default function ShippingMethodForm({
  shippingMethods,
  initialMethod,
  onSubmit,
  onBack,
}: ShippingMethodFormProps) {
  return (
    <Formik
      initialValues={{ shippingMethodId: initialMethod || '' }}
      validationSchema={validationSchema}
      onSubmit={(values) => onSubmit(values.shippingMethodId)}
    >
      {({ values, setFieldValue, isSubmitting, errors, touched }) => (
        <Form className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Méthode de livraison</h2>
            <p className="text-gray-600 mb-6">Choisissez votre mode de livraison préféré</p>

            <div className="space-y-3">
              {shippingMethods.map((method) => {
                const Icon = iconMap[method.icon];
                const isSelected = values.shippingMethodId === method.id;

                return (
                  <Card
                    key={method.id}
                    className={cn(
                      'cursor-pointer transition-all hover:border-primary',
                      isSelected && 'border-primary ring-2 ring-primary/20'
                    )}
                    onClick={() => setFieldValue('shippingMethodId', method.id)}
                  >
                    <Card.Content className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Radio Button */}
                        <div className="flex-shrink-0 mt-1">
                          <div
                            className={cn(
                              'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors',
                              isSelected
                                ? 'border-primary bg-primary'
                                : 'border-gray-300 bg-white'
                            )}
                          >
                            {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                          </div>
                        </div>

                        {/* Icon */}
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                            <Icon className="h-6 w-6 text-primary" />
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-semibold text-gray-900">{method.name}</h3>
                              <p className="text-sm text-gray-600 mt-1">{method.description}</p>
                              <p className="text-sm text-gray-500 mt-1">
                                Livraison estimée: {method.estimatedDays}
                              </p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="font-bold text-primary">
                                {method.price === 0 ? 'Gratuit' : formatPrice(method.price)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card.Content>
                  </Card>
                );
              })}
            </div>

            {touched.shippingMethodId && errors.shippingMethodId && (
              <p className="text-sm text-error mt-2">{errors.shippingMethodId}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onBack} className="flex-1">
              Retour
            </Button>
            <Button type="submit" loading={isSubmitting} className="flex-1">
              Continuer vers le paiement
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
