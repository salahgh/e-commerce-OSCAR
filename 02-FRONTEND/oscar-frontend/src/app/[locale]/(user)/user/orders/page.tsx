'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, Card, Badge, Skeleton } from '@/components/ui';
import { Package, ChevronRight, Filter } from 'lucide-react';
import { formatDate } from '@/lib/utils/formatters';
import { formatPrice } from '@/lib/utils/mappers';
import { cn } from '@/lib/utils';
import { useGetMyOrdersQuery } from '@/graphql/generated/graphql';
import { mapOrder } from '@/lib/utils/mappers';
import { useLocale } from 'next-intl';
import type { Locale } from '@/lib/utils/mappers';

const statusConfig = {
  PENDING: { label: 'En attente', variant: 'warning' as const, color: 'bg-yellow-100 text-yellow-800' },
  PROCESSING: { label: 'En préparation', variant: 'info' as const, color: 'bg-blue-100 text-blue-800' },
  SHIPPED: { label: 'Expédiée', variant: 'primary' as const, color: 'bg-purple-100 text-purple-800' },
  DELIVERED: { label: 'Livrée', variant: 'success' as const, color: 'bg-green-100 text-green-800' },
  CANCELLED: { label: 'Annulée', variant: 'error' as const, color: 'bg-red-100 text-red-800' },
};

export default function OrdersPage() {
  const locale = useLocale() as Locale;
  const [filter, setFilter] = useState<string>('all');
  const [page, setPage] = useState(0);

  // Fetch orders from GraphQL
  const { data, loading, error } = useGetMyOrdersQuery({
    variables: {
      page,
      size: 20,
    },
  });

  // Map orders to frontend format
  const orders = data?.myOrders?.content?.map((order) => mapOrder(order, locale)) || [];

  const filteredOrders =
    filter === 'all' ? orders : orders.filter((order) => order.status === filter);

  const totalOrders = data?.myOrders?.totalElements || 0;

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
        <h1 className="text-3xl font-bold">Mes Commandes</h1>
        <Card>
          <Card.Content className="p-12 text-center">
            <p className="text-red-600 mb-4">Erreur lors du chargement des commandes</p>
            <p className="text-sm text-gray-600">{error.message}</p>
          </Card.Content>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Mes Commandes</h1>
          <p className="text-gray-600 mt-1">
            {totalOrders > 0 ? `${totalOrders} commande${totalOrders > 1 ? 's' : ''} au total` : 'Aucune commande'}
          </p>
        </div>
        <Button variant="outline" leftIcon={<Filter className="h-4 w-4" />}>
          Filtrer
        </Button>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('all')}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            filter === 'all'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          )}
        >
          Toutes ({orders.length})
        </button>
        {Object.entries(statusConfig).map(([status, config]) => {
          const count = orders.filter((o) => o.status === status).length;
          if (count === 0) return null;
          return (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                filter === status ? config.color : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              {config.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <Card>
          <Card.Content className="p-12 text-center">
            <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Aucune commande</h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all'
                ? "Vous n'avez pas encore passé de commande"
                : 'Aucune commande avec ce statut'}
            </p>
            {filter === 'all' && (
              <Button asChild>
                <Link href="/products">Commencer mes achats</Link>
              </Button>
            )}
          </Card.Content>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const status = statusConfig[order.status as keyof typeof statusConfig];
            return (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <Card.Content className="p-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Order Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">{order.orderNumber}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Commandé le {formatDate(order.date)}
                          </p>
                        </div>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{order.items.length} article(s)</span>
                        <span>•</span>
                        <span className="font-semibold text-primary text-base">
                          {formatPrice(order.total)}
                        </span>
                      </div>

                      {/* Preview of first item */}
                      {order.items[0] && (
                        <p className="text-sm text-gray-600 mt-2">
                          {order.items[0].product.name[locale]}
                          {order.items.length > 1 && ` et ${order.items.length - 1} autre(s)`}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 md:items-end md:justify-center">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/user/orders/${order.id}`}>
                          Voir les détails
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Link>
                      </Button>
                      {order.status === 'DELIVERED' && (
                        <Button variant="ghost" size="sm">
                          Racheter
                        </Button>
                      )}
                    </div>
                  </div>
                </Card.Content>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
