# 04 — Environment files

Three `.env` files drive the three apps. The script
[`04-write-env.sh`](../scripts/04-write-env.sh) generates all of them from the
templates in `deploy/env-templates/`. You can edit them by hand afterwards;
just remember to **reload the affected service**.

## Where they live

| File | App | Read when |
|---|---|---|
| `apps/backend/.env`              | Vendure backend  | Backend boot (`pm2 reload oscar-backend --update-env`) |
| `apps/frontend/.env.production`  | Next.js storefront | **Build-time** — must rerun `pnpm --filter @oscar/frontend build` |
| `apps/backoffice/.env.production`| Vite back-office  | **Build-time** — must rerun `pnpm --filter @oscar/backoffice build` |

> **Why the frontend/backoffice envs are build-time:** all values prefixed
> `NEXT_PUBLIC_` / `VITE_` are inlined into the JS bundle. Editing them on the
> server has no effect until you rebuild and (for the frontend) `pm2 reload`.

## Required values

### `apps/backend/.env`

```env
NODE_ENV=production
PORT=8085
CORS_ORIGINS=https://oscarfashion.dz,https://www.oscarfashion.dz,https://admin.oscarfashion.dz

DATABASE_URL=postgres://oscar:<random>@127.0.0.1:5432/oscar_fashion

SUPERADMIN_USERNAME=superadmin
SUPERADMIN_PASSWORD=<your strong password>

COOKIE_SECRET=<openssl rand -hex 32>
```

Optional blocks for SMTP, CIB and Baridimob — see
[`env-templates/backend.env.example`](../env-templates/backend.env.example).

### `apps/frontend/.env.production`

```env
NEXT_PUBLIC_GRAPHQL_URL=https://api.oscarfashion.dz/shop-api
NEXT_PUBLIC_GRAPHQL_WS_URL=wss://api.oscarfashion.dz/shop-api
NEXT_PUBLIC_SITE_URL=https://oscarfashion.dz
NEXT_PUBLIC_CDN_URL=https://api.oscarfashion.dz/assets
NEXT_PUBLIC_ENABLE_REVIEWS=true
NEXT_PUBLIC_ENABLE_WISHLIST=true
NEXT_PUBLIC_ENABLE_COMPARE=false
```

### `apps/backoffice/.env.production`

```env
VITE_GRAPHQL_URL=https://api.oscarfashion.dz/admin-api
```

## Run

```bash
bash deploy/scripts/04-write-env.sh
```

It prompts for everything it doesn't already have. To pre-seed:

```bash
DOMAIN_SHOP=oscarfashion.dz \
DOMAIN_API=api.oscarfashion.dz \
DOMAIN_ADMIN=admin.oscarfashion.dz \
SUPERADMIN_PASSWORD='change_me' \
bash deploy/scripts/04-write-env.sh
```

To overwrite existing `.env` files:

```bash
FORCE=1 bash deploy/scripts/04-write-env.sh
```

## After editing by hand

| Changed file | Re-run |
|---|---|
| `apps/backend/.env` | `pm2 reload oscar-backend --update-env` |
| `apps/frontend/.env.production` | `pnpm --filter @oscar/frontend build && pm2 reload oscar-frontend --update-env` |
| `apps/backoffice/.env.production` | `pnpm --filter @oscar/backoffice build` (Caddy serves the new files instantly) |

Next: [05 — First deploy](05-first-deploy.md).
