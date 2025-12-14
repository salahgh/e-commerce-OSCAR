import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '../components/ui/Badge';
import {
  TrendingUp,
  ShoppingCart,
  Users,
  Package,
  AlertTriangle,
  Clock,
  Eye,
  ChevronRight,
  DollarSign,
  BarChart3,
  Calendar,
  RefreshCw,
} from 'lucide-react';
import { formatPrice, formatDateTime } from '../lib/utils';
import {
  KPICard,
  SalesLineChart,
  CategoryPieChart,
  TopProductsBarChart,
} from '../components/dashboard';
import { useDashboardData, type DateRange } from '../hooks/useDashboardData';

// Order status configuration
const ORDER_STATUS: Record<
  string,
  { label: string; variant: 'default' | 'success' | 'warning' | 'danger' | 'info' }
> = {
  AddingItems: { label: 'En cours', variant: 'default' },
  ArrangingPayment: { label: 'Paiement', variant: 'info' },
  PaymentAuthorized: { label: 'Autorisé', variant: 'info' },
  PaymentSettled: { label: 'Payé', variant: 'success' },
  PartiallyShipped: { label: 'Partiellement expédié', variant: 'warning' },
  Shipped: { label: 'Expédié', variant: 'info' },
  PartiallyDelivered: { label: 'Partiellement livré', variant: 'warning' },
  Delivered: { label: 'Livré', variant: 'success' },
  Modifying: { label: 'En modification', variant: 'warning' },
  ArrangingAdditionalPayment: { label: 'Paiement additionnel', variant: 'info' },
  Cancelled: { label: 'Annulé', variant: 'danger' },
};

const DATE_RANGE_OPTIONS: { value: DateRange; label: string }[] = [
  { value: '7d', label: '7 jours' },
  { value: '30d', label: '30 jours' },
  { value: '90d', label: '90 jours' },
];

export const Dashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    kpis,
    salesData,
    categoryData,
    topProducts,
    recentOrders,
    lowStockProducts,
    chartsLoading,
    kpisLoading,
    recentOrdersLoading,
    lowStockLoading,
  } = useDashboardData(dateRange);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Trigger refetch by toggling date range
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header with Date Range Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tableau de bord</h1>
          <p className="text-muted-foreground mt-1">Vue d'ensemble de la plateforme OSCAR Fashion</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Date Range Toggle */}
          <div className="flex items-center bg-card rounded-lg p-1 border border-border">
            {DATE_RANGE_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setDateRange(option.value)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  dateRange === option.value
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing || kpisLoading}
            className="p-2 bg-card border border-border rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all disabled:opacity-50"
          >
            <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Revenu Total"
          value={kpis.totalRevenue / 100}
          icon={<DollarSign className="h-6 w-6" />}
          iconBgColor="bg-blue-500/20"
          iconColor="text-blue-400"
          trend={kpis.trends.revenue}
          subtitle={`Panier moyen: ${formatPrice(kpis.averageOrderValue / 100)}`}
          isCurrency
          loading={kpisLoading}
        />
        <KPICard
          title="Commandes"
          value={kpis.totalOrders}
          icon={<ShoppingCart className="h-6 w-6" />}
          iconBgColor="bg-green-500/20"
          iconColor="text-green-400"
          trend={kpis.trends.orders}
          subtitle={`${kpis.pendingOrders} en attente`}
          loading={kpisLoading}
        />
        <KPICard
          title="Clients"
          value={kpis.totalCustomers}
          icon={<Users className="h-6 w-6" />}
          iconBgColor="bg-purple-500/20"
          iconColor="text-purple-400"
          trend={kpis.trends.customers}
          subtitle="Clients enregistrés"
          loading={kpisLoading}
        />
        <KPICard
          title="Taux de conversion"
          value={`${kpis.conversionRate.toFixed(1)}%`}
          icon={<BarChart3 className="h-6 w-6" />}
          iconBgColor="bg-orange-500/20"
          iconColor="text-orange-400"
          trend={kpis.trends.aov}
          subtitle={`${kpis.lowStockCount} produits stock bas`}
          loading={kpisLoading}
        />
      </div>

      {/* Sales Evolution Chart - Full Width */}
      <SalesLineChart data={salesData} loading={chartsLoading} />

      {/* Two Column Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryPieChart data={categoryData} loading={chartsLoading} />
        <TopProductsBarChart data={topProducts} loading={chartsLoading} metric="revenue" />
      </div>

      {/* Recent Orders & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders - Takes 2 columns */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border">
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-400" />
              Commandes Récentes
            </h3>
            <Link
              to="/orders"
              className="text-sm text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
            >
              Voir tout <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="p-6">
            {recentOrdersLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                    <div className="h-10 w-24 bg-muted rounded" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-32 bg-muted rounded" />
                      <div className="h-3 w-48 bg-muted rounded" />
                    </div>
                    <div className="h-6 w-20 bg-muted rounded" />
                  </div>
                ))}
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <ShoppingCart className="h-12 w-12 mb-3 opacity-50" />
                <p className="font-medium">Aucune commande</p>
                <p className="text-sm">Les nouvelles commandes apparaîtront ici</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => {
                  const statusConfig = ORDER_STATUS[order.state] || {
                    label: order.state,
                    variant: 'default' as const,
                  };
                  return (
                    <Link
                      key={order.id}
                      to={`/orders/${order.id}`}
                      className="flex items-center justify-between p-4 bg-accent/30 rounded-lg hover:bg-accent/50 transition-all group border border-transparent hover:border-muted-foreground/30"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-muted rounded-lg px-3 py-2">
                          <span className="font-mono text-sm text-muted-foreground">#{order.code}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                              {order.customerName}
                            </span>
                            <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {order.wilaya && <span>{order.wilaya} • </span>}
                            {order.orderPlacedAt && formatDateTime(order.orderPlacedAt)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-foreground">
                          {formatPrice(order.totalWithTax)}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-card rounded-xl border border-border">
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-400" />
              Alertes Stock
            </h3>
            <Link
              to="/products"
              className="text-sm text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
            >
              Voir tout <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="p-6">
            {lowStockLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse p-3 bg-orange-900/20 rounded-lg">
                    <div className="h-4 w-32 bg-orange-800/50 rounded mb-2" />
                    <div className="h-3 w-20 bg-orange-800/50 rounded" />
                  </div>
                ))}
              </div>
            ) : lowStockProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Package className="h-12 w-12 mb-3 opacity-50" />
                <p className="font-medium text-success">Stock OK</p>
                <p className="text-sm">Tous les produits ont un stock suffisant</p>
              </div>
            ) : (
              <div className="space-y-3">
                {lowStockProducts.map((product) => {
                  const stockLevel = product.stockOnHand;
                  const isCritical = stockLevel === 0;
                  const isLow = stockLevel < 5;

                  return (
                    <Link
                      key={product.id}
                      to={`/products/${product.id}`}
                      className={`block p-4 rounded-lg transition-all border ${
                        isCritical
                          ? 'bg-red-900/20 border-red-700/50 hover:bg-red-900/30'
                          : isLow
                            ? 'bg-orange-900/20 border-orange-700/50 hover:bg-orange-900/30'
                            : 'bg-yellow-900/20 border-yellow-700/50 hover:bg-yellow-900/30'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">{product.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{product.sku}</p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <span
                            className={`text-sm font-bold ${
                              isCritical
                                ? 'text-red-400'
                                : isLow
                                  ? 'text-orange-400'
                                  : 'text-yellow-400'
                            }`}
                          >
                            {stockLevel}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            / {product.minStock}
                          </span>
                        </div>
                      </div>
                      {/* Stock bar */}
                      <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isCritical
                              ? 'bg-red-500'
                              : isLow
                                ? 'bg-orange-500'
                                : 'bg-yellow-500'
                          }`}
                          style={{
                            width: `${Math.min((stockLevel / product.minStock) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </Link>
                  );
                })}
                {lowStockProducts.length > 10 && (
                  <p className="text-sm text-muted-foreground text-center pt-2">
                    Et {lowStockProducts.length - 10} autres produits...
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Actions Rapides</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/products"
            className="flex flex-col items-center p-4 bg-blue-500/10 rounded-xl hover:bg-blue-500/20 transition-all border border-blue-500/20 hover:border-blue-500/40 group"
          >
            <Package className="h-8 w-8 text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-foreground">Gérer Produits</span>
          </Link>
          <Link
            to="/orders"
            className="flex flex-col items-center p-4 bg-green-500/10 rounded-xl hover:bg-green-500/20 transition-all border border-green-500/20 hover:border-green-500/40 group"
          >
            <ShoppingCart className="h-8 w-8 text-green-400 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-foreground">Commandes</span>
          </Link>
          <Link
            to="/customers"
            className="flex flex-col items-center p-4 bg-purple-500/10 rounded-xl hover:bg-purple-500/20 transition-all border border-purple-500/20 hover:border-purple-500/40 group"
          >
            <Users className="h-8 w-8 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-foreground">Clients</span>
          </Link>
          <Link
            to="/categories"
            className="flex flex-col items-center p-4 bg-orange-500/10 rounded-xl hover:bg-orange-500/20 transition-all border border-orange-500/20 hover:border-orange-500/40 group"
          >
            <TrendingUp className="h-8 w-8 text-orange-400 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-foreground">Catégories</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
