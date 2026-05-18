#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────
# 06-migrate.sh — run Vendure DB migrations (and optionally seed).
#
#   bash deploy/scripts/06-migrate.sh           # migrations only
#   bash deploy/scripts/06-migrate.sh --seed    # also run populate (FIRST DEPLOY ONLY)
#
# The --seed flag will overwrite product data — never use it on a
# database that already has live orders/products.
# ──────────────────────────────────────────────────────────────
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/oscar}"
cd "$APP_DIR"

echo "▶  Running Vendure migrations"
pnpm --filter @oscar/backend migration:run

if [[ "${1:-}" == "--seed" ]]; then
  echo "▶  Seeding demo/initial data (apps/backend populate)"
  pnpm --filter @oscar/backend populate
fi

echo
echo "✅  Database is up to date."
echo "   Next: bash deploy/scripts/07-pm2-start.sh"
