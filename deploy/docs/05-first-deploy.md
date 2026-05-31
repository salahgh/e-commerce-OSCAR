# 05 — First deploy (happy path)

The full sequence from a fresh Ubuntu VPS to all three apps live on HTTPS.

## Prerequisites checklist

- [ ] Ubuntu 22.04 / 24.04 VPS, root SSH access, ≥ 2 GiB RAM (≥ 4 GiB recommended).
- [ ] DNS A-records already created and propagated:
  - `oscarfashion.dz`        → VPS public IP
  - `www.oscarfashion.dz`    → VPS public IP
  - `api.oscarfashion.dz`    → VPS public IP
  - `admin.oscarfashion.dz`  → VPS public IP
  Verify with `dig +short oscarfashion.dz` from your laptop.
- [ ] GitHub repo URL handy (HTTPS clone URL).

## Step-by-step

### 1. Bootstrap (as root)

```bash
ssh root@VPS_IP
git clone https://github.com/<you>/e-commerce-OSCAR.git /tmp/oscar
sudo bash /tmp/oscar/deploy/scripts/00-bootstrap.sh
```

Log out, then back in as `oscar`:

```bash
ssh oscar@VPS_IP
```

### 2. Install dependencies

```bash
bash /tmp/oscar/deploy/scripts/01-install-deps.sh
```

### 3. Postgres role + database

```bash
bash /tmp/oscar/deploy/scripts/02-setup-postgres.sh
```

### 4. Clone the repo to its real home

```bash
REPO_URL=https://github.com/<you>/e-commerce-OSCAR.git \
  bash /tmp/oscar/deploy/scripts/03-clone-repo.sh
```

From here, work from `/var/www/oscar`:

```bash
cd /var/www/oscar
```

### 5. Write env files

```bash
bash deploy/scripts/04-write-env.sh
```

You'll be prompted for the three domains and the superadmin password.

### 6. Install + build

```bash
bash deploy/scripts/05-build.sh
```

This takes 3–8 minutes depending on VPS specs. The Next.js build is the heaviest
step.

### 7. Run migrations + seed (first deploy only)

```bash
bash deploy/scripts/06-migrate.sh --seed
```

**Drop the `--seed` flag** on every subsequent deploy — it would overwrite live
data.

### 8. Start under PM2

```bash
bash deploy/scripts/07-pm2-start.sh
pm2 status     # both apps should be online
curl -s http://127.0.0.1:8085/health  # → "ok"
curl -sI http://127.0.0.1:3001/       # → HTTP/1.1 200
```

### 9. Apply Caddy reverse-proxy

```bash
bash deploy/scripts/08-caddy-apply.sh
sudo journalctl -u caddy -f
```

Watch the log — Caddy fetches TLS certs from Let's Encrypt on the first request
to each domain.

### 10. Smoke test from your laptop

```bash
curl -I https://oscarfashion.dz                    # → 200 OK, TLS valid
curl -I https://api.oscarfashion.dz/shop-api       # → 400 or 200 (GraphQL playground)
curl -I https://admin.oscarfashion.dz              # → 200 OK, serving index.html
```

Open `https://admin.oscarfashion.dz` in a browser and log in with the
superadmin credentials.

If you used `--seed`, browse `https://oscarfashion.dz` and confirm products
render with images.

## What now?

- Save the superadmin password in your password manager.
- Schedule database backups — see [03 — Database](03-database.md#backups-recommended).
- Read [07 — Updates](07-updates.md) for the day-2 workflow.
- Read [08 — Troubleshooting](08-troubleshooting.md) for common failure modes.
