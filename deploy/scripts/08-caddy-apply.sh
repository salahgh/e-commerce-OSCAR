#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────
# 08-caddy-apply.sh — install the Caddyfile and reload Caddy.
#
#   bash deploy/scripts/08-caddy-apply.sh
#
# Make sure the three DNS A-records already point at this VPS;
# Caddy needs that to fetch Let's Encrypt certificates.
# ──────────────────────────────────────────────────────────────
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/oscar}"
SRC="$APP_DIR/deploy/caddy/Caddyfile"
DST=/etc/caddy/Caddyfile

[[ -f "$SRC" ]] || { echo "❌  $SRC not found" >&2; exit 1; }

echo "▶  Validating $SRC"
caddy validate --config "$SRC" --adapter caddyfile

echo "▶  Copying to $DST"
sudo install -m 644 "$SRC" "$DST"

if systemctl is-active --quiet caddy; then
  echo "▶  Reloading Caddy (zero-downtime)"
  sudo systemctl reload caddy
else
  echo "▶  Caddy isn't running yet — starting + enabling on boot"
  sudo systemctl enable --now caddy
fi

sleep 1
sudo systemctl status caddy --no-pager --lines=5 || true

echo
echo "✅  Caddy reloaded."
echo "   First requests to each domain will trigger Let's Encrypt cert issuance."
echo "   Watch live:  sudo journalctl -u caddy -f"
