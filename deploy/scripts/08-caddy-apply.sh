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

if ! systemctl is-active --quiet caddy; then
  echo
  echo "❌  Caddy failed to start. Recent logs:"
  sudo journalctl -u caddy -n 20 --no-pager
  echo
  echo "   Most common cause: another process owns :80 or :443. Check with:"
  echo "     sudo ss -tlnp '( sport = :80 or sport = :443 )'"
  echo "     sudo lsof -i :443"
  exit 1
fi

sudo systemctl status caddy --no-pager --lines=5

echo
echo "✅  Caddy is active."
echo "   First requests to each domain will trigger Let's Encrypt cert issuance."
echo "   Watch live:  sudo journalctl -u caddy -f"
