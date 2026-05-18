# 08 — Troubleshooting

Common failure modes and how to diagnose them, grouped by symptom.

## "I can't reach my domain"

```bash
# 1. DNS resolves to the right IP?
dig +short oscarfashion.dz
# 2. Caddy is running and listening on 80/443?
sudo systemctl status caddy
sudo ss -tlnp | grep -E ':(80|443)\b'
# 3. UFW isn't blocking?
sudo ufw status
# 4. Caddy logs?
sudo journalctl -u caddy -n 100 --no-pager
```

If `dig` returns no IP, fix DNS. If it returns the right IP but `curl https://…`
hangs, check UFW. If TLS handshake fails with `unauthorized`, Caddy couldn't
complete the ACME challenge — see "ACME failed" below.

## "ACME / Let's Encrypt failed"

Usual causes:

1. DNS A-record doesn't point at the VPS yet (most common).
2. Port 80 isn't open in UFW or in the cloud provider's firewall.
3. You hit Let's Encrypt's rate limit (5 failed authorizations / host / hour).
   Fix the underlying issue and Caddy will retry exponentially.

```bash
sudo journalctl -u caddy --since "10 minutes ago" | grep -iE 'acme|cert|error'
```

## "Backend won't start"

```bash
pm2 logs oscar-backend --lines 200 --nostream
```

Most likely:

| Error fragment | Fix |
|---|---|
| `ECONNREFUSED 127.0.0.1:5432` | Postgres isn't running: `sudo systemctl start postgresql`. |
| `password authentication failed for user "oscar"` | DB password mismatch — regenerate (see [03](03-database.md#rotating-the-db-password-later)). |
| `relation "...." does not exist` | Migrations not run — `bash deploy/scripts/06-migrate.sh`. |
| `Cannot find module 'X'` | Did `pnpm install` get interrupted? Run `pnpm install --frozen-lockfile` again. |
| `EADDRINUSE 8085` | Another process owns the port: `sudo ss -tlnp \| grep 8085`. |

## "Frontend builds OOM-killed"

Symptom: `pnpm build` ends with "Killed" or the SSH session disconnects.

Cause: Next.js needs ~1.5 GiB during build. On a 1 GiB VPS the kernel OOM-killer
nukes it.

Fix: rerun `sudo bash deploy/scripts/00-bootstrap.sh` to add the 4 GiB swap
file. Or set `NODE_OPTIONS=--max-old-space-size=1024` if RAM is genuinely tight,
though this can make Next builds extremely slow.

## "Browser shows wrong API URL / mixed content"

Frontend env values are baked at build time. If you changed
`NEXT_PUBLIC_GRAPHQL_URL` after `pnpm build`, the change isn't picked up.

```bash
pnpm --filter @oscar/frontend build
pm2 reload oscar-frontend --update-env
```

Same applies to `VITE_GRAPHQL_URL` for the backoffice.

## "CORS error in the browser console"

Vendure rejects requests from origins not listed in `CORS_ORIGINS`. Check the
backend `.env`:

```bash
grep CORS_ORIGINS apps/backend/.env
```

It must contain every origin the browser will load the page from (including
`https://www.…` if you advertise that hostname).

After fixing:

```bash
pm2 reload oscar-backend --update-env
```

## "Apollo WebSocket subscriptions don't connect"

The frontend uses `wss://api.oscarfashion.dz/shop-api`. Verify:

1. Caddy proxies WebSockets (the stock `reverse_proxy` directive does — make
   sure you haven't customised it with explicit `transport http` overrides).
2. The frontend env uses `wss://` not `ws://`.
3. The backend is reachable: `curl -sI https://api.oscarfashion.dz/shop-api`.

## "PM2 didn't restart on reboot"

Run `pm2 status` right after reboot. If empty:

```bash
pm2 startup systemd -u oscar --hp /home/oscar    # prints a sudo command
sudo <paste the command it printed>
pm2 save
sudo reboot
```

## "Disk filling up"

Three usual suspects:

| Path | Cause | Fix |
|---|---|---|
| `~/.pm2/logs/*.log` | PM2 logs grow forever by default. | Install `pm2-logrotate`: `pm2 install pm2-logrotate`. |
| `apps/backend/static/assets/` | Product images uploaded via the admin UI. | Move to object storage (out of scope here). |
| `/var/log/journal/` | systemd journal. | `sudo journalctl --vacuum-size=500M`. |

## Getting more help

| Source | Command |
|---|---|
| All PM2 logs | `pm2 logs --lines 200 --nostream` |
| Caddy | `sudo journalctl -u caddy -f` |
| Postgres | `sudo journalctl -u postgresql -f` |
| Process tree | `pm2 list && pm2 describe oscar-backend` |
| Open ports | `sudo ss -tlnp` |
| Disk | `df -h && du -sh /var/www/oscar/* | sort -h` |
