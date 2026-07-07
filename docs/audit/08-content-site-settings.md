# MODULE M8: Content & Site Settings

Roughly 30 public Channel custom fields (promo banner, footer contact/address, social links, hero/banner/review imagery, free-shipping threshold) are edited in the back-office Content tab and exposed to both storefronts via `activeChannel.customFields`. Because Channel isn't translatable, multilingual text uses explicit per-language fields (…Ar/Fr/En).

**Stack:** Channel customFields · SiteSettingsContext (web) · Content tab (admin) · hero/banner carousels

---

### 1. Feature Reliability & Business Logic

#### [MEDIUM · Reliability · CONTENT-1] The `freeShippingThreshold` content field drives storefront messaging that billing can't honor
- **Evidence:** `vendure-config.ts:221` defines `freeShippingThreshold` (default 12000 DZD), surfaced in storefront copy ("livraison gratuite…"), while no server-side shipping calculator honors a threshold (see [PLAT-3](./09-platform-devops.md#rel--plat-3) / the 100× shipping mismatch).
- **Impact:** The storefront promises a free-shipping threshold the checkout doesn't actually apply — messaging that contradicts what the customer is charged.
- **Fix:** Implement the threshold in the server shipping calculator (M9), and derive the storefront banner from the same rule.

#### [MEDIUM · Reliability · CONTENT-2] The PWA is dead on arrival — precached icons and favicon 404
- **Evidence:** `public/` has no `icons/` dir, yet `sw.js:5` precaches `/icons/icon-192.png` (404 → `cache.addAll` rejects → SW never activates); `manifest.ts` and the layout icons reference the same missing files.
- **Impact:** Offline shell, install prompt, and favicon are all silently broken in production.
- **Fix:** Add the icon assets, or trim the precache/manifest/metadata to files that exist.

**Also noted (low severity)**
- **CONTENT-3** — Per-language string fields (…Ar/Fr/En) have no fallback logic; a missing locale renders empty rather than defaulting to French. Add a fallback chain.
- **CONTENT-4** — Hero/banner/review images are served full-resolution to the carousels (no resize params) — same image-weight issue as [CAT-13](./02-catalog-search.md#medium--performance--cat-13), on the highest-traffic screen.

### 2. Standard E-Commerce Security & Data Protection

No security findings — the channel content fields are intentionally public marketing values with no sensitive data. Note that if any of this content is ever rendered as raw HTML on the storefront, it inherits the sanitization requirement from [CAT-7](./02-catalog-search.md#critical--security--cat-7).

**✓ Verified OK**
- All site-content fields are `public:true` marketing data by design — no PII or admin data is exposed through `activeChannel.customFields`.
- The Content tab is grouped under a dedicated UI tab and edited through the standard admin permission model.

### 3. Performance & Speed Bottlenecks

Content is fetched once via `SiteSettingsContext` and cached — no hot-path cost. The only performance angle is carousel image weight (CONTENT-4), addressed with the same Vendure resize-param fix as the catalog.

### 4. Step-by-Step Improvement Plan

**Phase 2 — Structural hardening**
- [ ] Tie the free-shipping banner to a real server threshold rule (CONTENT-1)
- [ ] Fix the PWA icon/manifest 404s (or trim the manifest) (CONTENT-2)
- [ ] Add locale fallback for per-language content fields (CONTENT-3)

**Phase 3 — Speed tuning**
- [ ] Serve resized hero/banner imagery (CONTENT-4)
