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

  extend type Query {
    """
    Get products with low stock (for admin alerts)
    """
    lowStockProducts(threshold: Int): [Product!]!

    """
    Get dashboard statistics
    """
    oscarDashboardStats: DashboardStats!
  }

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