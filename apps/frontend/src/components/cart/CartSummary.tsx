'use client';

import React, { useState } from 'react';
import { Button, Card } from '@/components/ui';
import { ArrowRight, Truck, Tag, X, Loader2, CheckCircle2 } from 'lucide-react';
import { formatPrice } from '@/lib/utils/formatters';
import { useCart } from '@/contexts/CartContext';
import { cn } from '@/lib/utils';

interface CartSummaryProps {
  onCheckout?: () => void;
  className?: string;
  showPromoCode?: boolean;
}

export default function CartSummary({
  onCheckout,
  className = '',
  showPromoCode = true,
}: CartSummaryProps) {
  const { cart, applyCoupon, removeCoupon } = useCart();
  const [promoCode, setPromoCode] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [promoError, setPromoError] = useState('');

  if (!cart) {
    return null;
  }

  const subtotal = cart.subTotal || 0;
  const shippingCost = cart.shipping || 0;
  const discountTotal = cart.discounts?.reduce((sum, d) => sum + Math.abs(d.amountWithTax), 0) || 0;
  const total = cart.total || subtotal + shippingCost - discountTotal;

  const freeShippingThreshold = 5000; // 5000 DA
  const amountForFreeShipping = freeShippingThreshold - subtotal;
  const hasFreeShipping = amountForFreeShipping <= 0;

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      setPromoError('Veuillez entrer un code promo');
      return;
    }

    setIsApplying(true);
    setPromoError('');

    const success = await applyCoupon(promoCode.trim().toUpperCase());

    if (success) {
      setPromoCode('');
    } else {
      setPromoError('Code promo invalide ou expiré');
    }

    setIsApplying(false);
  };

  const handleRemoveCoupon = async (code: string) => {
    await removeCoupon(code);
  };

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

        {/* Promo Code Section */}
        {showPromoCode && (
          <div className="space-y-3 pt-4 border-t">
            {/* Applied Coupons */}
            {cart.couponCodes && cart.couponCodes.length > 0 && (
              <div className="space-y-2">
                {cart.couponCodes.map((code) => (
                  <div
                    key={code}
                    className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-700 dark:text-green-300">
                        {code}
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveCoupon(code)}
                      className="p-1 hover:bg-green-200 dark:hover:bg-green-800 rounded transition-colors"
                      aria-label="Supprimer le code promo"
                    >
                      <X className="h-4 w-4 text-green-600" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Promo Code Input */}
            {(!cart.couponCodes || cart.couponCodes.length === 0) && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Code promo</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => {
                      setPromoCode(e.target.value.toUpperCase());
                      setPromoError('');
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleApplyPromo();
                      }
                    }}
                    placeholder="Entrez votre code"
                    className={cn(
                      'flex-1 px-3 py-2 text-sm border rounded-lg bg-background',
                      'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
                      promoError && 'border-destructive'
                    )}
                    disabled={isApplying}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleApplyPromo}
                    disabled={isApplying || !promoCode.trim()}
                    className="px-4"
                  >
                    {isApplying ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Appliquer'
                    )}
                  </Button>
                </div>
                {promoError && (
                  <p className="text-xs text-destructive">{promoError}</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Price Breakdown */}
        <div className="space-y-2 pt-4 border-t">
          <div className="flex justify-between text-muted-foreground">
            <span>Sous-total</span>
            <span>{formatPrice(subtotal)}</span>
          </div>

          {/* Display Discounts */}
          {cart.discounts && cart.discounts.length > 0 && (
            <>
              {cart.discounts.map((discount, index) => (
                <div key={index} className="flex justify-between text-green-600 dark:text-green-400">
                  <span className="flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    {discount.description}
                  </span>
                  <span>-{formatPrice(Math.abs(discount.amountWithTax))}</span>
                </div>
              ))}
            </>
          )}

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

        {/* Savings indicator */}
        {discountTotal > 0 && (
          <div className="text-center">
            <span className="text-sm text-green-600 dark:text-green-400 font-medium">
              Vous économisez {formatPrice(discountTotal)}!
            </span>
          </div>
        )}

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
