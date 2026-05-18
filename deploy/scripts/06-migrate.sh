#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────
# 06-migrate.sh — apply Vendure migrations (and optionally seed).
#
#   bash deploy/scripts/06-migrate.sh           # no-op (informational)
#   bash deploy/scripts/06-migrate.sh --seed    # run populate (FIRST DEPLOY ONLY)
#
# Heads-up about migrations:
#   apps/backend/src/index.ts:9 calls `runMigrations(config)` BEFORE
#   `bootstrap(config)`. So every time PM2 starts oscar-backend, any
#   pending migrations are applied automatically. There's no manual
#   migration step in this deploy flow — this script just exists for
#   the optional seed phase.
#
#   To watch migrations run, tail the backend log after starting PM2:
#     pm2 logs oscar-backend --lines 200 --nostream
#
# The --seed flag overwrites product data — never use it on a database
# that already has live orders/products.
# ──────────────────────────────────────────────────────────────
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/oscar}"
cd "$APP_DIR"

if [[ "${1:-}" == "--seed" ]]; then
  echo "▶  Seeding Vendure initial data (tax category, zones, countries)"
  cd "$APP_DIR/apps/backend"
  pnpm exec ts-node ./src/seed-initial.ts

  echo "▶  Seeding OSCAR demo data (collections, products, variants)"
  pnpm exec ts-node ./src/populate.ts
else
  echo "ℹ  Skipping explicit migration step."
  echo "   Vendure runs migrations on backend boot — they'll apply when PM2"
  echo "   starts oscar-backend (see apps/backend/src/index.ts:9)."
  echo
  echo "   Pass --seed on the FIRST deploy only, to populate demo data:"
  echo "     bash deploy/scripts/06-migrate.sh --seed"
fi

echo
echo "✅  Done."
echo "   Next: bash deploy/scripts/07-pm2-start.sh"
