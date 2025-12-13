#!/bin/bash
#
# OSCAR Fashion Deployment Script
# Deploys Vendure, Next.js Frontend, and Backoffice using PM2
#
# Usage: ./deploy.sh [--skip-build] [--vendure-only] [--frontend-only] [--backoffice-only]
#
# Options:
#   --skip-build       Skip npm install and build steps (faster redeploy)
#   --vendure-only     Deploy only Vendure backend
#   --frontend-only    Deploy only Next.js frontend
#   --backoffice-only  Deploy only React backoffice
#

set -e

# Configuration
PROJECT_ROOT="/var/www/oscar"
REPO_URL="git@github.com:salahgh/e-commerce-OSCAR.git"
REPO_DIR="$PROJECT_ROOT/repo"
VENDURE_DIR="$PROJECT_ROOT/vendure"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
BACKOFFICE_DIR="$PROJECT_ROOT/backoffice"
LOGS_DIR="$PROJECT_ROOT/logs"

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
echo "  OSCAR Fashion Deployment Script"
echo "=============================================="
echo "  Project Root: $PROJECT_ROOT"
echo "  Skip Build: $SKIP_BUILD"
echo "  Deploy Vendure: $DEPLOY_VENDURE"
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
check_command npm "npm" || exit 1
check_command pm2 "PM2" || { echo "Run: sudo npm install -g pm2"; exit 1; }
check_command psql "PostgreSQL" || exit 1
check_command git "Git" || exit 1
check_command rsync "rsync" || exit 1

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
# Sync code to deployment directories
# ============================================
echo ""
echo "Syncing code to deployment directories..."

if [ "$DEPLOY_VENDURE" = true ]; then
    echo "  Syncing Vendure..."
    rsync -av --delete \
        --exclude 'node_modules' \
        --exclude '.env' \
        --exclude 'dist' \
        --exclude 'static/assets' \
        "$REPO_DIR/01-BACKEND-VENDURE/oscar-vendure/" "$VENDURE_DIR/"
fi

if [ "$DEPLOY_FRONTEND" = true ]; then
    echo "  Syncing Frontend..."
    rsync -av --delete \
        --exclude 'node_modules' \
        --exclude '.env*' \
        --exclude '.next' \
        --exclude 'out' \
        "$REPO_DIR/02-FRONTEND/oscar-frontend/" "$FRONTEND_DIR/"
fi

if [ "$DEPLOY_BACKOFFICE" = true ]; then
    echo "  Syncing Backoffice..."
    rsync -av --delete \
        --exclude 'node_modules' \
        --exclude '.env*' \
        --exclude 'dist' \
        "$REPO_DIR/03-BACKOFFICE/oscar-backoffice/" "$BACKOFFICE_DIR/"
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
    echo "  Deploying Vendure Backend"
    echo "=============================================="
    cd "$VENDURE_DIR"

    if [ "$SKIP_BUILD" = false ]; then
        echo "  Installing dependencies..."
        npm ci --production=false

        echo "  Building Vendure..."
        npm run build
    else
        echo "  Skipping build (--skip-build)"
    fi

    echo "  Starting Vendure with PM2..."
    pm2 delete vendure 2>/dev/null || true
    pm2 start npm --name "vendure" -- run start

    wait_for_service "http://localhost:8085/shop-api?query=%7B__typename%7D" "Vendure API" 30
fi

# ============================================
# Deploy Frontend
# ============================================
if [ "$DEPLOY_FRONTEND" = true ]; then
    echo ""
    echo "=============================================="
    echo "  Deploying Next.js Frontend"
    echo "=============================================="
    cd "$FRONTEND_DIR"

    if [ "$SKIP_BUILD" = false ]; then
        echo "  Installing dependencies..."
        npm ci --production=false

        echo "  Building Next.js..."
        npm run build
    else
        echo "  Skipping build (--skip-build)"
    fi

    echo "  Starting Frontend with PM2..."
    pm2 delete frontend 2>/dev/null || true
    PORT=3001 pm2 start npm --name "frontend" -- run start

    wait_for_service "http://localhost:3001" "Frontend" 30
fi

# ============================================
# Deploy Backoffice
# ============================================
if [ "$DEPLOY_BACKOFFICE" = true ]; then
    echo ""
    echo "=============================================="
    echo "  Deploying React Backoffice"
    echo "=============================================="
    cd "$BACKOFFICE_DIR"

    if [ "$SKIP_BUILD" = false ]; then
        echo "  Installing dependencies..."
        npm ci --production=false

        echo "  Building Backoffice..."
        npm run build
    else
        echo "  Skipping build (--skip-build)"
    fi

    # Ensure serve is installed
    if ! command -v serve &> /dev/null; then
        echo "  Installing serve globally..."
        npm install -g serve
    fi

    echo "  Starting Backoffice with PM2 (production)..."
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
