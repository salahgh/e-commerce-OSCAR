'use client';

import React from 'react';
import { Button, Card } from '@/components/ui';
import { formatPrice } from '@/lib/utils/formatters';
import { MapPin, Truck, Banknote, Edit2 } from 'lucide-react';
import Image from 'next/image';

interface OrderReviewProps {
  shippingAddress: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    wilaya: string;
    postalCode: string;
    notes?: string;
  };
  shippingMethod: {
    id: string;
    name: string;
    price: number;
    estimatedDays: string;
  };
  paymentMethod: {
    id: string;
    name: string;
  };
  cartItems: Array<{
    id: string;
    productVariantId: string;
    productName: string;
    variantName: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    linePrice: number;
    imageUrl?: string;
    productSlug?: string;
  }>;
  subtotal: number;
  discount: number;
  shippingCost: number;
  total: number;
  onEdit: (step: number) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

export default function OrderReview({
  shippingAddress,
  shippingMethod,
  paymentMethod,
  cartItems,
  subtotal,
  discount,
  shippingCost,
  total,
  onEdit,
  onSubmit,
  isSubmitting = false,
}: OrderReviewProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Vérification de la commande</h2>
        <p className="text-muted-foreground">Vérifiez les détails de votre commande avant de confirmer</p>
      </div>

      {/* Shipping Address */}
      <Card>
        <Card.Header>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold">Adresse de livraison</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onEdit(1)}>
              <Edit2 className="h-4 w-4 mr-1" />
              Modifier
            </Button>
          </div>
        </Card.Header>
        <Card.Content>
          <div className="text-sm space-y-1">
            <p className="font-medium">
              {shippingAddress.firstName} {shippingAddress.lastName}
            </p>
            <p className="text-muted-foreground">{shippingAddress.address}</p>
            <p className="text-muted-foreground">
              {shippingAddress.city}, {shippingAddress.wilaya} {shippingAddress.postalCode}
            </p>
            <p className="text-muted-foreground">{shippingAddress.phone}</p>
            <p className="text-muted-foreground">{shippingAddress.email}</p>
            {shippingAddress.notes && (
              <p className="text-muted-foreground mt-2">
                <span className="font-medium">Notes:</span> {shippingAddress.notes}
              </p>
            )}
          </div>
        </Card.Content>
      </Card>

      {/* Shipping Method */}
      <Card>
        <Card.Header>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold">Méthode de livraison</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onEdit(3)}>
              <Edit2 className="h-4 w-4 mr-1" />
              Modifier
            </Button>
          </div>
        </Card.Header>
        <Card.Content>
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">{shippingMethod.name}</p>
              <p className="text-sm text-muted-foreground">
                Livraison estimée: {shippingMethod.estimatedDays}
              </p>
            </div>
            <p className="font-semibold text-primary">
              {shippingMethod.price === 0 ? 'Gratuit' : formatPrice(shippingMethod.price)}
            </p>
          </div>
        </Card.Content>
      </Card>

      {/* Payment Method */}
      <Card>
        <Card.Header>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Banknote className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold">Mode de paiement</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onEdit(4)}>
              <Edit2 className="h-4 w-4 mr-1" />
              Modifier
            </Button>
          </div>
        </Card.Header>
        <Card.Content>
          <p className="font-medium">{paymentMethod.name}</p>
        </Card.Content>
      </Card>

      {/* Order Items */}
      <Card>
        <Card.Header>
          <h3 className="font-semibold">Articles commandés ({cartItems.length})</h3>
        </Card.Header>
        <Card.Content>
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex gap-4">
                <div className="relative w-20 h-20 rounded-md overflow-hidden bg-muted flex-shrink-0">
                  {item.imageUrl && (
                    <Image
                      src={item.imageUrl}
                      alt={item.productName}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm line-clamp-2">{item.productName}</p>
                  {item.variantName && (
                    <p className="text-xs text-muted-foreground mt-1">{item.variantName}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">Quantité: {item.quantity}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-semibold text-primary">{formatPrice(item.linePrice)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card.Content>
      </Card>

      {/* Order Summary */}
      <Card>
        <Card.Header>
          <h3 className="font-semibold">Résumé de la commande</h3>
        </Card.Header>
        <Card.Content>
          <div className="space-y-2">
            <div className="flex justify-between text-muted-foreground">
              <span>Sous-total</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Réduction</span>
                <span>-{formatPrice(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-muted-foreground">
              <span>Livraison</span>
              <span>{shippingCost === 0 ? 'Gratuite' : formatPrice(shippingCost)}</span>
            </div>
            <div className="pt-2 border-t flex justify-between items-center">
              <span className="text-lg font-bold">Total</span>
              <span className="text-2xl font-bold text-primary">{formatPrice(total)}</span>
            </div>
            <p className="text-xs text-muted-foreground">TVA incluse</p>
          </div>
        </Card.Content>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-6 border-t">
        <Button variant="outline" onClick={() => onEdit(4)} className="flex-1">
          Retour
        </Button>
        <Button onClick={onSubmit} loading={isSubmitting} className="flex-1">
          Confirmer la commande
        </Button>
      </div>

      {/* Terms */}
      <p className="text-xs text-muted-foreground text-center">
        En confirmant votre commande, vous acceptez nos{' '}
        <a href="/terms" className="text-primary hover:underline">
          conditions d'utilisation
        </a>{' '}
        et notre{' '}
        <a href="/privacy" className="text-primary hover:underline">
          politique de confidentialité
        </a>
      </p>
    </div>
  );
}
