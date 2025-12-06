'use client';

import React from 'react';
import { Button, Card } from '@/components/ui';
import { ArrowRight, Truck } from 'lucide-react';
import { formatPrice } from '@/lib/utils/formatters';
import { useCart } from '@/contexts/CartContext';

interface CartSummaryProps {
  onCheckout?: () => void;
  className?: string;
}

export default function CartSummary({
  onCheckout,
  className = '',
}: CartSummaryProps) {
  const { cart } = useCart();

  if (!cart) {
    return null;
  }

  const subtotal = cart.subTotal || 0;
  const shippingCost = cart.shipping || 0;
  const total = cart.total || subtotal + shippingCost;

  const freeShippingThreshold = 5000; // 5000 DA
  const amountForFreeShipping = freeShippingThreshold - subtotal;
  const hasFreeShipping = amountForFreeShipping <= 0;

  return (
    <Card className={className}>
      <Card.Header>
        <h2 className="text-xl font-bold">Résumé de la commande</h2>
      </Card.Header>

      <Card.Content className="space-y-4">
        {/* Free Shipping Progress */}
        {!hasFreeShipping && (
          <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div className="flex items-start gap-2">
              <Truck className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Plus que {formatPrice(amountForFreeShipping)} pour la livraison gratuite!
                </p>
                <div className="w-full bg-blue-200 dark:bg-blue-900 rounded-full h-2 mt-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.min((subtotal / freeShippingThreshold) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {hasFreeShipping && shippingCost === 0 && (
          <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-green-600 dark:text-green-400" />
              <p className="text-sm font-medium text-green-700 dark:text-green-300">
                Livraison gratuite applicable!
              </p>
            </div>
          </div>
        )}

        {/* Price Breakdown */}
        <div className="space-y-2 pt-4 border-t">
          <div className="flex justify-between text-muted-foreground">
            <span>Sous-total</span>
            <span>{formatPrice(subtotal)}</span>
          </div>

          <div className="flex justify-between text-muted-foreground">
            <span>Livraison</span>
            <span>{shippingCost === 0 ? 'Gratuite' : formatPrice(shippingCost)}</span>
          </div>
        </div>

        {/* Total */}
        <div className="flex justify-between items-center pt-4 border-t">
          <span className="text-lg font-bold text-foreground">Total</span>
          <span className="text-2xl font-bold text-primary">{formatPrice(total)}</span>
        </div>

        {/* Tax Info */}
        <p className="text-xs text-muted-foreground text-center">TVA incluse</p>
      </Card.Content>

      {/* Checkout Button */}
      {onCheckout && (
        <Card.Footer>
          <Button
            size="lg"
            className="w-full"
            onClick={onCheckout}
            rightIcon={<ArrowRight className="h-5 w-5" />}
            disabled={!cart.items || cart.items.length === 0}
          >
            Passer la commande
          </Button>
        </Card.Footer>
      )}
    </Card>
  );
}
