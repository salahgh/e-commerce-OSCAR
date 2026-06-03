# M3e — Brand-font application (design)

_Date: 2026-06-03. Milestone M3e of the Mobile Enhancement Program — the first post-M3d follow-up. Scope: mobile-only (`apps/mobile`). Sibling sweep to M3d (dark mode): a per-component hook already exists; most components don't consume it yet._

## Problem

The app ships two brand fonts — **Gabarito** (Latin, fr/en) and **IBM Plex Sans Arabic** (`ar`) — loaded in `app/_layout.tsx` and exposed as family tokens in `src/theme/typography.ts` (`fonts.latin.*`, `fonts.arabic.*`). A clean hook, `useAppFont()` (`src/hooks/useAppFont.ts`), returns the correct family set for the active i18n locale (`fonts.arabic` for `ar`, else `fonts.latin`) plus `isRTL`.

**The gap:** `useAppFont()` is consumed by only **18** components. The other **43** render text through `typography.styles.*` presets — which carry `fontSize`/`fontWeight`/`lineHeight` but **no `fontFamily`** — so their text falls back to the **system font for every locale**, Arabic included. The two sets are **fully disjoint** (verified: no file uses both), so there is no partial-wiring tangle. This milestone wires the remaining live components so all text uses the brand fonts.

## Decisions (locked during brainstorming)

1. **Scope: the full brand-font sweep** (user-selected) — apply brand fonts across all live components, not an Arabic-only subset. This also moves fr/en text from system font → Gabarito app-wide (the Figma intent; a deliberate, visible change to the default locale).
2. **Approach: extend the existing `useAppFont()` pattern** (no new API). Per component: `const { fontFamily } = useAppFont();`, then merge `{ fontFamily: fontFamily.<weight> }` onto each branded `<Text>`/`<TextInput>`, the weight matching the style's **effective** `fontWeight`. This is exactly what the 18 wired components already do (they keep `fontWeight` in their StyleSheets alongside the named family — the codebase's accepted, working practice). Rejected alternatives: a new `useTypography()` style-keyed hook (introduces a 2nd font API beside `useAppFont`); a `<ThemedText>` wrapper replacing every `<Text>` (largest refactor, diverges from the current pattern).
3. **Keep `fontWeight` in the StyleSheets** — the named per-weight family is authoritative; the residual `fontWeight` is harmless (the 18 wired components prove this in practice). We do **not** strip weights (that would be churn with no benefit).
4. **Sliced like M3d**, by feature area (≈8 slices), each: wire → gates → per-file coverage heuristic → review → commit → merge → push. Mechanical, like-for-like; no layout/copy/logic change.
5. **Not self-enforcing (the key difference from M3d).** Nothing breaks if a `<Text>` is missed — `typography.styles.*` still compiles without a family. So `tsc`/`lint`/tests confirm **no regression** but **not completeness**. Each slice adds a per-file heuristic (compare `<Text`/`<TextInput>` counts to `fontFamily` applications) + careful review; the real appearance check is the **on-device Arabic walkthrough** (deferred until a device is available).
6. **Exclude the same dead/deferred files as M3d** (below). The 18 already-wired components stay as-is.

## The weight → family mapping (the recipe's core)

For each `<Text>`/`<TextInput>`, determine its **effective** `fontWeight` (the preset's weight, after any StyleSheet override), and apply the matching family:

| effective fontWeight | family token |
|---|---|
| `400` / regular | `fontFamily.regular` |
| `500` / medium | `fontFamily.medium` |
| `600` / semiBold | `fontFamily.semiBold` |
| `700` / bold | `fontFamily.bold` |

Preset weights (from `typography.styles`): `h1`→bold; `h2`/`h3`/`h4`/`button`→semiBold; `h5`/`h6`→medium; `body`/`bodySmall`/`caption`→regular. **Watch for overrides** — a style like `{ ...typography.styles.body, fontWeight: typography.fontWeight.semiBold }` is effectively semiBold → `fontFamily.semiBold`. The implementer must read each style's final weight, not assume from the preset name.

## Conversion recipe (per file)

1. Import the hook: `import { useAppFont } from '<rel>/hooks/useAppFont';` (path varies by depth: `src/components/*` → `'../../hooks/useAppFont'`; `app/*` → `'../src/hooks/useAppFont'`; `app/<sub>/*` → `'../../src/hooks/useAppFont'`).
2. In **every component** that renders branded text, add `const { fontFamily } = useAppFont();`.
3. On each `<Text>`/`<TextInput>` that uses a typography preset (or any branded text style), merge the family: `style={[styles.x, { fontFamily: fontFamily.<weight> }]}` (wrap a bare `style={styles.x}` into an array). Leave the StyleSheet definitions unchanged (weights stay).
4. Do **not** touch icon-only / non-text elements, decorative numerals already handled, or the 18 already-wired components.
5. `npx prettier --write <file>`.

**Per-file coverage heuristic (the completeness check):** `grep -c "<Text\|<TextInput" <file>` vs `grep -c "fontFamily" <file>` — every branded text node should have a family. Exact equality isn't required (some `<Text>` wrap children with no own text, some lines have multiple), but a large gap flags a miss. Review confirms.

## Scope — slices (≈37 live components, ≈8 slices)

| Slice | Area | Files |
|---|---|---|
| **M3e-1** | UI primitives | `components/ui/{Button,Chip,Divider,EmptyState,ErrorState}.tsx` (5) |
| **M3e-2** | Tabs | `app/(tabs)/{_layout,orders}.tsx` (2) |
| **M3e-3** | Products | `components/products/{HorizontalProductRow,ProductCard,SearchBar,SizeGuideModal}.tsx` + `app/products/[slug].tsx` (5) |
| **M3e-4** | Checkout (live) | `components/checkout/{OrderSummary,SavedAddressPicker,ShippingAddressForm,WilayaPicker}.tsx` + `app/checkout/{index,confirmation}.tsx` (6) |
| **M3e-5** | Auth | `app/(auth)/{forgot-password,reset-password,verify-email}.tsx` (3) |
| **M3e-6** | Profile | `components/profile/{AddressCard,ProfileHeader,SettingsItem}.tsx` + `app/profile/{change-password,settings,wishlist}.tsx` (6) |
| **M3e-7** | Info | `app/info/{contact,faq,index,size-guide}.tsx` + `components/info/InfoScreen.tsx` (5) |
| **M3e-8** | Orders/cart/root | `app/orders/[id].tsx` + `components/cart/{CartItemContent,MiniCartSheet}.tsx` + `app/splash.tsx` + `components/AppErrorBoundary.tsx` (5) |

## Scope boundary

**In:** the 37 live components above (recipe; per-component hooks; weight→family mapping; per-file coverage heuristic), the program slices, status-doc handoff per slice.

**Out — 6 dead/deferred files (excluded, same rationale as M3d):** dead `components/orders/{OrderCard,OrderStatusBadge,OrderTimeline}.tsx` (no screen imports the barrel); deferred payment `components/payment/PaymentWebView.tsx`, `app/payment/status.tsx`, and dead `components/checkout/PaymentMethodSelector.tsx` (M1d). These wire alongside the eventual dead-code decision / real-gateway work.

**Out (other follow-ups):** the 18 already-wired components (already correct); RTL layout audit (mirroring/`writingDirection` — `isRTL` is exposed but a full RTL polish is its own effort); `darkColors` tint refinement; on-device walkthrough.

## Testing — gates-only (+ heuristic)

- **`npm test`** — the existing **104 tests / 21 suites** stay green (font wiring is render-time style merging; no logic change). `product-detail`/`settings` render tests exercise some swept components under providers.
- **`npm run type-check`** — **zero new** errors over the 155 baseline (the inline `{ fontFamily: fontFamily.x }` is well-typed; a typo'd weight key is a tsc error — the one self-enforcing sliver).
- **`npm run lint`** — **0 errors** (an imported-but-unused `useAppFont` → unused-var; catches a stray import).
- **Per-file coverage heuristic** — `<Text`/`<TextInput>` vs `fontFamily` counts per file.
- **Manual** — toggle `ar`; confirm Arabic text across every swept screen renders in IBM Plex Sans Arabic (not the system font), and fr/en in Gabarito. Per `docs/superpowers/plans/RUNTIME-VERIFICATION-runbook.md`. Deferred until a device.

## Risks & notes

- **Completeness, not correctness, is the risk** (non-self-enforcing) — mitigated by the per-file heuristic + per-slice review + the eventual device walkthrough.
- **Effective-weight overrides** are the per-Text judgment call — the implementer reads each style's final `fontWeight`, not just the preset name.
- **fr/en visual change** (system → Gabarito) is intended and accepted (user-selected full sweep).
- **`useAppFont` reads `i18n.language`** — a locale switch re-renders consumers (React context), so fonts flip live with language, same as the 18 wired components.
- **No new dependencies** — the fonts are already loaded; the hook already exists.
