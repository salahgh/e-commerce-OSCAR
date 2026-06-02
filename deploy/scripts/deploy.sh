#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────
# deploy.sh — day-2 update script. Run as the `oscar` user.
#
#   bash deploy/scripts/deploy.sh           # pull main, build, migrate, reload
#   BRANCH=feature/x bash deploy.sh         # deploy a different branch
#   SKIP_MIGRATE=1 bash deploy.sh           # skip the migration step
#
# Refuses to run if the working tree has uncommitted changes.
# ──────────────────────────────────────────────────────────────
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/oscar}"
BRANCH="${BRANCH:-main}"
ECO="$APP_DIR/deploy/scripts/ecosystem.config.cjs"

cd "$APP_DIR"

# Server-local overrides to apps/*/.env.production are expected (real URLs /
# secrets differ from what's committed) — exclude them from the dirty check.
if [[ -n "$(git status --porcelain -- ':(exclude)apps/*/.env.production')" ]]; then
  echo "❌  Working tree has uncommitted changes. Refusing to deploy." >&2
  git status --short -- ':(exclude)apps/*/.env.production' >&2
  exit 1
fi

echo "▶  Fetching + fast-forwarding $BRANCH"
git fetch --prune origin
git checkout "$BRANCH"
git pull --ff-only origin "$BRANCH"

echo "▶  pnpm install --frozen-lockfile"
export NODE_ENV=production
export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=2048}"
pnpm install --frozen-lockfile

echo "▶  pnpm build (backend + frontend + backoffice)"
pnpm build --filter=@oscar/backend --filter=@oscar/frontend --filter=@oscar/backoffice

# Migrations run automatically when the backend boots — they apply on
# the next `pm2 reload` below. See apps/backend/src/index.ts:9.

echo "▶  Reloading PM2 (zero-downtime — migrations apply on backend restart)"
pm2 reload "$ECO" --update-env

# The backoffice is served by Caddy from apps/backoffice/dist — the
# fresh build is picked up instantly, no reload needed.

echo
echo "✅  Deployed @ $(git rev-parse --short HEAD)"
pm2 status
