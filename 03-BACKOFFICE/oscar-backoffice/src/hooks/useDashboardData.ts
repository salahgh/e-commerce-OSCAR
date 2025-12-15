import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { useMemo } from 'react';

// ==================== GraphQL Queries ====================

const DASHBOARD_KPI_METRICS = gql`
  query DashboardKpiMetrics {
    dashboardKpiMetrics {
      revenueToday
      revenueThisWeek
      revenueThisMonth
      revenueLastMonth
      revenueGrowth
      ordersToday
      ordersThisWeek
      ordersThisMonth
      totalOrders
      pendingOrders
      processingOrders
      shippedOrders
      deliveredOrders
      cancelledOrders
      newCustomersToday
      newCustomersThisWeek
      newCustomersThisMonth
      totalCustomers
      totalProducts
      activeProducts
      lowStockProducts
      outOfStockProducts
      averageOrderValue
      conversionRate
    }
  }
`;

const DASHBOARD_SALES_TREND = gql`
  query DashboardSalesTrend($days: Int) {
    dashboardSalesTrend(days: $days) {
      date
      revenue
      orders
    }
  }
`;

const DASHBOARD_ORDERS_BY_STATUS = gql`
  query DashboardOrdersByStatus($days: Int) {
    dashboardOrdersByStatus(days: $days) {
      date
      pending
      processing
      shipped
      delivered
      cancelled
    }
  }
`;

const DASHBOARD_REVENUE_BY_CATEGORY = gql`
  query DashboardRevenueByCategory {
    dashboardRevenueByCategory {
      categoryId
      categoryName
      revenue
      percentage
    }
  }
`;

const DASHBOARD_RECENT_ORDERS = gql`
  query DashboardRecentOrders($limit: Int) {
    dashboardRecentOrders(limit: $limit) {
      id
      code
      customerName
      customerEmail
      total
      state
      itemCount
      createdAt
    }
  }
`;

const DASHBOARD_LOW_STOCK_ALERTS = gql`
  query DashboardLowStockAlerts($threshold: Int) {
    dashboardLowStockAlerts(threshold: $threshold) {
      productId
      productName
      variantId
      variantName
      sku
      currentStock
      threshold
    }
  }
`;

const DASHBOARD_TOP_SELLING_PRODUCTS = gql`
  query DashboardTopSellingProducts($limit: Int) {
    dashboardTopSellingProducts(limit: $limit) {
      productId
      productName
      variantId
      variantName
      sku
      quantitySold
      revenue
      imageUrl
    }
  }
`;

// ==================== Types ====================

export type DateRange = '7d' | '30d' | '90d';

export interface KpiMetrics {
  // Revenue
  revenueToday: number;
  revenueThisWeek: number;
  revenueThisMonth: number;
  revenueLastMonth: number;
  revenueGrowth: number;
  // Orders
  ordersToday: number;
  ordersThisWeek: number;
  ordersThisMonth: number;
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  // Customers
  newCustomersToday: number;
  newCustomersThisWeek: number;
  newCustomersThisMonth: number;
  totalCustomers: number;
  // Products
  totalProducts: number;
  activeProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  // Calculated
  averageOrderValue: number;
  conversionRate: number;
}

export interface SalesDataPoint {
  date: string;
  revenue: number;
  orders: number;
  [key: string]: string | number;
}

export interface OrdersByStatusDataPoint {
  date: string;
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  [key: string]: string | number;
}

export interface CategoryData {
  id: string;
  name: string;
  value: number;
  percentage: number;
  [key: string]: string | number;
}

export interface RecentOrder {
  id: string;
  code: string;
  customerName: string;
  customerEmail: string;
  total: number;
  state: string;
  itemCount: number;
  createdAt: string;
}

export interface LowStockAlert {
  productId: string;
  productName: string;
  variantId: string;
  variantName: string;
  sku: string;
  currentStock: number;
  threshold: number;
}

export interface TopSellingProduct {
  productId: string;
  productName: string;
  variantId: string;
  variantName: string;
  sku: string;
  quantitySold: number;
  revenue: number;
  imageUrl?: string;
}

// ==================== Helper Functions ====================

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

// ==================== Main Hook ====================

export function useDashboardData(dateRange: DateRange = '30d') {
  const days = getDateRangeDays(dateRange);

  // Fetch KPI metrics
  const {
    data: kpiData,
    loading: kpiLoading,
    error: kpiError,
    refetch: refetchKpi,
  } = useQuery(DASHBOARD_KPI_METRICS, {
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network',
  });

  // Fetch sales trend
  const {
    data: salesTrendData,
    loading: salesTrendLoading,
    error: salesTrendError,
  } = useQuery(DASHBOARD_SALES_TREND, {
    variables: { days },
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network',
  });

  // Fetch orders by status
  const {
    data: ordersByStatusData,
    loading: ordersByStatusLoading,
    error: ordersByStatusError,
  } = useQuery(DASHBOARD_ORDERS_BY_STATUS, {
    variables: { days },
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network',
  });

  // Fetch revenue by category
  const {
    data: categoryData,
    loading: categoryLoading,
    error: categoryError,
  } = useQuery(DASHBOARD_REVENUE_BY_CATEGORY, {
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network',
  });

  // Fetch recent orders
  const {
    data: recentOrdersData,
    loading: recentOrdersLoading,
    error: recentOrdersError,
  } = useQuery(DASHBOARD_RECENT_ORDERS, {
    variables: { limit: 10 },
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network',
  });

  // Fetch low stock alerts
  const {
    data: lowStockData,
    loading: lowStockLoading,
    error: lowStockError,
  } = useQuery(DASHBOARD_LOW_STOCK_ALERTS, {
    variables: { threshold: 10 },
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network',
  });

  // Fetch top selling products
  const {
    data: topProductsData,
    loading: topProductsLoading,
    error: topProductsError,
  } = useQuery(DASHBOARD_TOP_SELLING_PRODUCTS, {
    variables: { limit: 10 },
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network',
  });

  // Process KPI metrics
  const kpis: KpiMetrics = useMemo(() => {
    const metrics = kpiData?.dashboardKpiMetrics;
    return {
      revenueToday: metrics?.revenueToday ?? 0,
      revenueThisWeek: metrics?.revenueThisWeek ?? 0,
      revenueThisMonth: metrics?.revenueThisMonth ?? 0,
      revenueLastMonth: metrics?.revenueLastMonth ?? 0,
      revenueGrowth: metrics?.revenueGrowth ?? 0,
      ordersToday: metrics?.ordersToday ?? 0,
      ordersThisWeek: metrics?.ordersThisWeek ?? 0,
      ordersThisMonth: metrics?.ordersThisMonth ?? 0,
      totalOrders: metrics?.totalOrders ?? 0,
      pendingOrders: metrics?.pendingOrders ?? 0,
      processingOrders: metrics?.processingOrders ?? 0,
      shippedOrders: metrics?.shippedOrders ?? 0,
      deliveredOrders: metrics?.deliveredOrders ?? 0,
      cancelledOrders: metrics?.cancelledOrders ?? 0,
      newCustomersToday: metrics?.newCustomersToday ?? 0,
      newCustomersThisWeek: metrics?.newCustomersThisWeek ?? 0,
      newCustomersThisMonth: metrics?.newCustomersThisMonth ?? 0,
      totalCustomers: metrics?.totalCustomers ?? 0,
      totalProducts: metrics?.totalProducts ?? 0,
      activeProducts: metrics?.activeProducts ?? 0,
      lowStockProducts: metrics?.lowStockProducts ?? 0,
      outOfStockProducts: metrics?.outOfStockProducts ?? 0,
      averageOrderValue: metrics?.averageOrderValue ?? 0,
      conversionRate: metrics?.conversionRate ?? 0,
    };
  }, [kpiData]);

  // Process sales trend data
  const salesData: SalesDataPoint[] = useMemo(() => {
    const items = salesTrendData?.dashboardSalesTrend || [];
    return items.map((item: { date: string; revenue: number; orders: number }) => ({
      date: formatDateLabel(item.date, dateRange),
      revenue: item.revenue / 100, // Convert from cents
      orders: item.orders,
    }));
  }, [salesTrendData, dateRange]);

  // Process orders by status data
  const ordersByStatus: OrdersByStatusDataPoint[] = useMemo(() => {
    const items = ordersByStatusData?.dashboardOrdersByStatus || [];
    return items.map(
      (item: {
        date: string;
        pending: number;
        processing: number;
        shipped: number;
        delivered: number;
        cancelled: number;
      }) => ({
        date: formatDateLabel(item.date, dateRange),
        pending: item.pending,
        processing: item.processing,
        shipped: item.shipped,
        delivered: item.delivered,
        cancelled: item.cancelled,
      })
    );
  }, [ordersByStatusData, dateRange]);

  // Process category data
  const categories: CategoryData[] = useMemo(() => {
    const items = categoryData?.dashboardRevenueByCategory || [];
    return items.map(
      (item: { categoryId: string; categoryName: string; revenue: number; percentage: number }) => ({
        id: item.categoryId,
        name: item.categoryName,
        value: item.revenue / 100, // Convert from cents
        percentage: item.percentage,
      })
    );
  }, [categoryData]);

  // Process recent orders
  const recentOrders: RecentOrder[] = useMemo(() => {
    const items = recentOrdersData?.dashboardRecentOrders || [];
    return items.map(
      (item: {
        id: string;
        code: string;
        customerName: string;
        customerEmail: string;
        total: number;
        state: string;
        itemCount: number;
        createdAt: string;
      }) => ({
        id: item.id,
        code: item.code,
        customerName: item.customerName,
        customerEmail: item.customerEmail,
        total: item.total / 100, // Convert from cents
        state: item.state,
        itemCount: item.itemCount,
        createdAt: item.createdAt,
      })
    );
  }, [recentOrdersData]);

  // Process low stock alerts
  const lowStockAlerts: LowStockAlert[] = useMemo(() => {
    return lowStockData?.dashboardLowStockAlerts || [];
  }, [lowStockData]);

  // Process top selling products
  const topProducts: TopSellingProduct[] = useMemo(() => {
    const items = topProductsData?.dashboardTopSellingProducts || [];
    return items.map(
      (item: {
        productId: string;
        productName: string;
        variantId: string;
        variantName: string;
        sku: string;
        quantitySold: number;
        revenue: number;
        imageUrl?: string;
      }) => ({
        ...item,
        revenue: item.revenue / 100, // Convert from cents
      })
    );
  }, [topProductsData]);

  // Combined loading states
  const loading = kpiLoading || recentOrdersLoading || lowStockLoading;
  const chartsLoading = salesTrendLoading || ordersByStatusLoading || categoryLoading || topProductsLoading;

  // Refetch function
  const refetch = () => {
    refetchKpi();
  };

  return {
    // KPI Data
    kpis,

    // Chart Data
    salesData,
    ordersByStatus,
    categoryData: categories,
    topProducts,

    // Activity Data
    recentOrders,
    lowStockAlerts,

    // Loading States
    loading,
    chartsLoading,
    kpisLoading: kpiLoading,
    salesTrendLoading,
    ordersByStatusLoading,
    categoryLoading,
    recentOrdersLoading,
    lowStockLoading,
    topProductsLoading,

    // Error handling
    hasError:
      !!kpiError ||
      !!salesTrendError ||
      !!ordersByStatusError ||
      !!categoryError ||
      !!recentOrdersError ||
      !!lowStockError ||
      !!topProductsError,
    errors: {
      kpi: kpiError,
      salesTrend: salesTrendError,
      ordersByStatus: ordersByStatusError,
      category: categoryError,
      recentOrders: recentOrdersError,
      lowStock: lowStockError,
      topProducts: topProductsError,
    },

    // Actions
    refetch,
  };
}
