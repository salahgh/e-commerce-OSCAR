import gql from 'graphql-tag';

export const shopApiExtensions = gql`
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

    """
    Upload (or replace) the active customer's avatar image.
    Accepts a multipart file upload and returns the updated customer.
    """
    updateCustomerAvatar(file: Upload!): Customer!
  }
`;

export const adminApiExtensions = gql`
  # ==================== KPI METRICS ====================

  """
  Comprehensive KPI metrics for the dashboard
  """
  type KpiMetrics {
    # Revenue metrics (in cents). Float (not Int) so large totals can't overflow Int32.
    revenueToday: Float!
    revenueThisWeek: Float!
    revenueThisMonth: Float!
    revenueLastMonth: Float!
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
    "Placed orders ÷ total customers. NOT a conversion rate (no traffic data)."
    ordersPerCustomer: Float!
  }

  # ==================== CHART DATA ====================

  """
  Sales trend data point for line chart
  """
  type SalesTrendDataPoint {
    date: String!
    "Revenue in cents. Float to avoid Int32 overflow on high-volume days."
    revenue: Float!
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
    "Revenue in cents (ex-tax, listPrice × quantity). Float to avoid Int32 overflow."
    revenue: Float!
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
    "Order total with tax, in cents. Float to avoid Int32 overflow."
    total: Float!
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
    "Revenue in cents (ex-tax, listPrice × quantity). Float to avoid Int32 overflow."
    revenue: Float!
    imageUrl: String
  }

  # ==================== CATALOG STATS ====================

  """
  Point-in-time catalog metrics for the dashboard
  """
  type CatalogStats {
    totalProducts: Int!
    enabledProducts: Int!
    disabledProducts: Int!
    totalVariants: Int!
    outOfStockVariants: Int!
    lowStockVariants: Int!
    productsWithoutImages: Int!
    newProductsThisMonth: Int!
    "Total inventory value in minor units (cents). Returned as string because the value can exceed Int32."
    totalInventoryValue: String!
    "Average variant price in minor units (cents) across the active channel/currency."
    averageProductPrice: Int!
  }

  """
  Product count grouped by collection
  """
  type ProductsByCollectionPoint {
    collectionId: ID!
    collectionName: String!
    productCount: Int!
  }

  """
  Recently created product summary
  """
  type RecentProductItem {
    id: ID!
    name: String!
    slug: String!
    featuredAssetPreview: String
    createdAt: DateTime!
    enabled: Boolean!
    variantCount: Int!
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
    Point-in-time catalog metrics: products, variants, stock health, inventory value.
    """
    dashboardCatalogStats: CatalogStats!

    """
    Top N collections by distinct product count, sorted descending.
    """
    dashboardProductsByCollection(limit: Int): [ProductsByCollectionPoint!]!

    """
    Most recently created products, sorted by createdAt descending.
    """
    dashboardRecentProducts(limit: Int): [RecentProductItem!]!

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
