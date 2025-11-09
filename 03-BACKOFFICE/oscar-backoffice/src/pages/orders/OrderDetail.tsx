import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { ArrowLeft, Package, User, MapPin, CreditCard, Truck, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { formatPrice, formatDateTime } from '../../lib/utils';
import { PAYMENT_STATUS_LABELS } from '../../constants';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { addToast } from '../../store/slices/uiSlice';
import type { OrderStatus } from '../../types';
import { OrderDocument, UpdateOrderStatusDocument, AllOrdersDocument } from '../../graphql/generated/graphql';
import { Spinner } from '../../components/ui/Spinner';

const statusOptions = [
  { value: 'PENDING', label: 'En attente' },
  { value: 'CONFIRMED', label: 'Confirmée' },
  { value: 'PROCESSING', label: 'En préparation' },
  { value: 'SHIPPED', label: 'Expédiée' },
  { value: 'DELIVERED', label: 'Livrée' },
  { value: 'CANCELLED', label: 'Annulée' },
];

export const OrderDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [status, setStatus] = useState<string>('');

  // Fetch order data
  const { data, loading, error } = useQuery(OrderDocument, {
    variables: { id: id ? parseInt(id) : 0 },
    skip: !id,
  });

  const [updateOrderStatus, { loading: updating }] = useMutation(UpdateOrderStatusDocument, {
    refetchQueries: [
      { query: AllOrdersDocument, variables: { page: 0, size: 20 } },
      { query: OrderDocument, variables: { id: id ? parseInt(id) : 0 } },
    ],
  });

  // Set initial status when data loads
  useEffect(() => {
    if (data?.order?.status) {
      setStatus(data.order.status);
    }
  }, [data]);

  const handleStatusUpdate = async () => {
    if (!id) return;

    try {
      await updateOrderStatus({
        variables: {
          id: parseInt(id),
          input: {
            status,
          },
        },
      });

      dispatch(addToast({ message: 'Statut de la commande mis à jour', type: 'success' }));
    } catch (error: any) {
      console.error('Update order status error:', error);
      dispatch(addToast({ message: error.message || 'Erreur lors de la mise à jour', type: 'error' }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !data?.order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-500 text-lg mb-4">Erreur: {error?.message || 'Commande non trouvée'}</p>
        <Button onClick={() => navigate('/orders')}>Retour aux commandes</Button>
      </div>
    );
  }

  const order = data.order;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/orders')} icon={<ArrowLeft className="h-5 w-5" />}>
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Commande {order.orderNumber}</h1>
            <p className="text-gray-600 mt-1">Passée le {formatDateTime(String(order.createdAt))}</p>
          </div>
        </div>
        <Button variant="outline" icon={<Download className="h-5 w-5" />}>
          Télécharger facture
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600" />
                <CardTitle>Articles ({order.items?.length || 0})</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produit</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Prix unitaire</TableHead>
                    <TableHead>Quantité</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {item.productImage && (
                              <img
                                src={item.productImage}
                                alt={item.productName || ''}
                                className="w-12 h-12 rounded object-cover"
                              />
                            )}
                            <div>
                              <p className="font-medium">{item.productName}</p>
                              <p className="text-sm text-gray-500">
                                {item.selectedSize && `${item.selectedSize} - `}{item.selectedColor}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs">{item.productId}</TableCell>
                        <TableCell>{formatPrice(Number(item.price))}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell className="font-semibold">
                          {formatPrice(Number(item.subtotal))}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-gray-500">
                        Aucun article
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {/* Order Summary */}
              <div className="border-t border-gray-200 p-6">
                <div className="space-y-2 max-w-sm ml-auto">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Sous-total</span>
                    <span className="font-medium">{formatPrice(Number(order.subtotal))}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Livraison</span>
                    <span className="font-medium">{formatPrice(Number(order.shippingCost))}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total</span>
                    <span>{formatPrice(Number(order.totalAmount))}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                <CardTitle>Informations client</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{order.userEmail || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Téléphone</p>
                <p className="font-medium">{order.phoneNumber || 'N/A'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                <CardTitle>Adresse de livraison</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Téléphone</p>
                <p className="font-medium">{order.phoneNumber || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-900">{order.shippingAddress || 'Adresse non fournie'}</p>
              </div>
              {order.notes && (
                <div className="pt-3 border-t">
                  <p className="text-sm text-gray-600 mb-1">Notes</p>
                  <p className="text-sm italic">{order.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Management */}
          <Card>
            <CardHeader>
              <CardTitle>Statut de la commande</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Statut actuel</label>
                <Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as OrderStatus)}
                  options={statusOptions}
                />
              </div>
              {status !== order.status && (
                <Button onClick={handleStatusUpdate} loading={updating} className="w-full">
                  Mettre à jour le statut
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-blue-600" />
                <CardTitle>Paiement</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Méthode</span>
                <span className="font-medium">
                  {order.paymentMethod === 'CASH_ON_DELIVERY'
                    ? 'Paiement à la livraison'
                    : order.paymentMethod}
                </span>
              </div>
              {order.paidAt && (
                <div>
                  <p className="text-sm text-gray-600">Payé le</p>
                  <p className="text-sm font-medium">{formatDateTime(String(order.paidAt))}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tracking */}
          {order.trackingNumber && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-blue-600" />
                  <CardTitle>Suivi</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Numéro de suivi</p>
                  <p className="font-mono font-medium">{order.trackingNumber}</p>
                </div>
                {order.deliveredAt && (
                  <div>
                    <p className="text-sm text-gray-600">Livré le</p>
                    <p className="text-sm">{formatDateTime(String(order.deliveredAt))}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Historique</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-600 mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">Commande créée</p>
                    <p className="text-xs text-gray-500">{formatDateTime(String(order.createdAt))}</p>
                  </div>
                </div>
                {order.updatedAt && order.updatedAt !== order.createdAt && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-600 mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">Mise à jour</p>
                      <p className="text-xs text-gray-500">{formatDateTime(String(order.updatedAt))}</p>
                    </div>
                  </div>
                )}
                {order.deliveredAt && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-600 mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">Livrée</p>
                      <p className="text-xs text-gray-500">{formatDateTime(String(order.deliveredAt))}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
