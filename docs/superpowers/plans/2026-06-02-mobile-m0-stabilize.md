# Mobile M0 — Stabilize + Guardrails Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the mobile app's crash/dead-end bugs on common journeys and stand up a Jest + GitHub Actions safety net, so M1–M4 are guarded against regressions.

**Architecture:** All work is inside the standalone `apps/mobile` Expo project (own `package-lock.json`, npm — NOT pnpm/Turborepo workspace). TDD where the unit is pure or component-renderable; the canonical `apps/frontend` storefront is the reference (notably slug-based product identity). Bugs are fixed regression-test-first.

**Tech Stack:** Expo SDK 55, React Native 0.83, React 19.2, expo-router, Apollo Client 4, react-i18next, Jest (`jest-expo`), `@testing-library/react-native`, GitHub Actions.

**Working directory for ALL commands:** `apps/mobile` (run `cd apps/mobile` first, or use the per-command note).

**Branch:** `feat/mobile-m0-stabilize` (already created and holds the design spec commit).

---

## File Map

**Created:**
- `apps/mobile/jest.config.js` — Jest config (jest-expo preset, `@/` alias, setup file)
- `apps/mobile/jest.setup.js` — global test mocks (react-i18next, AsyncStorage)
- `apps/mobile/src/test/renderWithProviders.tsx` — RNTL render helper wrapping SafeAreaProvider
- `apps/mobile/src/test/setup.test.ts` — harness smoke test
- `apps/mobile/src/utils/__tests__/vendureAdapters.test.ts`
- `apps/mobile/src/utils/__tests__/discountParser.test.ts`
- `apps/mobile/src/utils/__tests__/validation.test.ts`
- `apps/mobile/src/utils/reorder.ts` — pure `summarizeReorder` helper
- `apps/mobile/src/utils/__tests__/reorder.test.ts`
- `apps/mobile/app/products/__tests__/product-detail.test.tsx` — PDP crash regression test
- `apps/mobile/src/components/AppErrorBoundary.tsx` — error-boundary fallback UI
- `apps/mobile/src/components/__tests__/AppErrorBoundary.test.tsx`
- `apps/mobile/app/products/[slug].tsx` — renamed from `[id].tsx`
- `.github/workflows/mobile-ci.yml` — first CI in the repo

**Modified:**
- `apps/mobile/package.json` — devDeps + `test`/`test:watch`/`type-check` scripts
- `apps/mobile/app/products/[id].tsx` → renamed; query swap + isFavorite move
- `apps/mobile/src/components/home/ProductCardFigma.tsx:47` — `.id` → `.slug`
- `apps/mobile/src/components/products/ProductCard.tsx:30` — `.id` → `.slug`
- `apps/mobile/src/components/products/ProductListItem.tsx:33` — `.id` → `.slug`
- `apps/mobile/src/components/home/ProductSection.tsx:100` — `.id` → `.slug`
- `apps/mobile/app/search.tsx:181` — `.id` → `.slug`
- `apps/mobile/app/(tabs)/orders.tsx:180` — route fix
- `apps/mobile/app/payment/status.tsx` — 5 route fixes
- `apps/mobile/src/components/home/SearchHeader.tsx` — remove dead bell
- `apps/mobile/app/_layout.tsx` — re-export `ErrorBoundary`
- `apps/mobile/app/orders/[id].tsx` — real reorder
- `apps/mobile/src/i18n/locales/{en,fr,ar}.json` — error-boundary `common` keys

**Untouched (deferred to M3, noted to avoid confusion):** `src/components/cart/CartItemContent.tsx:21` still pushes `item.productId` — it is dead/duplicated, type-incorrect code (`item.id: number`) not rendered by the live cart screen. Deleting the dead cart family is an M3 item; do not modify it here.

---

## Task 1: Test harness foundation

**Files:**
- Modify: `apps/mobile/package.json`
- Create: `apps/mobile/jest.config.js`, `apps/mobile/jest.setup.js`, `apps/mobile/src/test/renderWithProviders.tsx`, `apps/mobile/src/test/setup.test.ts`

- [ ] **Step 1: Install dev dependencies**

Run (in `apps/mobile`):
```bash
npm install --save-dev jest-expo@~55.0.0 jest@^29.7.0 @testing-library/react-native@^13.2.0 react-test-renderer@19.2.0 @types/jest@^29.5.12
```
Expected: installs succeed and these appear under `devDependencies` in `package.json`. (If npm reports a peer-dependency conflict on React 19, re-run with `--legacy-peer-deps`.) Record the exact resolved versions.

- [ ] **Step 2: Add scripts to `package.json`**

In the `"scripts"` block, add these three entries (place after the existing `"lint": "expo lint",` line):
```json
    "test": "jest",
    "test:watch": "jest --watch",
    "type-check": "tsc --noEmit",
```

- [ ] **Step 3: Create `jest.config.js`**

Create `apps/mobile/jest.config.js`:
```js
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
};
```

- [ ] **Step 4: Create `jest.setup.js`**

Create `apps/mobile/jest.setup.js`:
```js
// Predictable i18n under test: t(key, default) returns the default (or the key).
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key, defaultValue) => (typeof defaultValue === 'string' ? defaultValue : key),
    i18n: { language: 'en', changeLanguage: jest.fn() },
  }),
  initReactI18next: { type: '3rdParty', init: jest.fn() },
  Trans: ({ children }) => children,
}));

// AsyncStorage mock for contexts/utils that touch it.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
```

- [ ] **Step 5: Create the render helper**

Create `apps/mobile/src/test/renderWithProviders.tsx`:
```tsx
import React, { ReactElement } from 'react';
import { render } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

export function renderWithProviders(ui: ReactElement) {
  return render(<SafeAreaProvider initialMetrics={METRICS}>{ui}</SafeAreaProvider>);
}
```

- [ ] **Step 6: Create a smoke test**

Create `apps/mobile/src/test/setup.test.ts`:
```ts
describe('test harness', () => {
  it('runs and evaluates expectations', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 7: Run the harness**

Run (in `apps/mobile`): `npm test`
Expected: PASS — 1 suite (`setup.test.ts`), 1 test passing.

- [ ] **Step 8: Commit**

```bash
git add apps/mobile/package.json apps/mobile/package-lock.json apps/mobile/jest.config.js apps/mobile/jest.setup.js apps/mobile/src/test
git commit -m "test(mobile): add jest-expo + RNTL harness (W7)"
```

---

## Task 2: Unit tests for `vendureAdapters`

**Files:**
- Create: `apps/mobile/src/utils/__tests__/vendureAdapters.test.ts`
- Reference (do not modify): `apps/mobile/src/utils/vendureAdapters.ts`

- [ ] **Step 1: Write the tests**

Create `apps/mobile/src/utils/__tests__/vendureAdapters.test.ts`:
```ts
import { formatPrice, mapVendureOrderState } from '../vendureAdapters';

describe('formatPrice', () => {
  it('converts Vendure cents to whole DZD', () => {
    expect(formatPrice(150000)).toBe(1500);
  });

  it('rounds to the nearest dinar', () => {
    expect(formatPrice(150050)).toBe(1501); // 1500.5 -> 1501
    expect(formatPrice(150040)).toBe(1500); // 1500.4 -> 1500
  });

  it('handles zero', () => {
    expect(formatPrice(0)).toBe(0);
  });
});

describe('mapVendureOrderState', () => {
  it('maps known Vendure states to app states', () => {
    expect(mapVendureOrderState('PaymentSettled')).toBe('PAID');
    expect(mapVendureOrderState('Shipped')).toBe('SHIPPED');
    expect(mapVendureOrderState('Delivered')).toBe('DELIVERED');
    expect(mapVendureOrderState('Cancelled')).toBe('CANCELLED');
  });

  it('passes through unknown states unchanged', () => {
    expect(mapVendureOrderState('SomethingNew')).toBe('SomethingNew');
  });
});
```

- [ ] **Step 2: Run the tests**

Run (in `apps/mobile`): `npm test -- vendureAdapters`
Expected: PASS — all assertions green.

- [ ] **Step 3: Commit**

```bash
git add apps/mobile/src/utils/__tests__/vendureAdapters.test.ts
git commit -m "test(mobile): cover formatPrice + order-state mapping (W7)"
```

---

## Task 3: Unit tests for `discountParser`

**Files:**
- Create: `apps/mobile/src/utils/__tests__/discountParser.test.ts`
- Reference (do not modify): `apps/mobile/src/utils/discountParser.ts`

- [ ] **Step 1: Write the tests**

Create `apps/mobile/src/utils/__tests__/discountParser.test.ts`:
```ts
import { parseProductDiscount } from '../discountParser';

describe('parseProductDiscount', () => {
  it('returns no discount when there are no collections', () => {
    const result = parseProductDiscount([], 200000);
    expect(result.hasDiscount).toBe(false);
    expect(result.salePrice).toBe(200000);
    expect(result.savings).toBe(0);
  });

  it('parses a discount-NN collection slug and computes the sale price', () => {
    const result = parseProductDiscount([{ slug: 'discount-30' }], 200000);
    expect(result.hasDiscount).toBe(true);
    expect(result.percentage).toBe(30);
    expect(result.originalPrice).toBe(200000);
    expect(result.salePrice).toBe(140000);
    expect(result.savings).toBe(60000);
  });

  it('picks the highest discount when several match', () => {
    const result = parseProductDiscount(
      [{ slug: 'discount-10' }, { slug: 'discount-50' }, { slug: 'summer' }],
      100000
    );
    expect(result.percentage).toBe(50);
    expect(result.salePrice).toBe(50000);
  });

  it('ignores non-discount slugs and percentages over 100', () => {
    const result = parseProductDiscount([{ slug: 'discount-150' }, { slug: 'new' }], 100000);
    expect(result.hasDiscount).toBe(false);
  });

  it('returns no discount when price is zero', () => {
    const result = parseProductDiscount([{ slug: 'discount-30' }], 0);
    expect(result.hasDiscount).toBe(false);
  });
});
```

- [ ] **Step 2: Run the tests**

Run (in `apps/mobile`): `npm test -- discountParser`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/mobile/src/utils/__tests__/discountParser.test.ts
git commit -m "test(mobile): cover product discount parsing (W7)"
```

---

## Task 4: Unit tests for `validation`

**Files:**
- Create: `apps/mobile/src/utils/__tests__/validation.test.ts`
- Reference (do not modify): `apps/mobile/src/utils/validation.ts`

- [ ] **Step 1: Write the tests**

Create `apps/mobile/src/utils/__tests__/validation.test.ts`:
```ts
import { loginSchema, validationRules } from '../validation';
import * as Yup from 'yup';

describe('loginSchema', () => {
  it('accepts a valid email + password', async () => {
    await expect(
      loginSchema.validate({ email: 'user@example.com', password: 'secret1' })
    ).resolves.toBeTruthy();
  });

  it('rejects an invalid email', async () => {
    await expect(
      loginSchema.validate({ email: 'not-an-email', password: 'secret1' })
    ).rejects.toBeInstanceOf(Yup.ValidationError);
  });

  it('rejects a too-short password', async () => {
    await expect(
      loginSchema.validate({ email: 'user@example.com', password: '123' })
    ).rejects.toBeInstanceOf(Yup.ValidationError);
  });
});

describe('validationRules.phone', () => {
  it('accepts exactly 10 digits', async () => {
    await expect(validationRules.phone.validate('0551234567')).resolves.toBe('0551234567');
  });

  it('rejects non-10-digit input', async () => {
    await expect(validationRules.phone.validate('12345')).rejects.toBeInstanceOf(Yup.ValidationError);
  });
});
```

- [ ] **Step 2: Run the tests**

Run (in `apps/mobile`): `npm test -- validation`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/mobile/src/utils/__tests__/validation.test.ts
git commit -m "test(mobile): cover login + phone validation (W7)"
```

---

## Task 5: Fix PDP crash + migrate product routing to slug (W1 + W2)

This task is regression-test-first. The test reproduces the temporal-dead-zone crash, then the fix makes it pass. The route rename and ALL caller updates land in the same commit so navigation stays consistent.

**Files:**
- Create: `apps/mobile/app/products/__tests__/product-detail.test.tsx`
- Rename: `apps/mobile/app/products/[id].tsx` → `apps/mobile/app/products/[slug].tsx` (then edit)
- Modify: `ProductCardFigma.tsx`, `ProductCard.tsx`, `ProductListItem.tsx`, `ProductSection.tsx`, `app/search.tsx`

- [ ] **Step 1: Write the failing regression test**

Create `apps/mobile/app/products/__tests__/product-detail.test.tsx`:
```tsx
import React from 'react';
import { renderWithProviders } from '@/src/test/renderWithProviders';

// Mock the slug query hook (the screen reads data from it).
const mockUseGetProductBySlugQuery = jest.fn();
jest.mock('@/src/graphql/generated/graphql', () => ({
  useGetProductBySlugQuery: (opts: any) => mockUseGetProductBySlugQuery(opts),
}));

// Mock contexts so the screen does not need real Apollo providers.
jest.mock('@/src/contexts/CartContext', () => ({
  useCart: () => ({ addToCart: jest.fn(), loading: false }),
}));
jest.mock('@/src/contexts/WishlistContext', () => ({
  useWishlist: () => ({ has: () => false, toggle: jest.fn() }),
}));

// Mock heavy/native child barrels and expo-image so only the screen's own code runs.
jest.mock('@/src/components/products', () => ({
  ImageCarousel: () => null,
  SizeGuideModal: () => null,
  RelatedProducts: () => null,
}));
jest.mock('@/src/components/ui', () => {
  const { Text } = require('react-native');
  const Stub = ({ title }: any) => (title ? <Text>{title}</Text> : null);
  return {
    Button: Stub,
    LoadingSpinner: () => null,
    ErrorState: ({ title }: any) => <Text>{title}</Text>,
    Badge: Stub,
    Chip: Stub,
  };
});
jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ slug: 'blue-shirt' }),
  router: { push: jest.fn(), back: jest.fn(), canGoBack: () => false },
}));

import ProductDetailScreen from '../[slug]';

const PRODUCT = {
  id: 'p1',
  name: 'Blue Shirt',
  slug: 'blue-shirt',
  description: 'A shirt',
  featuredAsset: { preview: 'http://img/p.jpg' },
  assets: [{ preview: 'http://img/p.jpg' }],
  collections: [{ id: 'c1', name: 'Shirts', slug: 'shirts' }],
  variants: [
    {
      id: 'v1',
      name: 'Blue / M',
      sku: 'SKU1',
      priceWithTax: 250000,
      currencyCode: 'DZD',
      stockLevel: 'IN_STOCK',
      options: [],
    },
  ],
};

describe('ProductDetailScreen', () => {
  beforeEach(() => {
    mockUseGetProductBySlugQuery.mockReturnValue({
      data: { product: PRODUCT },
      loading: false,
      error: undefined,
      refetch: jest.fn(),
    });
  });

  it('renders the product without crashing and queries by slug', () => {
    const { getByText } = renderWithProviders(<ProductDetailScreen />);
    expect(getByText('Blue Shirt')).toBeTruthy();
    expect(mockUseGetProductBySlugQuery).toHaveBeenCalledWith({ variables: { slug: 'blue-shirt' } });
  });
});
```

- [ ] **Step 2: Run it against the current (buggy) code to confirm it fails**

The screen does not exist at `[slug]` yet and still has the crash, so the import/render fails. First rename so the import resolves, then watch the crash:

Run (in `apps/mobile`): `git mv app/products/[id].tsx app/products/[slug].tsx`

Then run: `npm test -- product-detail`
Expected: FAIL — either `ReferenceError: Cannot access 'data' before initialization` during render, or a mismatch because the screen still calls `useGetProductQuery`/reads `id`. This proves the test catches the bug.

- [ ] **Step 3: Apply the fix in `app/products/[slug].tsx`**

Edit 1 — import the slug hook. Change line 16 from:
```tsx
import { useGetProductQuery } from '../../src/graphql/generated/graphql';
```
to:
```tsx
import { useGetProductBySlugQuery } from '../../src/graphql/generated/graphql';
```

Edit 2 — read the `slug` param. Change line 27 from:
```tsx
  const { id } = useLocalSearchParams<{ id: string }>();
```
to:
```tsx
  const { slug } = useLocalSearchParams<{ slug: string }>();
```

Edit 3 — remove the early `isFavorite` line. Delete line 38:
```tsx
  const isFavorite = !!data?.product && wishlist.has(data.product.id);
```

Edit 4 — swap the query call. Change lines 40-44 from:
```tsx
  const { data, loading, error, refetch } = useGetProductQuery({
    variables: { id },
  });

  const product = data?.product;
```
to:
```tsx
  const { data, loading, error, refetch } = useGetProductBySlugQuery({
    variables: { slug },
  });

  const product = data?.product;
  const isFavorite = !!product && wishlist.has(product.id);
```

(`isFavorite` now derives from `product` AFTER the query, keying on `product.id` — wishlist keying is unchanged in M0.)

- [ ] **Step 4: Switch all product-navigation callers from `.id` to `.slug`**

`src/components/home/ProductCardFigma.tsx` line 47:
```tsx
      router.push(`/products/${product.slug}`);
```
`src/components/products/ProductCard.tsx` line 30:
```tsx
      router.push(`/products/${product.slug}`);
```
`src/components/products/ProductListItem.tsx` line 33:
```tsx
      router.push(`/products/${product.slug}`);
```
`src/components/home/ProductSection.tsx` line 100 (inside `CompactProductCard`):
```tsx
      router.push(`/products/${product.slug}`);
```
`app/search.tsx` line 181:
```tsx
    router.push(`/products/${product.slug}`);
```

(`wishlist.tsx:19` and `RelatedProducts.tsx:86` already push `.slug` — leave them; they now resolve correctly.)

- [ ] **Step 5: Run the regression test + type-check**

Run (in `apps/mobile`):
```bash
npm test -- product-detail
npx tsc --noEmit
```
Expected: test PASS; `tsc` reports no errors.

- [ ] **Step 6: Commit**

```bash
git add apps/mobile/app/products apps/mobile/src/components/home/ProductCardFigma.tsx apps/mobile/src/components/products/ProductCard.tsx apps/mobile/src/components/products/ProductListItem.tsx apps/mobile/src/components/home/ProductSection.tsx apps/mobile/app/search.tsx
git commit -m "fix(mobile): fix PDP crash + make product routing slug-canonical (W1/W2)"
```

---

## Task 6: Fix broken route strings (W3)

**Files:**
- Modify: `apps/mobile/app/(tabs)/orders.tsx:180`, `apps/mobile/app/payment/status.tsx` (lines 71, 96, 101, 131, 148)

- [ ] **Step 1: Fix the orders-tab login route**

`app/(tabs)/orders.tsx` line 180 — change:
```tsx
            onPress={() => router.push('/auth/login')}
```
to:
```tsx
            onPress={() => router.push('/(auth)/login')}
```

- [ ] **Step 2: Fix the payment-status routes**

In `app/payment/status.tsx`, replace every `router.replace('/(tabs)/home')` (lines 71, 101, 131, 148) with `router.replace('/(tabs)')`. There are 4 occurrences — replace all.

Then fix line 96 — change:
```tsx
              onPress: () => router.push('/support'),
```
to:
```tsx
              onPress: () => router.push('/profile/support'),
```

- [ ] **Step 3: Type-check**

Run (in `apps/mobile`): `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Manual smoke (note for executor)**

These are navigation strings not covered by unit tests. During the Task 11 manual pass, verify: orders-tab "log in" prompt reaches the login screen; payment-status "Go to Home" reaches the tabs home; payment-status "Contact Support" reaches the support screen.

- [ ] **Step 5: Commit**

```bash
git add apps/mobile/app/(tabs)/orders.tsx apps/mobile/app/payment/status.tsx
git commit -m "fix(mobile): repair broken navigation route strings (W3)"
```

---

## Task 7: Hide the dead notifications bell (W4)

**Files:**
- Modify: `apps/mobile/src/components/home/SearchHeader.tsx`

- [ ] **Step 1: Remove the bell `TouchableOpacity`**

In `SearchHeader.tsx`, delete the entire second `TouchableOpacity` block (lines 27-33) that navigates to `/profile/notifications`:
```tsx
      <TouchableOpacity
        style={styles.iconButton}
        onPress={() => router.push('/profile/notifications')}
        activeOpacity={0.7}
      >
        <Ionicons name="calendar-outline" size={spacing.iconSize.md} color={colors.text.primary} />
      </TouchableOpacity>
```
The search bar (`flex: 1`) now fills the row. Leave the `iconButton` style entry in place (harmless) — it will be reused when the notifications feature lands in M2.

- [ ] **Step 2: Type-check**

Run (in `apps/mobile`): `npx tsc --noEmit`
Expected: no errors. (Note: `Ionicons` is still imported and used by the search icon, so no unused-import lint error.)

- [ ] **Step 3: Lint**

Run (in `apps/mobile`): `npm run lint`
Expected: no new errors for `SearchHeader.tsx`.

- [ ] **Step 4: Commit**

```bash
git add apps/mobile/src/components/home/SearchHeader.tsx
git commit -m "fix(mobile): hide dead notifications bell until M2 (W4)"
```

---

## Task 8: Root error boundary (W5)

**Files:**
- Create: `apps/mobile/src/components/AppErrorBoundary.tsx`, `apps/mobile/src/components/__tests__/AppErrorBoundary.test.tsx`
- Modify: `apps/mobile/app/_layout.tsx`, `apps/mobile/src/i18n/locales/{en,fr,ar}.json`

- [ ] **Step 1: Add i18n keys to the `common` block**

In `src/i18n/locales/en.json`, change the end of the `common` block (line 28) from:
```json
    "tagline": "Affordable Style for Everyone"
  },
```
to:
```json
    "tagline": "Affordable Style for Everyone",
    "errorEyebrow": "Something went wrong",
    "errorBoundaryTitle": "Unexpected error",
    "errorBoundaryMessage": "The app ran into a problem. You can try again or go back home.",
    "goHome": "Go home"
  },
```

In `src/i18n/locales/fr.json`, change (line 28):
```json
    "tagline": "Des styles accessibles pour tous"
  },
```
to:
```json
    "tagline": "Des styles accessibles pour tous",
    "errorEyebrow": "Une erreur est survenue",
    "errorBoundaryTitle": "Erreur inattendue",
    "errorBoundaryMessage": "L'application a rencontré un problème. Vous pouvez réessayer ou revenir à l'accueil.",
    "goHome": "Accueil"
  },
```

In `src/i18n/locales/ar.json`, change (line 28):
```json
    "tagline": "أنماط بأسعار معقولة للجميع"
  },
```
to:
```json
    "tagline": "أنماط بأسعار معقولة للجميع",
    "errorEyebrow": "حدث خطأ ما",
    "errorBoundaryTitle": "خطأ غير متوقع",
    "errorBoundaryMessage": "واجه التطبيق مشكلة. يمكنك إعادة المحاولة أو العودة إلى الرئيسية.",
    "goHome": "الرئيسية"
  },
```

- [ ] **Step 2: Write the failing test**

Create `apps/mobile/src/components/__tests__/AppErrorBoundary.test.tsx`:
```tsx
import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '@/src/test/renderWithProviders';

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

import { AppErrorBoundary } from '../AppErrorBoundary';

describe('AppErrorBoundary', () => {
  beforeEach(() => mockReplace.mockClear());

  it('renders the localized fallback and the error message', () => {
    const { getByText } = renderWithProviders(
      <AppErrorBoundary error={new Error('boom')} retry={jest.fn()} />
    );
    expect(getByText('Unexpected error')).toBeTruthy();
    expect(getByText('boom')).toBeTruthy();
  });

  it('calls retry when "Retry" is pressed', () => {
    const retry = jest.fn();
    const { getByText } = renderWithProviders(
      <AppErrorBoundary error={new Error('boom')} retry={retry} />
    );
    fireEvent.press(getByText('Retry'));
    expect(retry).toHaveBeenCalledTimes(1);
  });

  it('navigates home when "Go home" is pressed', () => {
    const { getByText } = renderWithProviders(
      <AppErrorBoundary error={new Error('boom')} retry={jest.fn()} />
    );
    fireEvent.press(getByText('Go home'));
    expect(mockReplace).toHaveBeenCalledWith('/(tabs)');
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run (in `apps/mobile`): `npm test -- AppErrorBoundary`
Expected: FAIL — `Cannot find module '../AppErrorBoundary'`.

- [ ] **Step 4: Create the component**

Create `apps/mobile/src/components/AppErrorBoundary.tsx`:
```tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, spacing, typography } from '../theme';

interface AppErrorBoundaryProps {
  error: Error;
  retry: () => void;
}

/**
 * Fallback UI rendered by expo-router when a render error escapes the route tree.
 * Re-exported as `ErrorBoundary` from app/_layout.tsx.
 */
export function AppErrorBoundary({ error, retry }: AppErrorBoundaryProps) {
  const { t } = useTranslation();
  const router = useRouter();

  React.useEffect(() => {
    console.error('[AppErrorBoundary]', error);
  }, [error]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.eyebrow}>{t('common.errorEyebrow', 'Something went wrong')}</Text>
      <Text style={styles.title}>{t('common.errorBoundaryTitle', 'Unexpected error')}</Text>
      <Text style={styles.message}>{error?.message}</Text>
      <Text style={styles.hint}>
        {t('common.errorBoundaryMessage', 'The app ran into a problem. You can try again or go back home.')}
      </Text>

      <TouchableOpacity style={styles.primaryButton} onPress={retry} activeOpacity={0.8}>
        <Text style={styles.primaryButtonText}>{t('common.retry', 'Retry')}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryButton} onPress={() => router.replace('/(tabs)')} activeOpacity={0.8}>
        <Text style={styles.secondaryButtonText}>{t('common.goHome', 'Go home')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
    gap: spacing.sm,
  },
  eyebrow: {
    ...typography.styles.caption,
    color: colors.error,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    ...typography.styles.h2,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
  },
  message: {
    ...typography.styles.body,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  hint: {
    ...typography.styles.bodySmall,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: spacing.borderRadius.md,
    minWidth: 200,
    alignItems: 'center',
  },
  primaryButtonText: {
    ...typography.styles.body,
    color: colors.text.inverse,
    fontWeight: typography.fontWeight.semiBold,
  },
  secondaryButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    minWidth: 200,
    alignItems: 'center',
  },
  secondaryButtonText: {
    ...typography.styles.body,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
  },
});
```

> Note: if `tsc` reports that `typography.styles.caption`, `colors.error`, `colors.primary`, `colors.text.inverse`, `spacing.borderRadius.md`, or `spacing.xl` do not exist, substitute the nearest existing token (these are all used elsewhere in the codebase — e.g. `payment/status.tsx` uses `colors.error`, `spacing.xl`, `typography.styles.caption`; `Toast.tsx` uses `spacing.borderRadius.md`, `colors.text.inverse`). Confirm names against `src/theme/`.

- [ ] **Step 5: Run the test**

Run (in `apps/mobile`): `npm test -- AppErrorBoundary`
Expected: PASS — all 3 tests.

- [ ] **Step 6: Wire it into expo-router**

In `app/_layout.tsx`, add this re-export directly below the existing import block (after line 30, `import { MiniCartSheet } from '@/src/components/cart';`):
```tsx
export { AppErrorBoundary as ErrorBoundary } from '@/src/components/AppErrorBoundary';
```
expo-router automatically uses a named `ErrorBoundary` export from a layout route as the error fallback for that segment.

- [ ] **Step 7: Type-check + full test run**

Run (in `apps/mobile`):
```bash
npx tsc --noEmit
npm test
```
Expected: no type errors; all suites pass.

- [ ] **Step 8: Commit**

```bash
git add apps/mobile/src/components/AppErrorBoundary.tsx apps/mobile/src/components/__tests__/AppErrorBoundary.test.tsx apps/mobile/app/_layout.tsx apps/mobile/src/i18n/locales/en.json apps/mobile/src/i18n/locales/fr.json apps/mobile/src/i18n/locales/ar.json
git commit -m "feat(mobile): add root error boundary with localized fallback (W5)"
```

---

## Task 9: Real one-tap reorder (W6)

**Files:**
- Create: `apps/mobile/src/utils/reorder.ts`, `apps/mobile/src/utils/__tests__/reorder.test.ts`
- Modify: `apps/mobile/app/orders/[id].tsx`

- [ ] **Step 1: Write the failing test for the summary helper**

Create `apps/mobile/src/utils/__tests__/reorder.test.ts`:
```ts
import { summarizeReorder } from '../reorder';

describe('summarizeReorder', () => {
  it('is "success" when everything was added', () => {
    expect(summarizeReorder({ added: 3, failed: 0 })).toBe('success');
  });

  it('is "partial" when some lines failed but at least one was added', () => {
    expect(summarizeReorder({ added: 2, failed: 1 })).toBe('partial');
  });

  it('is "failed" when nothing was added', () => {
    expect(summarizeReorder({ added: 0, failed: 2 })).toBe('failed');
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run (in `apps/mobile`): `npm test -- reorder`
Expected: FAIL — `Cannot find module '../reorder'`.

- [ ] **Step 3: Create the helper**

Create `apps/mobile/src/utils/reorder.ts`:
```ts
export interface ReorderOutcome {
  added: number;
  failed: number;
}

export type ReorderStatus = 'success' | 'partial' | 'failed';

/** Classify the result of re-adding an order's lines to the cart. */
export function summarizeReorder({ added, failed }: ReorderOutcome): ReorderStatus {
  if (added === 0) return 'failed';
  if (failed > 0) return 'partial';
  return 'success';
}
```

- [ ] **Step 4: Run the test**

Run (in `apps/mobile`): `npm test -- reorder`
Expected: PASS.

- [ ] **Step 5: Wire the handler into the order-detail screen**

In `app/orders/[id].tsx`:

(a) Update imports. Change line 1 from:
```tsx
import React from 'react';
```
to:
```tsx
import React, { useState } from 'react';
```
Add these imports after line 9 (`import { formatPrice } ...`):
```tsx
import { useCart } from '../../src/contexts/CartContext';
import { useToast } from '../../src/components/ui';
import { summarizeReorder } from '../../src/utils/reorder';
```

(b) Add hooks + handler inside `OrderDetailScreen`, immediately after the `order` is derived (after line 48, `const order = data?.orderByCode;`):
```tsx
  const { addToCart } = useCart();
  const toast = useToast();
  const [reordering, setReordering] = useState(false);

  const handleReorder = async () => {
    if (reordering || !order?.lines?.length) return;
    setReordering(true);
    let added = 0;
    let failed = 0;
    for (const line of order.lines) {
      const variantId = line.productVariant?.id;
      if (!variantId) {
        failed += 1;
        continue;
      }
      try {
        await addToCart(variantId, line.quantity);
        added += 1;
      } catch {
        failed += 1;
      }
    }
    setReordering(false);

    const status = summarizeReorder({ added, failed });
    if (status === 'failed') {
      toast.error(t('orders.reorderFailed', 'Could not add items to your cart'));
      return;
    }
    if (status === 'partial') {
      toast.show({
        type: 'warning',
        message: t('orders.reorderPartial', `${added} added, ${failed} unavailable`),
      });
    } else {
      toast.success(t('orders.reorderSuccess', 'Items added to cart'));
    }
    router.push('/(tabs)/cart');
  };
```

(c) Replace the fake-success `onPress` (lines 283-288, inside the confirm `Alert.alert`) from:
```tsx
                    onPress: () => {
                      // TODO: Implement reorder functionality
                      Alert.alert(
                        t('common.success', 'Success'),
                        t('orders.reorderSuccess', 'Items added to cart')
                      );
                    },
```
to:
```tsx
                    onPress: () => {
                      handleReorder();
                    },
```

(d) Disable the reorder button while in flight. Change the reorder `<Button .../>` (line 273-297) to add a `disabled` prop — change:
```tsx
            variant="outline"
            fullWidth
            style={styles.reorderButton}
          />
```
to:
```tsx
            variant="outline"
            fullWidth
            disabled={reordering}
            style={styles.reorderButton}
          />
```

- [ ] **Step 6: Type-check + test**

Run (in `apps/mobile`):
```bash
npx tsc --noEmit
npm test -- reorder
```
Expected: no type errors; reorder unit tests pass. (`useToast`/`useCart`/`addToCart` signatures match: `addToCart(productVariantId, quantity)` and `toast.show/success/error` exist in `Toast.tsx`.)

> Note: if `tsc` flags `line.productVariant` as possibly undefined, the optional chaining already guards it; if it flags `Button` not accepting `disabled`, confirm the `Button` prop type in `src/components/ui/Button.tsx` and use its existing disabled/loading prop name.

- [ ] **Step 7: Commit**

```bash
git add apps/mobile/src/utils/reorder.ts apps/mobile/src/utils/__tests__/reorder.test.ts apps/mobile/app/orders/[id].tsx
git commit -m "feat(mobile): implement real one-tap reorder (W6)"
```

---

## Task 10: GitHub Actions CI (W8)

**Files:**
- Create: `.github/workflows/mobile-ci.yml` (repo root, NOT inside apps/mobile)

- [ ] **Step 1: Create the workflow**

Create `.github/workflows/mobile-ci.yml`:
```yaml
name: Mobile CI

on:
  pull_request:
    paths:
      - 'apps/mobile/**'
      - '.github/workflows/mobile-ci.yml'
  push:
    branches: [main]
    paths:
      - 'apps/mobile/**'
      - '.github/workflows/mobile-ci.yml'

jobs:
  verify:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: apps/mobile
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
          cache-dependency-path: apps/mobile/package-lock.json

      - name: Install dependencies
        run: npm ci

      - name: Type-check
        run: npx tsc --noEmit

      - name: Lint
        run: npm run lint

      - name: Test
        run: npm test -- --ci
```

- [ ] **Step 2: Validate the commands locally (this is what CI runs)**

Run (in `apps/mobile`):
```bash
npx tsc --noEmit
npm run lint
npm test -- --ci
```
Expected: all three succeed. CI mirrors exactly these commands, so green locally → green in CI. (The workflow itself only executes once pushed to GitHub.)

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/mobile-ci.yml
git commit -m "ci(mobile): add type-check + lint + test workflow (W8)"
```

---

## Task 11: Final verification gate

**Files:** none (verification only)

- [ ] **Step 1: Full type-check**

Run (in `apps/mobile`): `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 2: Full lint**

Run (in `apps/mobile`): `npm run lint`
Expected: no errors introduced by M0 files.

- [ ] **Step 3: Full test suite**

Run (in `apps/mobile`): `npm test -- --ci`
Expected: all suites pass — `setup`, `vendureAdapters`, `discountParser`, `validation`, `reorder`, `product-detail`, `AppErrorBoundary`.

- [ ] **Step 4: Manual smoke (start the app)**

Run (in `apps/mobile`): `npm run start` (or `npm run android` / `npm run ios`). Verify against the spec's success criteria:
1. Open a product from home/search/PLP → PDP renders (no crash).
2. Add a product to the wishlist, open the wishlist, tap it → PDP opens the correct product (no "product not found").
3. On the PDP, tap a related product → correct PDP opens.
4. Open an order → tap "Reorder Items" → confirm → items land in the cart and you arrive at the cart tab; a toast summarizes the result.
5. Home header no longer shows the bell that led nowhere.

- [ ] **Step 5: Confirm the diff matches the spec**

Run: `git log --oneline feat/mobile-m0-stabilize` and confirm one commit per work item (W7 harness + 3 unit-test commits, W1/W2, W3, W4, W5, W6, W8). No files outside the File Map were changed.

---

## Self-review (completed by plan author)

**Spec coverage:** W1→Task 5; W2→Task 5 (+ File Map caller table); W3→Task 6; W4→Task 7; W5→Task 8; W6→Task 9; W7→Tasks 1-5,8,9 (harness + unit tests + PDP regression test); W8→Task 10. All eight work items are covered. The spec's success criteria map to Task 11.

**Placeholder scan:** No "TBD/TODO/handle edge cases" steps; every code step shows complete code. Two `tsc`-guard notes (Task 8 Step 4, Task 9 Step 6) point at concrete existing usages to copy from rather than leaving anything open.

**Type consistency:** `summarizeReorder({ added, failed })` returns `'success'|'partial'|'failed'` — used identically in Task 9. `addToCart(productVariantId, quantity)`, `useToast().{show,success,error}`, `useGetProductBySlugQuery({ variables: { slug } })`, and `AppErrorBoundary({ error, retry })` match the real signatures read from source.
