"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OscarPlugin = void 0;
const core_1 = require("@vendure/core");
const oscar_service_1 = require("./services/oscar.service");
const oscar_admin_resolver_1 = require("./api/oscar-admin.resolver");
const oscar_shop_resolver_1 = require("./api/oscar-shop.resolver");
const api_extensions_1 = require("./api/api-extensions");
/**
 * OSCAR Fashion E-Commerce Plugin
 *
 * This plugin extends Vendure with custom functionality for the OSCAR fashion store:
 * - Custom API endpoints for Algerian market
 * - Extended product fields (multilingual FR/AR/EN)
 * - Custom shipping zones for Algeria (Wilayas)
 * - Payment integrations (CIB, Baridimob, COD)
 */
let OscarPlugin = class OscarPlugin {
};
exports.OscarPlugin = OscarPlugin;
exports.OscarPlugin = OscarPlugin = __decorate([
    (0, core_1.VendurePlugin)({
        imports: [core_1.PluginCommonModule],
        providers: [oscar_service_1.OscarService],
        adminApiExtensions: {
            schema: api_extensions_1.adminApiExtensions,
            resolvers: [oscar_admin_resolver_1.OscarAdminResolver],
        },
        shopApiExtensions: {
            schema: api_extensions_1.shopApiExtensions,
            resolvers: [oscar_shop_resolver_1.OscarShopResolver],
        },
        compatibility: '^3.0.0',
    })
], OscarPlugin);
//# sourceMappingURL=oscar-plugin.js.map