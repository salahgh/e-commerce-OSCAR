'use client';

import React, { useState } from 'react';
import { Button, Input, Card } from '@/components/ui';
import { Tag, ArrowRight, Truck } from 'lucide-react';
import { formatPrice } from '@/lib/utils/formatters';
import { useCart } from '@/contexts/CartContext';
import toast from 'react-hot-toast';

interface CartSummaryProps {
  onCheckout?: () => void;
  showCoupon?: boolean;
  className?: string;
}

export default function CartSummary({
  onCheckout,
  showCoupon = true,
  className = '',
}: CartSummaryProps) {
  const { cart, applyCoupon, removeCoupon } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  if (!cart) {
    return null;
  }

  const subtotal = cart.subtotal || 0;
  const discount = cart.discount || 0;
  const shippingCost = cart.shippingCost || 0;
  const total = cart.total || subtotal - discount + shippingCost;

  const freeShippingThreshold = 5000; // 5000 DA
  const amountForFreeShipping = freeShippingThreshold - subtotal;
  const hasFreeShipping = amountForFreeShipping <= 0;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Veuillez entrer un code promo');
      return;
    }

    setIsApplyingCoupon(true);
    try {
      await applyCoupon(couponCode);
      toast.success('Code promo appliqué avec succès!');
      setCouponCode('');
    } catch (error: any) {
      toast.error(error.message || 'Code promo invalide');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = async () => {
    try {
      await removeCoupon();
      toast.success('Code promo retiré');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors du retrait du code promo');
    }
  };

  return (
    <Card className={className}>
      <Card.Header>
        <h2 className="text-xl font-bold">Résumé de la commande</h2>
      </Card.Header>

      <Card.Content className="space-y-4">
        {/* Coupon Input */}
        {showCoupon && (
          <div>
            {cart.coupon ? (
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-900">
                      Code promo: {cart.coupon.code}
                    </p>
                    <p className="text-xs text-green-700">
                      {cart.coupon.type === 'PERCENTAGE'
                        ? `-${cart.coupon.value}%`
                        : `-${formatPrice(cart.coupon.value)}`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleRemoveCoupon}
                  className="text-xs text-green-700 hover:text-green-900 underline"
                >
                  Retirer
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Code promo"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  leftIcon={<Tag className="h-4 w-4 text-gray-400" />}
                  className="flex-1"
                />
                <Button
                  onClick={handleApplyCoupon}
                  loading={isApplyingCoupon}
                  disabled={!couponCode.trim()}
                  variant="outline"
                >
                  Appliquer
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Free Shipping Progress */}
        {!hasFreeShipping && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Truck className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-blue-900">
                  Plus que {formatPrice(amountForFreeShipping)} pour la livraison gratuite!
                </p>
                <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
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
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-green-600" />
              <p className="text-sm font-medium text-green-900">
                Livraison gratuite applicable!
              </p>
            </div>
          </div>
        )}

        {/* Price Breakdown */}
        <div className="space-y-2 pt-4 border-t">
          <div className="flex justify-between text-gray-700">
            <span>Sous-total</span>
            <span>{formatPrice(subtotal)}</span>
          </div>

          {discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Réduction</span>
              <span>-{formatPrice(discount)}</span>
            </div>
          )}

          <div className="flex justify-between text-gray-700">
            <span>Livraison</span>
            <span>{shippingCost === 0 ? 'Gratuite' : formatPrice(shippingCost)}</span>
          </div>
        </div>

        {/* Total */}
        <div className="flex justify-between items-center pt-4 border-t">
          <span className="text-lg font-bold text-gray-900">Total</span>
          <span className="text-2xl font-bold text-primary">{formatPrice(total)}</span>
        </div>

        {/* Tax Info */}
        <p className="text-xs text-gray-500 text-center">TVA incluse</p>
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
