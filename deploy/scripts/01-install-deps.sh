#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────
# 01-install-deps.sh — install system dependencies, idempotent.
# Run as the `oscar` user (which must have passwordless sudo):
#
#   bash deploy/scripts/01-install-deps.sh
#
# Idempotent: anything already installed at the right version is
# skipped — the script just reports what's there. Re-run any time.
#
# Optional flags:
#   FORCE_NODE=1   Replace a non-v20 Node install with Node 20 LTS.
#                  (Default: warn and leave existing Node alone.)
#
# Targets:
#   • Node 20 LTS (NodeSource)
#   • pnpm 10.29.3 (via corepack)
#   • PostgreSQL (Ubuntu default)
#   • Caddy (official stable repo)
#   • PM2 (global npm)
#   • git, build-essential
# ──────────────────────────────────────────────────────────────
set -euo pipefail

if [[ $EUID -eq 0 ]]; then
  echo "❌  Don't run as root. Run as the app user (e.g. oscar)." >&2
  exit 1
fi

PNPM_VERSION="10.29.3"
FORCE_NODE="${FORCE_NODE:-0}"

have()       { command -v "$1" &>/dev/null; }
svc_active() { systemctl is-active --quiet "$1" 2>/dev/null; }

# ── Preflight survey ──────────────────────────────────────────
echo "─────────── Preflight: existing dependencies ───────────"
if have node;     then printf '✓  %-9s %s\n' "node"     "$(node -v)"; else printf '·  %-9s %s\n' "node"     "(not installed)"; fi
if have pnpm;     then printf '✓  %-9s %s\n' "pnpm"     "$(pnpm -v)"; else printf '·  %-9s %s\n' "pnpm"     "(not installed)"; fi
if have corepack; then printf '✓  %-9s %s\n' "corepack" "$(corepack -v 2>/dev/null || echo '?')"; else printf '·  %-9s %s\n' "corepack" "(not installed)"; fi
if have psql; then
  printf '✓  %-9s %s  [systemd: %s]\n' "psql" "$(psql --version | awk '{print $3}')" "$(systemctl is-active postgresql 2>/dev/null || echo inactive)"
else
  printf '·  %-9s %s\n' "psql" "(not installed)"
fi
if have pm2;   then printf '✓  %-9s %s\n' "pm2" "$(pm2 -v)"; else printf '·  %-9s %s\n' "pm2" "(not installed)"; fi
if have caddy; then
  printf '✓  %-9s %s  [systemd: %s]\n' "caddy" "$(caddy version 2>/dev/null | head -1 | awk '{print $1}')" "$(systemctl is-active caddy 2>/dev/null || echo inactive)"
else
  printf '·  %-9s %s\n' "caddy" "(not installed)"
fi
if have git;  then printf '✓  %-9s %s\n' "git"  "$(git --version | awk '{print $3}')"; else printf '·  %-9s %s\n' "git"  "(not installed)"; fi
echo "────────────────────────────────────────────────────────"
echo

# ── apt cache + base packages (apt-get install is idempotent) ──
echo "▶  apt update"
sudo apt-get update -y

echo "▶  Base packages (curl, gpg, git, build tools — apt skips installed)"
sudo apt-get install -y \
  curl ca-certificates gnupg lsb-release \
  git build-essential \
  debian-keyring debian-archive-keyring apt-transport-https

# ── Node 20 LTS ────────────────────────────────────────────────
if ! have node; then
  echo "▶  Installing Node 20 LTS (none detected)"
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
elif [[ "$(node -v)" == v20.* ]]; then
  echo "✓  Node $(node -v) already at v20 — skipping"
elif [[ "$FORCE_NODE" == "1" ]]; then
  echo "▶  Node $(node -v) ≠ v20 and FORCE_NODE=1 — replacing with v20 LTS"
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
else
  echo "⚠   Node $(node -v) is installed, but this project targets Node 20 LTS."
  echo "    Leaving it alone. If pnpm install fails later, rerun with:"
  echo "      FORCE_NODE=1 bash deploy/scripts/01-install-deps.sh"
fi

# ── pnpm via corepack ──────────────────────────────────────────
if have pnpm && [[ "$(pnpm -v)" == "$PNPM_VERSION" ]]; then
  echo "✓  pnpm $PNPM_VERSION already active — skipping"
else
  if have pnpm; then
    echo "▶  pnpm $(pnpm -v) → switching to $PNPM_VERSION via corepack"
  else
    echo "▶  Activating pnpm@$PNPM_VERSION via corepack"
  fi
  sudo corepack enable
  sudo corepack prepare "pnpm@${PNPM_VERSION}" --activate
fi

# ── PostgreSQL ─────────────────────────────────────────────────
if have psql; then
  echo "✓  PostgreSQL $(psql --version | awk '{print $3}') already installed"
  if ! svc_active postgresql; then
    echo "▶  Starting + enabling postgresql"
    sudo systemctl enable --now postgresql
  else
    echo "✓  postgresql service is active"
  fi
else
  echo "▶  Installing PostgreSQL"
  sudo apt-get install -y postgresql postgresql-contrib
  sudo systemctl enable --now postgresql
fi

# ── PM2 (global) ───────────────────────────────────────────────
if have pm2; then
  echo "✓  PM2 $(pm2 -v) already installed — skipping"
else
  echo "▶  Installing PM2 globally"
  sudo npm install -g pm2
fi

# ── Caddy (official stable repo) ───────────────────────────────
if have caddy; then
  echo "✓  Caddy $(caddy version 2>/dev/null | head -1 | awk '{print $1}') already installed"
  if ! svc_active caddy; then
    echo "▶  Starting + enabling caddy"
    sudo systemctl enable --now caddy
  else
    echo "✓  caddy service is active"
  fi
else
  echo "▶  Installing Caddy"
  if [[ ! -f /usr/share/keyrings/caddy-stable-archive-keyring.gpg ]]; then
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' \
      | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  fi
  if [[ ! -f /etc/apt/sources.list.d/caddy-stable.list ]]; then
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' \
      | sudo tee /etc/apt/sources.list.d/caddy-stable.list >/dev/null
  fi
  sudo apt-get update -y
  sudo apt-get install -y caddy
fi

# ── Final summary ──────────────────────────────────────────────
echo
echo "─────────────── Installed versions ─────────────────────"
printf '%-9s %s\n' "Node:"     "$(node -v 2>/dev/null || echo MISSING)"
printf '%-9s %s\n' "pnpm:"     "$(pnpm -v 2>/dev/null || echo MISSING)"
printf '%-9s %s\n' "Postgres:" "$(psql --version 2>/dev/null | awk '{print $3}' || echo MISSING)"
printf '%-9s %s\n' "PM2:"      "$(pm2 -v 2>/dev/null || echo MISSING)"
printf '%-9s %s\n' "Caddy:"    "$(caddy version 2>/dev/null | head -1 | awk '{print $1}' || echo MISSING)"
printf '%-9s %s\n' "git:"      "$(git --version 2>/dev/null | awk '{print $3}' || echo MISSING)"
echo "────────────────────────────────────────────────────────"
echo
echo "✅  Dependencies ready."
echo "   Next: bash deploy/scripts/02-setup-postgres.sh"
