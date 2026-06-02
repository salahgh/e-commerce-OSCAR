# M1c — Offline-First Cache + Optimistic Cart Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Persist the Apollo cache to AsyncStorage so the storefront/cart survive cold starts, and make cart add/adjust/remove optimistic so the UI updates instantly.

**Architecture:** A pure helper module (`src/utils/optimisticCart.ts`) builds optimistic `Order` objects from the current cart + op args; `CartContext` feeds them to Apollo `optimisticResponse` and drops every `refetchQueries`. A small in-house persistor (`src/apollo/persistence.ts`, no new dependency — `apollo3-cache-persist` is incompatible with this app's Apollo Client 4) saves/restores the cache via public AC4 APIs + RN `AppState`, gated into the existing splash screen so the restore completes before the first query.

**Tech Stack:** Apollo Client 4.2.1, `@react-native-async-storage/async-storage` (already installed), React Native `AppState`, Jest + jest-expo + React Native Testing Library, TypeScript.

**Spec:** `docs/superpowers/specs/2026-06-02-mobile-m1c-offline-optimistic-cart-design.md`

**Working dir:** all commands run from `apps/mobile`. Branch: `m1c-offline-optimistic-cart` (already created).

**House rules:** standalone npm project — use `npm`, never `pnpm`. New work must add **zero new `tsc` errors** (baseline is already red). Commit per task.

---

## Task 0: Capture the baseline (so "zero new tsc errors" is provable)

**Files:** none (measurement only).

- [ ] **Step 1: Confirm tests green and record counts**

Run: `npm test 2>&1 | tail -5`
Expected: `Tests: 53 passed, 53 total` (9 suites). Record the number.

- [ ] **Step 2: Record the tsc baseline error count**

Run: `npx tsc --noEmit 2>&1 | grep -cE "error TS"`
Expected: a number around ~150 (the known-red baseline). **Record it** — call it `BASELINE_TSC`. Task 9 asserts the final count is `<= BASELINE_TSC`.

- [ ] **Step 3: Record the lint baseline**

Run: `npm run lint 2>&1 | tail -3`
Expected: 0 errors (warnings are pre-existing). Record that errors = 0.

No commit (measurement only).

---

## Task 1: Pure optimistic-cart helpers (the testable core)

**Files:**
- Create: `src/utils/optimisticCart.ts`
- Test: `src/utils/__tests__/optimisticCart.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/utils/__tests__/optimisticCart.test.ts`:

```ts
import {
  applyAddItem,
  applyAdjustLine,
  applyRemoveLine,
  applyClear,
  recomputeOrderTotals,
  makeOptimisticOrderLine,
  type OptimisticCartVariant,
} from '../optimisticCart';
import { CurrencyCode, type OrderFieldsFragment } from '../../graphql/generated/graphql';

const VARIANT: OptimisticCartVariant = {
  productVariantId: 'pv1',
  unitPriceWithTax: 250000, // 2500 DZD in cents
  name: 'Red / M',
  sku: 'SKU-1',
  product: { id: 'p1', name: 'T-Shirt', slug: 't-shirt', featuredAsset: { id: 'a1', preview: 'http://img/1' } },
  featuredAsset: { id: 'a1', preview: 'http://img/1' },
};

const VARIANT2: OptimisticCartVariant = {
  productVariantId: 'pv2',
  unitPriceWithTax: 100000,
  name: 'Blue / L',
  sku: 'SKU-2',
  product: { id: 'p2', name: 'Jeans', slug: 'jeans', featuredAsset: null },
  featuredAsset: null,
};

// Build a normalized order with a shipping cost of 500 DZD (50000 cents).
function orderWith(lines: OrderFieldsFragment['lines']): OrderFieldsFragment {
  return recomputeOrderTotals({
    __typename: 'Order',
    id: 'o1',
    code: 'OSC1',
    state: 'AddingItems',
    active: true,
    createdAt: '',
    updatedAt: '',
    totalQuantity: 0,
    subTotalWithTax: 0,
    shippingWithTax: 50000,
    totalWithTax: 0,
    currencyCode: CurrencyCode.Dzd,
    couponCodes: [],
    lines,
    shippingAddress: null,
    billingAddress: null,
    customer: null,
    shippingLines: [],
  });
}

describe('makeOptimisticOrderLine', () => {
  it('builds a line with temp id, computed line price, empty options, and asset fallback', () => {
    const line = makeOptimisticOrderLine(VARIANT2, 1, 'temp-x');
    expect(line.id).toBe('temp-x');
    expect(line.__typename).toBe('OrderLine');
    expect(line.linePriceWithTax).toBe(100000);
    expect(line.productVariant.options).toEqual([]);
    expect(line.featuredAsset).toBeNull(); // both line- and product-level assets null
  });
});

describe('applyAddItem', () => {
  it('creates a new order from null with one line and correct totals', () => {
    const o = applyAddItem(null, VARIANT, 2, 'temp-1');
    expect(o.lines).toHaveLength(1);
    expect(o.lines[0].quantity).toBe(2);
    expect(o.lines[0].linePriceWithTax).toBe(500000);
    expect(o.subTotalWithTax).toBe(500000);
    expect(o.shippingWithTax).toBe(0);
    expect(o.totalWithTax).toBe(500000);
    expect(o.totalQuantity).toBe(2);
  });

  it('appends a new variant to an existing order and sums totals over shipping', () => {
    const start = orderWith([makeOptimisticOrderLine(VARIANT, 1, 'l1')]);
    const o = applyAddItem(start, VARIANT2, 3, 'temp-2');
    expect(o.lines).toHaveLength(2);
    expect(o.subTotalWithTax).toBe(250000 + 300000);
    expect(o.totalWithTax).toBe(550000 + 50000);
    expect(o.totalQuantity).toBe(4);
  });

  it('increments the existing line when re-adding the same variant', () => {
    const start = orderWith([makeOptimisticOrderLine(VARIANT, 1, 'l1')]);
    const o = applyAddItem(start, VARIANT, 2, 'temp-3');
    expect(o.lines).toHaveLength(1);
    expect(o.lines[0].quantity).toBe(3);
    expect(o.lines[0].linePriceWithTax).toBe(750000);
    expect(o.totalWithTax).toBe(750000 + 50000);
  });
});

describe('applyAdjustLine', () => {
  it('updates quantity, line price, and totals', () => {
    const start = orderWith([makeOptimisticOrderLine(VARIANT, 1, 'l1')]);
    const o = applyAdjustLine(start, 'l1', 5);
    expect(o.lines[0].quantity).toBe(5);
    expect(o.lines[0].linePriceWithTax).toBe(1250000);
    expect(o.totalWithTax).toBe(1250000 + 50000);
  });

  it('drops the line when quantity goes to 0', () => {
    const start = orderWith([makeOptimisticOrderLine(VARIANT, 1, 'l1')]);
    const o = applyAdjustLine(start, 'l1', 0);
    expect(o.lines).toHaveLength(0);
    expect(o.subTotalWithTax).toBe(0);
    expect(o.totalWithTax).toBe(50000); // shipping preserved
  });
});

describe('applyRemoveLine', () => {
  it('removes the matching line and recomputes totals', () => {
    const start = orderWith([
      makeOptimisticOrderLine(VARIANT, 1, 'l1'),
      makeOptimisticOrderLine(VARIANT2, 1, 'l2'),
    ]);
    const o = applyRemoveLine(start, 'l1');
    expect(o.lines.map((l) => l.id)).toEqual(['l2']);
    expect(o.subTotalWithTax).toBe(100000);
  });
});

describe('applyClear', () => {
  it('empties lines, zeroes subtotal, preserves shipping', () => {
    const start = orderWith([makeOptimisticOrderLine(VARIANT, 2, 'l1')]);
    const o = applyClear(start);
    expect(o.lines).toEqual([]);
    expect(o.subTotalWithTax).toBe(0);
    expect(o.totalQuantity).toBe(0);
    expect(o.totalWithTax).toBe(50000);
  });
});

describe('recomputeOrderTotals', () => {
  it('sets totalWithTax = subTotalWithTax + shippingWithTax', () => {
    const o = orderWith([
      makeOptimisticOrderLine(VARIANT, 1, 'l1'),
      makeOptimisticOrderLine(VARIANT2, 2, 'l2'),
    ]);
    expect(o.subTotalWithTax).toBe(250000 + 200000);
    expect(o.totalWithTax).toBe(450000 + 50000);
    expect(o.totalQuantity).toBe(3);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- optimisticCart 2>&1 | tail -15`
Expected: FAIL — `Cannot find module '../optimisticCart'`.

- [ ] **Step 3: Write the implementation**

Create `src/utils/optimisticCart.ts`:

```ts
/**
 * Pure helpers that build optimistic Vendure `Order` objects for the cart.
 * No Apollo imports — all prices are RAW CENTS (the cache's native unit;
 * `formatPrice` divides by 100 only for display). Callers pass a `tempId`
 * so these functions stay deterministic and unit-testable without a clock.
 */
import {
  CurrencyCode,
  type OrderFieldsFragment,
  type OrderLineFieldsFragment,
} from '../graphql/generated/graphql';

export type OptimisticCartVariant = {
  productVariantId: string;
  /** Raw cents, tax-inclusive. On the PDP this is `selectedVariant.priceWithTax`. */
  unitPriceWithTax: number;
  name: string;
  sku: string;
  product: {
    id: string;
    name: string;
    slug: string;
    featuredAsset?: { id: string; preview: string } | null;
  };
  featuredAsset?: { id: string; preview: string } | null;
};

type Order = OrderFieldsFragment;
type Line = OrderLineFieldsFragment;

function asAsset(
  a?: { id: string; preview: string } | null,
): { __typename?: 'Asset'; id: string; preview: string } | null {
  return a ? { __typename: 'Asset', id: a.id, preview: a.preview } : null;
}

export function recomputeOrderTotals(order: Order): Order {
  const totalQuantity = order.lines.reduce((n, l) => n + l.quantity, 0);
  const subTotalWithTax = order.lines.reduce((n, l) => n + l.linePriceWithTax, 0);
  return {
    ...order,
    totalQuantity,
    subTotalWithTax,
    totalWithTax: subTotalWithTax + order.shippingWithTax,
  };
}

export function makeOptimisticOrderLine(
  v: OptimisticCartVariant,
  quantity: number,
  tempId: string,
): Line {
  return {
    __typename: 'OrderLine',
    id: tempId,
    quantity,
    unitPriceWithTax: v.unitPriceWithTax,
    linePriceWithTax: v.unitPriceWithTax * quantity,
    productVariant: {
      __typename: 'ProductVariant',
      id: v.productVariantId,
      name: v.name,
      sku: v.sku,
      priceWithTax: v.unitPriceWithTax,
      product: {
        __typename: 'Product',
        id: v.product.id,
        name: v.product.name,
        slug: v.product.slug,
        featuredAsset: asAsset(v.product.featuredAsset),
      },
      options: [],
    },
    featuredAsset: asAsset(v.featuredAsset ?? v.product.featuredAsset),
  };
}

export function makeEmptyOptimisticOrder(
  tempId: string,
  currencyCode: CurrencyCode = CurrencyCode.Dzd,
): Order {
  return {
    __typename: 'Order',
    id: tempId,
    code: '',
    state: 'AddingItems',
    active: true,
    createdAt: '',
    updatedAt: '',
    totalQuantity: 0,
    subTotalWithTax: 0,
    shippingWithTax: 0,
    totalWithTax: 0,
    currencyCode,
    couponCodes: [],
    lines: [],
    shippingAddress: null,
    billingAddress: null,
    customer: null,
    shippingLines: [],
  };
}

export function applyAddItem(
  order: Order | null,
  v: OptimisticCartVariant,
  quantity: number,
  tempId: string,
): Order {
  const base = order ?? makeEmptyOptimisticOrder(tempId, order?.currencyCode);
  const existing = base.lines.find((l) => l.productVariant.id === v.productVariantId);
  const lines: Line[] = existing
    ? base.lines.map((l) =>
        l === existing
          ? { ...l, quantity: l.quantity + quantity, linePriceWithTax: l.unitPriceWithTax * (l.quantity + quantity) }
          : l,
      )
    : [...base.lines, makeOptimisticOrderLine(v, quantity, tempId)];
  return recomputeOrderTotals({ ...base, lines });
}

export function applyAdjustLine(order: Order, orderLineId: string, quantity: number): Order {
  const lines =
    quantity <= 0
      ? order.lines.filter((l) => l.id !== orderLineId)
      : order.lines.map((l) =>
          l.id === orderLineId ? { ...l, quantity, linePriceWithTax: l.unitPriceWithTax * quantity } : l,
        );
  return recomputeOrderTotals({ ...order, lines });
}

export function applyRemoveLine(order: Order, orderLineId: string): Order {
  return recomputeOrderTotals({ ...order, lines: order.lines.filter((l) => l.id !== orderLineId) });
}

export function applyClear(order: Order): Order {
  return recomputeOrderTotals({ ...order, lines: [] });
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- optimisticCart 2>&1 | tail -15`
Expected: PASS — all describe blocks green.

- [ ] **Step 5: Commit**

```bash
git add src/utils/optimisticCart.ts src/utils/__tests__/optimisticCart.test.ts
git commit -m "feat(mobile): pure optimistic-cart Order builders (M1c)"
```

---

## Task 2: In-house Apollo cache persistor

**Files:**
- Create: `src/apollo/persistence.ts`
- Test: `src/apollo/__tests__/persistence.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/apollo/__tests__/persistence.test.ts`:

```ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { gql, InMemoryCache } from '@apollo/client';
import { createPersistor } from '../persistence';

const PING = gql`
  query Ping {
    ping
  }
`;

beforeEach(async () => {
  await AsyncStorage.clear();
});

function cacheWithData(): InMemoryCache {
  const cache = new InMemoryCache();
  cache.writeQuery({ query: PING, data: { ping: 'pong' } });
  return cache;
}

describe('createPersistor', () => {
  it('round-trips the cache through persist() then restore()', async () => {
    const source = cacheWithData();
    await createPersistor(source).persist();

    const target = new InMemoryCache();
    await createPersistor(target).restore();

    expect(target.readQuery({ query: PING })).toEqual({ ping: 'pong' });
  });

  it('restore() is a no-op when nothing is stored', async () => {
    const cache = new InMemoryCache();
    await expect(createPersistor(cache).restore()).resolves.toBeUndefined();
    expect(cache.readQuery({ query: PING })).toBeNull();
  });

  it('restore() swallows corrupt stored JSON', async () => {
    await AsyncStorage.setItem('oscar-apollo-cache', '{not valid json');
    const cache = new InMemoryCache();
    await expect(createPersistor(cache).restore()).resolves.toBeUndefined();
  });

  it('purge() removes the persisted snapshot', async () => {
    const source = cacheWithData();
    const persistor = createPersistor(source);
    await persistor.persist();
    await persistor.purge();

    const target = new InMemoryCache();
    await createPersistor(target).restore();
    expect(target.readQuery({ query: PING })).toBeNull();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- persistence 2>&1 | tail -15`
Expected: FAIL — `Cannot find module '../persistence'`.

- [ ] **Step 3: Write the implementation**

Create `src/apollo/persistence.ts`:

```ts
/**
 * Minimal in-house Apollo cache persistor.
 *
 * `apollo3-cache-persist` peer-depends on Apollo Client 3 and will not install
 * against this app's AC4, so we persist the cache ourselves using only public
 * AC4 APIs (`cache.extract()` / `cache.restore()`) plus RN `AppState` as the
 * write trigger. Persistence must never crash or block the app — every failure
 * is swallowed with a warning.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, type AppStateStatus } from 'react-native';
import type { InMemoryCache } from '@apollo/client';

const CACHE_KEY = 'oscar-apollo-cache';
const MAX_BYTES = 1024 * 1024; // 1 MB cap

export interface ApolloPersistor {
  restore(): Promise<void>;
  persist(): Promise<void>;
  purge(): Promise<void>;
  /** Begin auto-persisting on app background/inactive. Returns an unsubscribe fn. */
  start(): () => void;
}

export function createPersistor(cache: InMemoryCache): ApolloPersistor {
  const persist = async (): Promise<void> => {
    try {
      const data = JSON.stringify(cache.extract());
      if (data.length > MAX_BYTES) {
        await AsyncStorage.removeItem(CACHE_KEY); // too large — drop rather than store a huge blob
        return;
      }
      await AsyncStorage.setItem(CACHE_KEY, data);
    } catch (e) {
      console.warn('[persist] write failed', e);
    }
  };

  const restore = async (): Promise<void> => {
    try {
      const raw = await AsyncStorage.getItem(CACHE_KEY);
      if (raw) cache.restore(JSON.parse(raw));
    } catch (e) {
      console.warn('[persist] restore failed', e);
    }
  };

  const purge = async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(CACHE_KEY);
    } catch (e) {
      console.warn('[persist] purge failed', e);
    }
  };

  const start = (): (() => void) => {
    const onChange = (state: AppStateStatus): void => {
      if (state === 'background' || state === 'inactive') void persist();
    };
    const sub = AppState.addEventListener('change', onChange);
    return () => sub.remove();
  };

  return { restore, persist, purge, start };
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- persistence 2>&1 | tail -15`
Expected: PASS — 4 tests green.

- [ ] **Step 5: Commit**

```bash
git add src/apollo/persistence.ts src/apollo/__tests__/persistence.test.ts
git commit -m "feat(mobile): in-house Apollo cache persistor over AsyncStorage (M1c)"
```

---

## Task 3: Wire the persistor into the client + export a purge helper

**Files:**
- Modify: `src/apollo/client.ts`

- [ ] **Step 1: Export the cache instead of keeping it local**

In `src/apollo/client.ts`, change the cache declaration (around line 118) from:

```ts
const cache = new InMemoryCache({
```
to:
```ts
export const cache = new InMemoryCache({
```

- [ ] **Step 2: Add the persistor singleton + purge helper**

At the **top** of `src/apollo/client.ts`, add to the imports:

```ts
import { createPersistor } from './persistence';
```

At the **end** of `src/apollo/client.ts` (after the `apolloClient` export), add:

```ts
// Cache persistence (cold-start read survival). Restore is driven by the
// `useApolloPersistence` bootstrap hook; purge runs on logout.
export const cachePersistor = createPersistor(cache);

export async function purgeApolloCache(): Promise<void> {
  await cachePersistor.purge();
}
```

- [ ] **Step 3: Verify the module compiles and existing tests still pass**

Run: `npx tsc --noEmit 2>&1 | grep -E "apollo/(client|persistence)\.ts" || echo "no new errors in apollo/*"`
Expected: `no new errors in apollo/*`.

Run: `npm test 2>&1 | tail -5`
Expected: still all green (no behavior change yet).

- [ ] **Step 4: Commit**

```bash
git add src/apollo/client.ts
git commit -m "feat(mobile): expose cache + persistor + purgeApolloCache from client (M1c)"
```

---

## Task 4: Bootstrap hook + splash gate

**Files:**
- Create: `src/hooks/useApolloPersistence.ts`
- Modify: `app/_layout.tsx`

- [ ] **Step 1: Create the hook**

Create `src/hooks/useApolloPersistence.ts`:

```ts
import { useEffect, useState } from 'react';
import { cachePersistor } from '../apollo/client';

/**
 * Restores the persisted Apollo cache once on mount and starts AppState
 * auto-persist. Returns `true` once restore settles (success OR failure) so the
 * splash gate can release — a failed restore must never permanently block the app.
 */
export function useApolloPersistence(): boolean {
  const [restored, setRestored] = useState(false);

  useEffect(() => {
    let mounted = true;
    cachePersistor.restore().finally(() => {
      if (mounted) setRestored(true);
    });
    const stop = cachePersistor.start();
    return () => {
      mounted = false;
      stop();
    };
  }, []);

  return restored;
}
```

- [ ] **Step 2: Gate the app render on restore**

In `app/_layout.tsx`, add the import near the other `@/src` imports:

```ts
import { useApolloPersistence } from '@/src/hooks/useApolloPersistence';
```

In `RootLayout`, add the hook call alongside the existing `languageLoaded`/`fontsLoaded` state (after the `useEffect` that loads language):

```ts
  const cacheRestored = useApolloPersistence();
```

Then change the gate from:

```ts
  if (!languageLoaded || !fontsLoaded) {
    return <LoadingSpinner />;
  }
```
to:
```ts
  if (!languageLoaded || !fontsLoaded || !cacheRestored) {
    return <LoadingSpinner />;
  }
```

- [ ] **Step 3: Verify compile + tests**

Run: `npx tsc --noEmit 2>&1 | grep -E "_layout\.tsx|useApolloPersistence" || echo "no new errors"`
Expected: `no new errors`.

Run: `npm test 2>&1 | tail -5`
Expected: all green.

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useApolloPersistence.ts app/_layout.tsx
git commit -m "feat(mobile): restore persisted cache before first query via splash gate (M1c)"
```

---

## Task 5: Purge the persisted cache on logout

**Files:**
- Modify: `src/contexts/AuthContext.tsx`

- [ ] **Step 1: Import the purge helper**

In `src/contexts/AuthContext.tsx`, extend the existing client import (line 4) from:

```ts
import { apolloClient, VENDURE_TOKEN_KEY } from '../apollo/client';
```
to:
```ts
import { apolloClient, VENDURE_TOKEN_KEY, purgeApolloCache } from '../apollo/client';
```

- [ ] **Step 2: Purge in both logout paths**

Replace the `logout` callback body (around lines 239-249) with:

```ts
  const logout = useCallback(async () => {
    try {
      await logoutMutation();
      await clearAuth();
      await apolloClient.clearStore();
      await purgeApolloCache();
    } catch (error) {
      console.error('Logout error:', error);
      await clearAuth();
      await apolloClient.clearStore();
      await purgeApolloCache();
    }
  }, [logoutMutation]);
```

- [ ] **Step 3: Verify compile + tests**

Run: `npx tsc --noEmit 2>&1 | grep -E "AuthContext\.tsx" || echo "no new errors"`
Expected: `no new errors`.

Run: `npm test 2>&1 | tail -5`
Expected: all green.

- [ ] **Step 4: Commit**

```bash
git add src/contexts/AuthContext.tsx
git commit -m "feat(mobile): purge persisted cache on logout (M1c)"
```

---

## Task 6: Optimistic CartContext (drop refetchQueries) + wiring test

**Files:**
- Modify: `src/contexts/CartContext.tsx`
- Test: `src/contexts/__tests__/CartContext.optimistic.test.tsx`

- [ ] **Step 1: Write the failing wiring test**

Create `src/contexts/__tests__/CartContext.optimistic.test.tsx`:

```tsx
import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';

// Capture the options passed to the add mutation.
const mockAddItem = jest.fn().mockResolvedValue({
  data: { addItemToOrder: { __typename: 'Order', id: 'o1' } },
});
const noop = jest.fn().mockResolvedValue({ data: {} });

jest.mock('../../graphql/generated/graphql', () => ({
  ...jest.requireActual('../../graphql/generated/graphql'),
  useGetActiveOrderQuery: () => ({ data: { activeOrder: null }, loading: false, error: undefined, refetch: jest.fn() }),
  useAddItemToOrderMutation: () => [mockAddItem, { loading: false }],
  useAdjustOrderLineMutation: () => [noop, { loading: false }],
  useRemoveOrderLineMutation: () => [noop, { loading: false }],
  useRemoveAllOrderLinesMutation: () => [noop, { loading: false }],
}));

import { CartProvider, useCart } from '../CartContext';
import type { OptimisticCartVariant } from '../../utils/optimisticCart';

const SNAPSHOT: OptimisticCartVariant = {
  productVariantId: 'pv1',
  unitPriceWithTax: 250000,
  name: 'Red / M',
  sku: 'SKU-1',
  product: { id: 'p1', name: 'T-Shirt', slug: 't-shirt', featuredAsset: null },
  featuredAsset: null,
};

function Consumer() {
  const { addToCart } = useCart();
  return <Text testID="add" onPress={() => addToCart('pv1', 2, SNAPSHOT)}>add</Text>;
}

describe('CartContext optimistic wiring', () => {
  beforeEach(() => jest.clearAllMocks());

  it('passes an optimisticResponse + update and NO refetchQueries to addItemToOrder', async () => {
    render(
      <CartProvider>
        <Consumer />
      </CartProvider>,
    );

    fireEvent.press(screen.getByTestId('add'));

    await waitFor(() => expect(mockAddItem).toHaveBeenCalled());
    const opts = mockAddItem.mock.calls[0][0];

    expect(opts.refetchQueries).toBeUndefined();
    expect(typeof opts.update).toBe('function');
    expect(opts.optimisticResponse.addItemToOrder.lines).toHaveLength(1);
    expect(opts.optimisticResponse.addItemToOrder.lines[0].linePriceWithTax).toBe(500000);
    expect(opts.optimisticResponse.addItemToOrder.totalQuantity).toBe(2);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- CartContext.optimistic 2>&1 | tail -20`
Expected: FAIL — current code passes `refetchQueries: ['GetActiveOrder']` and no `optimisticResponse`, so `opts.refetchQueries` is defined and `opts.optimisticResponse` is undefined.

- [ ] **Step 3: Update the imports in CartContext**

In `src/contexts/CartContext.tsx`, replace the generated-types import block (lines 2-10) with:

```ts
import {
  useGetActiveOrderQuery,
  useAddItemToOrderMutation,
  useAdjustOrderLineMutation,
  useRemoveOrderLineMutation,
  useRemoveAllOrderLinesMutation,
  GetActiveOrderDocument,
  Order,
  OrderLine,
  type OrderFieldsFragment,
  type GetActiveOrderQuery,
  type AddItemToOrderMutation,
  type AdjustOrderLineMutation,
  type RemoveOrderLineMutation,
  type RemoveAllOrderLinesMutation,
} from '../graphql/generated/graphql';
import { formatPrice } from '../utils/vendureAdapters';
import {
  applyAddItem,
  applyAdjustLine,
  applyRemoveLine,
  applyClear,
  type OptimisticCartVariant,
} from '../utils/optimisticCart';
```

- [ ] **Step 4: Extend the context type for the optional snapshot**

In the `CartContextValue` interface, change the `addToCart` signature from:

```ts
  addToCart: (productVariantId: string, quantity: number) => Promise<void>;
```
to:
```ts
  addToCart: (
    productVariantId: string,
    quantity: number,
    optimistic?: OptimisticCartVariant,
  ) => Promise<void>;
```

- [ ] **Step 5: Replace the four mutation callbacks**

Replace `addToCart` (lines 65-89) with:

```ts
  const addToCart = useCallback(
    async (productVariantId: string, quantity: number, optimistic?: OptimisticCartVariant) => {
      try {
        const currentOrder = (orderData?.activeOrder ?? null) as OrderFieldsFragment | null;
        const tempId = `temp-${productVariantId}-${Date.now()}`;
        const { data } = await addItemMutation({
          variables: { productVariantId, quantity },
          ...(optimistic
            ? {
                optimisticResponse: {
                  __typename: 'Mutation',
                  addItemToOrder: applyAddItem(currentOrder, optimistic, quantity, tempId),
                } as AddItemToOrderMutation,
              }
            : {}),
          update: (cache, { data: mutationData }) => {
            const res = mutationData?.addItemToOrder;
            if (res && 'id' in res && !('errorCode' in res)) {
              cache.writeQuery<GetActiveOrderQuery>({
                query: GetActiveOrderDocument,
                data: { activeOrder: res as OrderFieldsFragment },
              });
            }
          },
        });

        if (data?.addItemToOrder) {
          const result = data.addItemToOrder;
          if ('errorCode' in result) {
            const errorResult = result as { errorCode: string; message: string };
            throw new Error(errorResult.message || 'Failed to add item to cart');
          }
          // Auto-open the mini-cart sheet so the user sees the new line.
          setMiniCartOpen(true);
        }
      } catch (error) {
        console.error('Add to cart error:', error);
        throw error;
      }
    },
    [addItemMutation, orderData],
  );
```

Replace `updateQuantity` (lines 91-112) with:

```ts
  const updateQuantity = useCallback(
    async (orderLineId: string, quantity: number) => {
      try {
        const currentOrder = (orderData?.activeOrder ?? null) as OrderFieldsFragment | null;
        const { data } = await adjustLineMutation({
          variables: { orderLineId, quantity },
          ...(currentOrder
            ? {
                optimisticResponse: {
                  __typename: 'Mutation',
                  adjustOrderLine: applyAdjustLine(currentOrder, orderLineId, quantity),
                } as AdjustOrderLineMutation,
              }
            : {}),
        });

        if (data?.adjustOrderLine) {
          const result = data.adjustOrderLine;
          if ('errorCode' in result) {
            const errorResult = result as { errorCode: string; message: string };
            throw new Error(errorResult.message || 'Failed to update cart item');
          }
        }
      } catch (error) {
        console.error('Update cart item error:', error);
        throw error;
      }
    },
    [adjustLineMutation, orderData],
  );
```

Replace `removeFromCart` (lines 114-135) with:

```ts
  const removeFromCart = useCallback(
    async (orderLineId: string) => {
      try {
        const currentOrder = (orderData?.activeOrder ?? null) as OrderFieldsFragment | null;
        const { data } = await removeLineMutation({
          variables: { orderLineId },
          ...(currentOrder
            ? {
                optimisticResponse: {
                  __typename: 'Mutation',
                  removeOrderLine: applyRemoveLine(currentOrder, orderLineId),
                } as RemoveOrderLineMutation,
              }
            : {}),
        });

        if (data?.removeOrderLine) {
          const result = data.removeOrderLine;
          if ('errorCode' in result) {
            const errorResult = result as { errorCode: string; message: string };
            throw new Error(errorResult.message || 'Failed to remove item from cart');
          }
        }
      } catch (error) {
        console.error('Remove from cart error:', error);
        throw error;
      }
    },
    [removeLineMutation, orderData],
  );
```

Replace `clearCart` (lines 137-154) with:

```ts
  const clearCart = useCallback(async () => {
    try {
      const currentOrder = (orderData?.activeOrder ?? null) as OrderFieldsFragment | null;
      const { data } = await removeAllLinesMutation({
        ...(currentOrder
          ? {
              optimisticResponse: {
                __typename: 'Mutation',
                removeAllOrderLines: applyClear(currentOrder),
              } as RemoveAllOrderLinesMutation,
            }
          : {}),
      });

      if (data?.removeAllOrderLines) {
        const result = data.removeAllOrderLines;
        if ('errorCode' in result) {
          const errorResult = result as { errorCode: string; message: string };
          throw new Error(errorResult.message || 'Failed to clear cart');
        }
      }
    } catch (error) {
      console.error('Clear cart error:', error);
      throw error;
    }
  }, [removeAllLinesMutation, orderData]);
```

- [ ] **Step 6: Run the wiring test + full suite**

Run: `npm test -- CartContext.optimistic 2>&1 | tail -20`
Expected: PASS.

Run: `npm test 2>&1 | tail -5`
Expected: all suites green — the 3 new suites (`optimisticCart`, `persistence`, `CartContext.optimistic`) add ~14 tests on top of the baseline 53 (≈67 total). Confirm zero failures and no regressions; don't fixate on the exact count.

- [ ] **Step 7: Verify no new tsc errors in CartContext**

Run: `npx tsc --noEmit 2>&1 | grep -E "contexts/CartContext\.tsx" || echo "no new errors in CartContext"`
Expected: `no new errors in CartContext`. If any appear, they will be cast-related on an `optimisticResponse` literal — widen that one cast to `as unknown as <MutationType>` and re-run.

- [ ] **Step 8: Commit**

```bash
git add src/contexts/CartContext.tsx src/contexts/__tests__/CartContext.optimistic.test.tsx
git commit -m "feat(mobile): optimistic cart add/adjust/remove, drop refetchQueries (M1c)"
```

---

## Task 7: Pass optimistic snapshots from the call sites

**Files:**
- Modify: `app/products/[slug].tsx`
- Modify: `app/orders/[id].tsx`

- [ ] **Step 1: PDP — pass the snapshot from `selectedVariant` + `product`**

In `app/products/[slug].tsx`, in `handleAddToCart` (line 134), replace:

```ts
      await addToCart(selectedVariant.id, quantity);
```
with:
```ts
      await addToCart(selectedVariant.id, quantity, {
        productVariantId: selectedVariant.id,
        unitPriceWithTax: selectedVariant.priceWithTax, // raw cents (un-adapted query data)
        name: selectedVariant.name,
        sku: selectedVariant.sku,
        product: {
          id: product.id,
          name: product.name,
          slug: product.slug,
          featuredAsset: product.featuredAsset ?? null,
        },
        featuredAsset: product.featuredAsset ?? null,
      });
```

- [ ] **Step 2: Reorder — pass a snapshot built from the order line**

The `CustomerOrderFields` fragment (used by `GetOrderByCode`) already selects everything needed on each line: `unitPriceWithTax` (raw cents, on the line), `productVariant { id, name, sku, product { id, name, slug, featuredAsset } }`, and line `featuredAsset`. In `app/orders/[id].tsx`, inside the `for (const line of order.lines)` loop (line 69), replace:

```ts
        await addToCart(variantId, line.quantity);
```
with:
```ts
        await addToCart(variantId, line.quantity, {
          productVariantId: variantId,
          unitPriceWithTax: line.unitPriceWithTax, // raw cents, taken from the order line
          name: line.productVariant?.name ?? '',
          sku: line.productVariant?.sku ?? '',
          product: {
            id: line.productVariant?.product?.id ?? '',
            name: line.productVariant?.product?.name ?? '',
            slug: line.productVariant?.product?.slug ?? '',
            featuredAsset: line.productVariant?.product?.featuredAsset ?? null,
          },
          featuredAsset: line.featuredAsset ?? null,
        });
```

(`variantId` is already destructured and null-guarded just above this line.)

- [ ] **Step 3: Verify compile + tests**

Run: `npx tsc --noEmit 2>&1 | grep -E "products/\[slug\]\.tsx|orders/\[id\]\.tsx" || echo "no new errors in call sites"`
Expected: `no new errors in call sites`.

Run: `npm test 2>&1 | tail -5`
Expected: all green (the `product-detail.test.tsx` mock of `useCart` accepts the extra arg).

- [ ] **Step 4: Commit**

```bash
git add "app/products/[slug].tsx" "app/orders/[id].tsx"
git commit -m "feat(mobile): pass optimistic variant snapshot from PDP + reorder (M1c)"
```

---

## Task 8: Runbook entries for runtime verification

**Files:**
- Modify: `docs/superpowers/plans/RUNTIME-VERIFICATION-runbook.md`

- [ ] **Step 1: Append an M1c section**

Add to the end of `docs/superpowers/plans/RUNTIME-VERIFICATION-runbook.md`:

```markdown
## M1c — Offline-first cache + optimistic cart (runtime checks)

These cannot be unit-tested (native AppState/launch + Apollo write timing):

1. **Cold-start read survival:** Browse a few products, add to cart, send the app to
   the background (so AppState persists), then fully close it. Enable airplane mode and
   relaunch — the storefront and cart render from cache before any spinner/network.
2. **Optimistic add/adjust/remove:** With normal connectivity, add to cart / change a
   quantity / remove a line — the cart UI updates instantly (before the server responds),
   then totals reconcile to the server amount.
3. **Stock rollback:** Adjust a line above available stock → the optimistic bump appears,
   then rolls back when `InsufficientStockError` returns, and an error is surfaced.
4. **First-ever add:** From an empty session (no active order), add one item — the line
   appears and survives a refetch (proves the `writeQuery` link replaced `refetchQueries`).
5. **Logout hygiene:** Log out, then relaunch — the cart/storefront start clean (purged).
```

- [ ] **Step 2: Commit**

```bash
git add docs/superpowers/plans/RUNTIME-VERIFICATION-runbook.md
git commit -m "docs(mobile): add M1c runtime-verification checklist (M1c)"
```

---

## Task 9: Final verification (prove the health bar)

**Files:** none (verification only).

- [ ] **Step 1: Full test suite**

Run: `npm test 2>&1 | tail -6`
Expected: all suites pass; total = baseline 53 + new (`optimisticCart`, `persistence`, `CartContext.optimistic`) with zero failures.

- [ ] **Step 2: Lint**

Run: `npm run lint 2>&1 | tail -3`
Expected: 0 errors (warnings pre-existing, unchanged in spirit).

- [ ] **Step 3: tsc delta — the critical gate**

Run: `npx tsc --noEmit 2>&1 | grep -cE "error TS"`
Expected: `<= BASELINE_TSC` from Task 0 Step 2 (zero new errors). If higher, run `npx tsc --noEmit 2>&1 | grep -E "error TS"` and fix only errors in files this milestone touched (`optimisticCart.ts`, `persistence.ts`, `client.ts`, `useApolloPersistence.ts`, `_layout.tsx`, `AuthContext.tsx`, `CartContext.tsx`, the two call sites) — typically a cast on an `optimisticResponse` literal (`as unknown as <MutationType>`).

- [ ] **Step 4: Update the enhancement status doc**

In `docs/superpowers/mobile-enhancement-status.md`: move "Offline-first + optimistic cart" from **Next up** into **Done** as **M1c**, and bump the "Health" test count. Keep it one or two lines, matching the M1a/M1b entries.

- [ ] **Step 5: Commit**

```bash
git add docs/superpowers/mobile-enhancement-status.md
git commit -m "docs(mobile): mark M1c done in enhancement status (M1c)"
```

---

## Self-review notes (for the executor)

- **Prices are raw cents everywhere in the optimistic helpers.** The PDP's `selectedVariant.priceWithTax` is un-adapted query data (raw cents) — do **not** wrap it in `formatPrice` before passing it as `unitPriceWithTax`.
- **`update` writer is on `addItemToOrder` only.** `adjust`/`remove`/`clear` rely on normalization of the already-linked `Order:id`; only the `null → first order` transition needs `writeQuery`.
- **Optimistic totals are an estimate** (tax rounding); the server response is authoritative and corrects within one round-trip. This is expected, not a bug.
- **Zero new tsc errors** is a hard gate (Task 9 Step 3). The baseline is red for unrelated reasons (Apollo v4 `QueryResult` codegen mismatch) — never "fix" baseline errors as part of M1c.
