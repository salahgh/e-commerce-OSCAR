#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────
# 08-nginx-apply.sh — install OSCAR's nginx site + get TLS certs.
#
#   bash deploy/scripts/08-nginx-apply.sh
#
# What it does (idempotent):
#   1. Removes any stale oscarfashion.dz HTTP-redirect block from the
#      existing oscar-fidelity file (the promostore block stays intact).
#   2. Installs deploy/nginx/oscar-fashion.conf to
#      /etc/nginx/sites-available/oscar-fashion (symlinked from sites-enabled).
#   3. Issues Let's Encrypt certs for api.oscarfashion.dz and
#      admin.oscarfashion.dz via certbot --nginx (skipped if certs exist).
#   4. Reloads nginx after each successful step.
#
# Prerequisites:
#   • nginx + certbot already installed on the VPS (they are).
#   • DNS A-records for api.oscarfashion.dz and admin.oscarfashion.dz
#     pointing at this VPS (confirmed before running this script).
#   • PM2 oscar-frontend listening on 127.0.0.1:3001.
#   • PM2 oscar-backend listening on 127.0.0.1:8085.
#   • apps/backoffice/dist exists (bash deploy/scripts/05-build.sh).
# ──────────────────────────────────────────────────────────────
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/oscar}"
SRC="$APP_DIR/deploy/nginx/oscar-fashion.conf"
DST_AVAIL=/etc/nginx/sites-available/oscar-fashion
DST_ENAB=/etc/nginx/sites-enabled/oscar-fashion
LE_EMAIL="${LE_EMAIL:-sonyexperiasola29@gmail.com}"

[[ -f "$SRC" ]] || { echo "❌  $SRC not found" >&2; exit 1; }
command -v certbot >/dev/null || { echo "❌  certbot is not installed" >&2; exit 1; }

# ── 1. Strip the dead oscarfashion.dz HTTP-redirect from oscar-fidelity ──
FIDELITY=/etc/nginx/sites-available/oscar-fidelity
if [[ -f "$FIDELITY" ]] && grep -q 'server_name oscarfashion.dz www.oscarfashion.dz' "$FIDELITY"; then
  echo "▶  Backing up oscar-fidelity → oscar-fidelity.bak.$(date +%s)"
  sudo cp -a "$FIDELITY" "$FIDELITY.bak.$(date +%s)"

  # Drop the server block that handles oscarfashion.dz (and not promostore).
  # Uses brace-counting so nested `if { … }` blocks inside the server block
  # don't fool us.
  echo "▶  Removing dead oscarfashion.dz HTTP-redirect block from oscar-fidelity"
  sudo python3 - "$FIDELITY" <<'PY'
import sys, re
p = sys.argv[1]
with open(p) as f:
    lines = f.readlines()

out = []
i = 0
removed = 0
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

if removed == 0:
    print("  (no matching block found — already clean)")
else:
    print(f"  Removed {removed} server block(s)")

with open(p, 'w') as f:
    f.writelines(out)
PY
fi

# ── 2. Decide which version of our config to install ──────────
HAS_API_CERT=0
HAS_ADMIN_CERT=0
[[ -f /etc/letsencrypt/live/api.oscarfashion.dz/fullchain.pem ]]   && HAS_API_CERT=1
[[ -f /etc/letsencrypt/live/admin.oscarfashion.dz/fullchain.pem ]] && HAS_ADMIN_CERT=1

install_full_config() {
  echo "▶  Installing full HTTPS-aware config (all certs present)"
  sudo install -m 644 "$SRC" "$DST_AVAIL"
  sudo ln -sf ../sites-available/oscar-fashion "$DST_ENAB"
}

install_phase1_config() {
  echo "▶  Installing phase-1 config (HTTP-only for hosts without certs)"
  # Storefront block keeps its existing HTTPS (cert exists already).
  # api/admin get HTTP-only blocks so certbot can find them.
  TMP=$(mktemp)
  cat > "$TMP" <<EOF
# Phase-1 OSCAR Fashion nginx config — installed by 08-nginx-apply.sh.
# Replaced by deploy/nginx/oscar-fashion.conf once certbot issues certs
# for api.oscarfashion.dz and admin.oscarfashion.dz.

# Storefront (existing cert is valid)
server {
    listen 80;
    server_name oscarfashion.dz www.oscarfashion.dz;
    return 301 https://oscarfashion.dz\$request_uri;
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

# API — HTTP-only so certbot --nginx can find the block
server {
    listen 80;
    server_name api.oscarfashion.dz;

    client_max_body_size 50M;

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

# Back-office SPA — HTTP-only so certbot --nginx can find the block
server {
    listen 80;
    server_name admin.oscarfashion.dz;

    root /var/www/oscar/apps/backoffice/dist;
    index index.html;

    location / {
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

# ── 3. Run certbot for missing certs ──────────────────────────
missing=()
[[ $HAS_API_CERT   -eq 0 ]] && missing+=("api.oscarfashion.dz")
[[ $HAS_ADMIN_CERT -eq 0 ]] && missing+=("admin.oscarfashion.dz")

if [[ ${#missing[@]} -gt 0 ]]; then
  echo "▶  Requesting Let's Encrypt certs for: ${missing[*]}"
  args=(--nginx --non-interactive --agree-tos --redirect --email "$LE_EMAIL")
  for h in "${missing[@]}"; do args+=(-d "$h"); done
  sudo certbot "${args[@]}"

  # Now that the certs exist, switch to the canonical full config so
  # future deploys are not at the mercy of certbot's edits.
  echo "▶  Switching to canonical HTTPS config"
  install_full_config

  echo "▶  nginx -t"
  sudo nginx -t

  echo "▶  Reloading nginx"
  sudo systemctl reload nginx
else
  echo "✓  Certs already exist for api + admin — skipping certbot"
fi

# ── 4. Sanity check ───────────────────────────────────────────
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
