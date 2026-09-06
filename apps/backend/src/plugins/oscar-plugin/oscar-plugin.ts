import { PluginCommonModule, VendurePlugin } from '@vendure/core';
import { OscarService } from './services/oscar.service';
import { DashboardService } from './services/dashboard.service';
import { WilayaShippingService } from './services/wilaya-shipping.service';
import { OrderWilayaService } from './services/order-wilaya.service';
import { WilayaShipping } from './entities/wilaya-shipping.entity';
import { OscarAdminResolver } from './api/oscar-admin.resolver';
import { OscarShopResolver } from './api/oscar-shop.resolver';
import { HealthController } from './api/health.controller';
import { adminApiExtensions, shopApiExtensions } from './api/api-extensions';

/**
 * OSCAR Fashion E-Commerce Plugin
 *
 * This plugin extends Vendure with custom functionality for the OSCAR fashion store:
 * - Custom API endpoints for Algerian market
 * - Extended product fields (multilingual FR/AR/EN)
 * - Per-wilaya delivery pricing managed from the back-office (shipping/)
 * - Wilaya bookkeeping for the back-office (copies the shipping wilaya onto
 *   the `wilaya` custom fields once an order is placed)
 * - Payment integrations (CIB, Baridimob, COD)
 */
@VendurePlugin({
  imports: [PluginCommonModule],
  providers: [OscarService, DashboardService, WilayaShippingService, OrderWilayaService],
  entities: [WilayaShipping],
  controllers: [HealthController],
  adminApiExtensions: {
    schema: adminApiExtensions,
    resolvers: [OscarAdminResolver],
  },
  shopApiExtensions: {
    schema: shopApiExtensions,
    resolvers: [OscarShopResolver],
  },
  compatibility: '^3.0.0',
})
export class OscarPlugin {}
