import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
  Ctx,
  RequestContext,
  Product,
  Order,
  Allow,
  Permission,
  ID,
  ProductService,
  OrderService,
  CustomerService,
  TransactionalConnection,
} from '@vendure/core';
import { OscarService } from '../services/oscar.service';
import {
  DashboardService,
  KpiMetrics,
  SalesTrendDataPoint,
  OrdersChartDataPoint,
  RevenueByCategoryDataPoint,
  RecentOrder,
  LowStockAlert,
  TopSellingProduct,
  CatalogStats,
  ProductsByCollectionPoint,
  RecentProductItem,
} from '../services/dashboard.service';

@Resolver()
export class OscarAdminResolver {
  constructor(
    private oscarService: OscarService,
    private dashboardService: DashboardService,
    private productService: ProductService,
    private orderService: OrderService,
    private customerService: CustomerService,
    private connection: TransactionalConnection,
  ) {}

  // ==================== DASHBOARD KPI QUERIES ====================

  @Query()
  @Allow(Permission.ReadOrder, Permission.ReadCustomer, Permission.ReadCatalog)
  async dashboardKpiMetrics(@Ctx() ctx: RequestContext): Promise<KpiMetrics> {
    return this.dashboardService.getKpiMetrics(ctx);
  }

  @Query()
  @Allow(Permission.ReadOrder)
  async dashboardSalesTrend(
    @Ctx() ctx: RequestContext,
    @Args() args: { days?: number },
  ): Promise<SalesTrendDataPoint[]> {
    return this.dashboardService.getSalesTrend(ctx, args.days ?? 30);
  }

  @Query()
  @Allow(Permission.ReadOrder)
  async dashboardOrdersByStatus(
    @Ctx() ctx: RequestContext,
    @Args() args: { days?: number },
  ): Promise<OrdersChartDataPoint[]> {
    return this.dashboardService.getOrdersByStatus(ctx, args.days ?? 7);
  }

  @Query()
  @Allow(Permission.ReadOrder, Permission.ReadCatalog)
  async dashboardRevenueByCategory(
    @Ctx() ctx: RequestContext,
  ): Promise<RevenueByCategoryDataPoint[]> {
    return this.dashboardService.getRevenueByCategory(ctx);
  }

  @Query()
  @Allow(Permission.ReadOrder)
  async dashboardRecentOrders(
    @Ctx() ctx: RequestContext,
    @Args() args: { limit?: number },
  ): Promise<RecentOrder[]> {
    return this.dashboardService.getRecentOrders(ctx, args.limit ?? 10);
  }

  @Query()
  @Allow(Permission.ReadCatalog)
  async dashboardLowStockAlerts(
    @Ctx() ctx: RequestContext,
    @Args() args: { threshold?: number },
  ): Promise<LowStockAlert[]> {
    return this.dashboardService.getLowStockAlerts(ctx, args.threshold ?? 10);
  }

  @Query()
  @Allow(Permission.ReadOrder, Permission.ReadCatalog)
  async dashboardTopSellingProducts(
    @Ctx() ctx: RequestContext,
    @Args() args: { limit?: number },
  ): Promise<TopSellingProduct[]> {
    return this.dashboardService.getTopSellingProducts(ctx, args.limit ?? 10);
  }

  @Query()
  @Allow(Permission.ReadCatalog)
  async dashboardCatalogStats(@Ctx() ctx: RequestContext): Promise<CatalogStats> {
    return this.dashboardService.getCatalogStats(ctx);
  }

  @Query()
  @Allow(Permission.ReadCatalog)
  async dashboardProductsByCollection(
    @Ctx() ctx: RequestContext,
    @Args() args: { limit?: number },
  ): Promise<ProductsByCollectionPoint[]> {
    return this.dashboardService.getProductsByCollection(ctx, args.limit ?? 8);
  }

  @Query()
  @Allow(Permission.ReadCatalog)
  async dashboardRecentProducts(
    @Ctx() ctx: RequestContext,
    @Args() args: { limit?: number },
  ): Promise<RecentProductItem[]> {
    return this.dashboardService.getRecentProducts(ctx, args.limit ?? 5);
  }

  // ==================== LEGACY QUERIES (kept for compatibility) ====================

  @Query()
  @Allow(Permission.ReadCatalog)
  async lowStockProducts(
    @Ctx() ctx: RequestContext,
    @Args() args: { threshold?: number },
  ): Promise<Product[]> {
    return this.oscarService.getLowStockProducts(ctx, args.threshold ?? 10);
  }

  @Query()
  @Allow(Permission.ReadOrder, Permission.ReadCustomer, Permission.ReadCatalog)
  async oscarDashboardStats(@Ctx() ctx: RequestContext) {
    // Get total orders
    const orders = await this.orderService.findAll(ctx, { take: 1 });
    const totalOrders = orders.totalItems;

    // Get pending orders count
    const pendingOrders = await this.orderService.findAll(ctx, {
      filter: { state: { eq: 'PaymentAuthorized' } },
      take: 1,
    });

    // Get total customers
    const customers = await this.customerService.findAll(ctx, { take: 1 });
    const totalCustomers = customers.totalItems;

    // Get total products
    const products = await this.productService.findAll(ctx, { take: 1 });
    const totalProducts = products.totalItems;

    // Calculate total revenue (simplified)
    const allOrders = await this.orderService.findAll(ctx, {
      filter: { state: { in: ['PaymentSettled', 'Shipped', 'Delivered'] } },
    });
    const totalRevenue = allOrders.items.reduce(
      (sum, order) => sum + order.totalWithTax,
      0,
    );

    return {
      totalOrders,
      totalRevenue,
      totalCustomers,
      totalProducts,
      pendingOrders: pendingOrders.totalItems,
      lowStockProductsCount: 0, // Would need proper stock checking
    };
  }

  // ==================== MUTATIONS ====================

  @Mutation()
  @Allow(Permission.UpdateCatalog)
  async toggleProductFeatured(
    @Ctx() ctx: RequestContext,
    @Args() args: { productId: ID },
  ): Promise<Product> {
    const product = await this.productService.findOne(ctx, args.productId);
    if (!product) {
      throw new Error('Product not found');
    }

    const currentValue = (product.customFields as any)?.isFeatured ?? false;

    return this.productService.update(ctx, {
      id: args.productId,
      customFields: {
        isFeatured: !currentValue,
      },
    });
  }

  @Mutation()
  @Allow(Permission.UpdateOrder)
  async updateOrderTracking(
    @Ctx() ctx: RequestContext,
    @Args() args: { orderId: ID; trackingNumber: string },
  ): Promise<Order> {
    const order = await this.orderService.findOne(ctx, args.orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    // Update custom field
    await this.connection.getRepository(ctx, Order).update(
      { id: args.orderId },
      {
        customFields: {
          ...order.customFields,
          trackingNumber: args.trackingNumber,
        },
      },
    );

    return this.orderService.findOne(ctx, args.orderId) as Promise<Order>;
  }

  @Mutation()
  @Allow(Permission.UpdateOrder)
  async addOrderAdminNotes(
    @Ctx() ctx: RequestContext,
    @Args() args: { orderId: ID; notes: string },
  ): Promise<Order> {
    const order = await this.orderService.findOne(ctx, args.orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    await this.connection.getRepository(ctx, Order).update(
      { id: args.orderId },
      {
        customFields: {
          ...order.customFields,
          adminNotes: args.notes,
        },
      },
    );

    return this.orderService.findOne(ctx, args.orderId) as Promise<Order>;
  }
}
