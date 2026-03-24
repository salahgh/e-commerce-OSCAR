'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Skeleton } from '@/components/ui';
import { CartItem, CartSummary } from '@/components/cart';
import { useCart } from '@/contexts/CartContext';
import { ShoppingBag, ArrowLeft, Trash2 } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function CartPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as 'ar' | 'fr' | 'en') || 'fr';
  const { cart, loading, clearCart } = useCart();
  const [isClearing, setIsClearing] = useState(false);

  const handleClearCart = async () => {
    if (!confirm('Êtes-vous sûr de vouloir vider votre panier?')) {
      return;
    }

    setIsClearing(true);
    try {
      await clearCart();
    } finally {
      setIsClearing(false);
    }
  };

  const handleCheckout = () => {
    router.push(`/${locale}/checkout`);
  };

  // Loading state
  if (loading) {
    return (
      <div className="container-custom py-8">
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <div>
            <Skeleton className="h-96" />
          </div>
        </div>
      </div>
    );
  }

  // Empty cart
  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="container-custom py-16">
        <div className="max-w-md mx-auto text-center">
          <ShoppingBag className="h-24 w-24 mx-auto text-gray-300 mb-6" />
          <h1 className="text-2xl font-bold mb-4">Votre panier est vide</h1>
          <p className="text-gray-600 mb-8">
            Commencez vos achats et ajoutez des articles à votre panier
          </p>
          <Button asChild size="lg">
            <Link href="/products">Découvrir les Produits</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Mon Panier</h1>
          <p className="text-gray-600 mt-1">
            {cart.items.length} {cart.items.length === 1 ? 'article' : 'articles'}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href="/products">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Continuer mes achats
            </Link>
          </Button>
          {cart.items.length > 0 && (
            <Button
              variant="destructive"
              onClick={handleClearCart}
              loading={isClearing}
              leftIcon={<Trash2 className="h-4 w-4" />}
            >
              Vider le panier
            </Button>
          )}
        </div>
      </div>

      {/* Cart Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <CartItem key={item.id} item={item} locale={locale} />
          ))}
        </div>

        {/* Cart Summary */}
        <div>
          <CartSummary onCheckout={handleCheckout} />

          {/* Additional Info */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Informations de livraison</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Livraison dans toute l'Algérie</li>
              <li>• Délai de livraison: 2-5 jours ouvrables</li>
              <li>• Paiement à la livraison disponible</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Continue Shopping Link (Mobile) */}
      <div className="mt-8 text-center lg:hidden">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Continuer mes achats
        </Link>
      </div>
    </div>
  );
}
