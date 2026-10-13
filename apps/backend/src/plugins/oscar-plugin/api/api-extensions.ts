import gql from 'graphql-tag';

export const shopApiExtensions = gql`
  type MultilingualSearchResult {
    items: [Product!]!
    totalItems: Int!
  }

  """
  A wilaya customers can be delivered to, with the communes they can pick.
  """
  type DeliveryDestination {
    code: String!
    name: String!
    nameAr: String!
    "Delivery-delay zone 1..4 (storefronts map it to a localized estimate)"
    shippingZone: Int!
    communes: [DeliveryDestinationCommune!]!
  }

  type DeliveryDestinationCommune {
    code: String!
    name: String!
    nameAr: String!
    postalCode: String
  }

  extend type Query {
    """
    Active delivery wilayas with their active communes, ordered by code.
    Managed in the back-office; drives the address forms.
    """
    deliveryDestinations: [DeliveryDestination!]!

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

  type IncompleteProduct {
    id: ID!
    name: String!
    enabled: Boolean!
    createdAt: DateTime!
  }

  type CollectionVariantCount {
    collectionId: ID!
    count: Int!
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

  # ==================== DELIVERY DESTINATIONS ====================

  """
  A delivery wilaya (managed in Settings → Livraison): the destination itself
  and its two delivery prices. A null price means that delivery mode is not
  offered in the wilaya; an inactive wilaya is hidden from customers.
  """
  type DeliveryWilaya {
    id: ID!
    "Two-digit code"
    code: String!
    name: String!
    nameAr: String!
    "Offered to customers at all"
    active: Boolean!
    "Delivery-delay zone 1..4"
    shippingZone: Int!
    "Home-delivery price in minor units (centimes), or null when not offered"
    homePrice: Int
    "Courier-office pickup price in minor units (centimes), or null when not offered"
    officePrice: Int
    communes: [DeliveryCommune!]!
  }

  type DeliveryCommune {
    id: ID!
    "Wilaya code + two-digit sequence, generated"
    code: String!
    name: String!
    nameAr: String!
    postalCode: String
    active: Boolean!
  }

  input CreateDeliveryWilayaInput {
    "Two digits, unique"
    code: String!
    name: String!
    nameAr: String!
    shippingZone: Int!
    homePrice: Int
    officePrice: Int
  }

  "Omitted fields are unchanged; an explicit null price stops offering that mode."
  input UpdateDeliveryWilayaInput {
    id: ID!
    name: String
    nameAr: String
    active: Boolean
    shippingZone: Int
    homePrice: Int
    officePrice: Int
  }

  input CreateDeliveryCommuneInput {
    wilayaId: ID!
    name: String!
    nameAr: String!
    postalCode: String
  }

  input UpdateDeliveryCommuneInput {
    id: ID!
    name: String
    nameAr: String
    postalCode: String
    active: Boolean
  }

  input UpdateWilayaShippingPriceInput {
    code: String!
    "Home-delivery price in minor units (centimes); null to stop offering it"
    homePrice: Int
    "Courier-office pickup price in minor units (centimes); null to stop offering it"
    officePrice: Int
  }

  # ==================== QUERIES ====================

  extend type Query {
    """
    Every delivery wilaya (active or not) with its communes, ordered by code
    """
    deliveryWilayas: [DeliveryWilaya!]!

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
    Products in this channel that have no variants (never search-indexed), newest first.
    """
    productsWithoutVariants(limit: Int): [IncompleteProduct!]!

    """
    Non-deleted variant count per collection in this channel (one grouped query). Collections with zero variants are omitted.
    """
    collectionVariantCounts: [CollectionVariantCount!]!

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
    Update delivery prices for one or more wilayas (bulk save of the price grid)
    """
    updateWilayaShippingPrices(input: [UpdateWilayaShippingPriceInput!]!): [DeliveryWilaya!]!

    createDeliveryWilaya(input: CreateDeliveryWilayaInput!): DeliveryWilaya!
    updateDeliveryWilaya(input: UpdateDeliveryWilayaInput!): DeliveryWilaya!
    "Deletes the wilaya and its communes. Existing orders keep their address text."
    deleteDeliveryWilaya(id: ID!): Boolean!
    createDeliveryCommune(input: CreateDeliveryCommuneInput!): DeliveryCommune!
    updateDeliveryCommune(input: UpdateDeliveryCommuneInput!): DeliveryCommune!
    deleteDeliveryCommune(id: ID!): Boolean!

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

  extend type Mutation {
    """
    Modify an unshipped order in one call: enters Modifying, applies the changes, settles the
    money side (COD authorization follows the new total; a lower total refunds against the
    existing payment; a higher total on a paid order goes to ArrangingAdditionalPayment) and
    returns to the original state. With dryRun: true nothing is persisted and the previewed
    order is returned.
    """
    modifyOrderGuided(input: ModifyOrderInput!): ModifyOrderResult!
  }
`;
