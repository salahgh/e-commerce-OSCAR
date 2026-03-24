# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

OSCAR Fashion is an e-commerce platform for the Algerian fashion market. It's a **pnpm + Turborepo monorepo** with 4 apps and 2 shared packages:

| Package | Path | Stack | Dev Port |
|---------|------|-------|----------|
| Backend | `apps/backend` | Vendure 3.5 (NestJS), TypeORM, PostgreSQL | 8085 |
| Frontend | `apps/frontend` | Next.js 16, React 19, Apollo Client, Tailwind | 3000 |
| Back-Office | `apps/backoffice` | React 19, Vite 7, Apollo Client, Redux Toolkit | 5173 |
| Mobile | `apps/mobile` | Expo 54, React Native 0.81, Apollo Client 4 | 8081 |
| Shared | `packages/shared` | Pure TS: colors, constants, formatters, facet-utils | — |
| GraphQL Shop | `packages/graphql-shop` | Shared shop-api codegen: types + Apollo hooks | — |

## Common Commands

### Root (Turborepo)
```bash
pnpm install               # Install all workspaces
pnpm dev                   # Dev all apps
pnpm dev:backend           # Dev backend only
pnpm dev:frontend          # Dev frontend only
pnpm dev:backoffice        # Dev backoffice only
pnpm dev:mobile            # Dev mobile only
pnpm build                 # Build all apps
pnpm codegen               # Run GraphQL codegen across all apps
pnpm type-check            # TypeScript check all apps
```

### Per-app (from app directory or with filter)
```bash
pnpm --filter @oscar/backend dev         # Vendure dev server → :8085
pnpm --filter @oscar/backend populate    # Seed database
pnpm --filter @oscar/frontend dev        # Next.js dev → :3000
pnpm --filter @oscar/frontend storybook  # Component stories → :6006
pnpm --filter @oscar/backoffice dev      # Vite dev → :5173
pnpm --filter @oscar/mobile start        # Expo dev server
```

### GraphQL Codegen
```bash
pnpm --filter @oscar/graphql-shop codegen   # Generate shared shop-api types (backend must be running)
pnpm --filter @oscar/backoffice codegen     # Generate admin-api types
```

### Database Migrations (backend)
```bash
pnpm --filter @oscar/backend migration:generate
pnpm --filter @oscar/backend migration:run
pnpm --filter @oscar/backend migration:revert
pnpm --filter @oscar/backend reindex
```

## Architecture

### Monorepo Structure
- **pnpm workspaces** with `node-linker=hoisted` (required for Expo/Metro compatibility)
- **Turborepo** orchestrates `build`, `dev`, `codegen`, `type-check`, `lint` tasks
- Shared packages use raw TypeScript (`"main": "src/index.ts"`) — no build step, each app's bundler transpiles

### Shared Packages

**`@oscar/shared`** — Pure TypeScript, zero runtime deps:
- `colors.ts` — Color palette with multilingual names (EN/FR/AR), hex lookup, contrast utilities
- `constants/wilayas.ts` — 48 Algerian wilayas with communes, shipping zones, pricing
- `constants/order-status.ts` — Order status labels and Tailwind color classes
- `constants/payment.ts` — Payment method/status labels (CIB, Baridimob, COD)
- `constants/sizes.ts` — Available sizes, colors, user roles
- `formatters/price.ts` — DZD price formatting (Vendure cents → display)
- `facet-utils.ts` — Faceted search state, URL serialization, size sorting

**`@oscar/graphql-shop`** — Shared Vendure Shop API integration:
- `src/operations/` — All shared `.graphql` files (auth, cart, products, orders)
- `src/generated/graphql.ts` — Auto-generated TypeScript types + Apollo hooks
- `src/scalars.ts` — Vendure scalar type mappings
- Used by frontend and mobile; backoffice has its own admin-api codegen

### GraphQL-First
All apps communicate via Vendure's GraphQL API. No REST endpoints.
- **Shop API**: `localhost:8085/shop-api` (customer-facing — frontend, mobile)
- **Admin API**: `localhost:8085/admin-api` (back-office and Vendure's built-in admin UI)

### GraphQL Code Generation
**The backend must be running** for codegen to work (it introspects the live schema).
- **Shop API** (shared): `packages/graphql-shop/codegen.ts` → `packages/graphql-shop/src/generated/graphql.ts`
- **Admin API** (backoffice only): `apps/backoffice/codegen.ts` → `apps/backoffice/src/graphql/generated/`
- Custom scalar mappings: `DateTime→string`, `JSON→Record<string,any>`, `Money→number`, `Upload→File`

### Frontend Routing & i18n
- **next-intl** with dynamic `[locale]` route segment
- Locales: `ar` (Arabic), `fr` (French, default), `en` (English)
- Locale prefix: `as-needed` (French URLs have no prefix)
- Route groups: `(shop)` for store pages, `(auth)` for auth flows, `(user)` for account pages
- RTL is applied for Arabic (`dir="rtl"`)
- Translation files: `src/messages/{ar,fr,en}.json`
- Use navigation helpers from `@/i18n/routing` (`Link`, `redirect`, `useRouter`, `usePathname`) instead of next/link or next/navigation

### Mobile Routing
- **Expo Router** with file-based routing (Next.js-style)
- Route groups: `(tabs)` for bottom tab navigation, `(auth)` for auth screens
- Dynamic routes: `products/[id]`, `orders/[id]`
- Protected routes redirect to `/(auth)/login` when unauthenticated
- 5-tab bottom navigation: Home, Explore, Orders, Cart (with badge), Profile
- **i18next** + react-i18next for i18n (same locales: fr default, ar, en)
- RTL auto-applied when Arabic is selected

### State Management Patterns
- **Apollo Client cache** for all GraphQL data (all apps)
- **AuthContext** + **CartContext** for auth and cart state (frontend and mobile)
- Redux Toolkit used in back-office for more complex admin state; minimal in frontend
- Prefer contexts and Apollo cache over Redux in frontend/mobile

### Styling & Design System
- **Tailwind CSS** with CSS variable-based theming (frontend + back-office, supports dark mode via `next-themes`)
- **shadcn/ui** components in frontend `src/components/ui/`
- Mobile uses a custom theme system: `src/theme/` with colors, spacing, typography exports
- Path aliases: `@/*` maps to `src/*` in all apps

### Backend Plugin System
Custom business logic lives in `apps/backend/src/plugins/oscar-plugin/`:
- `api/` — Custom GraphQL resolvers and schema extensions
- `services/` — Business logic services
- `payment/` — Algerian payment handlers (CIB, Baridimob)
- `entities/` — Custom TypeORM entities extending Vendure

### Authentication
- Vendure native auth strategy (email/password)
- Frontend: JWT in localStorage, Apollo auth link attaches Bearer token + Accept-Language header
- Mobile: token in `expo-secure-store`, attached via `vendure-token` header; auto-captures token from response headers
- Vendure returns union types for auth operations (e.g., `CurrentUser | InvalidCredentialsError`) — always handle error variants
- Back-office uses role-based access control (RBAC) with `<ProtectedRoute>` components

### Algerian Market Specifics
- Payment methods: CIB (inter-bank), Baridimob (postal)
- Shipping: Algerian wilayas (provinces) as zones — data in `@oscar/shared`
- Currency: DZD (Algerian Dinar) — formatter in `@oscar/shared`
- Primary language: French (default), with full Arabic RTL support

### Adding New Shared Code
When developing new utilities, constants, or types that could be used by multiple apps, place them in the appropriate shared package rather than duplicating in app code. Import via `@oscar/shared` or `@oscar/graphql-shop`.
