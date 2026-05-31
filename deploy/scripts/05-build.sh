#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────
# 05-build.sh — install + build all three apps.
#
#   bash deploy/scripts/05-build.sh
#
# Heads-up: Next.js build can use up to ~1.5 GiB RAM. If your VPS
# has less, run 00-bootstrap.sh first to add swap.
# ──────────────────────────────────────────────────────────────
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/oscar}"
cd "$APP_DIR"

export NODE_ENV=production
# Some Next.js / framer-motion builds need a higher heap on small VPSes
export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=2048}"

echo "▶  pnpm install --frozen-lockfile (this may take a few minutes)"
pnpm install --frozen-lockfile

echo "▶  pnpm build (Turbo — backend, frontend, backoffice)"
pnpm build

echo
echo "✅  Build complete."
echo "   • apps/backend/dist"
echo "   • apps/frontend/.next"
echo "   • apps/backoffice/dist"
echo "   Next: bash deploy/scripts/06-migrate.sh"
