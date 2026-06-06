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
import { MoreThanOrEqual, IsNull, Not } from 'typeorm';

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
  /**
   * Orders per customer (placed orders / total customers). NOT a true conversion
   * rate — we have no traffic/session data to compute orders ÷ visitors.
   */
  ordersPerCustomer: number;
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
    // Week starts Monday (locale convention for DZ/FR). getDay(): 0=Sun..6=Sat.
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Get repositories
    const orderRepo = this.connection.getRepository(ctx, Order);
    const customerRepo = this.connection.getRepository(ctx, Customer);
    const productRepo = this.connection.getRepository(ctx, Product);

    // Revenue is summed over PLACED orders in "completed" payment/fulfilment
    // states. calculateRevenue anchors on orderPlacedAt with a half-open
    // [start, end) interval, so active carts (AddingItems) are excluded and
    // orders never double-count at day boundaries.
    const completedStates = ['PaymentSettled', 'Shipped', 'Delivered', 'PartiallyShipped', 'PartiallyDelivered'];

    const revenueToday = await this.calculateRevenue(ctx, todayStart, now, completedStates);
    const revenueThisWeek = await this.calculateRevenue(ctx, weekStart, now, completedStates);
    const revenueThisMonth = await this.calculateRevenue(ctx, monthStart, now, completedStates);
    // Full previous month: [lastMonthStart, monthStart) — half-open so the last
    // day of the previous month is included (the old `day 0` upper bound dropped it).
    const revenueLastMonth = await this.calculateRevenue(ctx, lastMonthStart, monthStart, completedStates);

    // Growth compares like-for-like: month-to-date vs the SAME elapsed window of
    // the previous month (not partial month vs full month, which always skewed
    // negative early in the month).
    const monthElapsedMs = now.getTime() - monthStart.getTime();
    const lastMonthToDateEnd = new Date(lastMonthStart.getTime() + monthElapsedMs);
    const revenueLastMonthToDate = await this.calculateRevenue(
      ctx,
      lastMonthStart,
      lastMonthToDateEnd,
      completedStates,
    );
    const revenueGrowth = revenueLastMonthToDate > 0
      ? ((revenueThisMonth - revenueLastMonthToDate) / revenueLastMonthToDate) * 100
      : 0;

    // Order counts cover PLACED orders only (orderPlacedAt set). Counting by
    // createdAt with no state filter previously included every abandoned cart
    // (state AddingItems), massively inflating "Commandes" and the ratio below.
    const ordersToday = await orderRepo.count({
      where: { orderPlacedAt: MoreThanOrEqual(todayStart) },
    });

    const ordersThisWeek = await orderRepo.count({
      where: { orderPlacedAt: MoreThanOrEqual(weekStart) },
    });

    const ordersThisMonth = await orderRepo.count({
      where: { orderPlacedAt: MoreThanOrEqual(monthStart) },
    });

    const totalOrders = await orderRepo.count({
      where: { orderPlacedAt: Not(IsNull()) },
    });

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

    // Product counts — exclude soft-deleted products so these agree with
    // getCatalogStats (which already filters deletedAt).
    const totalProducts = await productRepo.count({ where: { deletedAt: IsNull() } as any });

    const activeProducts = await productRepo.count({
      where: { enabled: true, deletedAt: IsNull() } as any,
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

    // Average order value: completed-order revenue ÷ count of those SAME orders.
    // (Previously divided by ALL orders this month incl. carts, understating AOV.)
    const completedOrdersThisMonth = await this.countOrdersInRange(ctx, monthStart, now, completedStates);
    const averageOrderValue = completedOrdersThisMonth > 0 ? revenueThisMonth / completedOrdersThisMonth : 0;

    // Orders per customer (lifetime placed orders ÷ customers). This is NOT a
    // conversion rate; renamed to stop presenting a >100% "rate".
    const ordersPerCustomer = totalCustomers > 0 ? totalOrders / totalCustomers : 0;

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
      ordersPerCustomer,
    };
  }

  /**
   * Get sales trend data for line chart (last 30 days)
   */
  async getSalesTrend(ctx: RequestContext, days: number = 30): Promise<SalesTrendDataPoint[]> {
    const completedStates = ['PaymentSettled', 'Shipped', 'Delivered', 'PartiallyShipped', 'PartiallyDelivered'];
    const now = new Date();

    // Build the day buckets (oldest -> newest) up front, then fetch all of them
    // concurrently instead of serially (was 2 queries * `days`, awaited one by one).
    const ranges: { dayStart: Date; dayEnd: Date }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);
      ranges.push({ dayStart, dayEnd });
    }

    return Promise.all(
      ranges.map(async ({ dayStart, dayEnd }) => {
        const [revenue, orders] = await Promise.all([
          this.calculateRevenue(ctx, dayStart, dayEnd, completedStates),
          this.countOrdersInRange(ctx, dayStart, dayEnd, completedStates),
        ]);
        return { date: dayStart.toISOString().split('T')[0], revenue, orders };
      }),
    );
  }

  /**
   * Get orders by status for bar chart (last 7 days)
   */
  async getOrdersByStatus(ctx: RequestContext, days: number = 7): Promise<OrdersChartDataPoint[]> {
    const orderRepo = this.connection.getRepository(ctx, Order);
    const now = new Date();

    const ranges: { dayStart: Date; dayEnd: Date }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);
      ranges.push({ dayStart, dayEnd });
    }

    // Half-open [dayStart, dayEnd) on orderPlacedAt: an order at exactly midnight
    // lands in one bucket only, and active carts (no orderPlacedAt) are excluded.
    const countFor = (dayStart: Date, dayEnd: Date, state: string) =>
      orderRepo
        .createQueryBuilder('o')
        .where('o.orderPlacedAt >= :dayStart', { dayStart })
        .andWhere('o.orderPlacedAt < :dayEnd', { dayEnd })
        .andWhere('o.state = :state', { state })
        .getCount();

    // Fetch every (day, state) count concurrently instead of 5 * `days` serial counts.
    return Promise.all(
      ranges.map(async ({ dayStart, dayEnd }) => {
        const [pending, processing, shipped, delivered, cancelled] = await Promise.all([
          countFor(dayStart, dayEnd, 'PaymentAuthorized'),
          countFor(dayStart, dayEnd, 'PaymentSettled'),
          countFor(dayStart, dayEnd, 'Shipped'),
          countFor(dayStart, dayEnd, 'Delivered'),
          countFor(dayStart, dayEnd, 'Cancelled'),
        ]);
        return {
          date: dayStart.toISOString().split('T')[0],
          pending,
          processing,
          shipped,
          delivered,
          cancelled,
        };
      }),
    );
  }

  /**
   * Get revenue by category for the pie chart. Joins order lines through the
   * variant and the collection many-to-many table, sums (listPrice * quantity)
   * across completed orders, groups by collection. Names are hydrated via
   * CollectionService so translations resolve under ctx.languageCode.
   *
   * Note: `linePriceWithTax` is a TypeScript getter on OrderLine (computed
   * from listPrice/taxLines/adjustments) and does NOT exist as a DB column,
   * so we use `listPrice * quantity` as the per-line revenue.
   *
   * Each order line is attributed to exactly ONE collection (DISTINCT ON the
   * line, taking the lowest collectionId) so the result is a true partition:
   * a variant in multiple collections no longer multiplies its revenue and the
   * percentages sum to 100%. Lines whose variant has no collection fall into an
   * "uncategorized" bucket (LEFT JOIN) so the pie still totals real revenue.
   */
  async getRevenueByCategory(ctx: RequestContext): Promise<RevenueByCategoryDataPoint[]> {
    const completedStates = [
      'PaymentSettled',
      'Shipped',
      'Delivered',
      'PartiallyShipped',
      'PartiallyDelivered',
    ];

    const rows: Array<{ collectionId: string | null; revenue: string }> = await this.connection
      .getRepository(ctx, OrderLine)
      .query(
        `SELECT t."collectionId" AS "collectionId", SUM(t.revenue)::text AS revenue
         FROM (
           SELECT DISTINCT ON (line.id)
                  cpv."collectionId" AS "collectionId",
                  (line."listPrice" * line."quantity") AS revenue
           FROM order_line line
           INNER JOIN "order" o ON o.id = line."orderId"
           LEFT JOIN collection_product_variants_product_variant cpv
                  ON cpv."productVariantId" = line."productVariantId"
           WHERE o.state = ANY($1)
           ORDER BY line.id, cpv."collectionId" NULLS LAST
         ) t
         GROUP BY t."collectionId"`,
        [completedStates],
      );

    if (rows.length === 0) return [];

    const ids = rows
      .map(r => r.collectionId)
      .filter((id): id is string => id != null);
    const collections = await Promise.all(
      ids.map(id => this.collectionService.findOne(ctx, id)),
    );
    const nameById = new Map<string, string>();
    for (const c of collections) {
      if (c) nameById.set(c.id.toString(), c.name);
    }

    const totalRevenue = rows.reduce((sum, r) => sum + Number(r.revenue || 0), 0);

    return rows
      .map(row => {
        const revenue = Number(row.revenue || 0);
        const uncategorized = row.collectionId == null;
        return {
          categoryId: uncategorized ? 'uncategorized' : row.collectionId!.toString(),
          categoryName: uncategorized
            ? 'Sans catégorie'
            : nameById.get(row.collectionId!.toString()) || 'Unknown',
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
    // Load `lines` (for itemCount) and `customer` (for name/email) — without these
    // relations `order.lines` is undefined and itemCount was always 0.
    const { items } = await this.orderService.findAll(
      ctx,
      {
        take: limit,
        sort: { createdAt: 'DESC' as any },
      },
      ['lines', 'customer'],
    );

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
   * Top selling products by units sold across ALL completed orders.
   *
   * Aggregated in SQL (GROUP BY variant) rather than scanning an arbitrary
   * `take: 100` recent slice in memory — the old approach was neither all-time
   * nor a defined window and silently dropped orders. Uses the same
   * `completedStates` as the rest of the dashboard, and `listPrice * quantity`
   * (ex-tax) for revenue to stay consistent with revenue-by-category.
   */
  async getTopSellingProducts(ctx: RequestContext, limit: number = 10): Promise<TopSellingProduct[]> {
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
      .where('o.state IN (:...states)', { states: completedStates })
      .andWhere('line."productVariantId" IS NOT NULL')
      .select('line."productVariantId"', 'variantId')
      .addSelect('SUM(line."quantity")', 'quantitySold')
      .addSelect('SUM(line."listPrice" * line."quantity")', 'revenue')
      .groupBy('line."productVariantId"')
      .orderBy('"quantitySold"', 'DESC')
      .limit(limit)
      .getRawMany<{ variantId: string; quantitySold: string; revenue: string }>();

    if (rows.length === 0) return [];

    const result: TopSellingProduct[] = [];
    for (const row of rows) {
      const variant = await this.productVariantService.findOne(ctx, row.variantId);
      if (!variant) continue;

      const product = await this.productService.findOne(ctx, variant.productId);

      result.push({
        productId: variant.productId.toString(),
        productName: product?.name || 'Unknown',
        variantId: row.variantId.toString(),
        variantName: variant.sku || `Variant ${variant.id}`,
        sku: variant.sku,
        quantitySold: Number(row.quantitySold),
        revenue: Number(row.revenue),
        imageUrl: product?.featuredAsset?.preview || null,
      });
    }

    return result;
  }

  // Helper methods

  /**
   * Sum of totalWithTax over orders PLACED in [startDate, endDate) in the given
   * states. Anchored on orderPlacedAt (excludes active carts) with a half-open
   * interval (no double-count at day boundaries). Summed in SQL rather than
   * loading every order into memory.
   */
  private async calculateRevenue(
    ctx: RequestContext,
    startDate: Date,
    endDate: Date,
    states: string[],
  ): Promise<number> {
    // Order.totalWithTax is a getter (subTotalWithTax + shippingWithTax), not a
    // column, so it can't be summed directly in SQL — sum the two real columns.
    const result = await this.connection
      .getRepository(ctx, Order)
      .createQueryBuilder('o')
      .select('COALESCE(SUM(o."subTotalWithTax" + o."shippingWithTax"), 0)', 'sum')
      .where('o.orderPlacedAt >= :startDate', { startDate })
      .andWhere('o.orderPlacedAt < :endDate', { endDate })
      .andWhere('o.state IN (:...states)', { states })
      .getRawOne<{ sum: string }>();

    return Number(result?.sum ?? 0);
  }

  /**
   * Count of orders PLACED in [startDate, endDate) in the given states.
   * Same anchoring/interval semantics as calculateRevenue.
   */
  private async countOrdersInRange(
    ctx: RequestContext,
    startDate: Date,
    endDate: Date,
    states: string[],
  ): Promise<number> {
    return this.connection
      .getRepository(ctx, Order)
      .createQueryBuilder('o')
      .where('o.orderPlacedAt >= :startDate', { startDate })
      .andWhere('o.orderPlacedAt < :endDate', { endDate })
      .andWhere('o.state IN (:...states)', { states })
      .getCount();
  }
}
