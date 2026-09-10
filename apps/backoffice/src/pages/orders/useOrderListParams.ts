import { useCallback, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  DEFAULT_ORDER_LIST_STATE,
  parseOrderListParams,
  serializeOrderListParams,
  type OrderListState,
} from './order-list-params';

const RETURN_PATH_KEY = 'oscar:orders:lastListSearch';

/**
 * The orders list view lives in the URL (see order-list-params.ts). This hook
 * exposes it as state plus an `update` that writes back to the URL, resetting
 * to page 1 whenever anything other than the page itself changes.
 */
export function useOrderListParams() {
  const [searchParams, setSearchParams] = useSearchParams();
  const state = useMemo(() => parseOrderListParams(searchParams), [searchParams]);

  // Remembered so the order detail page can bring the owner back to the same view.
  useEffect(() => {
    try {
      sessionStorage.setItem(RETURN_PATH_KEY, serializeOrderListParams(state).toString());
    } catch {
      /* private mode etc.: the back button then lands on the default list */
    }
  }, [state]);

  const update = useCallback(
    (patch: Partial<OrderListState>) => {
      const onlyPage = Object.keys(patch).every((k) => k === 'page');
      const next = { ...state, ...patch, ...(onlyPage ? {} : { page: 1 }) };
      setSearchParams(serializeOrderListParams(next), { replace: true });
    },
    [state, setSearchParams]
  );

  const reset = useCallback(() => {
    setSearchParams(serializeOrderListParams(DEFAULT_ORDER_LIST_STATE), { replace: true });
  }, [setSearchParams]);

  return { state, update, reset };
}

/** Path of the orders list as it was last displayed in this tab, for "back" buttons. */
export function orderListReturnPath(): string {
  try {
    const qs = sessionStorage.getItem(RETURN_PATH_KEY);
    return qs ? `/orders?${qs}` : '/orders';
  } catch {
    return '/orders';
  }
}
