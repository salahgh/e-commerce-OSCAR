import 'dotenv/config';
import {
  dummyPaymentHandler,
  DefaultJobQueuePlugin,
  DefaultSearchPlugin,
  DefaultSchedulerPlugin,
  VendureConfig,
  LanguageCode,
} from '@vendure/core';
import { defaultEmailHandlers, EmailPlugin } from '@vendure/email-plugin';
import { AssetServerPlugin } from '@vendure/asset-server-plugin';
import { AdminUiPlugin } from '@vendure/admin-ui-plugin';
import path from 'path';

import { OscarPlugin } from './plugins/oscar-plugin/oscar-plugin';
import { cashOnDeliveryHandler } from './plugins/oscar-plugin/payment/cash-on-delivery-handler';
import { cibPaymentHandler } from './plugins/oscar-plugin/payment/cib-payment-handler';
import { baridimobPaymentHandler } from './plugins/oscar-plugin/payment/baridimob-payment-handler';

const IS_DEV = process.env.NODE_ENV !== 'production';

// Parse CORS origins from environment variable
const getCorsOrigins = (): string[] | boolean => {
  if (IS_DEV) {
    return [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'http://127.0.0.1:5175',
      'http://127.0.0.1:3000',
    ];
  }
  // In production, read from CORS_ORIGINS env variable
  const corsOrigins = process.env.CORS_ORIGINS;
  if (corsOrigins) {
    return corsOrigins.split(',').map(origin => origin.trim());
  }
  // Default: allow all origins (set CORS_ORIGINS for stricter security)
  return true;
};

export const config: VendureConfig = {
  apiOptions: {
    port: Number(process.env.PORT) || 8085,
    adminApiPath: 'admin-api',
    shopApiPath: 'shop-api',
    // CORS settings to allow frontend apps
    cors: {
      origin: getCorsOrigins(),
      credentials: true,
    },
    // The following options are useful in development mode,
    // but should be disabled in production for security reasons.
    ...(IS_DEV ? {
      adminApiPlayground: {
        settings: { 'request.credentials': 'include' },
      },
      adminApiDebug: true,
      shopApiPlayground: {
        settings: { 'request.credentials': 'include' },
      },
      shopApiDebug: true,
    } : {}),
  },
  authOptions: {
    tokenMethod: ['bearer', 'cookie'],
    superadminCredentials: {
      identifier: process.env.SUPERADMIN_USERNAME || 'superadmin',
      password: process.env.SUPERADMIN_PASSWORD || 'superadmin123',
    },
    cookieOptions: {
      secret: process.env.COOKIE_SECRET || 'oscar-cookie-secret',
    },
    requireVerification: false, // Set to true in production
  },
  dbConnectionOptions: {
    type: 'postgres',
    synchronize: true, // Set to false in production, use migrations instead
    migrations: [path.join(__dirname, './migrations/*.+(js|ts)')],
    logging: false,
    database: process.env.DB_NAME!,
    schema: process.env.DB_SCHEMA || 'public',
    host: process.env.DB_HOST!,
    port: +process.env.DB_PORT!,
    username: process.env.DB_USERNAME!,
    password: process.env.DB_PASSWORD!,
  },
  paymentOptions: {
    paymentMethodHandlers: [
      dummyPaymentHandler,
      cashOnDeliveryHandler,
      cibPaymentHandler,
      baridimobPaymentHandler,
    ],
  },
  // When adding or changing custom fields, remember to generate
  // a database migration. See https://docs.vendure.io/guides/developer-guide/migrations/
  customFields: {
    Product: [
      { name: 'nameFr', type: 'string', label: [{ languageCode: LanguageCode.en, value: 'Name (French)' }] },
      { name: 'nameAr', type: 'string', label: [{ languageCode: LanguageCode.en, value: 'Name (Arabic)' }] },
      { name: 'descriptionFr', type: 'text', label: [{ languageCode: LanguageCode.en, value: 'Description (French)' }] },
      { name: 'descriptionAr', type: 'text', label: [{ languageCode: LanguageCode.en, value: 'Description (Arabic)' }] },
      { name: 'salePrice', type: 'int', label: [{ languageCode: LanguageCode.en, value: 'Sale Price' }] },
      { name: 'isFeatured', type: 'boolean', label: [{ languageCode: LanguageCode.en, value: 'Featured Product' }] },
      { name: 'viewCount', type: 'int', label: [{ languageCode: LanguageCode.en, value: 'View Count' }] },
      { name: 'weightKg', type: 'float', label: [{ languageCode: LanguageCode.en, value: 'Weight (kg)' }] },
      { name: 'availableSizes', type: 'string', list: true, label: [{ languageCode: LanguageCode.en, value: 'Available Sizes' }] },
      { name: 'availableColors', type: 'string', list: true, label: [{ languageCode: LanguageCode.en, value: 'Available Colors' }] },
    ],
    ProductVariant: [
      { name: 'minStockAlert', type: 'int', label: [{ languageCode: LanguageCode.en, value: 'Min Stock Alert' }] },
    ],
    Collection: [
      { name: 'nameFr', type: 'string', label: [{ languageCode: LanguageCode.en, value: 'Name (French)' }] },
      { name: 'nameAr', type: 'string', label: [{ languageCode: LanguageCode.en, value: 'Name (Arabic)' }] },
      { name: 'descriptionFr', type: 'text', label: [{ languageCode: LanguageCode.en, value: 'Description (French)' }] },
      { name: 'descriptionAr', type: 'text', label: [{ languageCode: LanguageCode.en, value: 'Description (Arabic)' }] },
      { name: 'displayOrder', type: 'int', label: [{ languageCode: LanguageCode.en, value: 'Display Order' }] },
    ],
    Customer: [
      { name: 'wilaya', type: 'string', label: [{ languageCode: LanguageCode.en, value: 'Wilaya' }] },
      { name: 'city', type: 'string', label: [{ languageCode: LanguageCode.en, value: 'City' }] },
    ],
    Order: [
      { name: 'customerNotes', type: 'text', label: [{ languageCode: LanguageCode.en, value: 'Customer Notes' }] },
      { name: 'adminNotes', type: 'text', label: [{ languageCode: LanguageCode.en, value: 'Admin Notes' }] },
      { name: 'trackingNumber', type: 'string', label: [{ languageCode: LanguageCode.en, value: 'Tracking Number' }] },
      { name: 'wilaya', type: 'string', label: [{ languageCode: LanguageCode.en, value: 'Wilaya' }] },
      { name: 'cancellationReason', type: 'text', label: [{ languageCode: LanguageCode.en, value: 'Cancellation Reason' }] },
    ],
    FacetValue: [
      { name: 'colorHex', type: 'string', nullable: true, label: [{ languageCode: LanguageCode.en, value: 'Color Hex Code' }] },
    ],
  },
  plugins: [
    AssetServerPlugin.init({
      route: 'assets',
      assetUploadDir: path.join(__dirname, '../static/assets'),
    }),
    DefaultJobQueuePlugin.init({ useDatabaseForBuffer: true }),
    DefaultSchedulerPlugin,
    DefaultSearchPlugin.init({ bufferUpdates: false, indexStockStatus: true }),
    EmailPlugin.init({
      devMode: true,
      outputPath: path.join(__dirname, '../static/email/test-emails'),
      route: 'mailbox',
      handlers: defaultEmailHandlers,
      templatePath: path.join(__dirname, '../static/email/templates'),
      globalTemplateVars: {
        fromAddress: '"OSCAR Fashion" <noreply@oscarfashion.dz>',
        verifyEmailAddressUrl: 'http://localhost:3000/verify',
        passwordResetUrl: 'http://localhost:3000/password-reset',
        changeEmailAddressUrl: 'http://localhost:3000/verify-email-address-change',
      },
    }),
    AdminUiPlugin.init({
      route: 'admin',
      port: 8086,
    }),
    OscarPlugin,
  ],
};
