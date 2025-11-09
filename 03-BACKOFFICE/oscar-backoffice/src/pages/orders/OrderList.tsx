import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { formatPrice, formatDate } from '../../lib/utils';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '../../constants';
import { graphql } from '../../graphql/generated';

const ORDERS_QUERY = graphql(`
  query AllOrders($page: Int, $size: Int) {
    allOrders(page: $page, size: $size) {
      content {
        id
        orderNumber
        userEmail
        status
        totalAmount
        createdAt
      }
      totalElements
      totalPages
    }
  }
`);

export const OrderList: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [size] = useState(20);

  const { data, loading, error } = useQuery(ORDERS_QUERY, {
    variables: { page, size },
  });

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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Rechercher une commande..."
              icon={<Search className="h-5 w-5" />}
            />
            <select className="px-3 py-2 border border-gray-300 rounded-lg">
              <option value="">Tous les statuts</option>
              <option value="PENDING">En attente</option>
              <option value="CONFIRMED">Confirmée</option>
              <option value="PROCESSING">En préparation</option>
              <option value="SHIPPED">Expédiée</option>
              <option value="DELIVERED">Livrée</option>
              <option value="CANCELLED">Annulée</option>
            </select>
            <Button variant="outline">Filtrer</Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {loading ? 'Chargement...' : error ? 'Erreur' : `${data?.allOrders?.totalElements || 0} commandes`}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">Chargement des commandes...</div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center py-12">
              <div className="text-red-500">Erreur: {error.message}</div>
            </div>
          )}

          {!loading && !error && data?.allOrders?.content && (
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
                {data.allOrders.content.map((order) => (
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/orders/${order.id}`)}
                      >
                        Détails
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
