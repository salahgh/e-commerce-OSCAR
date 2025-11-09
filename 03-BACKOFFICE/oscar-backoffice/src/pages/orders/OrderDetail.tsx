import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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

// Mock data
const mockOrder = {
  id: '1',
  orderNumber: 'OSC-2025-0001',
  user: { id: '3', firstName: 'Ahmed', lastName: 'Benali', email: 'ahmed.benali@gmail.com', phoneNumber: '0555123456' },
  status: 'DELIVERED' as OrderStatus,
  paymentMethod: 'CASH_ON_DELIVERY',
  paymentStatus: 'PAID',
  subtotal: 37497,
  shippingCost: 800,
  discountAmount: 0,
  totalAmount: 38297,
  shippingFullName: 'Ahmed Benali',
  shippingPhone: '0555123456',
  shippingAddress: 'Cité 200 Logements, Bâtiment A, N°15',
  shippingCity: 'Alger Centre',
  shippingWilaya: 'Alger',
  shippingPostalCode: '16000',
  customerNotes: 'Livraison avant 18h SVP',
  trackingNumber: 'YLD-DZ-2025-001234',
  items: [
    {
      id: '1',
      productNameFr: 'T-Shirt Classique Noir',
      productSku: 'MTS-001-BLK',
      quantity: 2,
      unitPrice: 1999,
      selectedSize: 'L',
      selectedColor: 'Noir',
      productImageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab',
    },
    {
      id: '2',
      productNameFr: 'Jean Slim Bleu Foncé',
      productSku: 'MJN-001-BLU',
      quantity: 1,
      unitPrice: 7999,
      selectedSize: '32',
      selectedColor: 'Bleu foncé',
      productImageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d',
    },
  ],
  createdAt: '2025-01-15T10:30:00Z',
  shippedAt: '2025-01-17T14:00:00Z',
  deliveredAt: '2025-01-20T16:30:00Z',
  paidAt: '2025-01-20T16:30:00Z',
};

const statusOptions = [
  { value: 'PENDING', label: 'En attente' },
  { value: 'CONFIRMED', label: 'Confirmée' },
  { value: 'PROCESSING', label: 'En préparation' },
  { value: 'SHIPPED', label: 'Expédiée' },
  { value: 'DELIVERED', label: 'Livrée' },
  { value: 'CANCELLED', label: 'Annulée' },
];

export const OrderDetail: React.FC = () => {
  const {} = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [status, setStatus] = useState(mockOrder.status);
  const [updating, setUpdating] = useState(false);

  const handleStatusUpdate = async () => {
    setUpdating(true);
    try {
      // TODO: Replace with GraphQL mutation
      await new Promise((resolve) => setTimeout(resolve, 1000));

      dispatch(addToast({ message: 'Statut de la commande mis à jour', type: 'success' }));
    } catch (error: any) {
      dispatch(addToast({ message: error.message || 'Erreur lors de la mise à jour', type: 'error' }));
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/orders')} icon={<ArrowLeft className="h-5 w-5" />}>
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Commande {mockOrder.orderNumber}</h1>
            <p className="text-gray-600 mt-1">Passée le {formatDateTime(mockOrder.createdAt)}</p>
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
                <CardTitle>Articles ({mockOrder.items.length})</CardTitle>
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
                  {mockOrder.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img
                            src={item.productImageUrl}
                            alt={item.productNameFr}
                            className="w-12 h-12 rounded object-cover"
                          />
                          <div>
                            <p className="font-medium">{item.productNameFr}</p>
                            <p className="text-sm text-gray-500">
                              {item.selectedSize} - {item.selectedColor}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{item.productSku}</TableCell>
                      <TableCell>{formatPrice(item.unitPrice)}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell className="font-semibold">
                        {formatPrice(item.unitPrice * item.quantity)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Order Summary */}
              <div className="border-t border-gray-200 p-6">
                <div className="space-y-2 max-w-sm ml-auto">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Sous-total</span>
                    <span className="font-medium">{formatPrice(mockOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Livraison</span>
                    <span className="font-medium">{formatPrice(mockOrder.shippingCost)}</span>
                  </div>
                  {mockOrder.discountAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Réduction</span>
                      <span className="font-medium text-green-600">
                        -{formatPrice(mockOrder.discountAmount)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total</span>
                    <span>{formatPrice(mockOrder.totalAmount)}</span>
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
                <p className="text-sm text-gray-600">Nom</p>
                <p className="font-medium">
                  {mockOrder.user.firstName} {mockOrder.user.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{mockOrder.user.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Téléphone</p>
                <p className="font-medium">{mockOrder.user.phoneNumber}</p>
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
                <p className="font-medium">{mockOrder.shippingFullName}</p>
                <p className="text-sm text-gray-600">{mockOrder.shippingPhone}</p>
              </div>
              <div>
                <p className="text-gray-900">{mockOrder.shippingAddress}</p>
                <p className="text-gray-600">
                  {mockOrder.shippingCity}, {mockOrder.shippingWilaya} {mockOrder.shippingPostalCode}
                </p>
              </div>
              {mockOrder.customerNotes && (
                <div className="pt-3 border-t">
                  <p className="text-sm text-gray-600 mb-1">Notes du client</p>
                  <p className="text-sm italic">{mockOrder.customerNotes}</p>
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
              {status !== mockOrder.status && (
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
                  {mockOrder.paymentMethod === 'CASH_ON_DELIVERY'
                    ? 'Paiement à la livraison'
                    : mockOrder.paymentMethod}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Statut</span>
                <Badge variant={mockOrder.paymentStatus === 'PAID' ? 'success' : 'warning'}>
                  {PAYMENT_STATUS_LABELS[mockOrder.paymentStatus as keyof typeof PAYMENT_STATUS_LABELS]}
                </Badge>
              </div>
              {mockOrder.paidAt && (
                <div>
                  <p className="text-sm text-gray-600">Payé le</p>
                  <p className="text-sm font-medium">{formatDateTime(mockOrder.paidAt)}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tracking */}
          {mockOrder.trackingNumber && (
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
                  <p className="font-mono font-medium">{mockOrder.trackingNumber}</p>
                </div>
                {mockOrder.shippedAt && (
                  <div>
                    <p className="text-sm text-gray-600">Expédié le</p>
                    <p className="text-sm">{formatDateTime(mockOrder.shippedAt)}</p>
                  </div>
                )}
                {mockOrder.deliveredAt && (
                  <div>
                    <p className="text-sm text-gray-600">Livré le</p>
                    <p className="text-sm">{formatDateTime(mockOrder.deliveredAt)}</p>
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
                    <p className="text-xs text-gray-500">{formatDateTime(mockOrder.createdAt)}</p>
                  </div>
                </div>
                {mockOrder.shippedAt && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-600 mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">Expédiée</p>
                      <p className="text-xs text-gray-500">{formatDateTime(mockOrder.shippedAt)}</p>
                    </div>
                  </div>
                )}
                {mockOrder.deliveredAt && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-600 mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">Livrée</p>
                      <p className="text-xs text-gray-500">{formatDateTime(mockOrder.deliveredAt)}</p>
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
