"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cibPaymentHandler = void 0;
const core_1 = require("@vendure/core");
/**
 * CIB (Carte Interbancaire) Payment Handler
 *
 * CIB is the Algerian interbank card payment system.
 * This handler integrates with CIB payment gateway.
 */
exports.cibPaymentHandler = new core_1.PaymentMethodHandler({
    code: 'cib',
    description: [
        { languageCode: core_1.LanguageCode.en, value: 'CIB Card Payment' },
        { languageCode: core_1.LanguageCode.fr, value: 'Paiement par carte CIB' },
        { languageCode: core_1.LanguageCode.ar, value: 'الدفع بالبطاقة البنكية CIB' },
    ],
    args: {
        merchantId: {
            type: 'string',
            label: [{ languageCode: core_1.LanguageCode.en, value: 'CIB Merchant ID' }],
            required: true,
        },
        terminalId: {
            type: 'string',
            label: [{ languageCode: core_1.LanguageCode.en, value: 'CIB Terminal ID' }],
            required: true,
        },
        secretKey: {
            type: 'string',
            label: [{ languageCode: core_1.LanguageCode.en, value: 'CIB Secret Key' }],
            required: true,
        },
        apiUrl: {
            type: 'string',
            label: [{ languageCode: core_1.LanguageCode.en, value: 'CIB API URL' }],
            defaultValue: 'https://cib.satim.dz/api/v1',
        },
        testMode: {
            type: 'boolean',
            label: [{ languageCode: core_1.LanguageCode.en, value: 'Test Mode' }],
            defaultValue: true,
        },
    },
    /**
     * Create a CIB payment
     * In production, this would call the CIB API
     */
    createPayment: async (ctx, order, amount, args, metadata) => {
        try {
            // In production, you would:
            // 1. Call CIB API to initiate payment
            // 2. Return payment URL for customer redirect
            // 3. Handle webhook callback
            if (args.testMode) {
                // Test mode - simulate successful payment
                return {
                    amount,
                    state: 'Authorized',
                    transactionId: `CIB-${order.code}-${Date.now()}`,
                    metadata: {
                        paymentMethod: 'cib',
                        merchantId: args.merchantId,
                        testMode: true,
                        ...metadata,
                    },
                };
            }
            // Production implementation would go here
            // const response = await callCibApi(args, order, amount);
            return {
                amount,
                state: 'Authorized',
                transactionId: `CIB-${order.code}-${Date.now()}`,
                metadata: {
                    paymentMethod: 'cib',
                    merchantId: args.merchantId,
                    ...metadata,
                },
            };
        }
        catch (error) {
            return {
                amount,
                state: 'Declined',
                errorMessage: error.message || 'CIB payment failed',
                metadata: {
                    error: error.message,
                },
            };
        }
    },
    /**
     * Settle the CIB payment
     */
    settlePayment: async (ctx, order, payment, args) => {
        // In production, verify payment status with CIB API
        return {
            success: true,
            metadata: {
                settledAt: new Date().toISOString(),
            },
        };
    },
    /**
     * Create a refund through CIB
     */
    createRefund: async (ctx, input, amount, order, payment, args) => {
        try {
            // In production, call CIB refund API
            return {
                state: 'Settled',
                transactionId: `CIB-REFUND-${order.code}-${Date.now()}`,
                metadata: {
                    refundReason: input.reason,
                    originalTransactionId: payment.transactionId,
                },
            };
        }
        catch (error) {
            return {
                state: 'Failed',
                transactionId: `CIB-REFUND-FAILED-${Date.now()}`,
                metadata: {
                    error: error.message,
                },
            };
        }
    },
});
//# sourceMappingURL=cib-payment-handler.js.map