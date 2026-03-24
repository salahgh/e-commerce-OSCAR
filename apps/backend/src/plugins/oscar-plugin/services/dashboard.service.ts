import { Injectable } from '@nestjs/common';
import {
  RequestContext,
  TransactionalConnection,
  OrderService,
  CustomerService,
  ProductService,
  ProductVariantService,
  Order,
  Customer,
  Product,
  ProductVariant,
  OrderLine,
  Collection,
} from '@vendure/core';
import { MoreThanOrEqual, Between, In } from 'typeorm';

export interface KpiMetrics {
  // Revenue metrics
  revenueToday: number;
  revenueThisWeek: number;
  revenueThisMonth: number;
  revenueLastMonth: number;
  revenueGrowth: number;

  // Order metrics
  ordersToday: number;
  ordersThisWeek: number;
  ordersThisMonth: number;
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;

  // Customer metrics
  newCustomersToday: number;
  newCustomersThisWeek: number;
  newCustomersThisMonth: number;
  totalCustomers: number;

  // Product metrics
  totalProducts: number;
  activeProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;

  // Calculated metrics
  averageOrderValue: number;
  conversionRate: number;
}

export interface SalesTrendDataPoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface OrdersChartDataPoint {
  date: string;
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
}

export interface RevenueByCategoryDataPoint {
  categoryId: string;
  categoryName: string;
  revenue: number;
  percentage: number;
}

export interface RecentOrder {
  id: string;
  code: string;
  customerName: string;
  customerEmail: string;
  total: number;
  state: string;
  itemCount: number;
  createdAt: Date;
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
  imageUrl: string | null;
}

@Injectable()
export class DashboardService {
  constructor(
    private connection: TransactionalConnection,
    private orderService: OrderService,
    private customerService: CustomerService,
    private productService: ProductService,
    private productVariantService: ProductVariantService,
  ) {}

  /**
   * Get comprehensive KPI metrics for the dashboard
   */
  async getKpiMetrics(ctx: RequestContext): Promise<KpiMetrics> {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Get repositories
    const orderRepo = this.connection.getRepository(ctx, Order);
    const customerRepo = this.connection.getRepository(ctx, Customer);
    const productRepo = this.connection.getRepository(ctx, Product);

    // Revenue calculations using simple entity fetching
    const completedStates = ['PaymentSettled', 'Shipped', 'Delivered', 'PartiallyShipped', 'PartiallyDelivered'];

    const revenueToday = await this.calculateRevenue(ctx, todayStart, now, completedStates);
    const revenueThisWeek = await this.calculateRevenue(ctx, weekStart, now, completedStates);
    const revenueThisMonth = await this.calculateRevenue(ctx, monthStart, now, completedStates);
    const revenueLastMonth = await this.calculateRevenue(ctx, lastMonthStart, lastMonthEnd, completedStates);

    const revenueGrowth = revenueLastMonth > 0
      ? ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100
      : 0;

    // Order counts by state
    const ordersToday = await orderRepo.count({
      where: { createdAt: MoreThanOrEqual(todayStart) },
    });

    const ordersThisWeek = await orderRepo.count({
      where: { createdAt: MoreThanOrEqual(weekStart) },
    });

    const ordersThisMonth = await orderRepo.count({
      where: { createdAt: MoreThanOrEqual(monthStart) },
    });

    const totalOrders = await orderRepo.count();

    const pendingOrders = await orderRepo.count({
      where: { state: 'PaymentAuthorized' },
    });

    const processingOrders = await orderRepo.count({
      where: { state: 'PaymentSettled' },
    });

    const shippedOrders = await orderRepo.count({
      where: { state: 'Shipped' },
    });

    const deliveredOrders = await orderRepo.count({
      where: { state: 'Delivered' },
    });

    const cancelledOrders = await orderRepo.count({
      where: { state: 'Cancelled' },
    });

    // Customer counts
    const newCustomersToday = await customerRepo.count({
      where: { createdAt: MoreThanOrEqual(todayStart) },
    });

    const newCustomersThisWeek = await customerRepo.count({
      where: { createdAt: MoreThanOrEqual(weekStart) },
    });

    const newCustomersThisMonth = await customerRepo.count({
      where: { createdAt: MoreThanOrEqual(monthStart) },
    });

    const totalCustomers = await customerRepo.count();

    // Product counts
    const totalProducts = await productRepo.count();

    const activeProducts = await productRepo.count({
      where: { enabled: true },
    });

    // Low stock and out of stock (simplified)
    const lowStockProducts = 0; // Will implement properly
    const outOfStockProducts = 0; // Will implement properly

    // Average order value
    const averageOrderValue = ordersThisMonth > 0 ? revenueThisMonth / ordersThisMonth : 0;

    // Simplified conversion rate
    const conversionRate = totalCustomers > 0 ? (totalOrders / totalCustomers) * 100 : 0;

    return {
      revenueToday,
      revenueThisWeek,
      revenueThisMonth,
      revenueLastMonth,
      revenueGrowth,
      ordersToday,
      ordersThisWeek,
      ordersThisMonth,
      totalOrders,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      newCustomersToday,
      newCustomersThisWeek,
      newCustomersThisMonth,
      totalCustomers,
      totalProducts,
      activeProducts,
      lowStockProducts,
      outOfStockProducts,
      averageOrderValue,
      conversionRate,
    };
  }

  /**
   * Get sales trend data for line chart (last 30 days)
   */
  async getSalesTrend(ctx: RequestContext, days: number = 30): Promise<SalesTrendDataPoint[]> {
    const completedStates = ['PaymentSettled', 'Shipped', 'Delivered', 'PartiallyShipped', 'PartiallyDelivered'];
    const result: SalesTrendDataPoint[] = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const revenue = await this.calculateRevenue(ctx, dayStart, dayEnd, completedStates);
      const orderCount = await this.countOrdersInRange(ctx, dayStart, dayEnd, completedStates);

      result.push({
        date: dayStart.toISOString().split('T')[0],
        revenue,
        orders: orderCount,
      });
    }

    return result;
  }

  /**
   * Get orders by status for bar chart (last 7 days)
   */
  async getOrdersByStatus(ctx: RequestContext, days: number = 7): Promise<OrdersChartDataPoint[]> {
    const orderRepo = this.connection.getRepository(ctx, Order);
    const result: OrdersChartDataPoint[] = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const pending = await orderRepo.count({
        where: {
          createdAt: Between(dayStart, dayEnd),
          state: 'PaymentAuthorized' as any,
        },
      });

      const processing = await orderRepo.count({
        where: {
          createdAt: Between(dayStart, dayEnd),
          state: 'PaymentSettled' as any,
        },
      });

      const shipped = await orderRepo.count({
        where: {
          createdAt: Between(dayStart, dayEnd),
          state: 'Shipped' as any,
        },
      });

      const delivered = await orderRepo.count({
        where: {
          createdAt: Between(dayStart, dayEnd),
          state: 'Delivered' as any,
        },
      });

      const cancelled = await orderRepo.count({
        where: {
          createdAt: Between(dayStart, dayEnd),
          state: 'Cancelled' as any,
        },
      });

      result.push({
        date: dayStart.toISOString().split('T')[0],
        pending,
        processing,
        shipped,
        delivered,
        cancelled,
      });
    }

    return result;
  }

  /**
   * Get revenue by category for pie chart (simplified version)
   */
  async getRevenueByCategory(ctx: RequestContext): Promise<RevenueByCategoryDataPoint[]> {
    // Return empty for now - category revenue requires complex join queries
    // that need proper Vendure relationship handling
    return [];
  }

  /**
   * Get recent orders for the activity feed
   */
  async getRecentOrders(ctx: RequestContext, limit: number = 10): Promise<RecentOrder[]> {
    const { items } = await this.orderService.findAll(ctx, {
      take: limit,
      sort: { createdAt: 'DESC' as any },
    });

    return items.map(order => ({
      id: order.id.toString(),
      code: order.code,
      customerName: order.customer
        ? `${order.customer.firstName} ${order.customer.lastName}`
        : 'Guest',
      customerEmail: order.customer?.emailAddress || 'N/A',
      total: order.totalWithTax,
      state: order.state,
      itemCount: order.lines?.reduce((sum, line) => sum + line.quantity, 0) || 0,
      createdAt: order.createdAt,
    }));
  }

  /**
   * Get low stock alerts (simplified)
   * Note: In Vendure 3.x, stock is managed via StockLevel entities
   * This simplified version uses direct entity access
   */
  async getLowStockAlerts(ctx: RequestContext, threshold: number = 10): Promise<LowStockAlert[]> {
    const variantRepo = this.connection.getRepository(ctx, ProductVariant);

    // Get variants with their stock levels
    const variants = await variantRepo.find({
      take: 100,
      relations: ['product'],
    });

    const alerts: LowStockAlert[] = [];

    for (const variant of variants) {
      // Access stockOnHand from the raw entity (not translated)
      const stockOnHand = (variant as any).stockOnHand ?? 0;
      const customThreshold = (variant.customFields as any)?.minStockAlert || threshold;

      if (stockOnHand <= customThreshold && stockOnHand > 0) {
        const productName = (variant as any).product?.name || 'Unknown';

        alerts.push({
          productId: variant.productId.toString(),
          productName,
          variantId: variant.id.toString(),
          variantName: variant.sku || `Variant ${variant.id}`,
          sku: variant.sku,
          currentStock: stockOnHand,
          threshold: customThreshold,
        });
      }
    }

    // Sort by stock level ascending
    alerts.sort((a, b) => a.currentStock - b.currentStock);

    return alerts.slice(0, 20);
  }

  /**
   * Get top selling products (simplified)
   */
  async getTopSellingProducts(ctx: RequestContext, limit: number = 10): Promise<TopSellingProduct[]> {
    // Get recent completed orders
    const { items: orders } = await this.orderService.findAll(ctx, {
      take: 100,
      filter: {
        state: { in: ['PaymentSettled', 'Shipped', 'Delivered'] },
      },
    });

    // Aggregate sales by variant
    const variantSales = new Map<string, { quantity: number; revenue: number; variantId: string }>();

    for (const order of orders) {
      for (const line of order.lines || []) {
        const variantId = line.productVariant?.id?.toString() || '';
        if (!variantId) continue;

        const existing = variantSales.get(variantId) || { quantity: 0, revenue: 0, variantId };
        existing.quantity += line.quantity;
        existing.revenue += line.linePriceWithTax;
        variantSales.set(variantId, existing);
      }
    }

    // Sort by quantity and get top sellers
    const sorted = Array.from(variantSales.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, limit);

    // Fetch variant details
    const result: TopSellingProduct[] = [];
    for (const sale of sorted) {
      const variant = await this.productVariantService.findOne(ctx, sale.variantId);
      if (!variant) continue;

      const product = await this.productService.findOne(ctx, variant.productId);

      result.push({
        productId: variant.productId.toString(),
        productName: product?.name || 'Unknown',
        variantId: sale.variantId,
        variantName: variant.sku || `Variant ${variant.id}`,
        sku: variant.sku,
        quantitySold: sale.quantity,
        revenue: sale.revenue,
        imageUrl: product?.featuredAsset?.preview || null,
      });
    }

    return result;
  }

  // Helper methods
  private async calculateRevenue(
    ctx: RequestContext,
    startDate: Date,
    endDate: Date,
    states: string[],
  ): Promise<number> {
    const orderRepo = this.connection.getRepository(ctx, Order);

    // Use entity fetching instead of raw SQL
    const orders = await orderRepo.find({
      where: {
        createdAt: Between(startDate, endDate),
        state: In(states) as any,
      },
    });

    return orders.reduce((sum, order) => sum + order.totalWithTax, 0);
  }

  private async countOrdersInRange(
    ctx: RequestContext,
    startDate: Date,
    endDate: Date,
    states: string[],
  ): Promise<number> {
    const orderRepo = this.connection.getRepository(ctx, Order);

    return orderRepo.count({
      where: {
        createdAt: Between(startDate, endDate),
        state: In(states) as any,
      },
    });
  }
}
