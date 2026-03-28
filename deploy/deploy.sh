#!/bin/bash
#
# OSCAR Fashion Deployment Script (Monorepo)
# Deploys Vendure, Next.js Frontend, and Backoffice using PM2
#
# The project is a pnpm + Turborepo monorepo. This script pulls the full repo,
# installs deps at the root, builds via Turborepo, then starts each app with PM2.
#
# Usage: ./deploy.sh [--skip-build] [--vendure-only] [--frontend-only] [--backoffice-only]
#

set -e

# Configuration
PROJECT_ROOT="/var/www/oscar"
REPO_URL="git@github.com:salahgh/e-commerce-OSCAR.git"
REPO_DIR="$PROJECT_ROOT/repo"
LOGS_DIR="$PROJECT_ROOT/logs"

# App directories (inside the monorepo)
VENDURE_DIR="$REPO_DIR/apps/backend"
FRONTEND_DIR="$REPO_DIR/apps/frontend"
BACKOFFICE_DIR="$REPO_DIR/apps/backoffice"

# Options
SKIP_BUILD=false
DEPLOY_VENDURE=true
DEPLOY_FRONTEND=true
DEPLOY_BACKOFFICE=true

# Parse arguments
for arg in "$@"; do
    case $arg in
        --skip-build)
            SKIP_BUILD=true
            ;;
        --vendure-only)
            DEPLOY_VENDURE=true
            DEPLOY_FRONTEND=false
            DEPLOY_BACKOFFICE=false
            ;;
        --frontend-only)
            DEPLOY_VENDURE=false
            DEPLOY_FRONTEND=true
            DEPLOY_BACKOFFICE=false
            ;;
        --backoffice-only)
            DEPLOY_VENDURE=false
            DEPLOY_FRONTEND=false
            DEPLOY_BACKOFFICE=true
            ;;
    esac
done

echo "=============================================="
echo "  OSCAR Fashion Deployment Script (Monorepo)"
echo "=============================================="
echo "  Repo Dir:        $REPO_DIR"
echo "  Skip Build:      $SKIP_BUILD"
echo "  Deploy Vendure:  $DEPLOY_VENDURE"
echo "  Deploy Frontend: $DEPLOY_FRONTEND"
echo "  Deploy Backoffice: $DEPLOY_BACKOFFICE"
echo "=============================================="
echo ""

# ============================================
# Prerequisites Check
# ============================================
echo "Checking prerequisites..."

check_command() {
    local cmd=$1
    local name=$2
    echo -n "  $name: "
    if command -v $cmd &> /dev/null; then
        echo "OK ($($cmd --version 2>/dev/null | head -1 || echo 'installed'))"
        return 0
    else
        echo "NOT FOUND"
        return 1
    fi
}

check_command node "Node.js" || { echo "Run: curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash - && sudo apt install -y nodejs"; exit 1; }
check_command pnpm "pnpm" || { echo "Run: npm install -g pnpm"; exit 1; }
check_command pm2 "PM2" || { echo "Run: npm install -g pm2"; exit 1; }
check_command psql "PostgreSQL" || exit 1
check_command git "Git" || exit 1

# Check database connection
echo -n "  Database: "
if PGPASSWORD="${DB_PASSWORD:-majmajBS13..}" psql -h localhost -U oscar -d oscar_vendure -c "SELECT 1;" &> /dev/null; then
    echo "OK (connected)"
else
    echo "FAILED (check credentials)"
    exit 1
fi

# Check project directory
if [ ! -d "$PROJECT_ROOT" ]; then
    echo ""
    echo "ERROR: Project directory not found at $PROJECT_ROOT"
    echo "Run setup scripts first to initialize the server."
    exit 1
fi

echo ""
echo "All prerequisites passed!"
echo ""

# ============================================
# Backup .env files
# ============================================
echo "Backing up .env files..."
[ -f "$VENDURE_DIR/.env" ] && cp "$VENDURE_DIR/.env" /tmp/.env.vendure.bak && echo "  Vendure .env backed up"
[ -f "$FRONTEND_DIR/.env.production" ] && cp "$FRONTEND_DIR/.env.production" /tmp/.env.frontend.bak && echo "  Frontend .env backed up"
[ -f "$BACKOFFICE_DIR/.env.production" ] && cp "$BACKOFFICE_DIR/.env.production" /tmp/.env.backoffice.bak && echo "  Backoffice .env backed up"

# ============================================
# Pull latest code from GitHub
# ============================================
echo ""
echo "Pulling latest code from GitHub..."

if [ -d "$REPO_DIR/.git" ]; then
    cd "$REPO_DIR"
    git fetch origin main
    git reset --hard origin/main
    echo "  Code updated from main branch"
else
    echo "  Cloning repository..."
    rm -rf "$REPO_DIR"
    git clone -b main "$REPO_URL" "$REPO_DIR"
    echo "  Repository cloned"
fi

# ============================================
# Restore .env files
# ============================================
echo ""
echo "Restoring .env files..."
[ -f /tmp/.env.vendure.bak ] && cp /tmp/.env.vendure.bak "$VENDURE_DIR/.env" && echo "  Vendure .env restored"
[ -f /tmp/.env.frontend.bak ] && cp /tmp/.env.frontend.bak "$FRONTEND_DIR/.env.production" && echo "  Frontend .env restored"
[ -f /tmp/.env.backoffice.bak ] && cp /tmp/.env.backoffice.bak "$BACKOFFICE_DIR/.env.production" && echo "  Backoffice .env restored"

# ============================================
# Check .env files exist
# ============================================
echo ""
echo "Checking .env files..."

if [ "$DEPLOY_VENDURE" = true ] && [ ! -f "$VENDURE_DIR/.env" ]; then
    echo "ERROR: Vendure .env not found!"
    echo "Create it with: nano $VENDURE_DIR/.env"
    exit 1
fi

if [ "$DEPLOY_FRONTEND" = true ] && [ ! -f "$FRONTEND_DIR/.env.production" ]; then
    echo "ERROR: Frontend .env.production not found!"
    echo "Create it with: nano $FRONTEND_DIR/.env.production"
    exit 1
fi

if [ "$DEPLOY_BACKOFFICE" = true ] && [ ! -f "$BACKOFFICE_DIR/.env.production" ]; then
    echo "ERROR: Backoffice .env.production not found!"
    echo "Create it with: nano $BACKOFFICE_DIR/.env.production"
    exit 1
fi

echo "  All required .env files found"

# ============================================
# Install dependencies & Build (monorepo)
# ============================================
if [ "$SKIP_BUILD" = false ]; then
    echo ""
    echo "=============================================="
    echo "  Installing dependencies (pnpm)"
    echo "=============================================="
    cd "$REPO_DIR"
    pnpm install --frozen-lockfile

    echo ""
    echo "=============================================="
    echo "  Building with Turborepo"
    echo "=============================================="

    if [ "$DEPLOY_VENDURE" = true ] && [ "$DEPLOY_FRONTEND" = true ] && [ "$DEPLOY_BACKOFFICE" = true ]; then
        pnpm build
    else
        [ "$DEPLOY_VENDURE" = true ] && pnpm --filter @oscar/backend build
        [ "$DEPLOY_FRONTEND" = true ] && pnpm --filter @oscar/frontend build
        [ "$DEPLOY_BACKOFFICE" = true ] && pnpm --filter @oscar/backoffice build
    fi
else
    echo ""
    echo "Skipping install & build (--skip-build)"
fi

# ============================================
# Health check function with timeout
# ============================================
wait_for_service() {
    local url=$1
    local name=$2
    local max_retries=${3:-30}
    local retry_count=0

    echo "  Waiting for $name to be healthy..."
    until curl -sf "$url" > /dev/null 2>&1; do
        retry_count=$((retry_count + 1))
        if [ $retry_count -ge $max_retries ]; then
            echo "  WARNING: $name health check timed out after $max_retries attempts"
            return 1
        fi
        echo "    Attempt $retry_count/$max_retries..."
        sleep 3
    done
    echo "  $name is healthy!"
    return 0
}

# ============================================
# Deploy Vendure
# ============================================
if [ "$DEPLOY_VENDURE" = true ]; then
    echo ""
    echo "=============================================="
    echo "  Starting Vendure Backend"
    echo "=============================================="

    pm2 delete vendure 2>/dev/null || true
    pm2 start "node $VENDURE_DIR/dist/index.js" --name "vendure" --cwd "$VENDURE_DIR"

    wait_for_service "http://localhost:8085/shop-api?query=%7B__typename%7D" "Vendure API" 30
fi

# ============================================
# Deploy Frontend
# ============================================
if [ "$DEPLOY_FRONTEND" = true ]; then
    echo ""
    echo "=============================================="
    echo "  Starting Next.js Frontend"
    echo "=============================================="

    pm2 delete frontend 2>/dev/null || true
    PORT=3001 pm2 start "npx next start -p 3001" --name "frontend" --cwd "$FRONTEND_DIR"

    wait_for_service "http://localhost:3001" "Frontend" 30
fi

# ============================================
# Deploy Backoffice
# ============================================
if [ "$DEPLOY_BACKOFFICE" = true ]; then
    echo ""
    echo "=============================================="
    echo "  Starting React Backoffice"
    echo "=============================================="

    # Ensure serve is installed
    if ! command -v serve &> /dev/null; then
        echo "  Installing serve globally..."
        npm install -g serve
    fi

    pm2 delete backoffice 2>/dev/null || true
    pm2 start serve --name "backoffice" -- -s "$BACKOFFICE_DIR/dist" -l 3002

    wait_for_service "http://localhost:3002" "Backoffice" 30
fi

# ============================================
# Save PM2 configuration
# ============================================
echo ""
echo "Saving PM2 configuration..."
pm2 save

# ============================================
# Set correct ownership
# ============================================
echo "Setting file ownership..."
sudo chown -R oscar:oscar "$PROJECT_ROOT"

# ============================================
# Summary
# ============================================
echo ""
echo "=============================================="
echo "  Deployment Complete!"
echo "=============================================="
echo ""
echo "Services status:"
pm2 status
echo ""
echo "Useful commands:"
echo "  pm2 logs              - View all logs"
echo "  pm2 logs vendure      - View Vendure logs"
echo "  pm2 logs frontend     - View Frontend logs"
echo "  pm2 logs backoffice   - View Backoffice logs"
echo "  pm2 restart all       - Restart all services"
echo "  pm2 monit             - Monitor processes"
echo ""
echo "URLs (internal):"
echo "  Vendure API:   http://localhost:8085/shop-api"
echo "  Vendure Admin: http://localhost:8085/admin"
echo "  Frontend:      http://localhost:3001"
echo "  Backoffice:    http://localhost:3002"
echo ""
echo "URLs (public via Nginx):"
echo "  Store:         https://oscarfashion.com"
echo "  Admin:         https://oscarfashion.com/admin"
echo "  Backoffice:    https://oscarfashion.com/backoffice"
echo "  Shop API:      https://oscarfashion.com/shop-api"
echo ""
