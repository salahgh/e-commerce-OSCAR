#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────
# 07-pm2-start.sh — start backend + frontend under PM2, persist on boot.
#
#   bash deploy/scripts/07-pm2-start.sh
#
# The backoffice is NOT started under PM2 — it's a static SPA
# served by Caddy directly from apps/backoffice/dist (see 08).
# ──────────────────────────────────────────────────────────────
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/oscar}"
APP_USER="${APP_USER:-$(id -un)}"
ECO="$APP_DIR/deploy/scripts/ecosystem.config.cjs"

cd "$APP_DIR"

echo "▶  Starting PM2 apps"
pm2 startOrReload "$ECO" --update-env

echo "▶  Saving PM2 process list"
pm2 save

echo "▶  Enabling PM2 on boot (systemd)"
# `pm2 startup systemd …` PRINTS a sudo command. We capture it, run it.
STARTUP_CMD="$(pm2 startup systemd -u "$APP_USER" --hp "$HOME" | tail -1)"
if [[ "$STARTUP_CMD" == sudo* ]]; then
  echo "▶  $STARTUP_CMD"
  eval "$STARTUP_CMD"
fi
pm2 save

echo
echo "✅  PM2 ready."
echo "   pm2 status                 # quick check"
echo "   pm2 logs oscar-backend     # tail backend logs"
echo "   pm2 logs oscar-frontend    # tail frontend logs"
echo "   Next: bash deploy/scripts/08-caddy-apply.sh"
