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
exports.OscarShopResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const core_1 = require("@vendure/core");
const oscar_service_1 = require("../services/oscar.service");
let OscarShopResolver = class OscarShopResolver {
    constructor(oscarService) {
        this.oscarService = oscarService;
    }
    async featuredProducts(ctx, args) {
        return this.oscarService.getFeaturedProducts(ctx, args.take ?? 10);
    }
    async newArrivals(ctx, args) {
        return this.oscarService.getNewArrivals(ctx, args.take ?? 10);
    }
    async popularProducts(ctx, args) {
        return this.oscarService.getPopularProducts(ctx, args.take ?? 10);
    }
    async searchProductsMultilingual(ctx, args) {
        return this.oscarService.searchProductsMultilingual(ctx, args.keyword, args.take ?? 20, args.skip ?? 0);
    }
    wilayas() {
        return this.oscarService.getWilayas();
    }
    shippingCost(args) {
        const amount = this.oscarService.calculateShippingCost(args.wilayaCode);
        return { amount, currency: 'DZD' };
    }
    async trackProductView(ctx, args) {
        return this.oscarService.incrementViewCount(ctx, args.productId);
    }
};
exports.OscarShopResolver = OscarShopResolver;
__decorate([
    (0, graphql_1.Query)(),
    __param(0, (0, core_1.Ctx)()),
    __param(1, (0, graphql_1.Args)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [core_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], OscarShopResolver.prototype, "featuredProducts", null);
__decorate([
    (0, graphql_1.Query)(),
    __param(0, (0, core_1.Ctx)()),
    __param(1, (0, graphql_1.Args)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [core_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], OscarShopResolver.prototype, "newArrivals", null);
__decorate([
    (0, graphql_1.Query)(),
    __param(0, (0, core_1.Ctx)()),
    __param(1, (0, graphql_1.Args)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [core_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], OscarShopResolver.prototype, "popularProducts", null);
__decorate([
    (0, graphql_1.Query)(),
    __param(0, (0, core_1.Ctx)()),
    __param(1, (0, graphql_1.Args)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [core_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], OscarShopResolver.prototype, "searchProductsMultilingual", null);
__decorate([
    (0, graphql_1.Query)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], OscarShopResolver.prototype, "wilayas", null);
__decorate([
    (0, graphql_1.Query)(),
    __param(0, (0, graphql_1.Args)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], OscarShopResolver.prototype, "shippingCost", null);
__decorate([
    (0, graphql_1.Mutation)(),
    __param(0, (0, core_1.Ctx)()),
    __param(1, (0, graphql_1.Args)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [core_1.RequestContext, Object]),
    __metadata("design:returntype", Promise)
], OscarShopResolver.prototype, "trackProductView", null);
exports.OscarShopResolver = OscarShopResolver = __decorate([
    (0, graphql_1.Resolver)(),
    __metadata("design:paramtypes", [oscar_service_1.OscarService])
], OscarShopResolver);
//# sourceMappingURL=oscar-shop.resolver.js.map