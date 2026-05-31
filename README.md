# OSCAR Fashion E-commerce Platform

E-commerce platform for the Algerian fashion market. **pnpm + Turborepo** monorepo with a Vendure backend, a Next.js storefront, a React back-office, and a React Native (Expo) mobile app.

---

## Project Structure

```
e-commerce-OSCAR/
├── apps/
│   ├── backend/          Vendure 3.5 (NestJS) + TypeORM + PostgreSQL   :8085
│   ├── frontend/         Next.js 16 + React 19 + Apollo + Tailwind     :3000
│   ├── backoffice/       React 19 + Vite 7 + Apollo + Redux Toolkit    :5173
│   └── mobile/           Expo / React Native (standalone, not in workspace)
├── packages/
│   ├── shared/           Pure-TS: colors, constants (wilayas, sizes, payment), formatters
│   └── graphql-shop/     Shared shop-api codegen — TypeScript types + Apollo hooks
├── deploy/               Canonical deploy scripts (Caddy + PM2, single VPS)
├── docs/                 All cross-cutting documentation (see docs/README.md)
├── CLAUDE.md             Guidance for Claude Code
└── README.md             This file
```

> The mobile app is a standalone Expo project, not part of the pnpm workspace. Run it independently with `cd apps/mobile && npx expo start`.

---

## Technology Stack

### Backend — `apps/backend`
- **Vendure 3.5** on NestJS, TypeORM, PostgreSQL
- GraphQL **Shop API** (`/shop-api`) and **Admin API** (`/admin-api`)
- Algerian payment handlers: **CIB**, **Baridimob**, **Cash on Delivery**
- Custom plugin in `src/plugins/oscar-plugin/`

### Frontend Web — `apps/frontend`
- **Next.js 16** App Router + **React 19**
- **Apollo Client** with code-generated types (via `@oscar/graphql-shop`)
- **Tailwind CSS** + **shadcn/ui**
- **next-intl** for i18n (Arabic with RTL, French, English)

### Back-Office — `apps/backoffice`
- **React 19** + **Vite 7**
- Apollo Client (Admin API codegen) + Redux Toolkit
- Tailwind CSS, role-based access control

### Mobile — `apps/mobile`
- **Expo / React Native** + Apollo Client
- Multi-language with RTL support

---

## Common Commands

### Root (Turborepo)
```bash
pnpm install               # Install all workspaces
pnpm dev                   # Run dev for all apps
pnpm dev:backend           # Backend only
pnpm dev:frontend          # Frontend only
pnpm dev:backoffice        # Back-office only
pnpm build                 # Build all apps
pnpm codegen               # GraphQL codegen across all apps
pnpm type-check            # TypeScript check
```

### Per-app
```bash
pnpm --filter @oscar/backend dev          # Vendure → :8085
pnpm --filter @oscar/backend populate     # Seed database
pnpm --filter @oscar/frontend dev         # Next.js → :3000
pnpm --filter @oscar/frontend storybook   # Stories → :6006
pnpm --filter @oscar/backoffice dev       # Vite → :5173
```

### GraphQL codegen (backend must be running)
```bash
pnpm --filter @oscar/graphql-shop codegen   # Shared shop-api types
pnpm --filter @oscar/backoffice codegen     # Admin API types
```

### Database migrations
```bash
pnpm --filter @oscar/backend migration:generate
pnpm --filter @oscar/backend migration:run
pnpm --filter @oscar/backend migration:revert
pnpm --filter @oscar/backend reindex
```

---

## Documentation

All cross-cutting documentation lives in [`docs/`](./docs/README.md). Quick index:

- **[docs/README.md](./docs/README.md)** — full table of contents
- **Business & planning**: [master project plan](./docs/business/master-project-plan.md), [tasks checklist](./docs/planning/tasks-checklist.md), [commercial proposal](./docs/business/commercial-proposal.md)
- **Specifications**: [technical-spec](./docs/specs/technical-spec.md), [frontend](./docs/specs/frontend-spec.md), [backoffice](./docs/specs/backoffice-spec.md), [mobile](./docs/specs/mobile-spec.md)
- **Guides**: [authentication](./docs/guides/authentication.md), [Railway deployment](./docs/guides/railway-deployment.md), [POS integration](./docs/guides/pos-integration-challenges.md), [technical changes summary](./docs/guides/technical-changes-summary.md)
- **App-level READMEs**: [backend](./apps/backend/README.md) · [back-office](./apps/backoffice/README.md) · [mobile](./apps/mobile/README.md)

---

## Deployment

Canonical path: a single VPS with **Caddy + PM2** (Ubuntu). See [`deploy/README.md`](./deploy/README.md) and [`deploy/docs/`](./deploy/docs/) for the step-by-step bootstrap → first-deploy → day-2 update guide.

Alternative (managed): [Railway deployment guide](./docs/guides/railway-deployment.md).

A HestiaCP exploration is preserved at [`docs/archive/deploy-hestia/`](./docs/archive/deploy-hestia/) for reference only — it is not maintained.

---

## Key Features

- **E-commerce core**: catalog, search & filters, cart, multi-step checkout, order management
- **Algerian payments**: CIB, Baridimob, Cash on Delivery
- **Multi-platform**: web (Next.js), iOS + Android (Expo), admin panel
- **Multi-language**: Arabic (RTL), French (default), English
- **Admin**: dashboard, product/order/customer management, role-based access

---

## License

Proprietary — OSCAR Fashion. All rights reserved.
