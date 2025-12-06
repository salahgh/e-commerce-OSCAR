"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.baridimobPaymentHandler = void 0;
const core_1 = require("@vendure/core");
/**
 * Baridimob Payment Handler
 *
 * Baridimob is Algeria Post's mobile payment service.
 * Popular for mobile payments and money transfers.
 */
exports.baridimobPaymentHandler = new core_1.PaymentMethodHandler({
    code: 'baridimob',
    description: [
        { languageCode: core_1.LanguageCode.en, value: 'Baridimob Mobile Payment' },
        { languageCode: core_1.LanguageCode.fr, value: 'Paiement mobile Baridimob' },
        { languageCode: core_1.LanguageCode.ar, value: 'الدفع عبر بريدي موب' },
    ],
    args: {
        merchantAccount: {
            type: 'string',
            label: [{ languageCode: core_1.LanguageCode.en, value: 'Merchant Baridimob Account' }],
            required: true,
        },
        apiKey: {
            type: 'string',
            label: [{ languageCode: core_1.LanguageCode.en, value: 'Baridimob API Key' }],
            required: true,
        },
        secretKey: {
            type: 'string',
            label: [{ languageCode: core_1.LanguageCode.en, value: 'Baridimob Secret Key' }],
            required: true,
        },
        apiUrl: {
            type: 'string',
            label: [{ languageCode: core_1.LanguageCode.en, value: 'Baridimob API URL' }],
            defaultValue: 'https://api.baridimob.dz/v1',
        },
        testMode: {
            type: 'boolean',
            label: [{ languageCode: core_1.LanguageCode.en, value: 'Test Mode' }],
            defaultValue: true,
        },
    },
    /**
     * Create a Baridimob payment
     * Customer will receive a payment request on their Baridimob app
     */
    createPayment: async (ctx, order, amount, args, metadata) => {
        try {
            const customerPhone = metadata?.customerPhone;
            if (!customerPhone && !args.testMode) {
                return {
                    amount,
                    state: 'Declined',
                    errorMessage: 'Customer phone number required for Baridimob payment',
                    metadata: {},
                };
            }
            if (args.testMode) {
                // Test mode - simulate successful payment
                return {
                    amount,
                    state: 'Authorized',
                    transactionId: `BRDMOB-${order.code}-${Date.now()}`,
                    metadata: {
                        paymentMethod: 'baridimob',
                        merchantAccount: args.merchantAccount,
                        testMode: true,
                        ...metadata,
                    },
                };
            }
            // Production implementation:
            // 1. Call Baridimob API to create payment request
            // 2. Customer receives push notification on Baridimob app
            // 3. Customer confirms payment
            // 4. Webhook callback confirms payment
            return {
                amount,
                state: 'Authorized',
                transactionId: `BRDMOB-${order.code}-${Date.now()}`,
                metadata: {
                    paymentMethod: 'baridimob',
                    merchantAccount: args.merchantAccount,
                    customerPhone,
                    ...metadata,
                },
            };
        }
        catch (error) {
            return {
                amount,
                state: 'Declined',
                errorMessage: error.message || 'Baridimob payment failed',
                metadata: {
                    error: error.message,
                },
            };
        }
    },
    /**
     * Settle the Baridimob payment
     */
    settlePayment: async (ctx, order, payment, args) => {
        // In production, verify payment status with Baridimob API
        return {
            success: true,
            metadata: {
                settledAt: new Date().toISOString(),
            },
        };
    },
    /**
     * Create a refund through Baridimob
     */
    createRefund: async (ctx, input, amount, order, payment, args) => {
        try {
            // In production, call Baridimob refund API
            // Refund will be sent to customer's Baridimob account
            return {
                state: 'Settled',
                transactionId: `BRDMOB-REFUND-${order.code}-${Date.now()}`,
                metadata: {
                    refundReason: input.reason,
                    originalTransactionId: payment.transactionId,
                    refundMethod: 'baridimob-wallet',
                },
            };
        }
        catch (error) {
            return {
                state: 'Failed',
                transactionId: `BRDMOB-REFUND-FAILED-${Date.now()}`,
                metadata: {
                    error: error.message,
                },
            };
        }
    },
});
//# sourceMappingURL=baridimob-payment-handler.js.map