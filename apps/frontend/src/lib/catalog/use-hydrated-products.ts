'use client';

import * as React from 'react';
import { useApolloClient } from '@apollo/client';
import {
  GetProductsDocument,
  type GetProductsQuery,
  type GetProductsQueryVariables,
  type ProductListFieldsFragment,
} from '@oscar/graphql-shop/generated';
import { idsToHydrate, orderedProducts, type SearchHit } from './hydrate-search';

/**
 * Turns search hits (product ids in search order) into full product cards,
 * fetching only the ids that have not been hydrated yet. Each search page
 * therefore costs one fixed-size products request, and a request that is
 * already in flight is never restarted by the next page arriving.
 *
 * `hydrating` is true while some hit still lacks its product; callers pass it
 * to the infinite-scroll trigger so the next page is not requested before the
 * current one is on screen.
 */
export function useHydratedProducts(hits: readonly SearchHit[]) {
  const client = useApolloClient();
  const [hydrated, setHydrated] = React.useState<ReadonlyMap<string, ProductListFieldsFragment>>(
    () => new Map(),
  );
  const [error, setError] = React.useState<Error | null>(null);
  const [attempt, setAttempt] = React.useState(0);
  const inFlight = React.useRef(new Set<string>());

  const missing = idsToHydrate(hits, hydrated);
  const missingKey = missing.join(',');

  React.useEffect(() => {
    const ids = missingKey ? missingKey.split(',').filter((id) => !inFlight.current.has(id)) : [];
    if (ids.length === 0) return;
    ids.forEach((id) => inFlight.current.add(id));
    client
      .query<GetProductsQuery, GetProductsQueryVariables>({
        query: GetProductsDocument,
        variables: { options: { filter: { id: { in: ids } }, take: ids.length } },
      })
      .then(({ data }) => {
        setHydrated((prev) => {
          const next = new Map(prev);
          for (const p of data.products.items) next.set(p.id, p);
          return next;
        });
      })
      .catch((e: unknown) => setError(e instanceof Error ? e : new Error(String(e))))
      .finally(() => ids.forEach((id) => inFlight.current.delete(id)));
  }, [client, missingKey, attempt]);

  const retry = React.useCallback(() => {
    setError(null);
    setAttempt((n) => n + 1);
  }, []);

  return {
    products: orderedProducts(hits, hydrated),
    hydrating: missing.length > 0 && !error,
    error,
    retry,
  };
}
