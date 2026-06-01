'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button, Card, Badge, Skeleton } from '@/components/ui';
import { Package, ChevronRight, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGetMyOrdersQuery } from '@/graphql/generated/graphql';
import { useLocale, useTranslations } from 'next-intl';

// Vendure order states mapped to display config
const statusConfig: Record<string, { labelKey: string; variant: 'warning' | 'info' | 'default' | 'success' | 'destructive'; color: string }> = {
  AddingItems: { labelKey: 'statusAddingItems', variant: 'info', color: 'bg-blue-100 text-blue-800' },
  ArrangingPayment: { labelKey: 'statusArrangingPayment', variant: 'warning', color: 'bg-yellow-100 text-yellow-800' },
  PaymentAuthorized: { labelKey: 'statusPaymentAuthorized', variant: 'info', color: 'bg-blue-100 text-blue-800' },
  PaymentSettled: { labelKey: 'statusPaymentSettled', variant: 'success', color: 'bg-green-100 text-green-800' },
  PartiallyShipped: { labelKey: 'statusPartiallyShipped', variant: 'info', color: 'bg-purple-100 text-purple-800' },
  Shipped: { labelKey: 'statusShipped', variant: 'default', color: 'bg-purple-100 text-purple-800' },
  PartiallyDelivered: { labelKey: 'statusPartiallyDelivered', variant: 'info', color: 'bg-indigo-100 text-indigo-800' },
  Delivered: { labelKey: 'statusDelivered', variant: 'success', color: 'bg-green-100 text-green-800' },
  Cancelled: { labelKey: 'statusCancelled', variant: 'destructive', color: 'bg-red-100 text-red-800' },
};

export default function OrdersPage() {
  const locale = useLocale();
  const t = useTranslations('accountOrders');
  const [filter, setFilter] = useState<string>('all');

  // Fetch orders using Vendure query
  const { data, loading, error } = useGetMyOrdersQuery({
    variables: {
      options: {
        take: 50,
        sort: { createdAt: 'DESC' as any },
        filter: {
          active: { eq: false }, // Only show completed orders, not active cart
        },
      },
    },
  });

  const orders = data?.activeCustomer?.orders?.items || [];
  const totalOrders = data?.activeCustomer?.orders?.totalItems || 0;

  // Filter orders
  const filteredOrders =
    filter === 'all' ? orders : orders.filter((order) => order.state === filter);

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
    }).format(new Date(dateString));
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">{t('pageTitle')}</h1>
        <Card>
          <div className="p-12 text-center">
            <p className="text-destructive mb-4">{t('loadError')}</p>
            <p className="text-sm text-muted-foreground">{error.message}</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t('pageTitle')}</h1>
          <p className="text-muted-foreground mt-1">
            {totalOrders > 0 ? t('ordersTotalCount', { count: totalOrders }) : t('noOrders')}
          </p>
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          {t('filterButton')}
        </Button>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('all')}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            filter === 'all'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          )}
        >
          {t('filterAll', { count: orders.length })}
        </button>
        {Object.entries(statusConfig).map(([status, config]) => {
          const count = orders.filter((o) => o.state === status).length;
          if (count === 0) return null;
          return (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                filter === status ? config.color : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              )}
            >
              {t(config.labelKey)} ({count})
            </button>
          );
        })}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <Card>
          <div className="p-12 text-center">
            <Package className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold mb-2">{t('noOrders')}</h3>
            <p className="text-muted-foreground mb-6">
              {filter === 'all'
                ? t('emptyAllMessage')
                : t('emptyFilteredMessage')}
            </p>
            {filter === 'all' && (
              <Button asChild>
                <Link href={`/${locale}/products`}>{t('startShopping')}</Link>
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const status = statusConfig[order.state];
            const statusLabel = status ? t(status.labelKey) : order.state;
            const statusVariant = status?.variant || ('default' as const);
            const firstLine = order.lines[0];
            const firstImage = firstLine?.featuredAsset?.preview || firstLine?.productVariant?.product?.featuredAsset?.preview;

            return (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Order Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">#{order.code}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {t('orderedOn', { date: formatDate(order.createdAt) })}
                          </p>
                        </div>
                        <Badge variant={statusVariant}>{statusLabel}</Badge>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{t('itemsCount', { count: order.totalQuantity })}</span>
                        <span>•</span>
                        <span className="font-semibold text-primary text-base">
                          {formatPrice(order.totalWithTax, order.currencyCode)}
                        </span>
                      </div>

                      {/* Preview of items */}
                      <div className="flex items-center gap-4 mt-4">
                        {firstImage && (
                          <div className="relative w-16 h-16 rounded-md overflow-hidden bg-secondary flex-shrink-0">
                            <Image
                              src={firstImage}
                              alt={firstLine?.productVariant?.name || t('productImageAlt')}
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          </div>
                        )}
                        <p className="text-sm text-muted-foreground">
                          {firstLine?.productVariant?.name}
                          {order.lines.length > 1 && ` ${t('andMoreItems', { count: order.lines.length - 1 })}`}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 md:items-end md:justify-center">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/${locale}/user/orders/${order.code}`}>
                          {t('viewDetails')}
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Link>
                      </Button>
                      {order.state === 'Delivered' && (
                        <Button variant="ghost" size="sm">
                          {t('reorder')}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
