'use client';

import * as React from 'react';
import { useAddToPlacedOrderMutation } from '@oscar/graphql-shop/generated';
import { clearRecentOrder, getRecentOrder, isFinalExtendError, type RecentOrder } from './recent-order';

export interface ExtendItem {
  productVariantId: string;
  quantity: number;
}

export type ExtendOutcome =
  | { ok: true; code: string }
  | { ok: false; code: string; errorCode: string | null; message: string | null; added: number };

/**
 * The order this browser placed in the last 30 minutes (if any) and a way to
 * add items to it. Re-reads storage on focus so a tab left open notices
 * expiry, and forgets the order once the server says it can't be extended.
 */
export function useRecentOrder() {
  const [recent, setRecent] = React.useState<RecentOrder | null>(null);
  const [adding, setAdding] = React.useState(false);
  const [addToPlacedOrder] = useAddToPlacedOrderMutation();

  React.useEffect(() => {
    const refresh = () => setRecent(getRecentOrder());
    refresh();
    window.addEventListener('focus', refresh);
    const timer = window.setInterval(refresh, 60_000);
    return () => {
      window.removeEventListener('focus', refresh);
      window.clearInterval(timer);
    };
  }, []);

  /** Adds the items one by one; stops at the first failure and reports how many went in. */
  const addItems = React.useCallback(
    async (items: ExtendItem[]): Promise<ExtendOutcome | null> => {
      const current = getRecentOrder();
      if (!current) {
        setRecent(null);
        return null;
      }
      setAdding(true);
      try {
        let added = 0;
        for (const item of items) {
          let errorCode: string | null = null;
          let message: string | null = null;
          try {
            const { data } = await addToPlacedOrder({
              variables: { orderCode: current.code, productVariantId: item.productVariantId, quantity: item.quantity },
            });
            const result = data?.addToPlacedOrder;
            if (result?.success) {
              added += 1;
              continue;
            }
            errorCode = result?.errorCode ?? null;
            message = result?.message ?? null;
          } catch (err) {
            message = err instanceof Error ? err.message : null;
          }
          if (isFinalExtendError(errorCode)) {
            clearRecentOrder();
            setRecent(null);
          }
          return { ok: false, code: current.code, errorCode, message, added };
        }
        return { ok: true, code: current.code };
      } finally {
        setAdding(false);
      }
    },
    [addToPlacedOrder],
  );

  return { recent, adding, addItems };
}
