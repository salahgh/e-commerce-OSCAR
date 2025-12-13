/**
 * OSCAR Vendure Production Configuration
 *
 * This is a production-ready version of vendure-config.ts
 * Copy this to src/vendure-config.ts before deploying
 *
 * Supports both PostgreSQL (recommended) and MariaDB
 */
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

// Database type detection
// Set DB_TYPE=mysql in .env for MariaDB, otherwise defaults to PostgreSQL
const DB_TYPE = (process.env.DB_TYPE as 'postgres' | 'mysql') || 'postgres';

// CORS origins - add your production domains
const CORS_ORIGINS = IS_DEV
  ? [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'http://127.0.0.1:5175',
      'http://127.0.0.1:3000',
    ]
  : process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',')
    : false;

export const config: VendureConfig = {
  apiOptions: {
    port: parseInt(process.env.PORT || '8085', 10),
    adminApiPath: 'admin-api',
    shopApiPath: 'shop-api',
    cors: {
      origin: CORS_ORIGINS,
      credentials: true,
    },
    // Disable playgrounds in production
    ...(IS_DEV
      ? {
          adminApiPlayground: {
            settings: { 'request.credentials': 'include' },
          },
          adminApiDebug: true,
          shopApiPlayground: {
            settings: { 'request.credentials': 'include' },
          },
          shopApiDebug: true,
        }
      : {}),
  },
  authOptions: {
    tokenMethod: ['bearer', 'cookie'],
    superadminCredentials: {
      identifier: process.env.SUPERADMIN_USERNAME || 'superadmin',
      password: process.env.SUPERADMIN_PASSWORD || 'superadmin123',
    },
    cookieOptions: {
      secret: process.env.COOKIE_SECRET || 'oscar-cookie-secret',
      // Use secure cookies in production
      ...(IS_DEV ? {} : { secure: true, sameSite: 'lax' }),
    },
    requireVerification: !IS_DEV, // Require email verification in production
  },
  dbConnectionOptions: {
    type: DB_TYPE,
    // Use migrations in production, synchronize in development
    synchronize: IS_DEV,
    migrations: [path.join(__dirname, './migrations/*.+(js|ts)')],
    logging: IS_DEV ? ['error', 'warn'] : ['error'],
    database: process.env.DB_NAME!,
    host: process.env.DB_HOST!,
    port: parseInt(process.env.DB_PORT || (DB_TYPE === 'postgres' ? '5432' : '3306'), 10),
    username: process.env.DB_USERNAME!,
    password: process.env.DB_PASSWORD!,
    // PostgreSQL specific
    ...(DB_TYPE === 'postgres' ? { schema: process.env.DB_SCHEMA || 'public' } : {}),
    // MariaDB/MySQL specific
    ...(DB_TYPE === 'mysql'
      ? {
          charset: 'utf8mb4',
          timezone: 'Z',
        }
      : {}),
  },
  paymentOptions: {
    paymentMethodHandlers: [
      dummyPaymentHandler,
      cashOnDeliveryHandler,
      cibPaymentHandler,
      baridimobPaymentHandler,
    ],
  },
  customFields: {
    Product: [
      {
        name: 'nameFr',
        type: 'string',
        label: [{ languageCode: LanguageCode.en, value: 'Name (French)' }],
      },
      {
        name: 'nameAr',
        type: 'string',
        label: [{ languageCode: LanguageCode.en, value: 'Name (Arabic)' }],
      },
      {
        name: 'descriptionFr',
        type: 'text',
        label: [{ languageCode: LanguageCode.en, value: 'Description (French)' }],
      },
      {
        name: 'descriptionAr',
        type: 'text',
        label: [{ languageCode: LanguageCode.en, value: 'Description (Arabic)' }],
      },
      {
        name: 'salePrice',
        type: 'int',
        label: [{ languageCode: LanguageCode.en, value: 'Sale Price' }],
      },
      {
        name: 'isFeatured',
        type: 'boolean',
        label: [{ languageCode: LanguageCode.en, value: 'Featured Product' }],
      },
      {
        name: 'viewCount',
        type: 'int',
        label: [{ languageCode: LanguageCode.en, value: 'View Count' }],
      },
      {
        name: 'weightKg',
        type: 'float',
        label: [{ languageCode: LanguageCode.en, value: 'Weight (kg)' }],
      },
      {
        name: 'availableSizes',
        type: 'string',
        list: true,
        label: [{ languageCode: LanguageCode.en, value: 'Available Sizes' }],
      },
      {
        name: 'availableColors',
        type: 'string',
        list: true,
        label: [{ languageCode: LanguageCode.en, value: 'Available Colors' }],
      },
    ],
    ProductVariant: [
      {
        name: 'minStockAlert',
        type: 'int',
        label: [{ languageCode: LanguageCode.en, value: 'Min Stock Alert' }],
      },
    ],
    Collection: [
      {
        name: 'nameFr',
        type: 'string',
        label: [{ languageCode: LanguageCode.en, value: 'Name (French)' }],
      },
      {
        name: 'nameAr',
        type: 'string',
        label: [{ languageCode: LanguageCode.en, value: 'Name (Arabic)' }],
      },
      {
        name: 'descriptionFr',
        type: 'text',
        label: [{ languageCode: LanguageCode.en, value: 'Description (French)' }],
      },
      {
        name: 'descriptionAr',
        type: 'text',
        label: [{ languageCode: LanguageCode.en, value: 'Description (Arabic)' }],
      },
      {
        name: 'displayOrder',
        type: 'int',
        label: [{ languageCode: LanguageCode.en, value: 'Display Order' }],
      },
    ],
    Customer: [
      {
        name: 'wilaya',
        type: 'string',
        label: [{ languageCode: LanguageCode.en, value: 'Wilaya' }],
      },
      { name: 'city', type: 'string', label: [{ languageCode: LanguageCode.en, value: 'City' }] },
    ],
    Order: [
      {
        name: 'customerNotes',
        type: 'text',
        label: [{ languageCode: LanguageCode.en, value: 'Customer Notes' }],
      },
      {
        name: 'adminNotes',
        type: 'text',
        label: [{ languageCode: LanguageCode.en, value: 'Admin Notes' }],
      },
      {
        name: 'trackingNumber',
        type: 'string',
        label: [{ languageCode: LanguageCode.en, value: 'Tracking Number' }],
      },
      {
        name: 'wilaya',
        type: 'string',
        label: [{ languageCode: LanguageCode.en, value: 'Wilaya' }],
      },
      {
        name: 'cancellationReason',
        type: 'text',
        label: [{ languageCode: LanguageCode.en, value: 'Cancellation Reason' }],
      },
    ],
    FacetValue: [
      {
        name: 'colorHex',
        type: 'string',
        nullable: true,
        label: [{ languageCode: LanguageCode.en, value: 'Color Hex Code' }],
      },
    ],
  },
  plugins: [
    AssetServerPlugin.init({
      route: 'assets',
      assetUploadDir: path.join(__dirname, '../static/assets'),
      // For production, consider using S3 or similar:
      // storageStrategyFactory: configureS3AssetStorage({ ... }),
    }),
    DefaultJobQueuePlugin.init({ useDatabaseForBuffer: true }),
    DefaultSchedulerPlugin,
    DefaultSearchPlugin.init({ bufferUpdates: false, indexStockStatus: true }),
    EmailPlugin.init({
      devMode: IS_DEV,
      outputPath: path.join(__dirname, '../static/email/test-emails'),
      route: 'mailbox',
      handlers: defaultEmailHandlers,
      templatePath: path.join(__dirname, '../static/email/templates'),
      globalTemplateVars: {
        fromAddress: process.env.EMAIL_FROM || '"OSCAR Fashion" <noreply@oscarfashion.dz>',
        verifyEmailAddressUrl:
          process.env.VERIFY_EMAIL_URL || 'http://localhost:3000/verify',
        passwordResetUrl:
          process.env.PASSWORD_RESET_URL || 'http://localhost:3000/password-reset',
        changeEmailAddressUrl:
          process.env.CHANGE_EMAIL_URL || 'http://localhost:3000/verify-email-address-change',
      },
      // Configure real SMTP in production:
      // transport: {
      //   type: 'smtp',
      //   host: process.env.SMTP_HOST,
      //   port: parseInt(process.env.SMTP_PORT || '587', 10),
      //   auth: {
      //     user: process.env.SMTP_USER,
      //     pass: process.env.SMTP_PASSWORD,
      //   },
      // },
    }),
    AdminUiPlugin.init({
      route: 'admin',
      port: 8086,
      // For production, compile the admin UI:
      // app: compileUiExtensions({
      //   outputPath: path.join(__dirname, '../admin-ui'),
      //   extensions: [],
      // }),
    }),
    OscarPlugin,
  ],
};
