"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cashOnDeliveryHandler = void 0;
const core_1 = require("@vendure/core");
/**
 * Cash on Delivery (COD) Payment Handler
 *
 * This is the most common payment method in Algeria.
 * Payment is collected upon delivery by the courier.
 */
exports.cashOnDeliveryHandler = new core_1.PaymentMethodHandler({
    code: 'cash-on-delivery',
    description: [
        { languageCode: core_1.LanguageCode.en, value: 'Cash on Delivery (COD)' },
        { languageCode: core_1.LanguageCode.fr, value: 'Paiement à la livraison' },
        { languageCode: core_1.LanguageCode.ar, value: 'الدفع عند الاستلام' },
    ],
    args: {
        codFee: {
            type: 'int',
            label: [{ languageCode: core_1.LanguageCode.en, value: 'COD Fee (DZD)' }],
            description: [{ languageCode: core_1.LanguageCode.en, value: 'Additional fee for cash on delivery' }],
            defaultValue: 0,
        },
    },
    /**
     * COD payments are automatically authorized
     * Actual payment happens on delivery
     */
    createPayment: async (ctx, order, amount, args, metadata) => {
        return {
            amount,
            state: 'Authorized',
            transactionId: `COD-${order.code}-${Date.now()}`,
            metadata: {
                paymentMethod: 'cash-on-delivery',
                expectedAmount: amount,
                codFee: args.codFee || 0,
                ...metadata,
            },
        };
    },
    /**
     * Settlement happens when the courier confirms receipt of payment
     */
    settlePayment: async (ctx, order, payment, args) => {
        return {
            success: true,
            metadata: {
                settledAt: new Date().toISOString(),
                settledBy: 'courier',
            },
        };
    },
    /**
     * Refund for COD - manual process
     */
    createRefund: async (ctx, input, amount, order, payment, args) => {
        return {
            state: 'Settled',
            transactionId: `COD-REFUND-${order.code}-${Date.now()}`,
            metadata: {
                refundReason: input.reason,
                refundMethod: 'manual',
            },
        };
    },
});
//# sourceMappingURL=cash-on-delivery-handler.js.map