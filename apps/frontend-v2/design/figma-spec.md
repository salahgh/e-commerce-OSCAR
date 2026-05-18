# OSCAR Najar — Figma Design Spec

Source: Figma file `SVomYJvoIIvYat5YNWNVM3`, page "design system" (13:3) and "Workspace" (0:1). Last synced 2026-05-18.

## Brand identity

- **Name**: OSCAR NAJAR (stacked wordmark — "OSCAR" over "NAJAR")
- **Primary language**: Arabic (RTL); also French and English
- **Currency**: DZD (Algerian Dinar). Arabic shorthand: "دج"
- **Visual identity**: monochrome — pure black (#1E1E1E / #000000) on white. Pink/rose comes from product imagery, not chrome.
- **Display font**: IBM Plex Sans Arabic across all weights (Medium 500 + Bold 700)

## Frame inventory (from `prompts.md`)

| Node ID    | Type           | What it shows                                                         |
|------------|----------------|------------------------------------------------------------------------|
| 14:3199    | DS — Cards     | 8 card variants: image-top, image-rounded, with-actions, price, social, content-only |
| 14:3896    | DS — Tags      | 6 intents × 2 sizes — chip/pill with leading X and trailing icon       |
| 14:3078    | DS — Tooltips  | Black tooltip, 12 placements with directional arrows                    |
| 14:4344    | DS — Alerts    | 4 intents (info/danger/success/warning) × 2 sizes (803/355) with title+body+close |
| 14:3946    | DS — Buttons (full) | Hover/pressed/disabled states + secondary outlined variants — wide showcase |
| 14:3757    | DS — Button sizes  | Primary intent only, 3 sizes (large/medium/small) × 3 layouts (default / dropdown / icon-only) |
| 190:9641   | Page — Home    | RTL homepage: hero + brand banner + featured product grid              |
| 266:8256   | Page — PDP     | Product detail with sale price strike-through, size + color selectors, qty, related products |
| 288:10095  | Page — Wishlist| Grid of saved products with heart icon, name, rating, price            |
| 294:22412  | Page — Cart    | Line items + order summary on the left (RTL) with "تأكيد الطلب" CTA   |

## Design tokens (raw → semantic)

See `tokens.json` for machine-readable. Summary:

### Color
- **Neutral scale**: gray/white → gray/1..6 (#FAFBFF → #646466), plus main/1..6 + main/brand1 (#1E1E1E)
- **Text on light**: darkText/dark (#010B38) — note: **not pure black**, this is the deep navy used for all headings/body
- **Text muted**: rgba(1,11,56,0.6) — 60% of the dark text color
- **Accent**: main/brand1 (#1E1E1E) — primary CTA bg
- **State** (each has `1` bg, base, and `6` content):
  - info / attention: #E5FBFF · #11CAEF · #1298B2
  - danger / error:   #FFE5E5 · #EB3E3E · #B22F2F
  - success:          #E5FFEE · #2FD976 · #2EA154
  - warning:          #FFF7E5 · #FFBC1F · #B28416

### Typography (all IBM Plex Sans Arabic)
- 12 / 16 — subtext (small labels, captions, tooltip)
- 14 / 24 — subtext (body)
- 16 / 24 — subtext (medium body, alert title bold variant)
- 18 / 32 — secondary (card title bold)
- 24 / 32 — secondary (price bold, section subtitle)
- 36 / 48 — Bold (page titles)
- Weights: Medium 500 (default) and Bold 700 (titles/prices)

### Radius
- All primitives use 8px corner radius (buttons, cards, tags, alerts, tooltips, inputs)

### Spacing
- 4-pt grid: 4 · 8 · 12 · 16 · 24 · 32 · 40 · 48 · 64
- Buttons: 16px horizontal padding, 8px vertical padding, 8px gap
- Cards: 16px padding, 16px gap between sections
- Alerts: 16px padding, 16px gap, 8px title-to-body gap

### Shadow
- Card: `0 4px 32px rgba(2, 12, 60, 0.07)` — very soft, low alpha, deep navy-tinted

## Component anatomies

### Button
- **Shape**: 8-radius pill, flex centered
- **Sizes**: 32px (small), 40px (medium), 48px (large) — all same px-16 py-8
- **Intent**: primary (black bg, white text) | secondary (white bg, #C8C9CC border, dark text)
- **Layouts**: default · leading icon · trailing icon · both · icon-only (square) · dropdown (text right, separator line, chevron-down left)
- **States**: default / hover (darker) / pressed (darkest) / disabled (gray bg)
- **Direction**: arrow icons reflect content direction — RTL means leading is right side

### Tag / Chip
- **Shape**: 8-radius rounded rect, border + filled bg
- **Sizes**: large (text 14/24, icon 24) · small (text 12/16, icon 16)
- **Intents**: default · info · warning · success · danger · dark — each has matching bg+border+text
- **Anatomy**: optional leading X (close), text, optional trailing icon (e.g. calendar)

### Tooltip
- **Shape**: 8-radius, solid black, padding-8, gap-8
- **Type**: Medium 12/16, white text
- **Arrow**: 8×6 triangle pointing toward anchor
- **Placements**: 12 positions (top/right/bottom/left × start/middle/end)

### Alert / Banner
- **Shape**: 8-radius, 16px padding, 1px solid border + tinted bg
- **Sizes**: large (803px-wide) shows title + body + leading icon + trailing X; small (355px-wide) shows title only with both icons
- **Intent colors**: info / danger / success / warning — each maps bg/border to state palette
- **Typography**: title Bold 16/24, body Medium 14/24 at 80% darkText opacity
- **Icons**: leading semantic icon (24px), trailing close X (24px)

### Card
- **Shape**: 8-radius, white bg, 1px gray/3 border, soft shadow
- **Standard width**: 358-393px
- **Image**: top or full-rounded, 229px tall
- **Title**: Bold 18/32 darkText.dark
- **Body**: Medium 14/24 darkText.muted60
- **Price variant**: subtitle Medium 14 + price Bold 24
- **Action variants**: dual buttons (primary + secondary) | social row (share + like with counts) | "read more" link
- **Padding**: 16, gap 16 (or 8 between title and body)

### Image gallery (PDP)
- Main image: large square, top-left thumbnail strip on the right side (RTL layout)
- Sale price treatment: strikethrough original + accent sale (both visible)

### Cart
- **Layout (RTL)**: order summary on the left, item list on the right
- **Line item**: image, name, qty stepper, price
- **Summary**: subtotal line(s), total in bold, primary CTA "تأكيد الطلب" (Confirm Order)

### Wishlist
- **Layout**: 4-column grid of product cards, each with heart filled (favorited), small image (rounded all corners), name, 5-star rating, price

### Home
- Header bar: black promo strip + nav row (Arabic links: الرئيسية / المتجر / الفئات / من نحن / اتصل بنا), logo top right
- Hero: three model figures (pink rose dresses) with "OSCAR NAJAR" wordmark overlaid in script
- Brand strip below: tile-banner with brand emphasis
- Featured grid: product cards (large image-top variant)

## Implementation rules (locked)

1. **No hard-coded hex** outside `src/styles/tokens.css`. ESLint rule enforces.
2. **All font sizes/line-heights** must come from the scale; no arbitrary `text-[13px]`.
3. **All spacing** through the 4-pt scale via Tailwind utilities driven by tokens.
4. **All components** receive `dir` from layout — RTL by default for Arabic, LTR for French/English.
5. **Storybook coverage** required for every primitive: variants + light/dark + ltr/rtl.

## What still needs MCP follow-up

These can be pulled lazily during Phase 4 page implementation:
- 14:3946 button hover/pressed/disabled state styling details (we know they exist visually)
- 190:9641 home page section anatomy (we have the macro screenshot)
- 266:8256 PDP detailed metrics (price layout, gallery thumbnails, related products row)
- 288:10095 wishlist card spacing/grid columns
- 294:22412 cart line item dimensions, summary card structure

Reason for deferral: each MCP `get_design_context` for a full page returns very large output. We'll drill in only when implementing that page.
