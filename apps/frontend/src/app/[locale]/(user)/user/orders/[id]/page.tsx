'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button, Card, Badge, Skeleton } from '@/components/ui';
import {
  ArrowLeft,
  Package,
  Truck,
  MapPin,
  CreditCard,
  Download,
  MessageSquare,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { useGetOrderByCodeQuery } from '@/graphql/generated/graphql';
import { useLocale, useTranslations } from 'next-intl';

// Vendure order states mapped to display config
const statusConfig: Record<string, { labelKey: string; variant: 'warning' | 'info' | 'default' | 'success' | 'destructive' }> = {
  AddingItems: { labelKey: 'statusAddingItems', variant: 'info' },
  ArrangingPayment: { labelKey: 'statusArrangingPayment', variant: 'warning' },
  PaymentAuthorized: { labelKey: 'statusPaymentAuthorized', variant: 'info' },
  PaymentSettled: { labelKey: 'statusPaymentSettled', variant: 'success' },
  PartiallyShipped: { labelKey: 'statusPartiallyShipped', variant: 'info' },
  Shipped: { labelKey: 'statusShipped', variant: 'default' },
  PartiallyDelivered: { labelKey: 'statusPartiallyDelivered', variant: 'info' },
  Delivered: { labelKey: 'statusDelivered', variant: 'success' },
  Cancelled: { labelKey: 'statusCancelled', variant: 'destructive' },
};

// Timeline steps based on order state
const getTimeline = (state: string, createdAt: string) => {
  const steps = [
    { statusKey: 'timelineOrderPlaced', icon: CheckCircle2, completed: true, date: createdAt },
    { statusKey: 'timelinePaymentConfirmed', icon: CreditCard, completed: ['PaymentSettled', 'PartiallyShipped', 'Shipped', 'PartiallyDelivered', 'Delivered'].includes(state) },
    { statusKey: 'timelinePreparing', icon: Package, completed: ['PartiallyShipped', 'Shipped', 'PartiallyDelivered', 'Delivered'].includes(state) },
    { statusKey: 'timelineShipped', icon: Truck, completed: ['Shipped', 'PartiallyDelivered', 'Delivered'].includes(state) },
    { statusKey: 'timelineDelivered', icon: CheckCircle2, completed: state === 'Delivered' },
  ];
  return steps;
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('orderDetail');
  const orderCode = params?.id as string;

  // Fetch order using Vendure query by code
  const { data, loading, error } = useGetOrderByCodeQuery({
    variables: { code: orderCode },
    skip: !orderCode,
  });

  const order = data?.orderByCode;

  // Format price
  const formatPrice = (priceInCents: number, currencyCode: string = 'DZD') => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0,
    }).format(priceInCents / 100);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  // Format address
  const formatAddress = (address: any) => {
    if (!address) return t('addressNotSpecified');
    const parts = [
      address.fullName,
      address.streetLine1,
      address.streetLine2,
      [address.city, address.province, address.postalCode].filter(Boolean).join(', '),
      address.country,
    ].filter(Boolean);
    return parts.join('\n');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" className="mb-4" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('backToOrders')}
        </Button>
        <Card>
          <div className="p-12 text-center">
            <h1 className="text-2xl font-bold mb-4">{t('orderNotFound')}</h1>
            <p className="text-muted-foreground mb-6">
              {error ? error.message : t('orderNotFoundDescription')}
            </p>
            <Button asChild>
              <Link href={`/${locale}/user/orders`}>{t('backToOrders')}</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const statusEntry = statusConfig[order.state];
  const status = {
    label: statusEntry ? t(statusEntry.labelKey) : order.state,
    variant: statusEntry?.variant ?? ('default' as const),
  };
  const timeline = getTimeline(order.state, order.createdAt);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button variant="ghost" size="sm" className="mb-4" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('backToOrders')}
        </Button>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">#{order.code}</h1>
            <p className="text-muted-foreground mt-1">{t('orderedOn', { date: formatDate(order.createdAt) })}</p>
          </div>
          <Badge variant={status.variant} className="text-base px-4 py-2">
            {status.label}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Timeline */}
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6">{t('orderTracking')}</h2>
              <div className="relative">
                {timeline.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div key={index} className="flex gap-4 pb-6 last:pb-0">
                      {/* Timeline Dot */}
                      <div className="relative flex flex-col items-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            item.completed ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        {index < timeline.length - 1 && (
                          <div
                            className={`w-0.5 h-full mt-2 ${
                              item.completed ? 'bg-primary' : 'bg-secondary'
                            }`}
                          />
                        )}
                      </div>

                      {/* Timeline Content */}
                      <div className="flex-1 pb-2">
                        <p
                          className={`font-medium ${
                            item.completed ? 'text-foreground' : 'text-muted-foreground'
                          }`}
                        >
                          {t(item.statusKey)}
                        </p>
                        {item.completed && item.date && (
                          <p className="text-sm text-muted-foreground">{formatDate(item.date)}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>

          {/* Order Items */}
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">{t('orderedItems')}</h2>
              <div className="space-y-4">
                {order.lines.map((line) => {
                  const imageUrl = line.featuredAsset?.preview || line.productVariant?.product?.featuredAsset?.preview;
                  return (
                    <div key={line.id} className="flex gap-4 pb-4 border-b last:border-0">
                      <div className="relative w-20 h-20 rounded-md overflow-hidden bg-secondary flex-shrink-0">
                        {imageUrl && (
                          <Image
                            src={imageUrl}
                            alt={line.productVariant?.name || 'Product'}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium line-clamp-2">
                          {line.productVariant?.product?.name}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {line.productVariant?.name}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {t('quantityLabel', { quantity: line.quantity })}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-semibold text-primary">
                          {formatPrice(line.linePriceWithTax, order.currencyCode)}
                        </p>
                        {line.quantity > 1 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {t('pricePerUnit', { price: formatPrice(line.unitPriceWithTax, order.currencyCode) })}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>

          {/* Fulfillments */}
          {order.fulfillments && order.fulfillments.length > 0 && (
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">{t('shipments')}</h2>
                <div className="space-y-4">
                  {order.fulfillments.map((fulfillment) => (
                    <div key={fulfillment.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Truck className="h-5 w-5 text-muted-foreground" />
                          <span className="font-medium">{fulfillment.method}</span>
                        </div>
                        <Badge variant={fulfillment.state === 'Delivered' ? 'success' : 'default'}>
                          {fulfillment.state}
                        </Badge>
                      </div>
                      {fulfillment.trackingCode && (
                        <p className="text-sm text-muted-foreground">
                          {t('trackingNumberLabel')} <span className="font-mono">{fulfillment.trackingCode}</span>
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        {t('createdOn', { date: formatDate(fulfillment.createdAt) })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <div className="p-6">
              <h3 className="font-semibold mb-4">{t('orderSummary')}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('subtotal')}</span>
                  <span>{formatPrice(order.subTotalWithTax, order.currencyCode)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('shipping')}</span>
                  <span>
                    {order.shippingWithTax === 0
                      ? t('free')
                      : formatPrice(order.shippingWithTax, order.currencyCode)}
                  </span>
                </div>
                <div className="pt-2 border-t flex justify-between items-center">
                  <span className="font-bold">{t('total')}</span>
                  <span className="text-xl font-bold text-primary">
                    {formatPrice(order.totalWithTax, order.currencyCode)}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Shipping Address */}
          <Card>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold">{t('shippingAddress')}</h3>
              </div>
              <div className="text-sm whitespace-pre-line text-muted-foreground">
                {formatAddress(order.shippingAddress)}
              </div>
              {order.shippingAddress?.phoneNumber && (
                <p className="text-sm text-muted-foreground mt-2">
                  {t('phoneLabel', { phone: order.shippingAddress.phoneNumber })}
                </p>
              )}
            </div>
          </Card>

          {/* Billing Address */}
          {order.billingAddress && (
            <Card>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-semibold">{t('billingAddress')}</h3>
                </div>
                <div className="text-sm whitespace-pre-line text-muted-foreground">
                  {formatAddress(order.billingAddress)}
                </div>
              </div>
            </Card>
          )}

          {/* Payment Info */}
          {order.payments && order.payments.length > 0 && (
            <Card>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-semibold">{t('payment')}</h3>
                </div>
                {order.payments.map((payment) => (
                  <div key={payment.id} className="text-sm">
                    <p className="font-medium">{payment.method}</p>
                    <p className="text-muted-foreground">
                      {formatPrice(payment.amount, order.currencyCode)}
                    </p>
                    <Badge
                      variant={payment.state === 'Settled' ? 'success' : 'default'}
                      className="mt-1"
                    >
                      {payment.state}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Actions */}
          <div className="space-y-2">
            <Button variant="outline" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              {t('downloadInvoice')}
            </Button>
            <Button variant="outline" className="w-full">
              <MessageSquare className="h-4 w-4 mr-2" />
              {t('contactSupport')}
            </Button>
            {order.state === 'Delivered' && (
              <Button className="w-full">
                <Package className="h-4 w-4 mr-2" />
                {t('reorder')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
