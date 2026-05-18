# OSCAR Fashion — Self-Hosted VPS Deployment

Plain-bash deployment of the OSCAR Fashion monorepo to a single Ubuntu VPS.
No Docker, no Railway, no Vercel — just **Node 20 + pnpm + PostgreSQL + PM2 + Caddy**.

> **Heads-up:** the old `setup-vps.sh`, `setup-vps-postgres.sh`, `maintenance.sh`,
> `deploy.sh` (at `deploy/` root) and `vendure-config.production.ts` files in this
> folder are **legacy** — they reference the pre-monorepo paths
> (`01-BACKEND-VENDURE/`, `02-FRONTEND/`) which no longer exist. They are kept
> around for reference but they will **not work**. Use the numbered scripts
> under `deploy/scripts/` instead. Delete the legacy files once you're confident
> the new flow works.

## What gets deployed

| Service | Path | Public URL | Local port | Process manager |
|---|---|---|---|---|
| Vendure API (shop-api, admin-api, /assets, built-in admin) | `apps/backend` | `https://api.oscarfashion.dz` | `127.0.0.1:8085` | PM2 (`oscar-backend`) |
| Next.js storefront | `apps/frontend` | `https://oscarfashion.dz` | `127.0.0.1:3001` | PM2 (`oscar-frontend`) |
| Custom back-office (Vite SPA) | `apps/backoffice` | `https://admin.oscarfashion.dz` | n/a (static files) | Caddy file_server |

## Topology (single VPS)

```
                ┌─────────────── Caddy (:80/:443, auto-HTTPS) ───────────────┐
                │                                                            │
oscarfashion.dz │  → reverse_proxy 127.0.0.1:3001   ───►  PM2 oscar-frontend │
api.oscarfashion.dz │ → reverse_proxy 127.0.0.1:8085 ───►  PM2 oscar-backend │
admin.oscarfashion.dz │ → file_server /var/www/oscar/apps/backoffice/dist   │
                └──────────────────────────────────┬─────────────────────────┘
                                                   │
                                            PostgreSQL :5432
                                            (oscar_fashion DB on localhost)
```

## Order of operations (first deploy)

| Step | Script | Run as | Notes |
|---|---|---|---|
| 1 | [`scripts/00-bootstrap.sh`](scripts/00-bootstrap.sh) | **root** | Optional but recommended — creates `oscar` user, UFW, swap. |
| 2 | [`scripts/01-install-deps.sh`](scripts/01-install-deps.sh) | `oscar` | Node 20, pnpm, Postgres, Caddy, PM2. |
| 3 | [`scripts/02-setup-postgres.sh`](scripts/02-setup-postgres.sh) | `oscar` | Creates role + db, writes `~/.oscar-db-url`. |
| 4 | [`scripts/03-clone-repo.sh`](scripts/03-clone-repo.sh) | `oscar` | Clones into `/var/www/oscar`. |
| 5 | [`scripts/04-write-env.sh`](scripts/04-write-env.sh) | `oscar` | Interactive — writes `.env` files for all 3 apps. |
| 6 | [`scripts/05-build.sh`](scripts/05-build.sh) | `oscar` | `pnpm install` + `pnpm build`. |
| 7 | [`scripts/06-migrate.sh --seed`](scripts/06-migrate.sh) | `oscar` | Migrations (+ seed demo data on **first run only**). |
| 8 | [`scripts/07-pm2-start.sh`](scripts/07-pm2-start.sh) | `oscar` | PM2 starts backend + frontend, enables boot persistence. |
| 9 | [`scripts/08-caddy-apply.sh`](scripts/08-caddy-apply.sh) | `oscar` | DNS A-records must already point at the VPS. |

After step 9 the three subdomains should serve HTTPS.

## Day-2 updates

```bash
ssh oscar@your-vps
cd /var/www/oscar
bash deploy/scripts/deploy.sh
```

That single script pulls `main`, reinstalls, rebuilds, runs migrations, and
reloads PM2 with zero downtime. See [`docs/07-updates.md`](docs/07-updates.md).

## Defaults (override via env vars before running any script)

| Var | Default | Purpose |
|---|---|---|
| `APP_DIR`  | `/var/www/oscar` | Where the repo lives on the VPS. |
| `APP_USER` | `oscar`          | Linux user that runs the apps. |
| `DB_NAME`  | `oscar_fashion`  | Postgres database name. |
| `DB_USER`  | `oscar`          | Postgres role. |
| `BRANCH`   | `main`           | Branch to deploy. |

## Where logs live

| Source | Command |
|---|---|
| Node apps | `pm2 logs`, `pm2 logs oscar-backend`, `pm2 logs oscar-frontend` |
| Caddy / TLS | `sudo journalctl -u caddy -f` |
| Postgres | `sudo journalctl -u postgresql -f` |

## Docs index

- [01 — VPS bootstrap](docs/01-vps-bootstrap.md)
- [02 — Dependencies](docs/02-dependencies.md)
- [03 — Database](docs/03-database.md)
- [04 — Env files](docs/04-env-files.md)
- [05 — First deploy (happy path)](docs/05-first-deploy.md)
- [06 — Caddy + DNS](docs/06-caddy-and-dns.md)
- [07 — Updates / rollback](docs/07-updates.md)
- [08 — Troubleshooting](docs/08-troubleshooting.md)
