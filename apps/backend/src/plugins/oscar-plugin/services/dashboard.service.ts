import { Injectable } from '@nestjs/common';
import {
  RequestContext,
  TransactionalConnection,
  OrderService,
  CustomerService,
  ProductService,
  ProductVariantService,
  CollectionService,
  Order,
  Customer,
  Product,
  ProductVariant,
  ProductVariantPrice,
  OrderLine,
  Collection,
  StockLevel,
} from '@vendure/core';
import { MoreThanOrEqual, Between, In, IsNull } from 'typeorm';

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

export interface CatalogStats {
  totalProducts: number;
  enabledProducts: number;
  disabledProducts: number;
  totalVariants: number;
  outOfStockVariants: number;
  lowStockVariants: number;
  productsWithoutImages: number;
  newProductsThisMonth: number;
  totalInventoryValue: string;
  averageProductPrice: number;
}

export interface ProductsByCollectionPoint {
  collectionId: string;
  collectionName: string;
  productCount: number;
}

export interface RecentProductItem {
  id: string;
  name: string;
  slug: string;
  featuredAssetPreview: string | null;
  createdAt: Date;
  enabled: boolean;
  variantCount: number;
}

interface VariantStockRow {
  variantId: string;
  productId: string;
  available: string;
}

@Injectable()
export class DashboardService {
  constructor(
    private connection: TransactionalConnection,
    private orderService: OrderService,
    private customerService: CustomerService,
    private productService: ProductService,
    private productVariantService: ProductVariantService,
    private collectionService: CollectionService,
  ) {}

  /**
   * Returns one row per non-deleted product variant with the summed available
   * stock across all stock locations: SUM(stockOnHand - stockAllocated).
   * Variants without any StockLevel rows yield available=0.
   */
  private async getVariantStockRows(ctx: RequestContext): Promise<VariantStockRow[]> {
    return this.connection
      .getRepository(ctx, ProductVariant)
      .createQueryBuilder('variant')
      .leftJoin(StockLevel, 'sl', 'sl."productVariantId" = variant.id')
      .where('variant.deletedAt IS NULL')
      .select('variant.id', 'variantId')
      .addSelect('variant.productId', 'productId')
      .addSelect('COALESCE(SUM(sl."stockOnHand" - sl."stockAllocated"), 0)', 'available')
      .groupBy('variant.id')
      .addGroupBy('variant.productId')
      .getRawMany<VariantStockRow>();
  }

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

    // Low stock and out of stock — aggregate over StockLevel entries per variant,
    // then count DISTINCT products. Threshold default 10.
    const lowStockThreshold = 10;
    const stockRows = await this.getVariantStockRows(ctx);
    const outOfStockProductIds = new Set<string>();
    const lowStockProductIds = new Set<string>();
    for (const row of stockRows) {
      const available = Number(row.available);
      if (available <= 0) {
        outOfStockProductIds.add(row.productId);
      } else if (available <= lowStockThreshold) {
        lowStockProductIds.add(row.productId);
      }
    }
    const lowStockProducts = lowStockProductIds.size;
    const outOfStockProducts = outOfStockProductIds.size;

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
   * Get revenue by category for the pie chart. Joins order lines through the
   * variant and the collection many-to-many table, sums (listPrice * quantity)
   * across completed orders, groups by collection. Names are hydrated via
   * CollectionService so translations resolve under ctx.languageCode.
   *
   * Note: `linePriceWithTax` is a TypeScript getter on OrderLine (computed
   * from listPrice/taxLines/adjustments) and does NOT exist as a DB column,
   * so we use `listPrice * quantity` as the per-line revenue. Close enough
   * for a category-share visualization.
   */
  async getRevenueByCategory(ctx: RequestContext): Promise<RevenueByCategoryDataPoint[]> {
    const completedStates = [
      'PaymentSettled',
      'Shipped',
      'Delivered',
      'PartiallyShipped',
      'PartiallyDelivered',
    ];

    const rows = await this.connection
      .getRepository(ctx, OrderLine)
      .createQueryBuilder('line')
      .innerJoin('order', 'o', 'o.id = line."orderId"')
      .innerJoin(
        'collection_product_variants_product_variant',
        'cpv',
        'cpv."productVariantId" = line."productVariantId"',
      )
      .where('o.state IN (:...states)', { states: completedStates })
      .select('cpv."collectionId"', 'collectionId')
      .addSelect('SUM(line."listPrice" * line."quantity")', 'revenue')
      .groupBy('cpv."collectionId"')
      .getRawMany<{ collectionId: string; revenue: string }>();

    if (rows.length === 0) return [];

    const collections = await Promise.all(
      rows.map(r => this.collectionService.findOne(ctx, r.collectionId)),
    );
    const nameById = new Map<string, string>();
    for (const c of collections) {
      if (c) nameById.set(c.id.toString(), c.name);
    }

    const totalRevenue = rows.reduce((sum, r) => sum + Number(r.revenue || 0), 0);

    return rows
      .map(row => {
        const revenue = Number(row.revenue || 0);
        return {
          categoryId: row.collectionId.toString(),
          categoryName: nameById.get(row.collectionId.toString()) || 'Unknown',
          revenue,
          percentage: totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0,
        };
      })
      .sort((a, b) => b.revenue - a.revenue);
  }

  /**
   * Catalog-wide KPIs covering total products, variants, stock health,
   * products without images, recently added products, and inventory value.
   */
  async getCatalogStats(ctx: RequestContext): Promise<CatalogStats> {
    const productRepo = this.connection.getRepository(ctx, Product);
    const variantRepo = this.connection.getRepository(ctx, ProductVariant);

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lowStockThreshold = 10;

    const totalProducts = await productRepo.count({ where: { deletedAt: IsNull() } as any });
    const enabledProducts = await productRepo.count({
      where: { enabled: true, deletedAt: IsNull() } as any,
    });
    const disabledProducts = totalProducts - enabledProducts;

    const totalVariants = await variantRepo.count({
      where: { deletedAt: IsNull() } as any,
    });

    const productsWithoutImages = await productRepo.count({
      where: { featuredAssetId: IsNull(), deletedAt: IsNull() } as any,
    });

    const newProductsThisMonth = await productRepo.count({
      where: { createdAt: MoreThanOrEqual(monthStart), deletedAt: IsNull() } as any,
    });

    // Stock health — reuse the per-variant aggregate.
    const stockRows = await this.getVariantStockRows(ctx);
    let outOfStockVariants = 0;
    let lowStockVariants = 0;
    for (const row of stockRows) {
      const available = Number(row.available);
      if (available <= 0) outOfStockVariants++;
      else if (available <= lowStockThreshold) lowStockVariants++;
    }

    // Inventory value: SUM(stockOnHand * variantPrice) for the active channel/currency.
    const currencyCode = ctx.channel.defaultCurrencyCode;
    const channelId = ctx.channelId;
    const inventoryRow = await this.connection
      .getRepository(ctx, StockLevel)
      .createQueryBuilder('sl')
      .innerJoin(
        ProductVariantPrice,
        'pvp',
        'pvp."variantId" = sl."productVariantId" AND pvp."channelId" = :channelId AND pvp."currencyCode" = :currency',
        { channelId, currency: currencyCode },
      )
      .select('COALESCE(SUM(sl."stockOnHand" * pvp."price"), 0)::text', 'inventoryValue')
      .getRawOne<{ inventoryValue: string }>();

    const averagePriceRow = await this.connection
      .getRepository(ctx, ProductVariantPrice)
      .createQueryBuilder('pvp')
      .where('pvp."channelId" = :channelId', { channelId })
      .andWhere('pvp."currencyCode" = :currency', { currency: currencyCode })
      .select('COALESCE(ROUND(AVG(pvp."price")), 0)', 'avgPrice')
      .getRawOne<{ avgPrice: string }>();

    return {
      totalProducts,
      enabledProducts,
      disabledProducts,
      totalVariants,
      outOfStockVariants,
      lowStockVariants,
      productsWithoutImages,
      newProductsThisMonth,
      totalInventoryValue: inventoryRow?.inventoryValue || '0',
      averageProductPrice: Number(averagePriceRow?.avgPrice || 0),
    };
  }

  /**
   * Top N collections by distinct product count, sorted DESC.
   * Names are hydrated via CollectionService for ctx.languageCode.
   */
  async getProductsByCollection(
    ctx: RequestContext,
    limit: number = 8,
  ): Promise<ProductsByCollectionPoint[]> {
    const rows = await this.connection
      .getRepository(ctx, ProductVariant)
      .createQueryBuilder('variant')
      .innerJoin(
        'collection_product_variants_product_variant',
        'cpv',
        'cpv."productVariantId" = variant.id',
      )
      .where('variant.deletedAt IS NULL')
      .select('cpv."collectionId"', 'collectionId')
      .addSelect('COUNT(DISTINCT variant.productId)', 'productCount')
      .groupBy('cpv."collectionId"')
      .orderBy('"productCount"', 'DESC')
      .limit(limit)
      .getRawMany<{ collectionId: string; productCount: string }>();

    if (rows.length === 0) return [];

    const collections = await Promise.all(
      rows.map(r => this.collectionService.findOne(ctx, r.collectionId)),
    );
    const byId = new Map<string, Collection>();
    for (const c of collections) {
      if (c) byId.set(c.id.toString(), c);
    }

    return rows.map(row => {
      const collection = byId.get(row.collectionId.toString());
      return {
        collectionId: row.collectionId.toString(),
        collectionName: collection?.name || 'Unknown',
        productCount: Number(row.productCount),
      };
    });
  }

  /**
   * Most recently created products, with translated name + variant count.
   */
  async getRecentProducts(
    ctx: RequestContext,
    limit: number = 5,
  ): Promise<RecentProductItem[]> {
    const { items } = await this.productService.findAll(ctx, {
      take: limit,
      sort: { createdAt: 'DESC' as any },
    });

    return Promise.all(
      items.map(async product => {
        const variants = await this.productVariantService.getVariantsByProductId(ctx, product.id);
        return {
          id: product.id.toString(),
          name: product.name,
          slug: product.slug,
          featuredAssetPreview: product.featuredAsset?.preview || null,
          createdAt: product.createdAt,
          enabled: product.enabled,
          variantCount: variants.totalItems,
        };
      }),
    );
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
   * Get low stock alerts. Aggregates summed `stockOnHand - stockAllocated` across
   * all StockLevel rows per variant. Includes variants with currentStock <= 0
   * (so the alert panel surfaces out-of-stock items too) up to the threshold.
   */
  async getLowStockAlerts(ctx: RequestContext, threshold: number = 10): Promise<LowStockAlert[]> {
    const rows = await this.connection
      .getRepository(ctx, ProductVariant)
      .createQueryBuilder('variant')
      .leftJoin(StockLevel, 'sl', 'sl."productVariantId" = variant.id')
      .where('variant.deletedAt IS NULL')
      .select('variant.id', 'variantId')
      .addSelect('variant.productId', 'productId')
      .addSelect('variant.sku', 'sku')
      .addSelect('COALESCE(SUM(sl."stockOnHand" - sl."stockAllocated"), 0)', 'available')
      .groupBy('variant.id')
      .addGroupBy('variant.productId')
      .addGroupBy('variant.sku')
      .having('COALESCE(SUM(sl."stockOnHand" - sl."stockAllocated"), 0) <= :threshold', { threshold })
      .orderBy('available', 'ASC')
      .limit(50)
      .getRawMany<{ variantId: string; productId: string; sku: string; available: string }>();

    if (rows.length === 0) return [];

    // Hydrate product names via the service so translations resolve.
    const productIds = Array.from(new Set(rows.map(r => r.productId)));
    const products = await Promise.all(
      productIds.map(id => this.productService.findOne(ctx, id)),
    );
    const productNameById = new Map<string, string>();
    for (const product of products) {
      if (product) productNameById.set(product.id.toString(), product.name);
    }

    return rows.map(row => ({
      productId: row.productId.toString(),
      productName: productNameById.get(row.productId.toString()) || 'Unknown',
      variantId: row.variantId.toString(),
      variantName: row.sku || `Variant ${row.variantId}`,
      sku: row.sku,
      currentStock: Number(row.available),
      threshold,
    }));
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
