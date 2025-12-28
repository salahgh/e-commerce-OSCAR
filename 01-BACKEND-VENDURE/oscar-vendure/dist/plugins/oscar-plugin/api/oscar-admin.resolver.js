"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OscarAdminResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const core_1 = require("@vendure/core");
const oscar_service_1 = require("../services/oscar.service");
const dashboard_service_1 = require("../services/dashboard.service");
let OscarAdminResolver = class OscarAdminResolver {
    constructor(oscarService, dashboardService, productService, orderService, customerService, connection) {
        this.oscarService = oscarService;
        this.dashboardService = dashboardService;
        this.productService = productService;
        this.orderService = orderService;
        this.customerService = customerService;
        this.connection = connection;
    }
    // ==================== DASHBOARD KPI QUERIES ====================
    async dashboardKpiMetrics(ctx) {
        return this.dashboardService.getKpiMetrics(ctx);
    }
    async dashboardSalesTrend(ctx, args) {
        return this.dashboardService.getSalesTrend(ctx, args.days ?? 30);
    }
    async dashboardOrdersByStatus(ctx, args) {
        return this.dashboardService.getOrdersByStatus(ctx, args.days ?? 7);
    }
    async dashboardRevenueByCategory(ctx) {
        return this.dashboardService.getRevenueByCategory(ctx);
    }
    async dashboardRecentOrders(ctx, args) {
        return this.dashboardService.getRecentOrders(ctx, args.limit ?? 10);
    }
    async dashboardLowStockAlerts(ctx, args) {
        return this.dashboardService.getLowStockAlerts(ctx, args.threshold ?? 10);
    }
    async dashboardTopSellingProducts(ctx, args) {
        return this.dashboardService.getTopSellingProducts(ctx, args.limit ?? 10);
    }
    // ==================== LEGACY QUERIES (kept for compatibility) ====================
    async lowStockProducts(ctx, args) {
        return this.oscarService.getLowStockProducts(ctx, args.threshold ?? 10);
    }
    async oscarDashboardStats(ctx) {
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
        const totalRevenue = allOrders.items.reduce((sum, order) => sum + order.totalWithTax, 0);
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
    async toggleProductFeatured(ctx, args) {
        const product = await this.productService.findOne(ctx, args.productId);
        if (!product) {
            throw new Error('Product not found');
        }
        const currentValue = product.customFields?.isFeatured ?? false;
        return this.productService.update(ctx, {
            id: args.productId,
            customFields: {
                isFeatured: !currentValue,
            },
        });
    }
    async updateOrderTracking(ctx, args) {
        const order = await this.orderService.findOne(ctx, args.orderId);
        if (!order) {
            throw new Error('Order not found');
        }
        // Update custom field
        await this.connection.getRepository(ctx, core_1.Order).update({ id: args.orderId }, {
            customFields: {
                ...order.customFields,
                trackingNumber: args.trackingNumber,
            },
        });
        return this.orderService.findOne(ctx, args.orderId);
    }
    async addOrderAdminNotes(ctx, args) {
        const order = await this.orderService.findOne(ctx, args.orderId);
        if (!order) {
            throw new Error('Order not found');
        }
        await this.connection.getRepository(ctx, core_1.Order).update({ id: args.orderId }, {
            customFields: {
                ...order.customFields,
                adminNotes: args.notes,
            },
        });
        return this.orderService.findOne(ctx, args.orderId);
    }
};
exports.OscarAdminResolver = OscarAdminResolver;
__decorate([
    (0, graphql_1.Query)(),
    (0, core_1.Allow)(core_1.Permission.ReadOrder, core_1.Permission.ReadCustomer, core_1.Permission.ReadCatalog),
    __param(0, (0, core_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [core_1.RequestContext]),
    __metadata("design:returntype", Promise)
], OscarAdminResolver.prototype, "dashboardKpiMetrics", null);
__decorate([
    (0, graphql_1.Query)(),
    (0, core_1.Allow)(core_1.Permission.ReadOrder),
    __param(0, (0, core_1.Ctx)()),
    __param(1, (0, graphql_1.Args)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [core_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], OscarAdminResolver.prototype, "dashboardSalesTrend", null);
__decorate([
    (0, graphql_1.Query)(),
    (0, core_1.Allow)(core_1.Permission.ReadOrder),
    __param(0, (0, core_1.Ctx)()),
    __param(1, (0, graphql_1.Args)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [core_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], OscarAdminResolver.prototype, "dashboardOrdersByStatus", null);
__decorate([
    (0, graphql_1.Query)(),
    (0, core_1.Allow)(core_1.Permission.ReadOrder, core_1.Permission.ReadCatalog),
    __param(0, (0, core_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [core_1.RequestContext]),
    __metadata("design:returntype", Promise)
], OscarAdminResolver.prototype, "dashboardRevenueByCategory", null);
__decorate([
    (0, graphql_1.Query)(),
    (0, core_1.Allow)(core_1.Permission.ReadOrder),
    __param(0, (0, core_1.Ctx)()),
    __param(1, (0, graphql_1.Args)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [core_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], OscarAdminResolver.prototype, "dashboardRecentOrders", null);
__decorate([
    (0, graphql_1.Query)(),
    (0, core_1.Allow)(core_1.Permission.ReadCatalog),
    __param(0, (0, core_1.Ctx)()),
    __param(1, (0, graphql_1.Args)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [core_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], OscarAdminResolver.prototype, "dashboardLowStockAlerts", null);
__decorate([
    (0, graphql_1.Query)(),
    (0, core_1.Allow)(core_1.Permission.ReadOrder, core_1.Permission.ReadCatalog),
    __param(0, (0, core_1.Ctx)()),
    __param(1, (0, graphql_1.Args)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [core_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], OscarAdminResolver.prototype, "dashboardTopSellingProducts", null);
__decorate([
    (0, graphql_1.Query)(),
    (0, core_1.Allow)(core_1.Permission.ReadCatalog),
    __param(0, (0, core_1.Ctx)()),
    __param(1, (0, graphql_1.Args)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [core_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], OscarAdminResolver.prototype, "lowStockProducts", null);
__decorate([
    (0, graphql_1.Query)(),
    (0, core_1.Allow)(core_1.Permission.ReadOrder, core_1.Permission.ReadCustomer, core_1.Permission.ReadCatalog),
    __param(0, (0, core_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [core_1.RequestContext]),
    __metadata("design:returntype", Promise)
], OscarAdminResolver.prototype, "oscarDashboardStats", null);
__decorate([
    (0, graphql_1.Mutation)(),
    (0, core_1.Allow)(core_1.Permission.UpdateCatalog),
    __param(0, (0, core_1.Ctx)()),
    __param(1, (0, graphql_1.Args)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [core_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], OscarAdminResolver.prototype, "toggleProductFeatured", null);
__decorate([
    (0, graphql_1.Mutation)(),
    (0, core_1.Allow)(core_1.Permission.UpdateOrder),
    __param(0, (0, core_1.Ctx)()),
    __param(1, (0, graphql_1.Args)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [core_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], OscarAdminResolver.prototype, "updateOrderTracking", null);
__decorate([
    (0, graphql_1.Mutation)(),
    (0, core_1.Allow)(core_1.Permission.UpdateOrder),
    __param(0, (0, core_1.Ctx)()),
    __param(1, (0, graphql_1.Args)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [core_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], OscarAdminResolver.prototype, "addOrderAdminNotes", null);
exports.OscarAdminResolver = OscarAdminResolver = __decorate([
    (0, graphql_1.Resolver)(),
    __metadata("design:paramtypes", [oscar_service_1.OscarService,
        dashboard_service_1.DashboardService,
        core_1.ProductService,
        core_1.OrderService,
        core_1.CustomerService,
        core_1.TransactionalConnection])
], OscarAdminResolver);
//# sourceMappingURL=oscar-admin.resolver.js.map