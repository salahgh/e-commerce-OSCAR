# 06 — Caddy + DNS

Caddy terminates HTTPS, fetches Let's Encrypt certificates automatically, and
fronts the three subdomains.

## DNS records you need

| Hostname | Type | Value |
|---|---|---|
| `oscarfashion.dz`       | A    | VPS public IP |
| `www.oscarfashion.dz`   | A    | VPS public IP |
| `api.oscarfashion.dz`   | A    | VPS public IP |
| `admin.oscarfashion.dz` | A    | VPS public IP |

Set TTL to 300 s while you're testing so DNS changes propagate quickly.

Verify before running the Caddy script:

```bash
for h in oscarfashion.dz www.oscarfashion.dz api.oscarfashion.dz admin.oscarfashion.dz; do
  printf '%-30s %s\n' "$h" "$(dig +short $h)"
done
```

All four must return the VPS IP. If any of them are missing, Caddy will fail
the Let's Encrypt HTTP-01 challenge.

## What's in the Caddyfile

[`deploy/caddy/Caddyfile`](../caddy/Caddyfile):

```caddy
oscarfashion.dz, www.oscarfashion.dz {
    encode zstd gzip
    reverse_proxy 127.0.0.1:3000        # Next.js storefront
}

api.oscarfashion.dz {
    encode zstd gzip
    reverse_proxy 127.0.0.1:8085        # Vendure: shop-api, admin-api, /assets, /admin
}

admin.oscarfashion.dz {
    encode zstd gzip
    root * /var/www/oscar/apps/backoffice/dist
    try_files {path} /index.html        # SPA fallback
    file_server
}
```

A few notes:

- **WebSockets just work.** `reverse_proxy` upgrades `Upgrade: websocket`
  requests transparently, which is what Apollo subscriptions need on
  `wss://api.oscarfashion.dz/shop-api`.
- **No CORS rules in Caddy.** CORS is handled at the GraphQL layer via
  `CORS_ORIGINS` in `apps/backend/.env`. Keep those origins in sync with the
  domains you serve.
- **No nginx, no certbot.** Caddy handles cert issuance + renewal on its own
  (timer is built in). Certs live under `/var/lib/caddy/.local/share/caddy/`.
- The Vendure-bundled admin UI on `:8086` is **not** exposed publicly; if you
  want it, add a fourth site block for it on a separate subdomain. The custom
  back-office on `admin.oscarfashion.dz` is what we deploy.

## Apply

```bash
bash deploy/scripts/08-caddy-apply.sh
```

The script:
1. Runs `caddy validate` against the file (catches typos before reload).
2. Copies it to `/etc/caddy/Caddyfile`.
3. `systemctl reload caddy` (zero-downtime).

## Watch cert issuance live

```bash
sudo journalctl -u caddy -f
```

You'll see entries like `certificate obtained successfully` followed by
`served HTTPS request`. If you see `unable to authenticate user`,
double-check DNS.

## Change a domain later

1. Edit `deploy/caddy/Caddyfile`.
2. Edit the env files where the hostnames appear (backend `CORS_ORIGINS`,
   frontend `NEXT_PUBLIC_*`, backoffice `VITE_GRAPHQL_URL`).
3. Rebuild the frontend + backoffice (see [04 — Env files](04-env-files.md#after-editing-by-hand)).
4. `bash deploy/scripts/08-caddy-apply.sh`.

## Manual cert renewal (rarely needed)

Caddy auto-renews ~30 days before expiry. To force:

```bash
sudo systemctl restart caddy
```

Next: [07 — Updates](07-updates.md).
