#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────
# 02-setup-postgres.sh — create the Vendure DB + role.
#
#   bash deploy/scripts/02-setup-postgres.sh
#
# Idempotent: rerunning will NOT overwrite an existing password.
# Writes the connection string to ~/.oscar-db-url (mode 600) so
# the env-writing script can pick it up.
# ──────────────────────────────────────────────────────────────
set -euo pipefail

DB_NAME="${DB_NAME:-oscar_fashion}"
DB_USER="${DB_USER:-oscar}"
URL_FILE="$HOME/.oscar-db-url"

# ── Reuse existing password if we've run before ───────────────
if [[ -f "$URL_FILE" ]]; then
  echo "✓  Reusing existing $URL_FILE"
  cat "$URL_FILE"
  exit 0
fi

DB_PASSWORD="$(openssl rand -base64 24 | tr -d '/+=' | head -c 32)"

echo "▶  Creating role $DB_USER + database $DB_NAME"

# Role
if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" | grep -q 1; then
  sudo -u postgres psql -v ON_ERROR_STOP=1 <<SQL
CREATE ROLE $DB_USER LOGIN PASSWORD '$DB_PASSWORD';
SQL
else
  echo "ℹ  Role $DB_USER already exists — rotating password"
  sudo -u postgres psql -v ON_ERROR_STOP=1 <<SQL
ALTER ROLE $DB_USER WITH PASSWORD '$DB_PASSWORD';
SQL
fi

# Database
if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" | grep -q 1; then
  sudo -u postgres createdb -O "$DB_USER" "$DB_NAME"
else
  echo "ℹ  Database $DB_NAME already exists"
fi

DATABASE_URL="postgres://$DB_USER:$DB_PASSWORD@127.0.0.1:5432/$DB_NAME?schema=public"

umask 077
echo "DATABASE_URL=$DATABASE_URL" > "$URL_FILE"
chmod 600 "$URL_FILE"

# Sanity check
echo "▶  Verifying connection"
PGPASSWORD="$DB_PASSWORD" psql -h 127.0.0.1 -U "$DB_USER" -d "$DB_NAME" -c '\conninfo' >/dev/null

echo
echo "✅  Postgres ready."
echo "   Credentials saved to $URL_FILE (mode 600)"
echo "   Next: bash deploy/scripts/03-clone-repo.sh"
