import React, { useState, useMemo } from 'react';
import { useQuery } from '@apollo/client';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
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
  UserPlus,
  UserCheck,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Box,
  RefreshCw,
} from 'lucide-react';
import {
  SalesReportOrdersDocument,
  TopSellingProductsDocument,
  LowStockVariantsDocument,
  CustomersReportDocument,
  StockOverviewDocument,
  CategoriesForReportDocument,
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
  { value: '180', label: '6 derniers mois' },
  { value: '365', label: 'Cette année' },
];

// Chart colors
const COLORS = [
  '#3b82f6', // blue
  '#22c55e', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
  '#84cc16', // lime
  '#6366f1', // indigo
];

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label, formatter }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border rounded-lg p-3 shadow-xl">
        <p className="text-muted-foreground text-sm mb-2">{label}</p>
        <div className="space-y-1">
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm flex items-center gap-2" style={{ color: entry.color }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              {entry.name}: <span className="font-semibold text-foreground">
                {formatter ? formatter(entry.value) : entry.value}
              </span>
            </p>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

// Pie chart tooltip
const PieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-popover border border-border rounded-lg p-3 shadow-xl">
        <p className="text-foreground font-medium mb-1">{data.name}</p>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            Revenus: <span className="text-foreground font-semibold">{formatPrice(data.value)}</span>
          </p>
          {data.count !== undefined && (
            <p className="text-sm text-muted-foreground">
              Commandes: <span className="text-foreground font-semibold">{data.count}</span>
            </p>
          )}
          {data.percentage !== undefined && (
            <p className="text-sm text-muted-foreground">
              Part: <span className="text-foreground font-semibold">{data.percentage.toFixed(1)}%</span>
            </p>
          )}
        </div>
      </div>
    );
  }
  return null;
};

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
        take: 1000,
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
        take: 50,
        sort: { createdAt: 'DESC' as any },
      },
    },
  });

  // stockOnHand lives on StockLevel, not ProductVariant, so it can't be used
  // as a ProductVariantFilterParameter. Fetch a generous slice and filter
  // client-side (the low-stock computation below already does this).
  const { data: lowStockData, loading: lowStockLoading } = useQuery(LowStockVariantsDocument, {
    variables: {
      options: {
        take: 200,
      },
    },
  });

  const { data: customersData, loading: customersLoading } = useQuery(CustomersReportDocument, {
    variables: {
      options: {
        take: 500,
        sort: { createdAt: 'DESC' as any },
      },
    },
  });

  const { data: stockData, loading: stockLoading } = useQuery(StockOverviewDocument, {
    variables: {
      options: {
        take: 500,
      },
    },
  });

  const orders = ordersData?.orders?.items || [];
  const products = productsData?.products?.items || [];
  const lowStockVariants = lowStockData?.productVariants?.items || [];
  const allCustomers = customersData?.customers?.items || [];
  const allVariants = stockData?.productVariants?.items || [];

  // Calculate sales metrics
  const salesMetrics = useMemo(() => {
    const completedOrders = orders.filter((o) =>
      ['PaymentSettled', 'Shipped', 'Delivered'].includes(o.state)
    );
    const totalRevenue = completedOrders.reduce((sum, o) => sum + o.totalWithTax, 0);
    const averageOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;

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
      .slice(0, 10);

    return {
      totalOrders: orders.length,
      completedOrders: completedOrders.length,
      totalRevenue,
      averageOrderValue,
      ordersByState,
      topWilayas,
    };
  }, [orders]);

  // Sales by period chart data
  const salesByPeriodData = useMemo(() => {
    const days = parseInt(dateRange, 10);
    const groupedByDate: Record<string, { revenue: number; orders: number }> = {};

    orders.forEach((order) => {
      const date = order.orderPlacedAt
        ? new Date(order.orderPlacedAt).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
          })
        : 'N/A';

      if (!groupedByDate[date]) {
        groupedByDate[date] = { revenue: 0, orders: 0 };
      }
      if (['PaymentSettled', 'Shipped', 'Delivered'].includes(order.state)) {
        groupedByDate[date].revenue += order.totalWithTax;
      }
      groupedByDate[date].orders++;
    });

    return Object.entries(groupedByDate)
      .map(([date, data]) => ({
        date,
        revenue: data.revenue,
        orders: data.orders,
      }))
      .reverse()
      .slice(-Math.min(days, 30)); // Show up to 30 data points
  }, [orders, dateRange]);

  // Sales by category
  const salesByCategory = useMemo(() => {
    const categoryData: Record<string, { revenue: number; count: number }> = {};

    orders.forEach((order) => {
      order.lines?.forEach((line) => {
        const facets = line.productVariant?.product?.facetValues || [];
        const categoryFacet = facets.find((f) => f.facet?.code === 'category');
        const categoryName = categoryFacet?.name || 'Non catégorisé';

        if (!categoryData[categoryName]) {
          categoryData[categoryName] = { revenue: 0, count: 0 };
        }
        categoryData[categoryName].revenue += line.linePriceWithTax;
        categoryData[categoryName].count++;
      });
    });

    const total = Object.values(categoryData).reduce((sum, d) => sum + d.revenue, 0);

    return Object.entries(categoryData)
      .map(([name, data]) => ({
        name,
        value: data.revenue,
        count: data.count,
        percentage: total > 0 ? (data.revenue / total) * 100 : 0,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [orders]);

  // Product performance
  const productPerformance = useMemo(() => {
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

  // Customer metrics
  const customerMetrics = useMemo(() => {
    const dateFilterObj = new Date(dateFilter);

    // New customers in period
    const newCustomers = allCustomers.filter((c) => new Date(c.createdAt) >= dateFilterObj);

    // Returning customers (more than 1 order)
    const returningCustomers = allCustomers.filter(
      (c) => (c.orders?.totalItems || 0) > 1
    );

    // New vs returning in the period
    const customersWithOrdersInPeriod = new Set<string>();
    const newCustomersWithOrdersInPeriod = new Set<string>();

    orders.forEach((order) => {
      if (order.customer?.id) {
        customersWithOrdersInPeriod.add(order.customer.id);
        const customerCreatedAt = new Date(order.customer.createdAt);
        if (customerCreatedAt >= dateFilterObj) {
          newCustomersWithOrdersInPeriod.add(order.customer.id);
        }
      }
    });

    const returningInPeriod = customersWithOrdersInPeriod.size - newCustomersWithOrdersInPeriod.size;

    // Customer geographic distribution
    const customersByWilaya: Record<string, number> = {};
    allCustomers.forEach((c) => {
      const wilaya = c.customFields?.wilaya || 'Non spécifié';
      customersByWilaya[wilaya] = (customersByWilaya[wilaya] || 0) + 1;
    });

    const topCustomerWilayas = Object.entries(customersByWilaya)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    // Customer acquisition over time
    const acquisitionByMonth: Record<string, number> = {};
    allCustomers.forEach((c) => {
      const month = new Date(c.createdAt).toLocaleDateString('fr-FR', {
        month: 'short',
        year: '2-digit',
      });
      acquisitionByMonth[month] = (acquisitionByMonth[month] || 0) + 1;
    });

    const acquisitionData = Object.entries(acquisitionByMonth)
      .map(([month, count]) => ({ month, count }))
      .slice(-12); // Last 12 months

    return {
      totalCustomers: allCustomers.length,
      newCustomers: newCustomers.length,
      returningCustomers: returningCustomers.length,
      newInPeriod: newCustomersWithOrdersInPeriod.size,
      returningInPeriod,
      topCustomerWilayas,
      acquisitionData,
      newVsReturning: [
        { name: 'Nouveaux', value: newCustomersWithOrdersInPeriod.size },
        { name: 'Fidèles', value: returningInPeriod },
      ],
    };
  }, [allCustomers, orders, dateFilter]);

  // Stock metrics
  const stockMetrics = useMemo(() => {
    const totalVariants = allVariants.length;
    const totalStock = allVariants.reduce((sum, v) => sum + (v.stockOnHand || 0), 0);
    const totalAllocated = allVariants.reduce((sum, v) => sum + (v.stockAllocated || 0), 0);

    const outOfStock = allVariants.filter((v) => (v.stockOnHand || 0) <= 0);
    const lowStock = allVariants.filter(
      (v) => (v.stockOnHand || 0) > 0 && (v.stockOnHand || 0) <= (v.customFields?.minStockAlert || 5)
    );
    const inStock = allVariants.filter(
      (v) => (v.stockOnHand || 0) > (v.customFields?.minStockAlert || 5)
    );

    // Stock by category
    const stockByCategory: Record<string, { stock: number; count: number }> = {};
    allVariants.forEach((v) => {
      const facets = v.product?.facetValues || [];
      const categoryFacet = facets.find((f) => f.facet?.code === 'category');
      const categoryName = categoryFacet?.name || 'Non catégorisé';

      if (!stockByCategory[categoryName]) {
        stockByCategory[categoryName] = { stock: 0, count: 0 };
      }
      stockByCategory[categoryName].stock += v.stockOnHand || 0;
      stockByCategory[categoryName].count++;
    });

    const stockByCategoryData = Object.entries(stockByCategory)
      .map(([name, data]) => ({
        name,
        stock: data.stock,
        produits: data.count,
      }))
      .sort((a, b) => b.stock - a.stock)
      .slice(0, 8);

    return {
      totalVariants,
      totalStock,
      totalAllocated,
      available: totalStock - totalAllocated,
      outOfStock: outOfStock.length,
      lowStock: lowStock.length,
      inStock: inStock.length,
      stockDistribution: [
        { name: 'En stock', value: inStock.length, color: '#22c55e' },
        { name: 'Stock faible', value: lowStock.length, color: '#f59e0b' },
        { name: 'Rupture', value: outOfStock.length, color: '#ef4444' },
      ],
      stockByCategoryData,
    };
  }, [allVariants]);

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

  const handleExportCustomersCSV = () => {
    const data = allCustomers.map((customer) => ({
      ID: customer.id,
      Prénom: customer.firstName,
      Nom: customer.lastName,
      Email: customer.emailAddress,
      Wilaya: customer.customFields?.wilaya || '-',
      'Date inscription': formatDateForExport(customer.createdAt),
      'Nombre commandes': customer.orders?.totalItems || 0,
    }));
    exportToCSV(data, 'rapport-clients');
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
                      <p className="text-orange-100 text-sm">Commandes complétées</p>
                      <p className="text-2xl font-bold mt-1">{salesMetrics.completedOrders}</p>
                    </div>
                    <UserCheck className="h-10 w-10 text-orange-200" />
                  </div>
                </div>
              </div>

              {/* Sales Trend Chart */}
              <div className="bg-card rounded-xl p-6 border border-border">
                <h4 className="font-medium text-foreground mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  Evolution des ventes
                </h4>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={salesByPeriodData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                      <XAxis dataKey="date" stroke="rgb(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis yAxisId="revenue" stroke="rgb(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${(value / 100000).toFixed(0)}k`} />
                      <YAxis yAxisId="orders" orientation="right" stroke="rgb(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip content={<CustomTooltip formatter={(v: number) => formatPrice(v)} />} />
                      <Legend />
                      <Area yAxisId="revenue" type="monotone" dataKey="revenue" name="Revenus" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                      <Area yAxisId="orders" type="monotone" dataKey="orders" name="Commandes" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#colorOrders)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Sales by Category and Top Products Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sales by Category Pie Chart */}
                <div className="bg-card rounded-xl p-6 border border-border">
                  <h4 className="font-medium text-foreground mb-4 flex items-center gap-2">
                    <Layers className="h-5 w-5 text-purple-500" />
                    Ventes par catégorie
                  </h4>
                  <div className="h-72 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={salesByCategory}
                          cx="50%"
                          cy="45%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={2}
                          dataKey="value"
                          stroke="none"
                        >
                          {salesByCategory.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<PieTooltip />} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -mt-4 text-center pointer-events-none">
                      <p className="text-xl font-bold text-foreground">
                        {formatPrice(salesByCategory.reduce((sum, d) => sum + d.value, 0))}
                      </p>
                      <p className="text-xs text-muted-foreground">Total</p>
                    </div>
                  </div>
                </div>

                {/* Top Products Table */}
                <div className="bg-card rounded-xl p-6 border border-border">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-foreground flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                      Top 10 Produits
                    </h4>
                    <Button variant="ghost" size="sm" onClick={handleExportProductsCSV} disabled={productPerformance.length === 0}>
                      <Download className="h-4 w-4 mr-1" />
                      CSV
                    </Button>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {productPerformance.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">Aucune vente</p>
                    ) : (
                      productPerformance.map(([productId, data], index) => (
                        <div key={productId} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                              {index + 1}
                            </span>
                            <div>
                              <p className="font-medium text-foreground text-sm">{data.name}</p>
                              <p className="text-xs text-muted-foreground">{data.quantity} vendus</p>
                            </div>
                          </div>
                          <p className="font-semibold text-foreground text-sm">{formatPrice(data.revenue)}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Top Wilayas */}
              <div className="bg-card rounded-xl p-6 border border-border">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-foreground flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-red-500" />
                    Ventes par Wilaya
                  </h4>
                  <Button variant="ghost" size="sm" onClick={handleExportWilayasCSV} disabled={salesMetrics.topWilayas.length === 0}>
                    <Download className="h-4 w-4 mr-1" />
                    CSV
                  </Button>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salesMetrics.topWilayas.map(([wilaya, data]) => ({ name: wilaya, revenue: data.revenue, commandes: data.count }))} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={true} vertical={false} />
                      <XAxis type="number" tickFormatter={(v) => `${(v / 100000).toFixed(0)}k`} stroke="rgb(var(--muted-foreground))" fontSize={12} />
                      <YAxis type="category" dataKey="name" width={100} stroke="rgb(var(--muted-foreground))" fontSize={12} />
                      <Tooltip content={<CustomTooltip formatter={(v: number) => formatPrice(v)} />} />
                      <Bar dataKey="revenue" name="Revenus" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}
        </div>
      ),
    },
    {
      id: 'customers',
      label: 'Clients',
      icon: <Users className="h-4 w-4" />,
      content: (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h3 className="text-lg font-semibold text-foreground">Rapport Clients</h3>
            <Button variant="outline" size="sm" onClick={handleExportCustomersCSV} disabled={allCustomers.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>

          {customersLoading ? (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          ) : (
            <>
              {/* Customer Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Total clients</p>
                      <p className="text-2xl font-bold mt-1">{customerMetrics.totalCustomers}</p>
                    </div>
                    <Users className="h-10 w-10 text-blue-200" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">Nouveaux (période)</p>
                      <p className="text-2xl font-bold mt-1">{customerMetrics.newInPeriod}</p>
                    </div>
                    <UserPlus className="h-10 w-10 text-green-200" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm">Fidèles (période)</p>
                      <p className="text-2xl font-bold mt-1">{customerMetrics.returningInPeriod}</p>
                    </div>
                    <UserCheck className="h-10 w-10 text-purple-200" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm">Clients fidèles</p>
                      <p className="text-2xl font-bold mt-1">{customerMetrics.returningCustomers}</p>
                    </div>
                    <RefreshCw className="h-10 w-10 text-orange-200" />
                  </div>
                </div>
              </div>

              {/* New vs Returning + Acquisition Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* New vs Returning Pie Chart */}
                <div className="bg-card rounded-xl p-6 border border-border">
                  <h4 className="font-medium text-foreground mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-500" />
                    Nouveaux vs Fidèles (période)
                  </h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={customerMetrics.newVsReturning}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          <Cell fill="#22c55e" />
                          <Cell fill="#3b82f6" />
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Customer Acquisition Chart */}
                <div className="bg-card rounded-xl p-6 border border-border">
                  <h4 className="font-medium text-foreground mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    Acquisition clients
                  </h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={customerMetrics.acquisitionData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                        <XAxis dataKey="month" stroke="rgb(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="rgb(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip />
                        <Bar dataKey="count" name="Nouveaux clients" fill="#22c55e" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Geographic Distribution */}
              <div className="bg-card rounded-xl p-6 border border-border">
                <h4 className="font-medium text-foreground mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-red-500" />
                  Distribution géographique
                </h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={customerMetrics.topCustomerWilayas.map(([wilaya, count]) => ({ name: wilaya, clients: count }))} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={true} vertical={false} />
                      <XAxis type="number" stroke="rgb(var(--muted-foreground))" fontSize={12} />
                      <YAxis type="category" dataKey="name" width={100} stroke="rgb(var(--muted-foreground))" fontSize={12} />
                      <Tooltip />
                      <Bar dataKey="clients" name="Clients" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
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
      icon: <Package className="h-4 w-4" />,
      content: (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h3 className="text-lg font-semibold text-foreground">Rapport Stock</h3>
            <Button variant="outline" size="sm" onClick={handleExportStockCSV} disabled={lowStockVariants.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Export Alertes CSV
            </Button>
          </div>

          {stockLoading || lowStockLoading ? (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          ) : (
            <>
              {/* Stock Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Total produits</p>
                      <p className="text-2xl font-bold mt-1">{stockMetrics.totalVariants}</p>
                    </div>
                    <Package className="h-10 w-10 text-blue-200" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">En stock</p>
                      <p className="text-2xl font-bold mt-1">{stockMetrics.inStock}</p>
                    </div>
                    <Box className="h-10 w-10 text-green-200" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-amber-100 text-sm">Stock faible</p>
                      <p className="text-2xl font-bold mt-1">{stockMetrics.lowStock}</p>
                    </div>
                    <AlertTriangle className="h-10 w-10 text-amber-200" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-100 text-sm">Rupture de stock</p>
                      <p className="text-2xl font-bold mt-1">{stockMetrics.outOfStock}</p>
                    </div>
                    <TrendingDown className="h-10 w-10 text-red-200" />
                  </div>
                </div>
              </div>

              {/* Stock Distribution and Stock by Category Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Stock Distribution Pie Chart */}
                <div className="bg-card rounded-xl p-6 border border-border">
                  <h4 className="font-medium text-foreground mb-4 flex items-center gap-2">
                    <Layers className="h-5 w-5 text-purple-500" />
                    Distribution du stock
                  </h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stockMetrics.stockDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {stockMetrics.stockDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Stock by Category */}
                <div className="bg-card rounded-xl p-6 border border-border">
                  <h4 className="font-medium text-foreground mb-4 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-500" />
                    Stock par catégorie
                  </h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stockMetrics.stockByCategoryData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={true} vertical={false} />
                        <XAxis type="number" stroke="rgb(var(--muted-foreground))" fontSize={12} />
                        <YAxis type="category" dataKey="name" width={100} stroke="rgb(var(--muted-foreground))" fontSize={12} />
                        <Tooltip />
                        <Bar dataKey="stock" name="Quantité" fill="#06b6d4" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Low Stock Alerts */}
              <div className="bg-card rounded-xl p-6 border border-border">
                <h4 className="font-medium text-foreground mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Alertes de stock ({lowStockVariants.length})
                </h4>
                {lowStockVariants.length === 0 ? (
                  <div className="text-center py-8 bg-green-900/30 rounded-lg">
                    <Package className="h-12 w-12 text-green-400 mx-auto mb-4" />
                    <p className="text-green-400 font-medium">Tous les stocks sont suffisants</p>
                    <p className="text-green-500 text-sm mt-1">
                      Aucun produit en rupture ou stock faible
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {lowStockVariants.map((variant) => {
                      const isOutOfStock = variant.stockOnHand <= 0;
                      const isCritical = variant.stockOnHand <= (variant.customFields?.minStockAlert || 5);

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
                              Seuil: {variant.customFields?.minStockAlert || 5}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Rapports & Analyses</h1>
        <p className="text-muted-foreground mt-1">Analysez les performances de votre boutique</p>
      </div>

      {/* Tabs */}
      <div className="bg-card rounded-lg shadow">
        <Tabs tabs={tabs} defaultTab="sales" />
      </div>
    </div>
  );
};
