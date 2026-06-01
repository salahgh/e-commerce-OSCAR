'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Button, Skeleton } from '@/components/ui';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/lib/utils/formatters';
import { ShoppingBag, Minus, Plus, Trash2, ImageOff } from 'lucide-react';
import { cn } from '@/lib/utils';

function normalizeUrl(url?: string) {
  return url?.replace(/\\/g, '/');
}

function CartItemImage({ src, alt }: { src?: string; alt: string }) {
  const [error, setError] = useState(false);
  if (!src || error) {
    return (
      <div className="w-full h-full bg-muted flex items-center justify-center">
        <ImageOff className="w-6 h-6 text-muted-foreground" />
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className="w-full h-full object-cover" onError={() => setError(true)} />
  );
}

export default function CartPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || 'fr';
  const t = useTranslations('cart');
  const { cart, loading, updateQuantity, removeItem } = useCart();

  const handleCheckout = () => {
    router.push(`/${locale}/checkout`);
  };

  if (loading) {
    return (
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-8">
        <Skeleton className="h-10 w-48 mb-8" />
        <div style={{ display: 'flex', gap: '2rem' }}>
          <div style={{ flex: 1 }}>
            <Skeleton className="h-24 mb-4" />
            <Skeleton className="h-24 mb-4" />
            <Skeleton className="h-24 mb-4" />
          </div>
          <div style={{ width: '340px' }}>
            <Skeleton className="h-64" />
          </div>
        </div>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-16">
        <div className="max-w-md mx-auto text-center">
          <ShoppingBag className="h-24 w-24 mx-auto text-muted-foreground/30 mb-6" />
          <h1 className="text-2xl font-bold text-foreground mb-4">{t('emptyTitle')}</h1>
          <p className="text-muted-foreground mb-8">{t('emptyMessage')}</p>
          <Button asChild size="lg">
            <Link href="/products">{t('continueShopping')}</Link>
          </Button>
        </div>
      </div>
    );
  }

  const subtotal = cart.subTotal || 0;
  const total = cart.total || subtotal;
  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="bg-background min-h-screen">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">{t('title')}</h1>

        <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
          {/* Cart Items */}
          <div style={{ flex: 1 }}>
            {/* Header Row */}
            <div className="hidden md:grid border-b border-border pb-3 mb-4 text-sm font-medium text-muted-foreground"
              style={{ gridTemplateColumns: '2fr 1fr 1fr auto' }}>
              <span>{t('product')}</span>
              <span className="text-center">{t('price')}</span>
              <span className="text-center">{t('quantityLabel')}</span>
              <span className="w-10" />
            </div>

            {/* Items */}
            <div className="space-y-4">
              {cart.items.map((item) => (
                <CartRow
                  key={item.id}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeItem}
                />
              ))}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div style={{ width: '340px', flexShrink: 0 }} className="hidden md:block">
            <div className="bg-card border border-border rounded-xl p-6 sticky top-24">
              <h2 className="text-xl font-bold text-foreground mb-6">{t('orderSummary')}</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-muted-foreground">
                  <span>{t('totalItems', { count: itemCount })}</span>
                  <span>{formatPrice(subtotal / 100)}</span>
                </div>
              </div>

              <div className="border-t border-border pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-foreground">{t('totalAmount')}</span>
                  <span className="text-xl font-bold text-foreground">
                    {formatPrice(total / 100)}
                  </span>
                </div>
              </div>

              <Button
                onClick={handleCheckout}
                className="w-full h-12 bg-[#1E1E1E] hover:bg-[#333] text-white text-lg font-medium rounded-lg"
              >
                {t('confirmOrder')}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Summary */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 z-40">
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-foreground">{t('totalAmount')}</span>
            <span className="text-xl font-bold text-foreground">{formatPrice(total / 100)}</span>
          </div>
          <Button
            onClick={handleCheckout}
            className="w-full h-12 bg-[#1E1E1E] hover:bg-[#333] text-white text-lg font-medium rounded-lg"
          >
            {t('confirmOrder')}
          </Button>
        </div>
      </div>
    </div>
  );
}

function CartRow({
  item,
  onUpdateQuantity,
  onRemove,
}: {
  item: any;
  onUpdateQuantity: (id: string, qty: number) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
}) {
  const [updating, setUpdating] = useState(false);
  const t = useTranslations('cart');

  const handleQty = async (newQty: number) => {
    if (newQty < 1 || newQty === item.quantity) return;
    setUpdating(true);
    try { await onUpdateQuantity(item.id, newQty); } finally { setUpdating(false); }
  };

  const handleRemove = async () => {
    setUpdating(true);
    try { await onRemove(item.id); } finally { setUpdating(false); }
  };

  return (
    <div className={cn(
      'flex items-center gap-4 py-4 border-b border-border',
      updating && 'opacity-50 pointer-events-none'
    )}>
      {/* Image */}
      <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden shrink-0">
        <CartItemImage src={normalizeUrl(item.imageUrl)} alt={item.productName} />
      </div>

      {/* Name + Delete */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground line-clamp-2 mb-1">{item.productName}</p>
        <button
          onClick={handleRemove}
          className="text-sm text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"
        >
          <Trash2 className="w-3 h-3" />
          {t('delete')}
        </button>
      </div>

      {/* Price */}
      <div className="text-center shrink-0 w-24 hidden md:block">
        <span className="font-bold text-foreground">{formatPrice(item.unitPrice / 100)}</span>
      </div>

      {/* Quantity */}
      <div className="flex items-center border border-border rounded-lg overflow-hidden shrink-0">
        <button
          onClick={() => handleQty(item.quantity + 1)}
          className="w-8 h-8 flex items-center justify-center hover:bg-muted transition-colors"
        >
          <Plus className="w-3 h-3" />
        </button>
        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
        <button
          onClick={() => handleQty(item.quantity - 1)}
          disabled={item.quantity <= 1}
          className="w-8 h-8 flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-40"
        >
          <Minus className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
