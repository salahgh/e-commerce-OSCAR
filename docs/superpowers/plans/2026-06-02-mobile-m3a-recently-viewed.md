# M3a — Recently-Viewed Products Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Track opened products locally and show a "Recently viewed" horizontal row on Home and the PDP.

**Architecture:** A pure tested helper (`src/utils/recentlyViewed.ts`, dedupe-move-to-front + cap) drives a `RecentlyViewedContext` (AsyncStorage-persisted, mirrors `WishlistContext`). The PDP records views. A shared `HorizontalProductRow` (extracted from `RelatedProducts`) renders both the related row and a new `RecentlyViewedRow` shown on Home + PDP.

**Tech Stack:** React Native / Expo Router, TypeScript, AsyncStorage, react-i18next, Jest + jest-expo.

**Spec:** `docs/superpowers/specs/2026-06-02-mobile-m3a-recently-viewed-design.md`

**Working dir:** all commands from `apps/mobile`. Branch: `m3a-recently-viewed` (already created). Use `npm`, never `pnpm`. Zero new `tsc` errors (baseline **155**). Commit per task.

---

## Task 0: Baseline

- [ ] Run: `cd /d/e-commerce-OSCAR/apps/mobile && npm test 2>&1 | grep -E "Tests:|Test Suites:"` → expect `Tests: 75 passed`, `Test Suites: 13 passed`.
- [ ] Run: `cd /d/e-commerce-OSCAR/apps/mobile && npx tsc --noEmit 2>&1 | grep -cE "error TS"` → expect `155` (the gate: final must be ≤ 155).
- [ ] Run: `cd /d/e-commerce-OSCAR/apps/mobile && npm run lint 2>&1 | grep -E "problems|error" | tail -1` → expect `0 errors`.

No commit.

---

## Task 1: Pure `addRecent` helper

**Files:** Create `src/utils/recentlyViewed.ts`; Test `src/utils/__tests__/recentlyViewed.test.ts`.

- [ ] **Step 1: Write the failing test** — create `src/utils/__tests__/recentlyViewed.test.ts`:

```ts
import { addRecent, RECENTLY_VIEWED_CAP, type RecentlyViewedEntry } from '../recentlyViewed';

const mk = (productId: string, viewedAt: number): RecentlyViewedEntry => ({
  productId,
  slug: `s-${productId}`,
  name: `P ${productId}`,
  imageUrl: null,
  price: 1000,
  currencyCode: 'DZD',
  viewedAt,
});

describe('addRecent', () => {
  it('adds to an empty list', () => {
    expect(addRecent([], mk('a', 1)).map((e) => e.productId)).toEqual(['a']);
  });

  it('prepends a new product, keeping previous order', () => {
    const list = [mk('a', 2), mk('b', 1)];
    expect(addRecent(list, mk('c', 3)).map((e) => e.productId)).toEqual(['c', 'a', 'b']);
  });

  it('moves a re-viewed product to the front without duplicating', () => {
    const list = [mk('a', 2), mk('b', 1)];
    const out = addRecent(list, mk('b', 3));
    expect(out.map((e) => e.productId)).toEqual(['b', 'a']);
    expect(out).toHaveLength(2);
    expect(out[0].viewedAt).toBe(3);
  });

  it('caps the list to the newest entries', () => {
    let list: RecentlyViewedEntry[] = [];
    for (let i = 0; i < RECENTLY_VIEWED_CAP + 3; i++) list = addRecent(list, mk(`p${i}`, i));
    expect(list).toHaveLength(RECENTLY_VIEWED_CAP);
    expect(list[0].productId).toBe(`p${RECENTLY_VIEWED_CAP + 2}`); // newest first
    expect(list.some((e) => e.productId === 'p0')).toBe(false); // oldest dropped
  });

  it('respects a custom cap', () => {
    const list = [mk('a', 2), mk('b', 1)];
    expect(addRecent(list, mk('c', 3), 2).map((e) => e.productId)).toEqual(['c', 'a']);
  });
});
```

- [ ] **Step 2: Run it, expect FAIL** — `cd /d/e-commerce-OSCAR/apps/mobile && npm test -- recentlyViewed 2>&1 | tail -15` → `Cannot find module '../recentlyViewed'`.

- [ ] **Step 3: Implement** — create `src/utils/recentlyViewed.ts`:

```ts
/**
 * Pure helper for the local "recently viewed" product list.
 * Re-viewing a product moves it to the front (no duplicates); the list is capped.
 * Caller stamps `viewedAt`, keeping this function deterministic + testable.
 */
export interface RecentlyViewedEntry {
  productId: string;
  slug: string;
  name: string;
  imageUrl: string | null;
  price: number; // display units (DZD whole), already formatPrice'd
  currencyCode: string;
  viewedAt: number; // epoch ms
}

export const RECENTLY_VIEWED_CAP = 12;

export function addRecent(
  list: RecentlyViewedEntry[],
  entry: RecentlyViewedEntry,
  cap: number = RECENTLY_VIEWED_CAP,
): RecentlyViewedEntry[] {
  return [entry, ...list.filter((e) => e.productId !== entry.productId)].slice(0, cap);
}
```

- [ ] **Step 4: Run it, expect PASS** — `cd /d/e-commerce-OSCAR/apps/mobile && npm test -- recentlyViewed 2>&1 | tail -15` → 5 passed.

- [ ] **Step 5: tsc-clean + commit**
```bash
cd /d/e-commerce-OSCAR/apps/mobile && npx tsc --noEmit 2>&1 | grep -E "utils/recentlyViewed" || echo "clean"
cd /d/e-commerce-OSCAR/apps/mobile && git add src/utils/recentlyViewed.ts src/utils/__tests__/recentlyViewed.test.ts && git commit -m "feat(mobile): recently-viewed addRecent helper (M3a)"
```

---

## Task 2: `RecentlyViewedContext` + provider mount

**Files:** Create `src/contexts/RecentlyViewedContext.tsx`; Modify `app/_layout.tsx`.

- [ ] **Step 1: Create the context** — `src/contexts/RecentlyViewedContext.tsx`:

```tsx
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addRecent, RecentlyViewedEntry } from '../utils/recentlyViewed';

const STORAGE_KEY = 'oscar.recentlyViewed.v1';

interface RecentlyViewedContextValue {
  items: RecentlyViewedEntry[];
  track: (entry: Omit<RecentlyViewedEntry, 'viewedAt'>) => void;
  clear: () => void;
  /** True until the persisted list has been hydrated from AsyncStorage. */
  hydrating: boolean;
}

const RecentlyViewedContext = createContext<RecentlyViewedContextValue | undefined>(undefined);

export const RecentlyViewedProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<RecentlyViewedEntry[]>([]);
  const [hydrating, setHydrating] = useState(true);

  // Hydrate from disk on mount.
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!alive) return;
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) setItems(parsed);
        }
      } catch (err) {
        console.warn('[recentlyViewed] hydrate failed', err);
      } finally {
        if (alive) setHydrating(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Persist after hydration (avoid wiping the saved list with the empty initial state).
  useEffect(() => {
    if (hydrating) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items)).catch((err) => {
      console.warn('[recentlyViewed] persist failed', err);
    });
  }, [items, hydrating]);

  const track = useCallback((entry: Omit<RecentlyViewedEntry, 'viewedAt'>) => {
    setItems((prev) => addRecent(prev, { ...entry, viewedAt: Date.now() }));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<RecentlyViewedContextValue>(
    () => ({ items, track, clear, hydrating }),
    [items, track, clear, hydrating],
  );

  return <RecentlyViewedContext.Provider value={value}>{children}</RecentlyViewedContext.Provider>;
};

export const useRecentlyViewed = () => {
  const ctx = useContext(RecentlyViewedContext);
  if (!ctx) throw new Error('useRecentlyViewed must be used inside <RecentlyViewedProvider>');
  return ctx;
};
```

- [ ] **Step 2: Mount the provider** — in `app/_layout.tsx`, add the import after the `WishlistProvider` import (line 28):
```ts
import { RecentlyViewedProvider } from '@/src/contexts/RecentlyViewedContext';
```
Then replace this exact block:
```tsx
              <WishlistProvider>
                <ThemeProvider>
                  <NavigationThemeBridge>
                    <ToastProvider>
                      <RootNavigator />
                      <MiniCartSheet />
                      <StatusBar style="auto" />
                    </ToastProvider>
                  </NavigationThemeBridge>
                </ThemeProvider>
              </WishlistProvider>
```
with:
```tsx
              <WishlistProvider>
                <RecentlyViewedProvider>
                  <ThemeProvider>
                    <NavigationThemeBridge>
                      <ToastProvider>
                        <RootNavigator />
                        <MiniCartSheet />
                        <StatusBar style="auto" />
                      </ToastProvider>
                    </NavigationThemeBridge>
                  </ThemeProvider>
                </RecentlyViewedProvider>
              </WishlistProvider>
```

- [ ] **Step 3: Verify + commit**
```bash
cd /d/e-commerce-OSCAR/apps/mobile && npx tsc --noEmit 2>&1 | grep -cE "error TS"   # expect <=155
cd /d/e-commerce-OSCAR/apps/mobile && npm test 2>&1 | grep -E "Tests:|Suites:"       # all green
cd /d/e-commerce-OSCAR/apps/mobile && git add src/contexts/RecentlyViewedContext.tsx app/_layout.tsx && git commit -m "feat(mobile): RecentlyViewedContext + provider mount (M3a)"
```

---

## Task 3: Extract `HorizontalProductRow` + refactor `RelatedProducts`

**Files:** Create `src/components/products/HorizontalProductRow.tsx`; Replace `src/components/products/RelatedProducts.tsx`; Modify `src/components/products/index.ts`.

- [ ] **Step 1: Create `HorizontalProductRow.tsx`** (the presentational row moved out of `RelatedProducts`):

```tsx
import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { colors, spacing, typography } from '../../theme';

export interface SimpleProduct {
  id: string;
  slug: string;
  name: string;
  imageUrl: string | null;
  price: number;
  currencyCode: string;
}

export function HorizontalProductRow({ title, products }: { title: string; products: SimpleProduct[] }) {
  const router = useRouter();
  if (products.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.title}>{title}</Text>
      <FlatList
        data={products}
        keyExtractor={(p) => p.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ width: spacing.md }} />}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => router.push(`/products/${item.slug}` as any)}>
            <View style={styles.thumb}>
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.thumbImage} contentFit="cover" />
              ) : null}
            </View>
            <Text style={styles.cardName} numberOfLines={2}>
              {item.name}
            </Text>
            <Text style={styles.cardPrice}>
              {item.price} {item.currencyCode}
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: spacing.lg,
  },
  title: {
    ...typography.styles.h4,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  list: {
    paddingHorizontal: spacing.lg,
  },
  card: {
    width: 140,
    gap: spacing.xs,
  },
  thumb: {
    width: 140,
    height: 180,
    borderRadius: 8,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  cardName: {
    ...typography.styles.bodySmall,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
  },
  cardPrice: {
    ...typography.styles.bodySmall,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.semiBold,
  },
});
```

- [ ] **Step 2: Replace `RelatedProducts.tsx`** with the slimmed version (queries + mapping kept; presentation delegated):

```tsx
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useGetCollectionWithProductsQuery,
  useGetProductsQuery,
} from '../../graphql/generated/graphql';
import { formatPrice } from '../../utils/vendureAdapters';
import { HorizontalProductRow, SimpleProduct } from './HorizontalProductRow';

interface RelatedProductsProps {
  /** Slug of the current product's first collection — pass an empty string to skip the collection query. */
  collectionSlug?: string | null;
  /** Current product id, excluded from the results. */
  currentProductId: string;
}

export function RelatedProducts({ collectionSlug, currentProductId }: RelatedProductsProps) {
  const { t } = useTranslation();

  const hasCollection = !!collectionSlug;
  const collectionQuery = useGetCollectionWithProductsQuery({
    variables: { slug: collectionSlug ?? '', take: 12, skip: 0 },
    skip: !hasCollection,
  });
  const recentQuery = useGetProductsQuery({
    variables: { options: { take: 12 } },
    skip: hasCollection,
  });

  const products = useMemo<SimpleProduct[]>(() => {
    const source: any[] = hasCollection
      ? (collectionQuery.data?.collection?.productVariants?.items ?? [])
          .map((v: any) => v.product)
          .filter(Boolean)
      : (recentQuery.data?.products?.items ?? []);

    const seen = new Set<string>([currentProductId]);
    const out: SimpleProduct[] = [];
    for (const p of source) {
      if (!p || seen.has(p.id)) continue;
      seen.add(p.id);
      const variant = p.variants?.[0];
      out.push({
        id: p.id,
        slug: p.slug,
        name: p.name,
        imageUrl: p.featuredAsset?.preview ?? null,
        price: variant ? formatPrice(variant.priceWithTax) : 0,
        currencyCode: variant?.currencyCode ?? 'DZD',
      });
      if (out.length >= 6) break;
    }
    return out;
  }, [hasCollection, collectionQuery.data, recentQuery.data, currentProductId]);

  return <HorizontalProductRow title={t('products.related', 'You may also like')} products={products} />;
}
```

- [ ] **Step 3: Update the barrel** — in `src/components/products/index.ts`, after the `export { RelatedProducts } from './RelatedProducts';` line, add:
```ts
export { HorizontalProductRow } from './HorizontalProductRow';
export type { SimpleProduct } from './HorizontalProductRow';
```

- [ ] **Step 4: Verify + commit**
```bash
cd /d/e-commerce-OSCAR/apps/mobile && npx tsc --noEmit 2>&1 | grep -cE "error TS"   # expect <=155
cd /d/e-commerce-OSCAR/apps/mobile && npm test 2>&1 | grep -E "Tests:|Suites:"       # all green
cd /d/e-commerce-OSCAR/apps/mobile && git add src/components/products/HorizontalProductRow.tsx src/components/products/RelatedProducts.tsx src/components/products/index.ts && git commit -m "refactor(mobile): extract HorizontalProductRow from RelatedProducts (M3a)"
```

---

## Task 4: `RecentlyViewedRow` component

**Files:** Create `src/components/products/RecentlyViewedRow.tsx`; Modify `src/components/products/index.ts`.

- [ ] **Step 1: Create the component**:

```tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useRecentlyViewed } from '../../contexts/RecentlyViewedContext';
import { HorizontalProductRow, SimpleProduct } from './HorizontalProductRow';

export function RecentlyViewedRow({ excludeProductId }: { excludeProductId?: string }) {
  const { t } = useTranslation();
  const { items } = useRecentlyViewed();

  const products: SimpleProduct[] = items
    .filter((e) => e.productId !== excludeProductId)
    .map((e) => ({
      id: e.productId,
      slug: e.slug,
      name: e.name,
      imageUrl: e.imageUrl,
      price: e.price,
      currencyCode: e.currencyCode,
    }));

  return (
    <HorizontalProductRow title={t('products.recentlyViewed', 'Recently viewed')} products={products} />
  );
}
```

- [ ] **Step 2: Barrel export** — in `src/components/products/index.ts`, add:
```ts
export { RecentlyViewedRow } from './RecentlyViewedRow';
```

- [ ] **Step 3: Verify + commit**
```bash
cd /d/e-commerce-OSCAR/apps/mobile && npx tsc --noEmit 2>&1 | grep -cE "error TS"   # expect <=155
cd /d/e-commerce-OSCAR/apps/mobile && npm test 2>&1 | grep -E "Tests:|Suites:"       # all green
cd /d/e-commerce-OSCAR/apps/mobile && git add src/components/products/RecentlyViewedRow.tsx src/components/products/index.ts && git commit -m "feat(mobile): RecentlyViewedRow component (M3a)"
```

---

## Task 5: PDP — record views + render the row

**Files:** Modify `app/products/[slug].tsx`.

- [ ] **Step 1: Imports** — change line 1 from:
```ts
import React, { useState, useCallback, useMemo } from 'react';
```
to:
```ts
import React, { useState, useCallback, useMemo, useEffect } from 'react';
```
Change line 18 from:
```ts
import { ImageCarousel, SizeGuideModal, RelatedProducts } from '../../src/components/products';
```
to:
```ts
import { ImageCarousel, SizeGuideModal, RelatedProducts, RecentlyViewedRow } from '../../src/components/products';
```
After the `useWishlist` import (line 21), add:
```ts
import { useRecentlyViewed } from '../../src/contexts/RecentlyViewedContext';
```

- [ ] **Step 2: Hook** — after `const wishlist = useWishlist();` add:
```ts
  const { track } = useRecentlyViewed();
```

- [ ] **Step 3: Tracking effect** — immediately after the `selectedVariant` memo (the block ending `}, [product, selectedOptions]);`), add:
```tsx
  // Record this product as recently viewed once per open (keyed on product id).
  useEffect(() => {
    if (!product || !selectedVariant) return;
    track({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      imageUrl: product.featuredAsset?.preview ?? null,
      price: formatPrice(selectedVariant.priceWithTax),
      currencyCode: selectedVariant.currencyCode ?? 'DZD',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);
```

- [ ] **Step 4: Render the row** — find the related-products block:
```tsx
        <RelatedProducts
          currentProductId={product.id}
          collectionSlug={product.collections?.[0]?.slug ?? null}
        />
```
and add immediately after it (before `</ScrollView>`):
```tsx
        <RecentlyViewedRow excludeProductId={product.id} />
```

- [ ] **Step 5: Verify + commit**
```bash
cd /d/e-commerce-OSCAR/apps/mobile && npx tsc --noEmit 2>&1 | grep -cE "error TS"   # expect <=155
cd /d/e-commerce-OSCAR/apps/mobile && npm test 2>&1 | grep -E "Tests:|Suites:"       # all green (product-detail test mocks useCart/useWishlist; add a useRecentlyViewed mock if it errors — see note)
cd /d/e-commerce-OSCAR/apps/mobile && git add "app/products/[slug].tsx" && git commit -m "feat(mobile): record + show recently-viewed on PDP (M3a)"
```
Note: `app/products/__tests__/product-detail.test.tsx` mocks `useCart`/`useWishlist`. If it now errors because `useRecentlyViewed` is called without a provider, add a mock alongside the others: `jest.mock('../../../src/contexts/RecentlyViewedContext', () => ({ useRecentlyViewed: () => ({ items: [], track: jest.fn(), clear: jest.fn(), hydrating: false }) }));` (match the relative path the other context mocks use). Run the test to confirm before committing.

---

## Task 6: Home — render the row

**Files:** Modify `app/(tabs)/index.tsx`.

- [ ] **Step 1: Import** — after the home-components import block (the `from '@/src/components/home';` import near line 29), add:
```ts
import { RecentlyViewedRow } from '@/src/components/products';
```

- [ ] **Step 2: Render** — find:
```tsx
        <View style={styles.bottomSpacer} />
```
and insert immediately before it:
```tsx
        {/* Recently viewed */}
        <RecentlyViewedRow />

```

- [ ] **Step 3: Verify + commit**
```bash
cd /d/e-commerce-OSCAR/apps/mobile && npx tsc --noEmit 2>&1 | grep -cE "error TS"   # expect <=155
cd /d/e-commerce-OSCAR/apps/mobile && npm test 2>&1 | grep -E "Tests:|Suites:"       # all green
cd /d/e-commerce-OSCAR/apps/mobile && git add "app/(tabs)/index.tsx" && git commit -m "feat(mobile): show recently-viewed row on Home (M3a)"
```

---

## Task 7: i18n string

**Files:** Modify `src/i18n/locales/{en,fr,ar}.json`.

Add a `recentlyViewed` key to the `products` object in each locale (find the `"products"` object; add the key, keep JSON valid):
- en: `"recentlyViewed": "Recently viewed"`
- fr: `"recentlyViewed": "Vus récemment"`
- ar: `"recentlyViewed": "شوهدت مؤخرًا"`

- [ ] **Step 1: Add the key in all three locales** (inside each file's `products` object).
- [ ] **Step 2: Verify JSON parses**
```bash
cd /d/e-commerce-OSCAR/apps/mobile && node -e "['en','fr','ar'].forEach(l=>{const p=require('./src/i18n/locales/'+l+'.json').products; if(!p.recentlyViewed) throw new Error(l); console.log(l,p.recentlyViewed)})"
```
- [ ] **Step 3: Commit**
```bash
cd /d/e-commerce-OSCAR/apps/mobile && git add src/i18n/locales/en.json src/i18n/locales/fr.json src/i18n/locales/ar.json && git commit -m "i18n(mobile): add products.recentlyViewed (M3a)"
```

---

## Task 8: Final verification + status doc

- [ ] **Step 1: Full gate**
```bash
cd /d/e-commerce-OSCAR/apps/mobile && npm test 2>&1 | grep -E "Tests:|Test Suites:"   # expect 80 tests / 14 suites (75 + 5 new)
cd /d/e-commerce-OSCAR/apps/mobile && npm run lint 2>&1 | grep -E "problems|error" | tail -1   # 0 errors
cd /d/e-commerce-OSCAR/apps/mobile && npx tsc --noEmit 2>&1 | grep -cE "error TS"   # <= 155
```
If tsc > 155, run `npx tsc --noEmit 2>&1 | grep -E "error TS"` and fix only in files this milestone touched.

- [ ] **Step 2: Status doc** — in `docs/superpowers/mobile-enhancement-status.md`: add an **M3a** entry to the Done list (recently-viewed: tested `addRecent`, `RecentlyViewedContext`, shared `HorizontalProductRow`, row on Home + PDP), bump the Health test count to 80, and under "Next up" note M3 is in progress (M3a done; haptics / a11y / dark mode remain). Match the existing entry style.

- [ ] **Step 3: Commit**
```bash
cd /d/e-commerce-OSCAR/apps/mobile && git add ../../docs/superpowers/mobile-enhancement-status.md && git commit -m "docs(mobile): mark M3a recently-viewed done (M3a)"
```

---

## Self-review notes (for the executor)
- The PDP tracking effect intentionally depends only on `[product?.id]` (record once per product open) with an `eslint-disable-next-line react-hooks/exhaustive-deps` — `track` is stable and `selectedVariant` is available whenever `product` is.
- `RecentlyViewedEntry.price` is **display units** (already `formatPrice`'d), matching how `HorizontalProductRow`/`RelatedProducts` render `{price} {currencyCode}`. Do NOT pass raw cents.
- The Home recently-viewed row uses the **simple card** (via `HorizontalProductRow`), not the home's `ProductCardFigma` — intentional (entries don't store rating/discount/stock). Do not touch `ProductCardFigma`.
- Zero new tsc errors (baseline 155). Never "fix" pre-existing baseline errors.
