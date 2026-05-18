#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────
# 03-clone-repo.sh — clone the monorepo to /var/www/oscar.
#
#   REPO_URL=https://github.com/<you>/e-commerce-OSCAR.git \
#     bash deploy/scripts/03-clone-repo.sh
#
# If REPO_URL is unset, the script prompts for it.
# Skipped if the target dir is already a git repo.
# ──────────────────────────────────────────────────────────────
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/oscar}"
APP_USER="${APP_USER:-oscar}"
REPO_URL="${REPO_URL:-}"
BRANCH="${BRANCH:-main}"

if [[ -d "$APP_DIR/.git" ]]; then
  echo "✓  $APP_DIR is already a git repo — skipping clone"
  exit 0
fi

if [[ -z "$REPO_URL" ]]; then
  read -r -p "Repo URL (e.g. https://github.com/you/repo.git): " REPO_URL
fi
[[ -z "$REPO_URL" ]] && { echo "❌  REPO_URL required" >&2; exit 1; }

echo "▶  Cloning $REPO_URL into $APP_DIR (branch: $BRANCH)"
sudo mkdir -p "$(dirname "$APP_DIR")"
sudo chown "$APP_USER:$APP_USER" "$(dirname "$APP_DIR")"

git clone --branch "$BRANCH" "$REPO_URL" "$APP_DIR"

# Ensure ownership in case sudo was needed for parent dir
sudo chown -R "$APP_USER:$APP_USER" "$APP_DIR"

echo
echo "✅  Repo cloned."
echo "   Next: bash deploy/scripts/04-write-env.sh"
