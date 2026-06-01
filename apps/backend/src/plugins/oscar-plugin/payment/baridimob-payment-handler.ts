import {
  CreatePaymentResult,
  CreateRefundResult,
  LanguageCode,
  PaymentMethodHandler,
  SettlePaymentResult,
} from '@vendure/core';

/**
 * Baridimob Payment Handler
 *
 * Baridimob is Algeria Post's mobile payment service.
 * Popular for mobile payments and money transfers.
 */
export const baridimobPaymentHandler = new PaymentMethodHandler({
  code: 'baridimob',
  description: [
    { languageCode: LanguageCode.en, value: 'Baridimob Mobile Payment' },
    { languageCode: LanguageCode.fr, value: 'Paiement mobile Baridimob' },
    { languageCode: LanguageCode.ar, value: 'الدفع عبر بريدي موب' },
  ],
  args: {
    merchantAccount: {
      type: 'string',
      label: [{ languageCode: LanguageCode.en, value: 'Merchant Baridimob Account' }],
      required: true,
    },
    apiKey: {
      type: 'string',
      label: [{ languageCode: LanguageCode.en, value: 'Baridimob API Key' }],
      required: true,
    },
    secretKey: {
      type: 'string',
      label: [{ languageCode: LanguageCode.en, value: 'Baridimob Secret Key' }],
      required: true,
    },
    apiUrl: {
      type: 'string',
      label: [{ languageCode: LanguageCode.en, value: 'Baridimob API URL' }],
      defaultValue: 'https://api.baridimob.dz/v1',
    },
    testMode: {
      type: 'boolean',
      label: [{ languageCode: LanguageCode.en, value: 'Test Mode' }],
      defaultValue: true,
    },
  },

  /**
   * Create a Baridimob payment
   * Customer will receive a payment request on their Baridimob app
   */
  createPayment: async (ctx, order, amount, args, metadata): Promise<CreatePaymentResult> => {
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

      // No real Baridimob gateway integration exists yet. Decline rather than fake an
      // authorization, so an order is never marked paid without money actually captured.
      // Enable the payment method's `testMode` flag to simulate success in non-production.
      return {
        amount,
        state: 'Declined',
        errorMessage:
          'Baridimob payment gateway is not yet integrated. Enable test mode for non-production use.',
        metadata: {
          paymentMethod: 'baridimob',
          merchantAccount: args.merchantAccount,
          customerPhone,
          notIntegrated: true,
          ...metadata,
        },
      };
    } catch (error: any) {
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
  settlePayment: async (ctx, order, payment, args): Promise<SettlePaymentResult> => {
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
  createRefund: async (ctx, input, amount, order, payment, args): Promise<CreateRefundResult> => {
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
    } catch (error: any) {
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
