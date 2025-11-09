import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { Search, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { formatPrice, formatDate } from '../../lib/utils';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '../../constants';
import { AllOrdersDocument, CancelOrderDocument, OrdersByStatusDocument } from '../../graphql/generated/graphql';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { addToast } from '../../store/slices/uiSlice';
import { Select } from '../../components/ui/Select';

export const OrderList: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [page, setPage] = useState(0);
  const [size] = useState(20);
  const [orderToCancel, setOrderToCancel] = useState<{ id: number; orderNumber: string } | null>(null);
  const [statusFilter, setStatusFilter] = useState('');

  // Use filtered or all orders query
  const { data: allData, loading: allLoading, error: allError } = useQuery(AllOrdersDocument, {
    variables: { page, size },
    skip: statusFilter !== '',
  });

  const { data: filteredData, loading: filteredLoading, error: filteredError } = useQuery(OrdersByStatusDocument, {
    variables: { status: statusFilter, page, size },
    skip: statusFilter === '',
  });

  const data = statusFilter ? filteredData?.ordersByStatus : allData?.allOrders;
  const loading = statusFilter ? filteredLoading : allLoading;
  const error = statusFilter ? filteredError : allError;

  const [cancelOrder, { loading: cancelling }] = useMutation(CancelOrderDocument, {
    refetchQueries: [
      { query: AllOrdersDocument, variables: { page, size } },
      ...(statusFilter ? [{ query: OrdersByStatusDocument, variables: { status: statusFilter, page, size } }] : []),
    ],
  });

  const handleCancelClick = (id: number, orderNumber: string) => {
    setOrderToCancel({ id, orderNumber });
  };

  const handleCancelConfirm = async () => {
    if (!orderToCancel) return;

    try {
      await cancelOrder({
        variables: { id: orderToCancel.id },
      });

      dispatch(
        addToast({
          message: 'Commande annulée avec succès',
          type: 'success',
        })
      );
      setOrderToCancel(null);
    } catch (error: any) {
      console.error('Cancel order error:', error);
      dispatch(
        addToast({
          message: error.message || 'Erreur lors de l\'annulation',
          type: 'error',
        })
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Commandes</h1>
        <p className="text-gray-600 mt-1">Gérez toutes les commandes de la plateforme</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Rechercher une commande..."
              icon={<Search className="h-5 w-5" />}
            />
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
              options={[
                { value: '', label: 'Tous les statuts' },
                { value: 'PENDING', label: 'En attente' },
                { value: 'CONFIRMED', label: 'Confirmée' },
                { value: 'PROCESSING', label: 'En préparation' },
                { value: 'SHIPPED', label: 'Expédiée' },
                { value: 'DELIVERED', label: 'Livrée' },
                { value: 'CANCELLED', label: 'Annulée' },
              ]}
            />
            <Button variant="outline" onClick={() => { setStatusFilter(''); setPage(0); }}>
              Réinitialiser
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {loading ? 'Chargement...' : error ? 'Erreur' : `${data?.totalElements || 0} commandes`}
            {statusFilter && ` (statut: ${ORDER_STATUS_LABELS[statusFilter as keyof typeof ORDER_STATUS_LABELS]})`}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading && (
            <div className="flex items-center justify-center py-12">p
              <div className="text-gray-500">Chargement des commandes...</div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center py-12">
              <div className="text-red-500">Erreur: {error.message}</div>
            </div>
          )}

          {!loading && !error && data?.content && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N° Commande</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.content.map((order: any) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono font-medium">{order.orderNumber}</TableCell>
                    <TableCell>{order.userEmail || '-'}</TableCell>
                    <TableCell>{formatDate(String(order.createdAt))}</TableCell>
                    <TableCell className="font-semibold">{formatPrice(Number(order.totalAmount))}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ORDER_STATUS_COLORS[(order.status || 'PENDING') as keyof typeof ORDER_STATUS_COLORS]}`}>
                        {ORDER_STATUS_LABELS[(order.status || 'PENDING') as keyof typeof ORDER_STATUS_LABELS]}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/orders/${order.id}`)}
                        >
                          Détails
                        </Button>
                        {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCancelClick(Number(order.id), order.orderNumber || '')}
                            icon={<XCircle className="h-4 w-4 text-red-600" />}
                          />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        isOpen={orderToCancel !== null}
        onClose={() => setOrderToCancel(null)}
        onConfirm={handleCancelConfirm}
        title="Annuler la commande"
        message={`Êtes-vous sûr de vouloir annuler la commande "${orderToCancel?.orderNumber}" ? Cette action est irréversible.`}
        confirmText="Annuler la commande"
        cancelText="Retour"
        loading={cancelling}
      />
    </div>
  );
};
