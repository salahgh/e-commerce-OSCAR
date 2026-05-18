#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────
# 04-write-env.sh — write the three .env files from templates.
#
#   bash deploy/scripts/04-write-env.sh              # interactive
#   FORCE=1 bash deploy/scripts/04-write-env.sh      # overwrite existing
#
# Inputs (env vars, or prompted):
#   DOMAIN_SHOP, DOMAIN_API, DOMAIN_ADMIN
#   SUPERADMIN_USERNAME, SUPERADMIN_PASSWORD
# Reads $HOME/.oscar-db-url for DATABASE_URL.
# Generates a random COOKIE_SECRET (32 hex bytes).
# ──────────────────────────────────────────────────────────────
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/oscar}"
URL_FILE="$HOME/.oscar-db-url"
TPL_DIR="$APP_DIR/deploy/env-templates"
FORCE="${FORCE:-0}"

[[ -f "$URL_FILE" ]] || { echo "❌  $URL_FILE missing. Run 02-setup-postgres.sh first." >&2; exit 1; }

# shellcheck disable=SC1090
source "$URL_FILE"   # sets DATABASE_URL

prompt() {  # prompt VAR "Label" "default"
  local var=$1 label=$2 default="${3:-}"
  local current="${!var:-}"
  [[ -n "$current" ]] && { echo "✓  $var=$current (from env)"; return; }
  if [[ -n "$default" ]]; then
    read -r -p "$label [$default]: " input
    printf -v "$var" '%s' "${input:-$default}"
  else
    read -r -p "$label: " input
    printf -v "$var" '%s' "$input"
  fi
}

prompt DOMAIN_SHOP       "Storefront domain"           "oscarfashion.dz"
prompt DOMAIN_API        "Vendure API domain"          "api.oscarfashion.dz"
prompt DOMAIN_ADMIN      "Back-office domain"          "admin.oscarfashion.dz"
prompt SUPERADMIN_USERNAME "Superadmin username"       "superadmin"

if [[ -z "${SUPERADMIN_PASSWORD:-}" ]]; then
  read -r -s -p "Superadmin password (input hidden): " SUPERADMIN_PASSWORD
  echo
  [[ -z "$SUPERADMIN_PASSWORD" ]] && { echo "❌  password required" >&2; exit 1; }
fi

COOKIE_SECRET="$(openssl rand -hex 32)"

write_if_missing() {  # write_if_missing path content
  local path=$1 content=$2
  if [[ -f "$path" ]] && [[ "$FORCE" != "1" ]]; then
    echo "ℹ  $path exists — skipping (use FORCE=1 to overwrite)"
    return
  fi
  printf '%s\n' "$content" > "$path"
  chmod 600 "$path"
  echo "✓  wrote $path"
}

# ── backend ────────────────────────────────────────────────────
BACKEND_ENV="$APP_DIR/apps/backend/.env"
write_if_missing "$BACKEND_ENV" "$(cat <<EOF
NODE_ENV=production
PORT=8085
CORS_ORIGINS=https://$DOMAIN_SHOP,https://www.$DOMAIN_SHOP,https://$DOMAIN_ADMIN

DATABASE_URL=$DATABASE_URL

SUPERADMIN_USERNAME=$SUPERADMIN_USERNAME
SUPERADMIN_PASSWORD=$SUPERADMIN_PASSWORD

COOKIE_SECRET=$COOKIE_SECRET

# SMTP (optional — fill in to enable transactional email)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
EOF
)"

# ── frontend ───────────────────────────────────────────────────
FRONT_ENV="$APP_DIR/apps/frontend/.env.production"
write_if_missing "$FRONT_ENV" "$(cat <<EOF
NEXT_PUBLIC_GRAPHQL_URL=https://$DOMAIN_API/shop-api
NEXT_PUBLIC_GRAPHQL_WS_URL=wss://$DOMAIN_API/shop-api
NEXT_PUBLIC_SITE_URL=https://$DOMAIN_SHOP
NEXT_PUBLIC_CDN_URL=https://$DOMAIN_API/assets
NEXT_PUBLIC_ENABLE_REVIEWS=true
NEXT_PUBLIC_ENABLE_WISHLIST=true
NEXT_PUBLIC_ENABLE_COMPARE=false
EOF
)"

# ── backoffice ─────────────────────────────────────────────────
BACK_ENV="$APP_DIR/apps/backoffice/.env.production"
write_if_missing "$BACK_ENV" "$(cat <<EOF
VITE_GRAPHQL_URL=https://$DOMAIN_API/admin-api
EOF
)"

echo
echo "✅  Env files written."
echo "   Next: bash deploy/scripts/05-build.sh"
