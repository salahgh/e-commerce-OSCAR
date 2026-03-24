import {
  CreatePaymentResult,
  CreateRefundResult,
  LanguageCode,
  PaymentMethodHandler,
  SettlePaymentResult,
} from '@vendure/core';

/**
 * Cash on Delivery (COD) Payment Handler
 *
 * This is the most common payment method in Algeria.
 * Payment is collected upon delivery by the courier.
 */
export const cashOnDeliveryHandler = new PaymentMethodHandler({
  code: 'cash-on-delivery',
  description: [
    { languageCode: LanguageCode.en, value: 'Cash on Delivery (COD)' },
    { languageCode: LanguageCode.fr, value: 'Paiement à la livraison' },
    { languageCode: LanguageCode.ar, value: 'الدفع عند الاستلام' },
  ],
  args: {
    codFee: {
      type: 'int',
      label: [{ languageCode: LanguageCode.en, value: 'COD Fee (DZD)' }],
      description: [{ languageCode: LanguageCode.en, value: 'Additional fee for cash on delivery' }],
      defaultValue: 0,
    },
  },

  /**
   * COD payments are automatically authorized
   * Actual payment happens on delivery
   */
  createPayment: async (ctx, order, amount, args, metadata): Promise<CreatePaymentResult> => {
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
  settlePayment: async (ctx, order, payment, args): Promise<SettlePaymentResult> => {
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
  createRefund: async (ctx, input, amount, order, payment, args): Promise<CreateRefundResult> => {
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
