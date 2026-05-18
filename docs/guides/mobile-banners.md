# Banners & New Arrivals — Vendure Integration

## Banner Carousel

The home screen banner carousel is powered by a Vendure **Collection** named `banners`. Each child collection under it becomes a banner slide.

### Setup in Vendure Admin (or OSCAR Backoffice)

1. **Create a parent collection** with slug `banners`
   - This collection doesn't need products — it's just a container
   - It will **not** appear in category navigation (the app filters by `topLevelOnly` for categories)

2. **Create child collections** under `banners` — one per slide:

   | Field | Purpose |
   |-------|---------|
   | `name` | Banner title (translated per language) |
   | `description` | Banner subtitle or link target (optional) |
   | `slug` | Used for navigation — tapping a banner navigates to `/products?collection=<slug>` |
   | `featuredAsset` | The banner image — this is the single image you upload per category in the backoffice |
   | `customFields.displayOrder` | Controls slide order (lower = first) |

3. **Translations**: Add translations for `name` and `description` in each language (FR, AR, EN) via the backoffice translations tab. The app sends the `Accept-Language` header automatically based on the user's selected language.

### What is `featuredAsset`?

In Vendure, every Collection (and Product) has two image fields:

| Field | Type | Description |
|-------|------|-------------|
| `featuredAsset` | Single image | The **main/hero image** — one per entity. This is the image you upload in the backoffice category form. |
| `assets` | Array of images | Additional gallery images (not used for banners). |

In the OSCAR backoffice, the single image upload on the category create/edit page (`/categories/new` or `/categories/:id`) sets the `featuredAsset`. There is no separate "featured asset" button — the image you upload IS the featured asset.

### Example Structure

```
banners (parent collection, slug: "banners")
  |-- "Summer Sale"      (slug: "summer-sale",      displayOrder: 1, featuredAsset: summer-banner.jpg)
  |-- "New Collection"   (slug: "new-collection",   displayOrder: 2, featuredAsset: new-collection-banner.jpg)
  |-- "Ramadan Offers"   (slug: "ramadan-offers",   displayOrder: 3, featuredAsset: ramadan-banner.jpg)
```

### GraphQL Query

```graphql
query GetBannerSlides {
  collection(slug: "banners") {
    id
    children {
      id
      name
      slug
      description
      featuredAsset { id, preview }
      customFields { displayOrder }
    }
  }
}
```

### Behavior

- Slides are sorted by `customFields.displayOrder` ascending
- Slides without a `featuredAsset` are filtered out
- If the `banners` collection doesn't exist or has no children, the carousel is hidden
- Pull-to-refresh reloads banners along with other home screen data

---

## New Arrivals

New arrivals are simply the most recently created products in Vendure — no special tagging or collection needed.

### How It Works

Vendure has no built-in "new arrivals" concept. The app queries the `products` endpoint sorted by `createdAt: DESC`, which returns the most recently added products first.

### GraphQL Query

```graphql
query GetNewArrivals($take: Int) {
  products(options: { take: $take, sort: { createdAt: DESC } }) {
    items { ...ProductFields }
    totalItems
  }
}
```

### Behavior

- Fetches the 10 newest products (sorted by `createdAt DESC`)
- Adding a new product in Vendure Admin/Backoffice automatically makes it appear in "New Arrivals"
- No collection, tag, or manual setup required
- Products are displayed in a horizontal scrollable row on the home screen

---

## Translations (i18n)

Both banners and new arrivals respect the app's current language.

The Apollo client sends an `Accept-Language` header (`fr`, `ar`, or `en`) on every GraphQL request. Vendure uses this header to return the correct translation for:
- Collection names and descriptions (banner titles)
- Product names and descriptions (new arrivals)

When the user changes language in the app, the next API request automatically uses the new language.

---

## Windows Asset URL Fix

### Problem

Vendure running on Windows stores asset paths with backslashes in the database:
```
http://localhost:8085/assets/preview\a4\86b595b6...png
```
This breaks image loading on mobile and non-Windows clients.

### Solution

The mobile Apollo client includes a global `fixAssetUrls` afterware (in `src/apollo/client.ts`) that replaces backslashes with forward slashes in all `preview` and `source` fields across every GraphQL response:

```typescript
function fixAssetUrls(obj: any): any {
  // Recursively traverses response data
  // Replaces \ with / in 'preview' and 'source' string fields
}
```

This runs automatically on every response — no per-component handling needed.

### Why client-side and not backend?

- Backslashes are already stored in the DB for existing assets — fixing the backend alone won't repair them
- A DB migration to fix paths is risky and environment-specific
- The client-side fix is zero-cost, universal, and handles both existing and new assets
- Works regardless of whether Vendure runs on Windows (dev) or Linux (production)

### If deploying to Linux production

On Linux, Vendure generates forward-slash paths natively. The `fixAssetUrls` function becomes a no-op (nothing to replace), so there's no performance concern leaving it in place.
