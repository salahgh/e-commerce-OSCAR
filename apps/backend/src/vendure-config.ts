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
import { collectionPercentageDiscount } from './plugins/oscar-plugin/promotion/collection-discount-action';

const IS_DEV = process.env.NODE_ENV !== 'production';

// Fail fast rather than boot production with insecure default secrets.
if (!IS_DEV) {
  const missing = ['COOKIE_SECRET', 'SUPERADMIN_PASSWORD'].filter((k) => !process.env[k]);
  if (missing.length > 0) {
    throw new Error(
      `Refusing to start in production with unset secret(s): ${missing.join(', ')}. ` +
        'Set them in the environment.',
    );
  }
}

// Parse DATABASE_URL (provided by Railway, Render, etc.) into individual connection options
const parseDatabaseUrl = () => {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  const parsed = new URL(url);
  const sslmode = parsed.searchParams.get('sslmode');
  return {
    host: parsed.hostname,
    port: Number(parsed.port) || 5432,
    database: parsed.pathname.slice(1),
    username: parsed.username,
    password: parsed.password,
    schema: parsed.searchParams.get('schema') || 'public',
    ssl: sslmode === 'require' || sslmode === 'verify-ca' || sslmode === 'verify-full',
  };
};

// Parse CORS origins from environment variable
const getCorsOrigins = (): string[] | boolean => {
  if (IS_DEV) {
    return [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'http://127.0.0.1:5175',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'http://127.0.0.1:3002',
    ];
  }
  // In production, read from CORS_ORIGINS env variable
  const corsOrigins = process.env.CORS_ORIGINS;
  if (corsOrigins) {
    return corsOrigins.split(',').map(origin => origin.trim());
  }
  // No CORS_ORIGINS set in production: deny cross-origin by default. Previously this
  // returned `true` (allow ALL origins) which, combined with credentials:true, is unsafe.
  // Set CORS_ORIGINS to the storefront/back-office origins to enable them.
  return false;
};

export const config: VendureConfig = {
  apiOptions: {
    port: Number(process.env.PORT) || 8085,
    hostname: '0.0.0.0',
    adminApiPath: 'admin-api',
    shopApiPath: 'shop-api',
    // CORS settings to allow frontend apps
    cors: {
      origin: getCorsOrigins(),
      credentials: true,
      exposedHeaders: ['vendure-auth-token'],
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
  dbConnectionOptions: (() => {
    const dbUrl = parseDatabaseUrl();
    // Enable TLS when the DATABASE_URL sslmode requires it (parsed above) or when
    // DB_SSL is explicitly set. Managed Postgres (Railway, Render, etc.) needs this.
    const sslEnabled =
      dbUrl?.ssl === true ||
      ['true', 'require', '1'].includes((process.env.DB_SSL || '').toLowerCase());
    return {
      type: 'postgres' as const,
      synchronize: IS_DEV, // dev only; production relies on migrations (migration:run)
      migrations: [path.join(__dirname, './migrations/*.+(js|ts)')],
      logging: false,
      database: dbUrl?.database || process.env.DB_NAME!,
      schema: dbUrl?.schema || process.env.DB_SCHEMA || 'public',
      host: dbUrl?.host || process.env.DB_HOST!,
      port: dbUrl?.port || +process.env.DB_PORT!,
      username: dbUrl?.username || process.env.DB_USERNAME!,
      password: dbUrl?.password || process.env.DB_PASSWORD!,
      ...(sslEnabled ? { ssl: { rejectUnauthorized: false } } : {}),
    };
  })(),
  paymentOptions: {
    paymentMethodHandlers: [
      dummyPaymentHandler,
      cashOnDeliveryHandler,
      cibPaymentHandler,
      baridimobPaymentHandler,
    ],
  },
  promotionOptions: {
    promotionActions: [collectionPercentageDiscount],
  },
  // When adding or changing custom fields, remember to generate
  // a database migration. See https://docs.vendure.io/guides/developer-guide/migrations/
  customFields: {
    // Product name/description use native Vendure translations; only the curated
    // `isFeatured` flag and real `viewCount` popularity signal are kept as custom fields.
    Product: [
      {
        name: 'isFeatured',
        type: 'boolean',
        defaultValue: false,
        public: true,
        label: [
          { languageCode: LanguageCode.en, value: 'Featured' },
          { languageCode: LanguageCode.fr, value: 'En vedette' },
          { languageCode: LanguageCode.ar, value: 'مميز' },
        ],
      },
      {
        name: 'viewCount',
        type: 'int',
        defaultValue: 0,
        public: true,
        label: [
          { languageCode: LanguageCode.en, value: 'View Count' },
          { languageCode: LanguageCode.fr, value: 'Nombre de vues' },
          { languageCode: LanguageCode.ar, value: 'عدد المشاهدات' },
        ],
      },
    ],
    ProductVariant: [
      { name: 'minStockAlert', type: 'int', label: [{ languageCode: LanguageCode.en, value: 'Min Stock Alert' }] },
      { name: 'originalPrice', type: 'int', nullable: true, label: [{ languageCode: LanguageCode.en, value: 'Original Price (cents)' }] },
      { name: 'discountPercent', type: 'int', nullable: true, min: 0, max: 100, label: [{ languageCode: LanguageCode.en, value: 'Discount Percent' }] },
    ],
    // Collection translation custom fields removed - using native Vendure translations instead
    Collection: [
      { name: 'displayOrder', type: 'int', label: [{ languageCode: LanguageCode.en, value: 'Display Order' }] },
    ],
    Customer: [
      { name: 'wilaya', type: 'string', label: [{ languageCode: LanguageCode.en, value: 'Wilaya' }] },
      { name: 'city', type: 'string', label: [{ languageCode: LanguageCode.en, value: 'City' }] },
      { name: 'adminNotes', type: 'text', label: [{ languageCode: LanguageCode.en, value: 'Admin Notes' }] },
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
    DefaultJobQueuePlugin.init({
      useDatabaseForBuffer: true,
      pollInterval: 1000, // Check for new jobs every second
    }),
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
        passwordResetUrl: 'http://localhost:3000/reset-password',
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
