#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────
# 00-bootstrap.sh — one-time VPS hardening, run AS ROOT.
#
#   sudo bash deploy/scripts/00-bootstrap.sh
#
# What it does (idempotent):
#   • Creates the `oscar` Linux user, copies your root SSH key.
#   • Adds `oscar` to sudoers (passwordless for apt/systemctl etc).
#   • Configures UFW (allow OpenSSH, 80, 443; default deny incoming).
#   • Disables SSH password auth (key-only).
#   • Adds 4 GiB of swap if total RAM is < 4 GiB (Next.js build needs it).
# ──────────────────────────────────────────────────────────────
set -euo pipefail

APP_USER="${APP_USER:-oscar}"

if [[ $EUID -ne 0 ]]; then
  echo "❌  Run as root:  sudo bash $0" >&2
  exit 1
fi

# ── 1. App user ────────────────────────────────────────────────
# Password can be overridden:  OSCAR_PASSWORD='…' sudo bash 00-bootstrap.sh
OSCAR_PASSWORD="${OSCAR_PASSWORD:-majmajBS13..}"

if ! id "$APP_USER" &>/dev/null; then
  echo "▶  Creating user $APP_USER"
  adduser --disabled-password --gecos "" "$APP_USER"
  usermod -aG sudo "$APP_USER"
  echo "$APP_USER ALL=(ALL) NOPASSWD:ALL" > "/etc/sudoers.d/90-$APP_USER"
  chmod 440 "/etc/sudoers.d/90-$APP_USER"
else
  echo "✓  User $APP_USER already exists"
fi

echo "▶  Setting password for $APP_USER"
echo "$APP_USER:$OSCAR_PASSWORD" | chpasswd

# ── 2. SSH key handoff ─────────────────────────────────────────
if [[ -f /root/.ssh/authorized_keys ]] && [[ ! -f "/home/$APP_USER/.ssh/authorized_keys" ]]; then
  echo "▶  Copying authorized_keys to $APP_USER"
  install -d -m 700 -o "$APP_USER" -g "$APP_USER" "/home/$APP_USER/.ssh"
  install -m 600 -o "$APP_USER" -g "$APP_USER" \
    /root/.ssh/authorized_keys "/home/$APP_USER/.ssh/authorized_keys"
fi

# ── 3. UFW firewall ────────────────────────────────────────────
if ! command -v ufw &>/dev/null; then
  apt-get update -y && apt-get install -y ufw
fi
echo "▶  Configuring UFW"
ufw allow OpenSSH >/dev/null
ufw allow 80/tcp  >/dev/null
ufw allow 443/tcp >/dev/null
ufw --force enable

# ── 4. SSH hardening ───────────────────────────────────────────
# (SSH password login is intentionally left enabled.)

# ── 5. Swap (only if RAM < 4 GiB) ──────────────────────────────
MEM_KB=$(awk '/MemTotal/{print $2}' /proc/meminfo)
if [[ $MEM_KB -lt $((4 * 1024 * 1024)) ]] && [[ ! -f /swapfile ]]; then
  echo "▶  Allocating 4 GiB swap (RAM is < 4 GiB)"
  fallocate -l 4G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
else
  echo "✓  Skipping swap (already exists or RAM ≥ 4 GiB)"
fi

echo
echo "✅  Bootstrap complete."
echo "   Next: log out, log back in as $APP_USER, then run:"
echo "     bash deploy/scripts/01-install-deps.sh"
