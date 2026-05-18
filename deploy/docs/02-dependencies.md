# 02 — System dependencies

Install all the system packages OSCAR Fashion needs.

## Run

```bash
ssh oscar@YOUR_VPS_IP
# Easiest if you already cloned the repo (03) — but you can also fetch
# the single script first:
curl -fsSL https://raw.githubusercontent.com/<you>/e-commerce-OSCAR/main/deploy/scripts/01-install-deps.sh -o /tmp/01.sh
bash /tmp/01.sh
```

## What gets installed

| Package | Why | Version pin |
|---|---|---|
| Node.js | Runtime for backend, frontend, and Vendure tooling | **20.x LTS** (NodeSource repo) |
| pnpm | Monorepo package manager | **10.29.3** (matches `package.json` engines) |
| PostgreSQL | Vendure's database | Default Ubuntu LTS package (14 / 16) |
| PM2 | Process manager for the two Node services | global npm |
| Caddy | Reverse proxy + auto-HTTPS | Stable repo (Cloudsmith) |
| git, build-essential | Cloning the repo + native module compiles | apt defaults |

The script is idempotent — it skips anything already present at the right
major version.

## Verify

After the script finishes it prints a summary; you can re-run the same checks
any time:

```bash
node -v        # v20.x.x
pnpm -v        # 10.29.3
psql --version # psql (PostgreSQL) 14.x or 16.x
pm2 -v
caddy version
git --version
systemctl is-active postgresql   # active
systemctl is-active caddy        # active
```

## Notes

- **pnpm via corepack.** Node 16.10+ ships with [corepack](https://nodejs.org/api/corepack.html);
  the script enables it and pins pnpm to the version this repo requires. If you
  later see "pnpm: command not found", run `sudo corepack enable && sudo corepack prepare pnpm@10.29.3 --activate` again.
- **PM2 location.** Installed globally; binary lives at `/usr/lib/node_modules/pm2/bin/pm2`.
  PM2's daemon runs as the user that first started it — so we run `pm2 start …`
  as `oscar`, not via sudo.
- **Caddy default config.** A stock `/etc/caddy/Caddyfile` is installed and Caddy
  is started; [08-caddy-apply.sh](../scripts/08-caddy-apply.sh) overwrites that
  file with ours later.

Next: [03 — Database](03-database.md).
