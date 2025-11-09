import React, { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { LineChart } from '@mui/x-charts/LineChart';
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';
import { TrendingUp, ShoppingCart, Users, Package, AlertTriangle } from 'lucide-react';
import { formatPrice } from '../lib/utils';
import { Spinner } from '../components/ui/Spinner';
import {
  ProductsDocument,
  AllOrdersDocument,
  UsersDocument,
  LowStockProductsDocument,
  PopularProductsDocument,
} from '../graphql/generated/graphql';

const StatCard: React.FC<{
  title: string;
  value: string;
  growth: number;
  icon: React.ReactNode;
  iconBg: string;
}> = ({ title, value, growth, icon, iconBg }) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-600 font-medium">+{growth}%</span>
            <span className="text-sm text-gray-500">vs mois dernier</span>
          </div>
        </div>
        <div className={`p-3 rounded-lg ${iconBg}`}>{icon}</div>
      </div>
    </CardContent>
  </Card>
);

export const Dashboard: React.FC = () => {
  // Fetch data from GraphQL
  const { data: productsData, loading: productsLoading } = useQuery(ProductsDocument, {
    variables: { page: 0, size: 1, sortBy: 'createdAt', sortDirection: 'DESC' },
  });

  const { data: ordersData, loading: ordersLoading } = useQuery(AllOrdersDocument, {
    variables: { page: 0, size: 100 },
  });

  const { data: usersData, loading: usersLoading } = useQuery(UsersDocument, {
    variables: { page: 0, size: 1, sortBy: 'createdAt', sortDirection: 'DESC' },
  });

  const { data: lowStockData, loading: lowStockLoading } = useQuery(LowStockProductsDocument, {
    variables: { threshold: 10 },
  });

  const { data: popularProductsData, loading: popularLoading } = useQuery(PopularProductsDocument, {
    variables: { page: 0, size: 5 },
  });

  // Calculate stats from real data
  const stats = useMemo(() => {
    const orders = ordersData?.allOrders?.content || [];
    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);

    // Count orders by status for pie chart
    const statusCounts = orders.reduce((acc, order) => {
      const status = order.status || 'PENDING';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const ordersStatusData = [
      { id: 'PENDING', label: 'En attente', value: statusCounts.PENDING || 0 },
      { id: 'CONFIRMED', label: 'Confirmées', value: statusCounts.CONFIRMED || 0 },
      { id: 'PROCESSING', label: 'En préparation', value: statusCounts.PROCESSING || 0 },
      { id: 'SHIPPED', label: 'Expédiées', value: statusCounts.SHIPPED || 0 },
      { id: 'DELIVERED', label: 'Livrées', value: statusCounts.DELIVERED || 0 },
      { id: 'CANCELLED', label: 'Annulées', value: statusCounts.CANCELLED || 0 },
    ];

    return {
      totalRevenue,
      totalOrders: ordersData?.allOrders?.totalElements || 0,
      totalCustomers: usersData?.users?.totalElements || 0,
      totalProducts: productsData?.products?.totalElements || 0,
      lowStockCount: lowStockData?.lowStockProducts?.length || 0,
      ordersStatusData,
    };
  }, [ordersData, usersData, productsData, lowStockData]);

  const isLoading = productsLoading || ordersLoading || usersLoading || lowStockLoading || popularLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Vue d'ensemble de la plateforme</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard
          title="Revenu Total"
          value={formatPrice(stats.totalRevenue)}
          growth={0}
          icon={<TrendingUp className="h-6 w-6 text-blue-600" />}
          iconBg="bg-blue-100"
        />
        <StatCard
          title="Commandes"
          value={stats.totalOrders.toString()}
          growth={0}
          icon={<ShoppingCart className="h-6 w-6 text-green-600" />}
          iconBg="bg-green-100"
        />
        <StatCard
          title="Clients"
          value={stats.totalCustomers.toString()}
          growth={0}
          icon={<Users className="h-6 w-6 text-purple-600" />}
          iconBg="bg-purple-100"
        />
        <StatCard
          title="Produits"
          value={stats.totalProducts.toString()}
          growth={0}
          icon={<Package className="h-6 w-6 text-orange-600" />}
          iconBg="bg-orange-100"
        />
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Stock Faible</p>
                <h3 className="text-2xl font-bold text-red-600">{stats.lowStockCount}</h3>
                <p className="text-xs text-gray-500 mt-2">Produits à réapprovisionner</p>
              </div>
              <div className="p-3 rounded-lg bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders Status Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Statut des Commandes</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.ordersStatusData.some((s) => s.value > 0) ? (
              <PieChart
                series={[
                  {
                    data: stats.ordersStatusData.filter((s) => s.value > 0),
                  },
                ]}
                height={300}
              />
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                Aucune commande disponible
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Products */}
        <Card>
          <CardHeader>
            <CardTitle>Produits en Stock Faible</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lowStockData?.lowStockProducts && lowStockData.lowStockProducts.length > 0 ? (
                lowStockData.lowStockProducts.slice(0, 5).map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{product.nameFr}</p>
                      <p className="text-sm text-gray-600">SKU: {product.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-red-600">{product.stockQuantity}</p>
                      <p className="text-xs text-gray-500">unités</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">Tous les produits ont un stock suffisant</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Products Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Produits les Plus Populaires</CardTitle>
        </CardHeader>
        <CardContent>
          {popularProductsData?.popularProducts?.content && popularProductsData.popularProducts.content.length > 0 ? (
            <BarChart
              xAxis={[
                {
                  data: popularProductsData.popularProducts.content.map((_, i) => i),
                  scaleType: 'band',
                },
              ]}
              series={[
                {
                  data: popularProductsData.popularProducts.content.map((p) => p.viewCount || 0),
                  label: 'Vues',
                  color: '#10b981',
                },
              ]}
              height={300}
            />
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              Aucune donnée de popularité disponible
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
