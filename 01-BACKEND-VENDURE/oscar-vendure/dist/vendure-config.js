"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
require("dotenv/config");
const core_1 = require("@vendure/core");
const email_plugin_1 = require("@vendure/email-plugin");
const asset_server_plugin_1 = require("@vendure/asset-server-plugin");
const admin_ui_plugin_1 = require("@vendure/admin-ui-plugin");
const path_1 = __importDefault(require("path"));
const oscar_plugin_1 = require("./plugins/oscar-plugin/oscar-plugin");
const cash_on_delivery_handler_1 = require("./plugins/oscar-plugin/payment/cash-on-delivery-handler");
const cib_payment_handler_1 = require("./plugins/oscar-plugin/payment/cib-payment-handler");
const baridimob_payment_handler_1 = require("./plugins/oscar-plugin/payment/baridimob-payment-handler");
const IS_DEV = process.env.NODE_ENV !== 'production';
// Parse CORS origins from environment variable
const getCorsOrigins = () => {
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
    // Default: allow all origins (set CORS_ORIGINS for stricter security)
    return true;
};
exports.config = {
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
        migrations: [path_1.default.join(__dirname, './migrations/*.+(js|ts)')],
        logging: false,
        database: process.env.DB_NAME,
        schema: process.env.DB_SCHEMA || 'public',
        host: process.env.DB_HOST,
        port: +process.env.DB_PORT,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
    },
    paymentOptions: {
        paymentMethodHandlers: [
            core_1.dummyPaymentHandler,
            cash_on_delivery_handler_1.cashOnDeliveryHandler,
            cib_payment_handler_1.cibPaymentHandler,
            baridimob_payment_handler_1.baridimobPaymentHandler,
        ],
    },
    // When adding or changing custom fields, remember to generate
    // a database migration. See https://docs.vendure.io/guides/developer-guide/migrations/
    customFields: {
        // Product custom fields removed - using native Vendure translations instead
        // To migrate existing data, run a migration script before deployment
        ProductVariant: [
            { name: 'minStockAlert', type: 'int', label: [{ languageCode: core_1.LanguageCode.en, value: 'Min Stock Alert' }] },
        ],
        // Collection translation custom fields removed - using native Vendure translations instead
        Collection: [
            { name: 'displayOrder', type: 'int', label: [{ languageCode: core_1.LanguageCode.en, value: 'Display Order' }] },
        ],
        Customer: [
            { name: 'wilaya', type: 'string', label: [{ languageCode: core_1.LanguageCode.en, value: 'Wilaya' }] },
            { name: 'city', type: 'string', label: [{ languageCode: core_1.LanguageCode.en, value: 'City' }] },
            { name: 'adminNotes', type: 'text', label: [{ languageCode: core_1.LanguageCode.en, value: 'Admin Notes' }] },
        ],
        Order: [
            { name: 'customerNotes', type: 'text', label: [{ languageCode: core_1.LanguageCode.en, value: 'Customer Notes' }] },
            { name: 'adminNotes', type: 'text', label: [{ languageCode: core_1.LanguageCode.en, value: 'Admin Notes' }] },
            { name: 'trackingNumber', type: 'string', label: [{ languageCode: core_1.LanguageCode.en, value: 'Tracking Number' }] },
            { name: 'wilaya', type: 'string', label: [{ languageCode: core_1.LanguageCode.en, value: 'Wilaya' }] },
            { name: 'cancellationReason', type: 'text', label: [{ languageCode: core_1.LanguageCode.en, value: 'Cancellation Reason' }] },
        ],
        FacetValue: [
            { name: 'colorHex', type: 'string', nullable: true, label: [{ languageCode: core_1.LanguageCode.en, value: 'Color Hex Code' }] },
        ],
    },
    plugins: [
        asset_server_plugin_1.AssetServerPlugin.init({
            route: 'assets',
            assetUploadDir: path_1.default.join(__dirname, '../static/assets'),
        }),
        core_1.DefaultJobQueuePlugin.init({
            useDatabaseForBuffer: true,
            pollInterval: 1000, // Check for new jobs every second
        }),
        core_1.DefaultSchedulerPlugin,
        core_1.DefaultSearchPlugin.init({ bufferUpdates: false, indexStockStatus: true }),
        email_plugin_1.EmailPlugin.init({
            devMode: true,
            outputPath: path_1.default.join(__dirname, '../static/email/test-emails'),
            route: 'mailbox',
            handlers: email_plugin_1.defaultEmailHandlers,
            templatePath: path_1.default.join(__dirname, '../static/email/templates'),
            globalTemplateVars: {
                fromAddress: '"OSCAR Fashion" <noreply@oscarfashion.dz>',
                verifyEmailAddressUrl: 'http://localhost:3000/verify',
                passwordResetUrl: 'http://localhost:3000/password-reset',
                changeEmailAddressUrl: 'http://localhost:3000/verify-email-address-change',
            },
        }),
        admin_ui_plugin_1.AdminUiPlugin.init({
            route: 'admin',
            port: 8086,
        }),
        oscar_plugin_1.OscarPlugin,
    ],
};
//# sourceMappingURL=vendure-config.js.map