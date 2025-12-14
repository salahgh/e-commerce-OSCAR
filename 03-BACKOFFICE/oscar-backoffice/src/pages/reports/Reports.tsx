import React, { useState, useMemo } from 'react';
import { useQuery } from '@apollo/client';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Package,
  ShoppingBag,
  Users,
  DollarSign,
  Calendar,
  MapPin,
  AlertTriangle,
  Eye,
  Download,
  FileText,
} from 'lucide-react';
import {
  SalesReportOrdersDocument,
  TopSellingProductsDocument,
  LowStockVariantsDocument,
  CustomersReportDocument,
} from '../../graphql/generated/graphql';
import { Tabs } from '../../components/ui/Tabs';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { formatPrice, formatDate } from '../../lib/utils';
import { exportToCSV, formatDateForExport, formatCurrencyForExport } from '../../lib/export-utils';

// Date range options
const DATE_RANGES = [
  { value: '7', label: '7 derniers jours' },
  { value: '30', label: '30 derniers jours' },
  { value: '90', label: '3 derniers mois' },
  { value: '365', label: 'Cette année' },
];

export const Reports: React.FC = () => {
  const [dateRange, setDateRange] = useState('30');

  // Calculate date filter
  const dateFilter = useMemo(() => {
    const now = new Date();
    const days = parseInt(dateRange, 10);
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    return startDate.toISOString();
  }, [dateRange]);

  // Queries
  const { data: ordersData, loading: ordersLoading } = useQuery(SalesReportOrdersDocument, {
    variables: {
      options: {
        take: 500,
        filter: {
          orderPlacedAt: { after: dateFilter },
        },
        sort: { orderPlacedAt: 'DESC' as any },
      },
    },
  });

  const { data: productsData, loading: productsLoading } = useQuery(TopSellingProductsDocument, {
    variables: {
      options: {
        take: 10,
        sort: { createdAt: 'DESC' as any },
      },
    },
  });

  const { data: lowStockData, loading: lowStockLoading } = useQuery(LowStockVariantsDocument, {
    variables: {
      options: {
        take: 20,
        filter: {
          stockOnHand: { lt: 10 },
        },
      },
    },
  });

  const { data: customersData, loading: customersLoading } = useQuery(CustomersReportDocument, {
    variables: {
      options: {
        take: 100,
        filter: {
          createdAt: { after: dateFilter },
        },
        sort: { createdAt: 'DESC' as any },
      },
    },
  });

  const orders = ordersData?.orders?.items || [];
  const products = productsData?.products?.items || [];
  const lowStockVariants = lowStockData?.productVariants?.items || [];
  const newCustomers = customersData?.customers?.items || [];

  // Calculate sales metrics
  const salesMetrics = useMemo(() => {
    const completedOrders = orders.filter((o) =>
      ['PaymentSettled', 'Shipped', 'Delivered'].includes(o.state)
    );
    const totalRevenue = completedOrders.reduce((sum, o) => sum + o.totalWithTax, 0);
    const averageOrderValue =
      completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;

    // Group by state
    const ordersByState: Record<string, number> = {};
    orders.forEach((o) => {
      ordersByState[o.state] = (ordersByState[o.state] || 0) + 1;
    });

    // Group by wilaya
    const ordersByWilaya: Record<string, { count: number; revenue: number }> = {};
    orders.forEach((o) => {
      const wilaya = o.customFields?.wilaya || 'Non spécifié';
      if (!ordersByWilaya[wilaya]) {
        ordersByWilaya[wilaya] = { count: 0, revenue: 0 };
      }
      ordersByWilaya[wilaya].count++;
      ordersByWilaya[wilaya].revenue += o.totalWithTax;
    });

    // Top wilayas
    const topWilayas = Object.entries(ordersByWilaya)
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 5);

    return {
      totalOrders: orders.length,
      completedOrders: completedOrders.length,
      totalRevenue,
      averageOrderValue,
      ordersByState,
      topWilayas,
    };
  }, [orders]);

  // Product performance
  const productPerformance = useMemo(() => {
    // Count product sales from order lines
    const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};

    orders.forEach((order) => {
      order.lines?.forEach((line) => {
        const productId = line.productVariant?.product?.id;
        const productName = line.productVariant?.product?.name || 'Unknown';
        if (productId) {
          if (!productSales[productId]) {
            productSales[productId] = { name: productName, quantity: 0, revenue: 0 };
          }
          productSales[productId].quantity += line.quantity;
          productSales[productId].revenue += line.linePriceWithTax;
        }
      });
    });

    return Object.entries(productSales)
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 10);
  }, [orders]);

  // Export functions
  const handleExportSalesCSV = () => {
    const data = orders.map((order) => ({
      'Code Commande': order.code,
      Date: formatDateForExport(order.orderPlacedAt),
      Client: order.customer ? `${order.customer.firstName} ${order.customer.lastName}` : 'Anonyme',
      Email: order.customer?.emailAddress || '-',
      Wilaya: order.customFields?.wilaya || '-',
      Statut: order.state,
      'Nombre Articles': order.lines?.reduce((sum, l) => sum + l.quantity, 0) || 0,
      'Total TTC': formatCurrencyForExport(order.totalWithTax / 100),
    }));
    const dateLabel = DATE_RANGES.find((r) => r.value === dateRange)?.label || dateRange;
    exportToCSV(data, `rapport-ventes-${dateLabel.replace(/\s/g, '-')}`);
  };

  const handleExportProductsCSV = () => {
    const data = productPerformance.map(([_, product], index) => ({
      Rang: index + 1,
      Produit: product.name,
      'Quantité Vendue': product.quantity,
      "Chiffre d'Affaires": formatCurrencyForExport(product.revenue / 100),
    }));
    exportToCSV(data, 'rapport-produits-top-ventes');
  };

  const handleExportStockCSV = () => {
    const data = lowStockVariants.map((variant) => ({
      Produit: variant.product?.name || '-',
      Variante: variant.name,
      SKU: variant.sku,
      'Stock Actuel': variant.stockOnHand,
      'Seuil Alerte': variant.customFields?.minStockAlert || 5,
      Statut:
        variant.stockOnHand <= 0
          ? 'Rupture'
          : variant.stockOnHand <= (variant.customFields?.minStockAlert || 5)
            ? 'Stock Faible'
            : 'OK',
    }));
    exportToCSV(data, 'rapport-alertes-stock');
  };

  const handleExportWilayasCSV = () => {
    const data = salesMetrics.topWilayas.map(([wilaya, stats], index) => ({
      Rang: index + 1,
      Wilaya: wilaya,
      'Nombre Commandes': stats.count,
      "Chiffre d'Affaires": formatCurrencyForExport(stats.revenue / 100),
    }));
    exportToCSV(data, 'rapport-ventes-par-wilaya');
  };

  const tabs = [
    {
      id: 'sales',
      label: 'Ventes',
      icon: <BarChart3 className="h-4 w-4" />,
      content: (
        <div className="space-y-6">
          {/* Date Range Selector */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h3 className="text-lg font-semibold text-foreground">Rapport des Ventes</h3>
            <div className="flex items-center gap-3">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
              >
                {DATE_RANGES.map((range) => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportSalesCSV}
                disabled={orders.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>

          {ordersLoading ? (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          ) : (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Chiffre d'affaires</p>
                      <p className="text-2xl font-bold mt-1">
                        {formatPrice(salesMetrics.totalRevenue)}
                      </p>
                    </div>
                    <DollarSign className="h-10 w-10 text-blue-200" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">Commandes</p>
                      <p className="text-2xl font-bold mt-1">{salesMetrics.totalOrders}</p>
                    </div>
                    <ShoppingBag className="h-10 w-10 text-green-200" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm">Panier moyen</p>
                      <p className="text-2xl font-bold mt-1">
                        {formatPrice(salesMetrics.averageOrderValue)}
                      </p>
                    </div>
                    <TrendingUp className="h-10 w-10 text-purple-200" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm">Nouveaux clients</p>
                      <p className="text-2xl font-bold mt-1">{newCustomers.length}</p>
                    </div>
                    <Users className="h-10 w-10 text-orange-200" />
                  </div>
                </div>
              </div>

              {/* Orders by State */}
              <div className="bg-muted/50 rounded-lg p-6">
                <h4 className="font-medium text-foreground mb-4">Statut des commandes</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(salesMetrics.ordersByState).map(([state, count]) => (
                    <div key={state} className="bg-card p-4 rounded-lg border border-border">
                      <p className="text-sm text-muted-foreground">{state}</p>
                      <p className="text-xl font-bold text-foreground">{count}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Wilayas */}
              <div className="bg-muted/50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-foreground flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    Top Wilayas
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleExportWilayasCSV}
                    disabled={salesMetrics.topWilayas.length === 0}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    CSV
                  </Button>
                </div>
                <div className="space-y-3">
                  {salesMetrics.topWilayas.map(([wilaya, data], index) => (
                    <div
                      key={wilaya}
                      className="flex items-center justify-between bg-card p-3 rounded-lg border border-border"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-blue-900/50 text-blue-400 flex items-center justify-center font-bold text-sm">
                          {index + 1}
                        </span>
                        <span className="font-medium text-foreground">{wilaya}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">{formatPrice(data.revenue)}</p>
                        <p className="text-sm text-muted-foreground">{data.count} commandes</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      ),
    },
    {
      id: 'products',
      label: 'Produits',
      icon: <Package className="h-4 w-4" />,
      content: (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Performance des Produits</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportProductsCSV}
              disabled={productPerformance.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>

          {productsLoading || ordersLoading ? (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          ) : (
            <>
              {/* Top Selling Products */}
              <div className="bg-muted/50 rounded-lg p-6">
                <h4 className="font-medium text-foreground mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Meilleures ventes
                </h4>
                {productPerformance.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    Aucune vente dans cette période
                  </p>
                ) : (
                  <div className="space-y-3">
                    {productPerformance.map(([productId, data], index) => (
                      <div
                        key={productId}
                        className="flex items-center justify-between bg-card p-4 rounded-lg border border-border"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-full bg-green-900/50 text-green-400 flex items-center justify-center font-bold text-sm">
                            {index + 1}
                          </span>
                          <div>
                            <p className="font-medium text-foreground">{data.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {data.quantity} unités vendues
                            </p>
                          </div>
                        </div>
                        <p className="font-semibold text-foreground">{formatPrice(data.revenue)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Most Viewed Products */}
              <div className="bg-muted/50 rounded-lg p-6">
                <h4 className="font-medium text-foreground mb-4 flex items-center gap-2">
                  <Eye className="h-5 w-5 text-blue-500" />
                  Produits les plus consultés
                </h4>
                <div className="space-y-3">
                  {products
                    .filter((p) => p.customFields?.viewCount && p.customFields.viewCount > 0)
                    .sort(
                      (a, b) => (b.customFields?.viewCount || 0) - (a.customFields?.viewCount || 0)
                    )
                    .slice(0, 5)
                    .map((product, index) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between bg-card p-4 rounded-lg border border-border"
                      >
                        <div className="flex items-center gap-3">
                          {product.featuredAsset?.preview ? (
                            <img
                              src={product.featuredAsset.preview}
                              alt={product.name}
                              className="w-10 h-10 rounded object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                              <Package className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-foreground">{product.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {product.customFields?.nameFr || product.slug}
                            </p>
                          </div>
                        </div>
                        <Badge variant="info">
                          <Eye className="h-3 w-3 mr-1" />
                          {product.customFields?.viewCount} vues
                        </Badge>
                      </div>
                    ))}
                  {products.filter((p) => p.customFields?.viewCount).length === 0 && (
                    <p className="text-muted-foreground text-center py-4">
                      Aucune donnée de vue disponible
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      ),
    },
    {
      id: 'inventory',
      label: 'Stock',
      icon: <AlertTriangle className="h-4 w-4" />,
      content: (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Alertes Stock</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportStockCSV}
              disabled={lowStockVariants.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>

          {lowStockLoading ? (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          ) : lowStockVariants.length === 0 ? (
            <div className="text-center py-8 bg-green-900/30 rounded-lg">
              <Package className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <p className="text-green-400 font-medium">Tous les stocks sont suffisants</p>
              <p className="text-green-500 text-sm mt-1">
                Aucun produit en rupture ou stock faible
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {lowStockVariants.map((variant) => {
                const isOutOfStock = variant.stockOnHand <= 0;
                const isCritical =
                  variant.stockOnHand <= (variant.customFields?.minStockAlert || 5);

                return (
                  <div
                    key={variant.id}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      isOutOfStock
                        ? 'bg-red-900/30 border-red-700'
                        : isCritical
                          ? 'bg-amber-900/30 border-amber-700'
                          : 'bg-card border-border'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {variant.product?.featuredAsset?.preview ? (
                        <img
                          src={variant.product.featuredAsset.preview}
                          alt={variant.name}
                          className="w-12 h-12 rounded object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded bg-muted flex items-center justify-center">
                          <Package className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-foreground">{variant.product?.name}</p>
                        <p className="text-sm text-muted-foreground">SKU: {variant.sku}</p>
                        <p className="text-xs text-muted-foreground">{variant.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={isOutOfStock ? 'danger' : isCritical ? 'warning' : 'default'}>
                        {isOutOfStock ? 'Rupture' : `${variant.stockOnHand} en stock`}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">
                        Alerte: {variant.customFields?.minStockAlert || 5}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Rapports</h1>
        <p className="text-muted-foreground mt-1">Analysez les performances de votre boutique</p>
      </div>

      {/* Tabs */}
      <div className="bg-card rounded-lg shadow">
        <Tabs tabs={tabs} defaultTab="sales" />
      </div>
    </div>
  );
};
