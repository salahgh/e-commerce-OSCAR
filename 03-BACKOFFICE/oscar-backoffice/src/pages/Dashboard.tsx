import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { LineChart } from '@mui/x-charts/LineChart';
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';
import { TrendingUp, ShoppingCart, Users, Package } from 'lucide-react';
import { formatPrice } from '../lib/utils';

// Mock data - TODO: Replace with GraphQL queries
const mockStats = {
  totalRevenue: 2584000,
  revenueGrowth: 12.5,
  totalOrders: 156,
  ordersGrowth: 8.3,
  totalCustomers: 1243,
  customersGrowth: 15.2,
  totalProducts: 35,
  lowStockProducts: 5,
};

const revenueData = {
  xAxis: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
  series: [258000, 312000, 285000, 425000, 398000, 458000],
};

const ordersStatusData = [
  { id: 'pending', label: 'En attente', value: 12 },
  { id: 'confirmed', label: 'Confirmées', value: 24 },
  { id: 'processing', label: 'En préparation', value: 18 },
  { id: 'shipped', label: 'Expédiées', value: 32 },
  { id: 'delivered', label: 'Livrées', value: 67 },
  { id: 'cancelled', label: 'Annulées', value: 3 },
];

const topProducts = [
  { name: 'T-Shirt Classique Noir', sales: 245 },
  { name: 'Jean Slim Bleu', sales: 189 },
  { name: 'Robe Florale Été', sales: 167 },
  { name: 'Hijab Jersey', sales: 234 },
];

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
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Vue d'ensemble de la plateforme</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Revenu Total"
          value={formatPrice(mockStats.totalRevenue)}
          growth={mockStats.revenueGrowth}
          icon={<TrendingUp className="h-6 w-6 text-blue-600" />}
          iconBg="bg-blue-100"
        />
        <StatCard
          title="Commandes"
          value={mockStats.totalOrders.toString()}
          growth={mockStats.ordersGrowth}
          icon={<ShoppingCart className="h-6 w-6 text-green-600" />}
          iconBg="bg-green-100"
        />
        <StatCard
          title="Clients"
          value={mockStats.totalCustomers.toString()}
          growth={mockStats.customersGrowth}
          icon={<Users className="h-6 w-6 text-purple-600" />}
          iconBg="bg-purple-100"
        />
        <StatCard
          title="Produits"
          value={mockStats.totalProducts.toString()}
          growth={0}
          icon={<Package className="h-6 w-6 text-orange-600" />}
          iconBg="bg-orange-100"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Évolution du Revenu</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart
              xAxis={[{ data: [0, 1, 2, 3, 4, 5], scaleType: 'point' }]}
              series={[
                {
                  data: revenueData.series,
                  label: 'Revenu (DZD)',
                  color: '#2563eb',
                },
              ]}
              height={300}
            />
          </CardContent>
        </Card>

        {/* Orders Status Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Statut des Commandes</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChart
              series={[
                {
                  data: ordersStatusData,
                },
              ]}
              height={300}
            />
          </CardContent>
        </Card>
      </div>

      {/* Top Products Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Produits les Plus Vendus</CardTitle>
        </CardHeader>
        <CardContent>
          <BarChart
            xAxis={[{ data: [0, 1, 2, 3], scaleType: 'band' }]}
            series={[
              {
                data: topProducts.map((p) => p.sales),
                label: 'Ventes',
                color: '#10b981',
              },
            ]}
            height={300}
          />
        </CardContent>
      </Card>
    </div>
  );
};
