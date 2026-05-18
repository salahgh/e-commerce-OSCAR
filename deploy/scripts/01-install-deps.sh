#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────
# 01-install-deps.sh — install all system dependencies.
# Run as the `oscar` user (which must have passwordless sudo):
#
#   bash deploy/scripts/01-install-deps.sh
#
# Installs:
#   • Node 20 LTS (NodeSource)
#   • pnpm 10.x (via corepack)
#   • PostgreSQL 14+
#   • Caddy (official stable repo)
#   • PM2 (global npm package)
#   • git, build-essential
# ──────────────────────────────────────────────────────────────
set -euo pipefail

if [[ $EUID -eq 0 ]]; then
  echo "❌  Don't run as root. Run as the app user (e.g. oscar)." >&2
  exit 1
fi

PNPM_VERSION="10.29.3"

echo "▶  apt update"
sudo apt-get update -y

echo "▶  Base packages"
sudo apt-get install -y curl ca-certificates gnupg lsb-release \
                        git build-essential debian-keyring debian-archive-keyring \
                        apt-transport-https

# ── Node 20 LTS via NodeSource ─────────────────────────────────
if ! command -v node &>/dev/null || [[ "$(node -v)" != v20.* ]]; then
  echo "▶  Installing Node 20 LTS"
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
else
  echo "✓  Node $(node -v) already installed"
fi

# ── pnpm via corepack ──────────────────────────────────────────
echo "▶  Enabling corepack + pnpm@$PNPM_VERSION"
sudo corepack enable
sudo corepack prepare "pnpm@${PNPM_VERSION}" --activate

# ── PostgreSQL ─────────────────────────────────────────────────
if ! command -v psql &>/dev/null; then
  echo "▶  Installing PostgreSQL"
  sudo apt-get install -y postgresql postgresql-contrib
  sudo systemctl enable --now postgresql
else
  echo "✓  PostgreSQL $(psql --version | awk '{print $3}') already installed"
fi

# ── PM2 (global) ───────────────────────────────────────────────
if ! command -v pm2 &>/dev/null; then
  echo "▶  Installing PM2"
  sudo npm install -g pm2
else
  echo "✓  PM2 $(pm2 -v) already installed"
fi

# ── Caddy (official repo) ──────────────────────────────────────
if ! command -v caddy &>/dev/null; then
  echo "▶  Installing Caddy"
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' \
    | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' \
    | sudo tee /etc/apt/sources.list.d/caddy-stable.list > /dev/null
  sudo apt-get update -y
  sudo apt-get install -y caddy
else
  echo "✓  Caddy $(caddy version | awk '{print $1}') already installed"
fi

# ── Versions summary ───────────────────────────────────────────
echo
echo "─── Installed versions ────────────────────────────────"
echo "Node:    $(node -v)"
echo "pnpm:    $(pnpm -v)"
echo "Postgres:$(psql --version | awk '{print $3}')"
echo "PM2:     $(pm2 -v)"
echo "Caddy:   $(caddy version 2>/dev/null | head -1 | awk '{print $1}')"
echo "git:     $(git --version | awk '{print $3}')"
echo "───────────────────────────────────────────────────────"
echo
echo "✅  Dependencies installed."
echo "   Next: bash deploy/scripts/02-setup-postgres.sh"
