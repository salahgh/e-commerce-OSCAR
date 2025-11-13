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
} from 'lucide-react';
import { formatDate } from '@/lib/utils/formatters';
import { formatPrice, mapOrder } from '@/lib/utils/mappers';
import { useGetOrderQuery } from '@/graphql/generated/graphql';
import { useLocale } from 'next-intl';
import type { Locale } from '@/lib/utils/mappers';

// Mock timeline data - backend doesn't provide this
const getMockTimeline = (status: string, createdAt: string, deliveredAt?: string | null) => {
  const timeline = [
    { status: 'Commande passée', date: createdAt, completed: true },
    { status: 'En préparation', date: createdAt, completed: status !== 'PENDING' },
    { status: 'Expédiée', date: createdAt, completed: status === 'SHIPPED' || status === 'DELIVERED' },
    { status: 'Livrée', date: deliveredAt || createdAt, completed: status === 'DELIVERED' },
  ];
  return timeline;
};

const statusConfig = {
  PENDING: { label: 'En attente', variant: 'warning' as const },
  PROCESSING: { label: 'En préparation', variant: 'info' as const },
  SHIPPED: { label: 'Expédiée', variant: 'primary' as const },
  DELIVERED: { label: 'Livrée', variant: 'success' as const },
  CANCELLED: { label: 'Annulée', variant: 'error' as const },
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const locale = useLocale() as Locale;

  // Fetch order from GraphQL
  const { data, loading, error } = useGetOrderQuery({
    variables: {
      id: Number(params.id),
    },
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error || !data?.order) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" className="mb-4" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour aux commandes
        </Button>
        <Card>
          <Card.Content className="p-12 text-center">
            <h1 className="text-2xl font-bold mb-4">Commande non trouvée</h1>
            <p className="text-gray-600 mb-6">
              {error ? error.message : 'La commande que vous recherchez n\'existe pas.'}
            </p>
            <Button asChild>
              <Link href="/user/orders">Retour aux commandes</Link>
            </Button>
          </Card.Content>
        </Card>
      </div>
    );
  }

  // Map order to frontend format
  const order = mapOrder(data.order, locale);
  const status = statusConfig[order.status as keyof typeof statusConfig];
  const timeline = getMockTimeline(order.status, order.createdAt, order.deliveredAt);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button variant="ghost" size="sm" className="mb-4" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour aux commandes
        </Button>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">{order.orderNumber}</h1>
            <p className="text-gray-600 mt-1">Commandé le {formatDate(order.createdAt)}</p>
          </div>
          <div className="flex gap-2">
            <Badge variant={status.variant} className="text-base px-4 py-2">
              {status.label}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Timeline */}
          {order.trackingNumber && (
            <Card>
              <Card.Header>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Suivi de commande</h2>
                  <span className="text-sm text-gray-600">
                    N° de suivi: {order.trackingNumber}
                  </span>
                </div>
              </Card.Header>
              <Card.Content>
                <div className="relative">
                  {timeline.map((item, index) => (
                    <div key={index} className="flex gap-4 pb-6 last:pb-0">
                      {/* Timeline Dot */}
                      <div className="relative flex flex-col items-center">
                        <div
                          className={`w-4 h-4 rounded-full ${
                            item.completed ? 'bg-primary' : 'bg-gray-300'
                          }`}
                        />
                        {index < timeline.length - 1 && (
                          <div
                            className={`w-0.5 h-full ${
                              item.completed ? 'bg-primary' : 'bg-gray-300'
                            }`}
                          />
                        )}
                      </div>

                      {/* Timeline Content */}
                      <div className="flex-1 pb-2">
                        <p
                          className={`font-medium ${
                            item.completed ? 'text-gray-900' : 'text-gray-500'
                          }`}
                        >
                          {item.status}
                        </p>
                        <p className="text-sm text-gray-600">{formatDate(item.date)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card.Content>
            </Card>
          )}

          {/* Order Items */}
          <Card>
            <Card.Header>
              <h2 className="text-xl font-semibold">Articles commandés</h2>
            </Card.Header>
            <Card.Content>
              <div className="space-y-4">
                {order.items.map((item) => {
                  const primaryImage = item.product.images?.[0];
                  return (
                    <div key={item.id} className="flex gap-4 pb-4 border-b last:border-0">
                      <div className="relative w-20 h-20 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                        {primaryImage && (
                          <Image
                            src={primaryImage.url}
                            alt={item.product.name[locale]}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium line-clamp-2">
                          {item.product.name[locale]}
                        </p>
                        {item.variant && (
                          <p className="text-sm text-gray-600 mt-1">
                            {item.variant.size && `Taille: ${item.variant.size}`}
                            {item.variant.size && item.variant.color && ' • '}
                            {item.variant.color && `Couleur: ${item.variant.color}`}
                          </p>
                        )}
                        <p className="text-sm text-gray-600 mt-1">Quantité: {item.quantity}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-semibold text-primary">{formatPrice(item.total)}</p>
                        {item.quantity > 1 && (
                          <p className="text-xs text-gray-600 mt-1">
                            {formatPrice(item.price)} / unité
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card.Content>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <Card.Header>
              <h3 className="font-semibold">Résumé de la commande</h3>
            </Card.Header>
            <Card.Content>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-700">
                  <span>Sous-total</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Réduction</span>
                    <span>-{formatPrice(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-700">
                  <span>Livraison</span>
                  <span>
                    {order.shippingCost === 0
                      ? 'Gratuite'
                      : formatPrice(order.shippingCost)}
                  </span>
                </div>
                <div className="pt-2 border-t flex justify-between items-center">
                  <span className="font-bold">Total</span>
                  <span className="text-xl font-bold text-primary">
                    {formatPrice(order.total)}
                  </span>
                </div>
              </div>
            </Card.Content>
          </Card>

          {/* Shipping Address */}
          <Card>
            <Card.Header>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-gray-600" />
                <h3 className="font-semibold">Adresse de livraison</h3>
              </div>
            </Card.Header>
            <Card.Content>
              <div className="text-sm space-y-1">
                <p className="text-gray-600">{order.shippingAddress}</p>
                <p className="text-gray-600">{order.phoneNumber}</p>
              </div>
            </Card.Content>
          </Card>

          {/* Payment Method */}
          <Card>
            <Card.Header>
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-gray-600" />
                <h3 className="font-semibold">Paiement</h3>
              </div>
            </Card.Header>
            <Card.Content>
              <p className="text-sm font-medium">{order.paymentMethod}</p>
            </Card.Content>
          </Card>

          {/* Actions */}
          <div className="space-y-2">
            <Button variant="outline" className="w-full" leftIcon={<Download className="h-4 w-4" />}>
              Télécharger la facture
            </Button>
            <Button
              variant="outline"
              className="w-full"
              leftIcon={<MessageSquare className="h-4 w-4" />}
            >
              Contacter le support
            </Button>
            {order.status === 'DELIVERED' && (
              <Button className="w-full" leftIcon={<Package className="h-4 w-4" />}>
                Racheter
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
