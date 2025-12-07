import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { useMemo } from 'react';

// GraphQL Queries - Compatible with Vendure Admin API
const OSCAR_DASHBOARD_STATS = gql`
  query OscarDashboardStats {
    oscarDashboardStats {
      totalOrders
      totalRevenue
      totalCustomers
      totalProducts
      pendingOrders
      lowStockProductsCount
    }
  }
`;

const RECENT_ORDERS = gql`
  query RecentOrders($options: OrderListOptions) {
    orders(options: $options) {
      items {
        id
        code
        state
        totalWithTax
        orderPlacedAt
        customer {
          id
          firstName
          lastName
        }
        customFields {
          trackingNumber
          wilaya
        }
      }
      totalItems
    }
  }
`;

const LOW_STOCK_PRODUCTS = gql`
  query LowStockProducts($threshold: Int) {
    lowStockProducts(threshold: $threshold) {
      id
      name
      slug
      variants {
        id
        sku
        stockOnHand
        customFields {
          minStockAlert
        }
      }
      customFields {
        nameFr
      }
    }
  }
`;

const DASHBOARD_ORDERS_ANALYSIS = gql`
  query DashboardOrdersAnalysis($options: OrderListOptions) {
    orders(options: $options) {
      items {
        id
        code
        state
        totalWithTax
        orderPlacedAt
        lines {
          id
          quantity
          linePriceWithTax
          productVariant {
            id
            name
            sku
            product {
              id
              name
              slug
              featuredAsset {
                preview
              }
              collections {
                id
                name
                slug
              }
              customFields {
                nameFr
              }
            }
          }
        }
      }
      totalItems
    }
  }
`;

export type DateRange = '7d' | '30d' | '90d';

export interface SalesDataPoint {
  date: string;
  revenue: number;
  orders: number;
  [key: string]: string | number;
}

export interface CategoryData {
  name: string;
  value: number;
  count: number;
  [key: string]: string | number;
}

export interface ProductData {
  id: string;
  name: string;
  revenue: number;
  quantity: number;
  image?: string;
  [key: string]: string | number | undefined;
}

interface KPIData {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  pendingOrders: number;
  lowStockCount: number;
  conversionRate: number;
  averageOrderValue: number;
  trends: {
    revenue: { value: number; isPositive: boolean };
    orders: { value: number; isPositive: boolean };
    customers: { value: number; isPositive: boolean };
    aov: { value: number; isPositive: boolean };
  };
}

interface RecentOrder {
  id: string;
  code: string;
  state: string;
  totalWithTax: number;
  orderPlacedAt: string;
  customerName: string;
  wilaya?: string;
}

interface LowStockProduct {
  id: string;
  name: string;
  sku: string;
  stockOnHand: number;
  minStock: number;
}

function getDateRangeDays(range: DateRange): number {
  switch (range) {
    case '7d':
      return 7;
    case '30d':
      return 30;
    case '90d':
      return 90;
    default:
      return 30;
  }
}

function getDateRangeFilter(range: DateRange): { after: string; before: string } {
  const now = new Date();
  const days = getDateRangeDays(range);
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - days);

  return {
    after: startDate.toISOString(),
    before: now.toISOString(),
  };
}

function formatDateLabel(dateStr: string, range: DateRange): string {
  const date = new Date(dateStr);
  if (range === '7d') {
    return date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });
  } else if (range === '30d') {
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  } else {
    return date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
  }
}

export function useDashboardData(dateRange: DateRange = '30d') {
  // Memoize dateFilter to prevent new object on every render
  const dateFilter = useMemo(() => getDateRangeFilter(dateRange), [dateRange]);

  // Memoize variables objects to prevent useQuery from refetching
  const recentOrdersVariables = useMemo(() => ({
    options: {
      take: 5,
      sort: { orderPlacedAt: 'DESC' as const },
    },
  }), []);

  const analysisVariables = useMemo(() => ({
    options: {
      take: 100,
      filter: {
        orderPlacedAt: {
          after: dateFilter.after,
          before: dateFilter.before,
        },
      },
      sort: { orderPlacedAt: 'ASC' as const },
    },
  }), [dateFilter.after, dateFilter.before]);

  // Fetch basic stats
  const { data: statsData, loading: statsLoading, error: statsError } = useQuery(OSCAR_DASHBOARD_STATS, {
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network',
  });

  // Fetch recent orders with proper Vendure options
  const { data: recentOrdersData, loading: recentLoading, error: recentError } = useQuery(RECENT_ORDERS, {
    variables: recentOrdersVariables,
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network',
  });

  // Fetch low stock products
  const { data: lowStockData, loading: lowStockLoading, error: lowStockError } = useQuery(LOW_STOCK_PRODUCTS, {
    variables: { threshold: 10 },
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network',
  });

  // Fetch orders for analysis (with date filter)
  const { data: ordersAnalysisData, loading: analysisLoading, error: analysisError } = useQuery(DASHBOARD_ORDERS_ANALYSIS, {
    variables: analysisVariables,
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network',
  });

  // Process KPI data
  const kpis: KPIData = useMemo(() => {
    const stats = statsData?.oscarDashboardStats;

    const totalRevenue = stats?.totalRevenue ?? 0;
    const totalOrders = stats?.totalOrders ?? 0;
    const totalCustomers = stats?.totalCustomers ?? 0;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Calculate conversion rate (orders / customers as proxy)
    const conversionRate = totalCustomers > 0 ? (totalOrders / totalCustomers) * 100 : 0;

    // Calculate trends (mock for now - would need previous period data)
    // In a real scenario, we'd compare current period to previous period
    const mockTrend = () => ({
      value: Math.round((Math.random() * 20 - 5) * 10) / 10, // Random between -5% and +15%
      isPositive: Math.random() > 0.3,
    });

    return {
      totalRevenue,
      totalOrders,
      totalCustomers,
      totalProducts: stats?.totalProducts ?? 0,
      pendingOrders: stats?.pendingOrders ?? 0,
      lowStockCount: stats?.lowStockProductsCount ?? 0,
      conversionRate,
      averageOrderValue,
      trends: {
        revenue: mockTrend(),
        orders: mockTrend(),
        customers: mockTrend(),
        aov: mockTrend(),
      },
    };
  }, [statsData]);

  // Process sales evolution data
  const salesData: SalesDataPoint[] = useMemo(() => {
    const orders = ordersAnalysisData?.orders?.items || [];
    if (orders.length === 0) return [];

    // Group orders by date
    const dailyData: Record<string, { revenue: number; orders: number }> = {};

    orders.forEach((order: any) => {
      if (!order.orderPlacedAt) return;
      const date = new Date(order.orderPlacedAt).toISOString().split('T')[0];
      if (!dailyData[date]) {
        dailyData[date] = { revenue: 0, orders: 0 };
      }
      dailyData[date].revenue += order.totalWithTax || 0;
      dailyData[date].orders += 1;
    });

    // Convert to array and sort by date
    return Object.entries(dailyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({
        date: formatDateLabel(date, dateRange),
        revenue: data.revenue / 100, // Convert from cents
        orders: data.orders,
      }));
  }, [ordersAnalysisData, dateRange]);

  // Process category data
  const categoryData: CategoryData[] = useMemo(() => {
    const orders = ordersAnalysisData?.orders?.items || [];
    if (orders.length === 0) return [];

    const categoryStats: Record<string, { value: number; count: number }> = {};

    orders.forEach((order: any) => {
      order.lines?.forEach((line: any) => {
        const collections = line.productVariant?.product?.collections || [];
        // Use first collection as category, or "Autres" if none
        const categoryName = collections[0]?.name || 'Autres';

        if (!categoryStats[categoryName]) {
          categoryStats[categoryName] = { value: 0, count: 0 };
        }
        categoryStats[categoryName].value += line.linePriceWithTax || 0;
        categoryStats[categoryName].count += line.quantity || 1;
      });
    });

    // Convert to array and sort by value
    return Object.entries(categoryStats)
      .map(([name, stats]) => ({
        name,
        value: stats.value / 100, // Convert from cents
        count: stats.count,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // Top 8 categories
  }, [ordersAnalysisData]);

  // Process top products data
  const topProducts: ProductData[] = useMemo(() => {
    const orders = ordersAnalysisData?.orders?.items || [];
    if (orders.length === 0) return [];

    const productStats: Record<string, ProductData> = {};

    orders.forEach((order: any) => {
      order.lines?.forEach((line: any) => {
        const product = line.productVariant?.product;
        if (!product) return;

        const productId = product.id;
        if (!productStats[productId]) {
          productStats[productId] = {
            id: productId,
            name: product.customFields?.nameFr || product.name || 'Produit inconnu',
            revenue: 0,
            quantity: 0,
            image: product.featuredAsset?.preview,
          };
        }
        productStats[productId].revenue += (line.linePriceWithTax || 0) / 100;
        productStats[productId].quantity += line.quantity || 1;
      });
    });

    // Convert to array and sort by revenue
    return Object.values(productStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }, [ordersAnalysisData]);

  // Process recent orders
  const recentOrders: RecentOrder[] = useMemo(() => {
    const orders = recentOrdersData?.orders?.items || [];
    return orders.map((order: any) => ({
      id: order.id,
      code: order.code,
      state: order.state,
      totalWithTax: order.totalWithTax / 100,
      orderPlacedAt: order.orderPlacedAt,
      customerName: order.customer
        ? `${order.customer.firstName} ${order.customer.lastName}`
        : 'Client anonyme',
      wilaya: order.customFields?.wilaya,
    }));
  }, [recentOrdersData]);

  // Process low stock products
  const lowStockProducts: LowStockProduct[] = useMemo(() => {
    const products = lowStockData?.lowStockProducts || [];
    const result: LowStockProduct[] = [];

    products.forEach((product: any) => {
      product.variants?.forEach((variant: any) => {
        result.push({
          id: variant.id,
          name: product.customFields?.nameFr || product.name,
          sku: variant.sku,
          stockOnHand: variant.stockOnHand,
          minStock: variant.customFields?.minStockAlert || 10,
        });
      });
    });

    return result.sort((a, b) => a.stockOnHand - b.stockOnHand).slice(0, 10);
  }, [lowStockData]);

  // Loading states - only true if actually loading, not if errored
  const loading = statsLoading || recentLoading || lowStockLoading;
  const chartsLoading = analysisLoading;

  return {
    kpis,
    salesData,
    categoryData,
    topProducts,
    recentOrders,
    lowStockProducts,
    loading,
    chartsLoading,
    // Expose individual loading states for granular control
    kpisLoading: statsLoading,
    recentOrdersLoading: recentLoading,
    lowStockLoading: lowStockLoading,
    hasError: !!statsError || !!recentError || !!lowStockError || !!analysisError,
    // Expose error details for debugging
    errors: {
      stats: statsError,
      recentOrders: recentError,
      lowStock: lowStockError,
      analysis: analysisError,
    },
  };
}
