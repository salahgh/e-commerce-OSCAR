# 07 — Day-2 updates

After the first deploy, all updates flow through one script.

## The happy path

```bash
ssh oscar@VPS_IP
cd /var/www/oscar
bash deploy/scripts/deploy.sh
```

What it does, in order:

1. Refuses to continue if there are uncommitted changes on the VPS.
2. `git fetch && git checkout $BRANCH && git pull --ff-only`.
3. `pnpm install --frozen-lockfile`.
4. `pnpm build` (rebuilds backend, frontend, backoffice via Turbo).
5. `pm2 reload deploy/scripts/ecosystem.config.cjs --update-env` — zero-downtime
   restart of `oscar-backend` and `oscar-frontend`. **Vendure runs migrations
   automatically on backend boot** (see `apps/backend/src/index.ts:9`), so any
   new migrations apply during the reload.

The backoffice doesn't need a "reload" — Caddy serves the freshly built
`apps/backoffice/dist/` instantly.

## Useful flags

| Variable | Effect |
|---|---|
| `BRANCH=feature/foo` | Deploy a non-`main` branch (handy for staging on the same VPS). |

## What to do if a deploy fails

PM2 keeps the previous version running while `pnpm build` runs, so a build
failure leaves the site up and the deploy aborts before `pm2 reload`. If
something does go wrong:

```bash
pm2 logs --lines 100
git log --oneline -10
```

## Rolling back

There's no automated rollback (intentional — keeps the script small). Manual
recipe:

```bash
cd /var/www/oscar
git fetch
git checkout <previous-good-sha>
pnpm install --frozen-lockfile
pnpm build
pm2 reload deploy/scripts/ecosystem.config.cjs --update-env
```

If the bad deploy added a migration, rolling back the code won't undo the
schema change — the safest path is to **restore the previous DB dump**
before reloading PM2. See
[03 — Database](03-database.md#backups-recommended).

> Vendure migrations are not always reversible. If a migration changes data,
> the safest rollback is to **restore the previous DB dump** (see
> [03 — Database](03-database.md#backups-recommended)) and redeploy.

## Watching a live deploy

In a second SSH session:

```bash
pm2 logs --lines 0
# In another:
sudo journalctl -u caddy -f
```

## Restarting individual processes

```bash
pm2 restart oscar-backend       # full restart, brief downtime
pm2 reload oscar-frontend        # graceful, zero-downtime
pm2 stop oscar-frontend
pm2 start oscar-frontend
```

## Persisting PM2 after manual changes

Whenever you start, stop, or rename a PM2 process by hand:

```bash
pm2 save        # snapshot the current process list
```

Without this, the saved list pm2 replays on boot is stale.

Next: [08 — Troubleshooting](08-troubleshooting.md).
