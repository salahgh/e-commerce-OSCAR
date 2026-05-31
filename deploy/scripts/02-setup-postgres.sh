#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────
# 02-setup-postgres.sh — create the Vendure DB + role.
#
#   bash deploy/scripts/02-setup-postgres.sh           # as `oscar`
#
# Do NOT prefix with `sudo` — the script `sudo`s internally only
# for the Postgres bits, and running the whole thing as root makes
# the credentials file land in /root/ instead of the app user's home.
#
# Idempotent: rerunning rotates the password (and the saved URL).
# Writes the connection string to ~/.oscar-db-url (mode 600).
# ──────────────────────────────────────────────────────────────
set -euo pipefail

# Refuse to run as root — see header comment.
if [[ $EUID -eq 0 ]]; then
  echo "❌  Don't run as root. Run as the app user (e.g. oscar) — without sudo." >&2
  echo "    The script will use sudo internally where needed." >&2
  exit 1
fi

# Run from /tmp so the postgres Unix user can chdir into our cwd
# (otherwise `sudo -u postgres psql` prints harmless warnings about
# /home/oscar being unreadable).
cd /tmp

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

# NOTE: no ?schema=public — psql rejects that query param. Vendure's
# vendure-config.ts defaults the schema to "public" when the URL has no
# query string (apps/backend/src/vendure-config.ts:34), so behaviour is
# identical and the same URL works with psql for ad-hoc queries.
DATABASE_URL="postgres://$DB_USER:$DB_PASSWORD@127.0.0.1:5432/$DB_NAME"

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
