#!/bin/bash
#
# OSCAR Deployment Script
# Usage: ./deploy.sh
#
# This script deploys/updates the Vendure backend and Next.js frontend
#

set -e

# Configuration
PROJECT_ROOT="/var/www/oscar"
VENDURE_DIR="$PROJECT_ROOT/vendure"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
REPO_URL="https://github.com/your-username/e-commerce-OSCAR.git"  # CHANGE THIS
BRANCH="main"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo -e "${BLUE}========================================"
echo "  OSCAR Deployment"
echo "  $(date '+%Y-%m-%d %H:%M:%S')"
echo "========================================${NC}"
echo ""

# ============================================
# Backup Environment Files
# ============================================
echo -e "${GREEN}[1/10] Backing up environment files...${NC}"
[ -f "$VENDURE_DIR/.env" ] && cp "$VENDURE_DIR/.env" /tmp/.env.vendure.bak
[ -f "$FRONTEND_DIR/.env" ] && cp "$FRONTEND_DIR/.env" /tmp/.env.frontend.bak
[ -f "$FRONTEND_DIR/.env.local" ] && cp "$FRONTEND_DIR/.env.local" /tmp/.env.frontend.local.bak
[ -f "$FRONTEND_DIR/.env.production" ] && cp "$FRONTEND_DIR/.env.production" /tmp/.env.frontend.prod.bak
echo "Environment files backed up"

# ============================================
# Pull Latest Code
# ============================================
echo ""
echo -e "${GREEN}[2/10] Pulling latest code from repository...${NC}"

if [ -d "$PROJECT_ROOT/.git" ]; then
    cd "$PROJECT_ROOT"
    git fetch origin "$BRANCH"
    git reset --hard "origin/$BRANCH"
    echo "Code updated from $BRANCH branch"
else
    echo -e "${YELLOW}Repository not found. Cloning fresh...${NC}"
    cd /var/www
    rm -rf oscar
    git clone -b "$BRANCH" "$REPO_URL" oscar
    echo "Repository cloned"
fi

# Sync code to deployment directories
echo "Syncing Vendure code..."
rsync -av --delete \
    --exclude 'node_modules' \
    --exclude '.env' \
    --exclude 'dist' \
    --exclude 'static/assets' \
    "$PROJECT_ROOT/01-BACKEND-VENDURE/oscar-vendure/" "$VENDURE_DIR/"

echo "Syncing Frontend code..."
rsync -av --delete \
    --exclude 'node_modules' \
    --exclude '.env*' \
    --exclude '.next' \
    --exclude 'out' \
    "$PROJECT_ROOT/02-FRONTEND/oscar-frontend/" "$FRONTEND_DIR/"

# ============================================
# Restore Environment Files
# ============================================
echo ""
echo -e "${GREEN}[3/10] Restoring environment files...${NC}"
[ -f /tmp/.env.vendure.bak ] && cp /tmp/.env.vendure.bak "$VENDURE_DIR/.env"
[ -f /tmp/.env.frontend.bak ] && cp /tmp/.env.frontend.bak "$FRONTEND_DIR/.env"
[ -f /tmp/.env.frontend.local.bak ] && cp /tmp/.env.frontend.local.bak "$FRONTEND_DIR/.env.local"
[ -f /tmp/.env.frontend.prod.bak ] && cp /tmp/.env.frontend.prod.bak "$FRONTEND_DIR/.env.production"

# Check if environment files exist
if [ ! -f "$VENDURE_DIR/.env" ]; then
    echo -e "${RED}ERROR: Vendure .env file not found!${NC}"
    echo "Please create $VENDURE_DIR/.env from the template"
    exit 1
fi

if [ ! -f "$FRONTEND_DIR/.env.production" ] && [ ! -f "$FRONTEND_DIR/.env.local" ]; then
    echo -e "${RED}ERROR: Frontend .env file not found!${NC}"
    echo "Please create $FRONTEND_DIR/.env.production from the template"
    exit 1
fi

echo "Environment files restored"

# ============================================
# Build and Deploy Vendure Backend
# ============================================
echo ""
echo -e "${GREEN}[4/10] Installing Vendure dependencies...${NC}"
cd "$VENDURE_DIR"
npm ci --production=false

echo ""
echo -e "${GREEN}[5/10] Building Vendure...${NC}"
npm run build

echo ""
echo -e "${GREEN}[6/10] Starting Vendure backend...${NC}"
pm2 delete vendure 2>/dev/null || true
pm2 start npm --name "vendure" -- run start
pm2 save

# Wait for Vendure to be healthy
echo "Waiting for Vendure API to be healthy..."
MAX_RETRIES=30
RETRY_COUNT=0
until curl -sf "http://localhost:8085/shop-api?query=%7B__typename%7D" > /dev/null 2>&1; do
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
        echo -e "${RED}ERROR: Vendure failed to start within timeout${NC}"
        pm2 logs vendure --lines 50
        exit 1
    fi
    echo "  Waiting... ($RETRY_COUNT/$MAX_RETRIES)"
    sleep 2
done
echo -e "${GREEN}Vendure API is healthy!${NC}"

# ============================================
# Build and Deploy Next.js Frontend
# ============================================
echo ""
echo -e "${GREEN}[7/10] Installing Frontend dependencies...${NC}"
cd "$FRONTEND_DIR"
npm ci --production=false

echo ""
echo -e "${GREEN}[8/10] Generating GraphQL types...${NC}"
npm run codegen 2>/dev/null || echo "Skipping codegen (schema may need manual fetch)"

echo ""
echo -e "${GREEN}[9/10] Building Next.js frontend...${NC}"
npm run build

echo ""
echo -e "${GREEN}[10/10] Starting Next.js frontend...${NC}"
pm2 delete frontend 2>/dev/null || true
pm2 start npm --name "frontend" -- run start
pm2 save

# Wait for Next.js to be healthy
echo "Waiting for Frontend to be healthy..."
MAX_RETRIES=20
RETRY_COUNT=0
until curl -sf "http://localhost:3000" > /dev/null 2>&1; do
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
        echo -e "${RED}ERROR: Frontend failed to start within timeout${NC}"
        pm2 logs frontend --lines 50
        exit 1
    fi
    echo "  Waiting... ($RETRY_COUNT/$MAX_RETRIES)"
    sleep 2
done
echo -e "${GREEN}Frontend is healthy!${NC}"

# ============================================
# Configure PM2 to start on boot
# ============================================
pm2 startup systemd -u root --hp /root 2>/dev/null || true
pm2 save

# ============================================
# Final Status
# ============================================
echo ""
echo -e "${BLUE}========================================"
echo "  Deployment Complete!"
echo "========================================${NC}"
echo ""
pm2 status
echo ""
echo "Services:"
echo "  - Vendure API: http://localhost:8085/shop-api"
echo "  - Vendure Admin: http://localhost:8086/admin"
echo "  - Frontend: http://localhost:3000"
echo ""
echo "Logs:"
echo "  - pm2 logs vendure"
echo "  - pm2 logs frontend"
echo ""
echo -e "${GREEN}Deployment finished at $(date '+%Y-%m-%d %H:%M:%S')${NC}"
