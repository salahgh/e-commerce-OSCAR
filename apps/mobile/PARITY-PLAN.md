# Mobile ↔ frontend-v2 parity plan

Mirror the storefront features into `apps/mobile` (Expo + expo-router + react-i18next + Apollo v4). Mobile is already ~70% there — core auth, browse, cart, checkout, orders, RTL i18n, theme tokens are all done. This plan tackles the remaining gaps in six phases, ordered by impact ÷ effort.

## Audit summary

| Layer | Mobile state | Notes |
|---|---|---|
| Routing | ✅ expo-router file tree complete | `(auth)`, `(tabs)`, `checkout`, `orders`, `payment`, `products`, `profile`, `search`, `splash`, `onboarding` |
| Auth (login/register/forgot) | ✅ | password reset partial; email verification absent |
| Browse (home/explore/PLP/PDP) | ✅ | variants, qty, add-to-cart, share, basic gallery |
| Cart | ✅ | line items, qty, remove, coupon |
| Checkout | ✅ | address → shipping → payment → confirmation |
| Orders list + detail | ✅ | state badges, timeline |
| Profile (edit / change-pw / settings) | ✅ | manual dark-mode toggle missing |
| Locale switcher | ✅ | fr/en/ar with RTL restart |
| Theme tokens + fonts | ✅ | Gabarito + IBM Plex Sans Arabic |
| **Wishlist** | 🟡 | heart icon toggles in-memory only, no persistence, no list page |
| **Mini-cart drawer / sheet** | ❌ | cart is a tab; add-to-cart only flashes a toast |
| **Related products on PDP** | ❌ | no "You may also like" section |
| **Image zoom** | 🟡 | `ZoomableImage` exists, not wired into PDP gallery |
| **Size guide modal** | ❌ | no chart, no link from PDP |
| **Dark-mode manual toggle** | 🟡 | system-only via `useColorScheme` |
| **Faceted search (color/size facets)** | 🟡 | price + size sheets only |
| **Static info pages** (shipping/returns/size-guide/faq/about/careers/contact/terms/privacy) | ❌ | none exist; need a More/About menu entry to reach them |
| **Email verification + reset-password landing** | ❌ | mobile has only `verify-phone` placeholder |
| SEO (sitemap/robots/OG/hreflang) | ⊘ N/A | native app — handled by store listings |
| A11y (skip-link, reduced motion) | ⊘ N/A | OS-level |

Mobile also has things web doesn't: native Share, expo-secure-store token, system color scheme detection, native payment redirect handlers (`payment/cib`, `payment/baridimob`).

## Sequencing

Phases are ordered by **customer impact × effort**. Phase 1 = quickest wins; phase 6 = biggest delta. Each phase is a single commit and can ship independently.

### Phase 1 — Quick wins (≈ 90 min)
Goal: close three small gaps that the user notices immediately.

1. **Wishlist persistence + dedicated screen** — add `WishlistContext` modelled on `apps/mobile/src/contexts/CartContext.tsx`, store the slug list in `AsyncStorage` via `@react-native-async-storage/async-storage` (already in deps). Wire the existing heart on the PDP. Add a new `app/(tabs)/wishlist.tsx` OR a `profile/wishlist.tsx` screen.
2. **Dark-mode manual toggle** — add a `ThemeMode` setting (`system | light | dark`) in `src/contexts/` backed by `AsyncStorage`; surface a 3-way segmented control in `app/profile/settings.tsx`. Today the app reads `useColorScheme()` directly.
3. **Size guide modal** — port `apps/frontend-v2/src/components/patterns/SizeGuideDialog.tsx`. Reuse the same 6-row XS..XXL chart. Open as a `Modal` from a "Size guide" link beside the `VariantPicker`'s size picker on the PDP.

Critical files:
- `apps/mobile/src/contexts/WishlistContext.tsx` (new)
- `apps/mobile/src/contexts/ThemeContext.tsx` (new)
- `apps/mobile/app/(tabs)/wishlist.tsx` or `apps/mobile/app/profile/wishlist.tsx` (new)
- `apps/mobile/app/profile/settings.tsx` (extend)
- `apps/mobile/app/products/[id].tsx` (wire wishlist + size guide)
- `apps/mobile/src/components/products/SizeGuideModal.tsx` (new)
- `apps/mobile/src/i18n/locales/{ar,en,fr}.json` (new keys)

Verification: tap heart on PDP, switch tabs, return → still highlighted. Toggle dark in Settings → persists across app restart. Open size guide on a sized product.

### Phase 2 — Related products on PDP (≈ 60 min)
Goal: lift average order value with cross-sell.

- Add `useGetCollectionWithProductsQuery` (or `useGetProductsQuery` fallback) to `app/products/[id].tsx`.
- Render a horizontal `FlatList` of `ProductCard` below the existing tabs.
- Dedupe by id, exclude the current product, cap at 6.

Critical files:
- `apps/mobile/src/graphql/operations/` (add op if missing — likely already shared)
- `apps/mobile/app/products/[id].tsx`
- `apps/mobile/src/components/products/RelatedProducts.tsx` (new)

Verification: open a PDP → "You may also like" row scrolls horizontally with at least 4 products that aren't the current one.

### Phase 3 — Mini-cart bottom sheet (≈ 90 min)
Goal: confirm add-to-cart without leaving the PDP. Web has a drawer; mobile gets a bottom sheet.

- Use `@gorhom/bottom-sheet` (needs install) OR a custom `Modal` with `slideIn` for now. Default to custom Modal to avoid a new dep.
- Trigger: `CartContext.addToCart` succeeds → sheet auto-opens with the most-recently-added line + "View cart" + "Checkout" buttons.
- Reuse `CartItem` for the line, `OrderSummary` for the totals.

Critical files:
- `apps/mobile/src/contexts/CartContext.tsx` (add `isMiniCartOpen` / `openMiniCart` / `closeMiniCart`)
- `apps/mobile/src/components/cart/MiniCartSheet.tsx` (new)
- `apps/mobile/app/_layout.tsx` (mount the sheet globally)

Verification: tap Add to cart on PDP → sheet animates up with the line and subtotal. Dismiss → returns to PDP. Tap Checkout in sheet → routes to checkout.

### Phase 4 — Static info pages (≈ 90 min)
Goal: every footer link on the web has a mobile counterpart, reachable from a single "More" or "Help" screen.

Web had: `/shipping`, `/returns`, `/size-guide`, `/faq`, `/about`, `/careers`, `/contact`, `/legal/terms`, `/legal/privacy`.

Approach:
- Build a `InfoScreen` wrapper component (title + intro + body), mirroring `InfoPageLayout` from frontend-v2.
- Add 9 routes under `apps/mobile/app/info/`: `shipping.tsx`, `returns.tsx`, `size-guide.tsx`, `faq.tsx`, `about.tsx`, `careers.tsx`, `contact.tsx`, `legal/terms.tsx`, `legal/privacy.tsx`.
- Copy translation keys directly from `apps/frontend-v2/src/messages/{fr,en,ar}.json` (`ShippingPage`, `ReturnsPage`, …, `PrivacyPage`, `InfoPage`) into `apps/mobile/src/i18n/locales/{fr,en,ar}.json`.
- Add a "Help & info" section in `app/profile/index.tsx` (or `(tabs)/profile.tsx`) listing the 9 entries. Also add a single Help entry that opens this index.
- For `contact`, render address/phone/email cards (use `Linking` for `mailto:` and `tel:`); skip the form for now.
- For `faq`, use a custom accordion (no Radix on RN — react-native built-in `LayoutAnimation` or a small custom toggle).

Critical files:
- `apps/mobile/src/components/info/InfoScreen.tsx` (new)
- `apps/mobile/src/components/info/FaqAccordion.tsx` (new)
- `apps/mobile/app/info/_layout.tsx` + 9 page files (new)
- `apps/mobile/app/(tabs)/profile.tsx` (add Help section)
- `apps/mobile/src/i18n/locales/{fr,en,ar}.json` (port 9 namespaces)

Verification: from Profile → Help → tap each entry → translated content renders. Dial / mail links on Contact open the system app.

### Phase 5 — Faceted search polish (≈ 2 hrs)
Goal: bring search filters up to web parity — color facets, multi-facet combination, URL/state sync.

- The `SearchProductsWithFacetsQuery` returns facet values with counts. Mobile already shows price + size filters via `FilterBottomSheet.tsx`; add a **color facet section** with the same chip pattern as `FilterSheet.tsx`.
- Use `@oscar/shared/facet-utils` `detectFacetType` (already imported by the web) — but mobile may not depend on `@oscar/shared` since it's outside the workspace. Either re-implement detection inline (small) or copy `facet-utils.ts` into `apps/mobile/src/utils/`.
- Track selected facet ids in a `useState` set, pass into the search query as `facetValueFilters`.

Critical files:
- `apps/mobile/src/components/products/FilterBottomSheet.tsx`
- `apps/mobile/src/utils/facets.ts` (new — copy/adapt from `packages/shared/src/facet-utils.ts`)
- `apps/mobile/app/search.tsx`

Verification: search "shirt" → open filter sheet → toggle Color: Black → result count drops to match web's `?f_color=…` count.

### Phase 6 — Email verification + password reset (≈ 2 hrs)
Goal: cover the deep-link verification flow the web already supports.

- Add `app/(auth)/verify-email.tsx` consuming `?token=` from `useLocalSearchParams`; on mount call `AuthContext.verifyEmail(token)` (add if missing). Show verifying / success / error states.
- Add `app/(auth)/reset-password.tsx` consuming `?token=` and posting `AuthContext.resetPassword(token, newPwd)`.
- Update the existing `register-success` screen: after register, redirect here (or to verification-pending) with `email` in params, mirroring web's `/verification-pending?email=…`.
- Wire deep-link handler in `apps/mobile/app/_layout.tsx` so `oscar-fashion://verify-email?token=…` opens the screen (scheme already set in `app.json`).

Critical files:
- `apps/mobile/src/contexts/AuthContext.tsx` (add `verifyEmail`, `resetPassword`, `resendVerification` if missing)
- `apps/mobile/app/(auth)/verify-email.tsx` (new)
- `apps/mobile/app/(auth)/reset-password.tsx` (new)
- `apps/mobile/app/(auth)/register-success.tsx` (existing — link forward to verify-email)
- `apps/mobile/app.json` (deep-link associated domains for iOS / `android.intentFilters` — only if you want HTTPS universal links, scheme links work without it)

Verification: from email, tap a verify link → opens app to `verify-email?token=…` → success state → routes home logged in. Same for reset-password.

## Out of scope (handled differently on mobile or by another session)

- SEO: irrelevant — native apps use App Store / Play Store metadata.
- Skip-to-content + reduced motion: OS-level on mobile.
- Phone SMS verification: needs backend SMS provider; the `verify-phone` placeholder already exists.
- CIB / Baridimob hosted-page details: already implemented on mobile via `app/payment/cib.tsx` + `baridimob.tsx`, beyond what web has wired up.
- Backend issues (USD→DZD channel currency, Vendure error i18n via Accept-Language): backend session.

## Suggested commit order

1. `mobile/phase-1: wishlist persistence + dark toggle + size guide modal`
2. `mobile/phase-2: related products on PDP`
3. `mobile/phase-3: mini-cart bottom sheet`
4. `mobile/phase-4: static info pages + Help index`
5. `mobile/phase-5: color facet on search`
6. `mobile/phase-6: verify-email + reset-password screens`

After each phase: `cd apps/mobile && npx expo start --ios` (or `--android`), smoke-test the new screens in Expo Go, commit.

## Open decisions to confirm before phase 1

- **Tabs vs profile sub-screen for wishlist** — frontend-v2 has it under `/user/wishlist`; mobile already has 5 tabs (Home/Explore/Orders/Cart/Profile). Adding a 6th feels crowded; recommend nesting under Profile.
- **`@gorhom/bottom-sheet` vs custom Modal for mini-cart** — gorhom is the industry standard but adds a dep + native install. Recommend custom Modal first, swap later if needed.
- **`@oscar/shared` reuse from mobile** — mobile is OUTSIDE the pnpm workspace per CLAUDE.md. Either bring it into the workspace, publish `@oscar/shared` to a private registry, or copy the small utils we need. Recommend copying for now (wilayas data, formatters, facet-utils) — sync via a one-time script if it drifts.
