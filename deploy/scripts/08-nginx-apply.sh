#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────
# 08-nginx-apply.sh — install OSCAR's nginx site + get TLS certs.
#
#   bash deploy/scripts/08-nginx-apply.sh
#
# What it does (idempotent):
#   1. Removes any stale oscarfashion.dz HTTP-redirect block from the
#      existing oscar-fidelity file (the promostore block stays intact).
#   2. Installs an nginx site at /etc/nginx/sites-available/oscar-fashion.
#      First-run version: phase-1 (HTTPS for shop using existing cert,
#      HTTP-only for api+admin with a webroot for ACME). Final version:
#      deploy/nginx/oscar-fashion.conf (full HTTPS for all 3).
#   3. Issues Let's Encrypt certs for api.oscarfashion.dz and
#      admin.oscarfashion.dz via certbot certonly --webroot.
#      (Bypasses --nginx, which had trouble with the existing site mix.)
#   4. Switches to the canonical HTTPS-everywhere config and reloads.
#
# Prerequisites:
#   • nginx + certbot already installed on the VPS.
#   • DNS A-records for api/admin pointing at this VPS.
#   • PM2 oscar-frontend on 127.0.0.1:3001; oscar-backend on :8085.
#   • apps/backoffice/dist exists (bash deploy/scripts/05-build.sh).
# ──────────────────────────────────────────────────────────────
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/oscar}"
SRC="$APP_DIR/deploy/nginx/oscar-fashion.conf"
DST_AVAIL=/etc/nginx/sites-available/oscar-fashion
DST_ENAB=/etc/nginx/sites-enabled/oscar-fashion
WEBROOT=/var/www/letsencrypt
LE_EMAIL="${LE_EMAIL:-sonyexperiasola29@gmail.com}"

[[ -f "$SRC" ]] || { echo "❌  $SRC not found" >&2; exit 1; }
command -v certbot >/dev/null || { echo "❌  certbot is not installed" >&2; exit 1; }

# ── 0. Webroot for ACME HTTP-01 challenges ────────────────────
if [[ ! -d "$WEBROOT" ]]; then
  echo "▶  Creating ACME webroot at $WEBROOT"
  sudo mkdir -p "$WEBROOT/.well-known/acme-challenge"
  sudo chown -R www-data:www-data "$WEBROOT"
fi

# ── 1. Strip dead oscarfashion.dz block from oscar-fidelity ───
FIDELITY=/etc/nginx/sites-available/oscar-fidelity
if [[ -f "$FIDELITY" ]] \
   && grep -qE '^\s*server_name\s+oscarfashion\.dz\s+www\.oscarfashion\.dz\s*;' "$FIDELITY"; then
  echo "▶  Backing up oscar-fidelity → oscar-fidelity.bak.$(date +%s)"
  sudo cp -a "$FIDELITY" "$FIDELITY.bak.$(date +%s)"

  echo "▶  Removing dead oscarfashion.dz HTTP-redirect block from oscar-fidelity"
  sudo python3 - "$FIDELITY" <<'PY'
import sys, re
p = sys.argv[1]
with open(p) as f:
    lines = f.readlines()

out, i, removed = [], 0, 0
server_re = re.compile(r'^\s*server\s*\{')
while i < len(lines):
    line = lines[i]
    if server_re.match(line):
        depth = line.count('{') - line.count('}')
        block = [line]
        j = i + 1
        while depth > 0 and j < len(lines):
            block.append(lines[j])
            depth += lines[j].count('{') - lines[j].count('}')
            j += 1
        text = ''.join(block)
        if ('oscarfashion.dz' in text
                and 'server_name' in text
                and 'promostore' not in text):
            removed += 1
            i = j
            continue
        out.extend(block)
        i = j
    else:
        out.append(line)
        i += 1

print(f"  Removed {removed} server block(s)" if removed else "  (no matching block — already clean)")
with open(p, 'w') as f:
    f.writelines(out)
PY
fi

# ── 2. Decide which config version to install ─────────────────
HAS_API_CERT=0
HAS_ADMIN_CERT=0
[[ -f /etc/letsencrypt/live/api.oscarfashion.dz/fullchain.pem ]]   && HAS_API_CERT=1
[[ -f /etc/letsencrypt/live/admin.oscarfashion.dz/fullchain.pem ]] && HAS_ADMIN_CERT=1

install_full_config() {
  echo "▶  Installing full HTTPS-aware config"
  sudo install -m 644 "$SRC" "$DST_AVAIL"
  sudo ln -sf ../sites-available/oscar-fashion "$DST_ENAB"
}

install_phase1_config() {
  echo "▶  Installing phase-1 config (HTTPS for shop; HTTP+ACME webroot for api/admin)"
  TMP=$(mktemp)
  cat > "$TMP" <<EOF
# Phase-1 OSCAR Fashion nginx config — installed by 08-nginx-apply.sh.
# Replaced by deploy/nginx/oscar-fashion.conf once certbot issues certs.

# ── Shared ACME webroot snippet ───────────────────────────────
# Every HTTP server block below mounts $WEBROOT for /.well-known/acme-challenge/.

# Storefront (existing cert is valid)
server {
    listen 80;
    server_name oscarfashion.dz www.oscarfashion.dz;

    location /.well-known/acme-challenge/ {
        root $WEBROOT;
        default_type "text/plain";
    }
    location / {
        return 301 https://oscarfashion.dz\$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name oscarfashion.dz www.oscarfashion.dz;

    ssl_certificate     /etc/letsencrypt/live/oscarfashion.dz/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/oscarfashion.dz/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    client_max_body_size 50M;

    if (\$host = www.oscarfashion.dz) {
        return 301 https://oscarfashion.dz\$request_uri;
    }

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 300s;
    }
}

# API — HTTP-only, ACME webroot, NO redirect (so HTTP-01 succeeds)
server {
    listen 80;
    server_name api.oscarfashion.dz;

    client_max_body_size 50M;

    location /.well-known/acme-challenge/ {
        root $WEBROOT;
        default_type "text/plain";
    }

    location / {
        proxy_pass http://127.0.0.1:8085;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}

# Back-office — HTTP-only, ACME webroot
server {
    listen 80;
    server_name admin.oscarfashion.dz;

    location /.well-known/acme-challenge/ {
        root $WEBROOT;
        default_type "text/plain";
    }

    location / {
        root /var/www/oscar/apps/backoffice/dist;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }
}
EOF
  sudo install -m 644 "$TMP" "$DST_AVAIL"
  rm -f "$TMP"
  sudo ln -sf ../sites-available/oscar-fashion "$DST_ENAB"
}

if [[ $HAS_API_CERT -eq 1 && $HAS_ADMIN_CERT -eq 1 ]]; then
  install_full_config
else
  install_phase1_config
fi

echo "▶  nginx -t"
sudo nginx -t
echo "▶  Reloading nginx"
sudo systemctl reload nginx

# ── 3. Issue certs via webroot challenge ──────────────────────
issue_cert() {
  local host=$1
  echo "▶  Issuing cert for $host (webroot $WEBROOT)"
  sudo certbot certonly \
    --webroot -w "$WEBROOT" \
    --non-interactive --agree-tos --email "$LE_EMAIL" \
    -d "$host"
}

[[ $HAS_API_CERT   -eq 0 ]] && issue_cert "api.oscarfashion.dz"
[[ $HAS_ADMIN_CERT -eq 0 ]] && issue_cert "admin.oscarfashion.dz"

# ── 4. Switch to full HTTPS-everywhere config ─────────────────
if [[ $HAS_API_CERT -eq 0 || $HAS_ADMIN_CERT -eq 0 ]]; then
  echo "▶  Switching to canonical HTTPS config"
  install_full_config
  echo "▶  nginx -t"
  sudo nginx -t
  echo "▶  Reloading nginx"
  sudo systemctl reload nginx
fi

# ── 5. Summary ────────────────────────────────────────────────
echo
echo "─── Live status ───────────────────────────────────────"
sudo systemctl is-active nginx
echo
sudo nginx -T 2>/dev/null | grep -E '^\s*server_name' | sort -u
echo "──────────────────────────────────────────────────────"
echo
echo "✅  Nginx is serving OSCAR Fashion."
echo "   Test from your laptop:"
echo "     curl -I https://oscarfashion.dz"
echo "     curl -I https://api.oscarfashion.dz/shop-api"
echo "     curl -I https://admin.oscarfashion.dz"
