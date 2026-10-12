/**
 * Pure planning for the guided order modification (`modifyOrderGuided`).
 *
 * Vendure's `modifyOrder` only runs in the `Modifying` state and leaves the
 * money side to the caller: a lower total needs a refund target, a higher total
 * needs an additional payment. For cash on delivery nothing has been collected
 * yet, so a higher total simply raises the amount the courier will collect:
 * we bump the Authorized COD payment instead of asking for another payment.
 *
 * Kept free of Vendure imports so it can be unit-tested without a database.
 */
export interface PaymentLike {
  id: string;
  method: string;
  state: string;
  amount: number;
}

export interface ModificationPlan {
  /** Order state to return to once the modification is committed. */
  returnState: 'PaymentAuthorized' | 'PaymentSettled' | 'ArrangingAdditionalPayment';
  /** Payment to refund the price decrease against (Vendure requires one when the total drops). */
  refundPaymentId?: string;
  /** Authorized COD payment whose amount must follow the new order total. */
  codPaymentId?: string;
  codAmountToSet?: number;
}

export const COD_METHOD = 'cash-on-delivery';

const MODIFIABLE_STATES = ['PaymentAuthorized', 'PaymentSettled'] as const;

export function isModifiableState(state: string): state is (typeof MODIFIABLE_STATES)[number] {
  return (MODIFIABLE_STATES as readonly string[]).includes(state);
}

export function planModification(args: {
  fromState: 'PaymentAuthorized' | 'PaymentSettled';
  delta: number;
  newTotal: number;
  payments: ReadonlyArray<PaymentLike>;
}): ModificationPlan {
  const { fromState, delta, newTotal, payments } = args;

  if (fromState === 'PaymentSettled') {
    if (delta > 0) return { returnState: 'ArrangingAdditionalPayment' };
    if (delta < 0) {
      const settled = payments.find(p => p.state === 'Settled');
      return settled ? { returnState: 'PaymentSettled', refundPaymentId: settled.id } : { returnState: 'PaymentSettled' };
    }
    return { returnState: 'PaymentSettled' };
  }

  // PaymentAuthorized — typically cash on delivery, nothing collected yet.
  const cod = payments.find(p => p.method === COD_METHOD && p.state === 'Authorized');
  if (delta > 0) {
    if (cod) return { returnState: 'PaymentAuthorized', codPaymentId: cod.id, codAmountToSet: newTotal };
    return { returnState: 'ArrangingAdditionalPayment' };
  }
  if (delta < 0) {
    const target = cod ?? payments.find(p => p.state === 'Authorized' || p.state === 'Settled');
    return target ? { returnState: 'PaymentAuthorized', refundPaymentId: target.id } : { returnState: 'PaymentAuthorized' };
  }
  return { returnState: 'PaymentAuthorized' };
}
