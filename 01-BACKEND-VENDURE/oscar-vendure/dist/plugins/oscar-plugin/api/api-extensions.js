"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminApiExtensions = exports.shopApiExtensions = void 0;
const graphql_tag_1 = __importDefault(require("graphql-tag"));
exports.shopApiExtensions = (0, graphql_tag_1.default) `
  type Wilaya {
    code: String!
    name: String!
  }

  type ShippingCost {
    amount: Int!
    currency: String!
  }

  type MultilingualSearchResult {
    items: [Product!]!
    totalItems: Int!
  }

  extend type Query {
    """
    Get featured products for homepage
    """
    featuredProducts(take: Int): [Product!]!

    """
    Get new arrivals (last 30 days)
    """
    newArrivals(take: Int): [Product!]!

    """
    Get popular products by view count
    """
    popularProducts(take: Int): [Product!]!

    """
    Search products with multilingual support (FR/AR/EN)
    """
    searchProductsMultilingual(
      keyword: String!
      take: Int
      skip: Int
    ): MultilingualSearchResult!

    """
    Get all Algeria wilayas for shipping
    """
    wilayas: [Wilaya!]!

    """
    Calculate shipping cost for a wilaya
    """
    shippingCost(wilayaCode: String!): ShippingCost!
  }

  extend type Mutation {
    """
    Track product view for analytics
    """
    trackProductView(productId: ID!): Boolean!
  }
`;
exports.adminApiExtensions = (0, graphql_tag_1.default) `
  # ==================== KPI METRICS ====================

  """
  Comprehensive KPI metrics for the dashboard
  """
  type KpiMetrics {
    # Revenue metrics (in cents)
    revenueToday: Int!
    revenueThisWeek: Int!
    revenueThisMonth: Int!
    revenueLastMonth: Int!
    revenueGrowth: Float!

    # Order metrics
    ordersToday: Int!
    ordersThisWeek: Int!
    ordersThisMonth: Int!
    totalOrders: Int!
    pendingOrders: Int!
    processingOrders: Int!
    shippedOrders: Int!
    deliveredOrders: Int!
    cancelledOrders: Int!

    # Customer metrics
    newCustomersToday: Int!
    newCustomersThisWeek: Int!
    newCustomersThisMonth: Int!
    totalCustomers: Int!

    # Product metrics
    totalProducts: Int!
    activeProducts: Int!
    lowStockProducts: Int!
    outOfStockProducts: Int!

    # Calculated metrics
    averageOrderValue: Float!
    conversionRate: Float!
  }

  # ==================== CHART DATA ====================

  """
  Sales trend data point for line chart
  """
  type SalesTrendDataPoint {
    date: String!
    revenue: Int!
    orders: Int!
  }

  """
  Orders by status data point for bar chart
  """
  type OrdersChartDataPoint {
    date: String!
    pending: Int!
    processing: Int!
    shipped: Int!
    delivered: Int!
    cancelled: Int!
  }

  """
  Revenue by category data point for pie chart
  """
  type RevenueByCategoryDataPoint {
    categoryId: ID!
    categoryName: String!
    revenue: Int!
    percentage: Float!
  }

  # ==================== ACTIVITY DATA ====================

  """
  Recent order for activity feed
  """
  type RecentOrderItem {
    id: ID!
    code: String!
    customerName: String!
    customerEmail: String!
    total: Int!
    state: String!
    itemCount: Int!
    createdAt: DateTime!
  }

  """
  Low stock alert item
  """
  type LowStockAlert {
    productId: ID!
    productName: String!
    variantId: ID!
    variantName: String!
    sku: String!
    currentStock: Int!
    threshold: Int!
  }

  """
  Top selling product item
  """
  type TopSellingProduct {
    productId: ID!
    productName: String!
    variantId: ID!
    variantName: String!
    sku: String!
    quantitySold: Int!
    revenue: Int!
    imageUrl: String
  }

  # ==================== LEGACY TYPES (kept for compatibility) ====================

  type LowStockProduct {
    product: Product!
    currentStock: Int!
    minStockAlert: Int!
  }

  type DashboardStats {
    totalOrders: Int!
    totalRevenue: Int!
    totalCustomers: Int!
    totalProducts: Int!
    pendingOrders: Int!
    lowStockProductsCount: Int!
  }

  # ==================== QUERIES ====================

  extend type Query {
    """
    Get comprehensive KPI metrics for the dashboard
    """
    dashboardKpiMetrics: KpiMetrics!

    """
    Get sales trend data for line chart
    """
    dashboardSalesTrend(days: Int): [SalesTrendDataPoint!]!

    """
    Get orders by status for bar chart
    """
    dashboardOrdersByStatus(days: Int): [OrdersChartDataPoint!]!

    """
    Get revenue by category for pie chart
    """
    dashboardRevenueByCategory: [RevenueByCategoryDataPoint!]!

    """
    Get recent orders for activity feed
    """
    dashboardRecentOrders(limit: Int): [RecentOrderItem!]!

    """
    Get low stock alerts
    """
    dashboardLowStockAlerts(threshold: Int): [LowStockAlert!]!

    """
    Get top selling products
    """
    dashboardTopSellingProducts(limit: Int): [TopSellingProduct!]!

    """
    Get products with low stock (legacy - for admin alerts)
    """
    lowStockProducts(threshold: Int): [Product!]!

    """
    Get dashboard statistics (legacy)
    """
    oscarDashboardStats: DashboardStats!
  }

  # ==================== MUTATIONS ====================

  extend type Mutation {
    """
    Toggle product featured status
    """
    toggleProductFeatured(productId: ID!): Product!

    """
    Update order tracking number
    """
    updateOrderTracking(orderId: ID!, trackingNumber: String!): Order!

    """
    Add admin notes to order
    """
    addOrderAdminNotes(orderId: ID!, notes: String!): Order!
  }
`;
//# sourceMappingURL=api-extensions.js.map