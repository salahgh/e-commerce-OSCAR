#!/bin/bash
#
# OSCAR Deployment - Step 5: Deploy Application
# Deploys/updates Vendure backend and Next.js frontend
#
# Usage: sudo ./05-deploy.sh
#

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
HESTIA_USER="oscar"
DOMAIN="oscarfashion.com"
WEB_DIR="/home/${HESTIA_USER}/web/${DOMAIN}"
VENDURE_DIR="${WEB_DIR}/vendure"
FRONTEND_DIR="${WEB_DIR}/frontend"
LOGS_DIR="${WEB_DIR}/logs"

echo ""
echo -e "${BLUE}========================================"
echo "  OSCAR Deployment"
echo "  $(date '+%Y-%m-%d %H:%M:%S')"
echo "========================================${NC}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Please run as root (sudo ./05-deploy.sh)${NC}"
    exit 1
fi

# ============================================
# Pre-flight Checks
# ============================================
echo -e "${GREEN}[0/8] Pre-flight checks...${NC}"

# Check directories exist
if [ ! -d "$VENDURE_DIR" ]; then
    echo -e "${RED}Vendure directory not found: ${VENDURE_DIR}${NC}"
    echo "Please run ./04-create-user.sh first"
    exit 1
fi

if [ ! -d "$FRONTEND_DIR" ]; then
    echo -e "${RED}Frontend directory not found: ${FRONTEND_DIR}${NC}"
    echo "Please run ./04-create-user.sh first"
    exit 1
fi

# Check if code is uploaded
if [ ! -f "$VENDURE_DIR/package.json" ]; then
    echo -e "${RED}Vendure code not found!${NC}"
    echo ""
    echo "Please upload your code first:"
    echo "  scp -r 01-BACKEND-VENDURE/oscar-vendure/* root@YOUR_VPS:${VENDURE_DIR}/"
    echo ""
    exit 1
fi

if [ ! -f "$FRONTEND_DIR/package.json" ]; then
    echo -e "${RED}Frontend code not found!${NC}"
    echo ""
    echo "Please upload your code first:"
    echo "  scp -r 02-FRONTEND/oscar-frontend/* root@YOUR_VPS:${FRONTEND_DIR}/"
    echo ""
    exit 1
fi

# Check .env files
if [ ! -f "$VENDURE_DIR/.env" ]; then
    echo -e "${RED}Vendure .env file not found!${NC}"
    exit 1
fi

echo "Pre-flight checks passed"

# ============================================
# Backup Environment Files
# ============================================
echo ""
echo -e "${GREEN}[1/8] Backing up environment files...${NC}"

mkdir -p /tmp/oscar-backup
[ -f "$VENDURE_DIR/.env" ] && cp "$VENDURE_DIR/.env" /tmp/oscar-backup/.env.vendure.bak
[ -f "$FRONTEND_DIR/.env.production" ] && cp "$FRONTEND_DIR/.env.production" /tmp/oscar-backup/.env.frontend.bak
[ -f "$FRONTEND_DIR/.env.local" ] && cp "$FRONTEND_DIR/.env.local" /tmp/oscar-backup/.env.frontend.local.bak

echo "Environment files backed up"

# ============================================
# Stop Running Services
# ============================================
echo ""
echo -e "${GREEN}[2/8] Stopping running services...${NC}"

pm2 stop vendure 2>/dev/null || true
pm2 stop frontend 2>/dev/null || true
pm2 delete vendure 2>/dev/null || true
pm2 delete frontend 2>/dev/null || true

echo "Services stopped"

# ============================================
# Restore Environment Files (in case overwritten)
# ============================================
echo ""
echo -e "${GREEN}[3/8] Restoring environment files...${NC}"

[ -f /tmp/oscar-backup/.env.vendure.bak ] && cp /tmp/oscar-backup/.env.vendure.bak "$VENDURE_DIR/.env"
[ -f /tmp/oscar-backup/.env.frontend.bak ] && cp /tmp/oscar-backup/.env.frontend.bak "$FRONTEND_DIR/.env.production"
[ -f /tmp/oscar-backup/.env.frontend.local.bak ] && cp /tmp/oscar-backup/.env.frontend.local.bak "$FRONTEND_DIR/.env.local"

echo "Environment files restored"

# ============================================
# Install Vendure Dependencies
# ============================================
echo ""
echo -e "${GREEN}[4/8] Installing Vendure dependencies...${NC}"

cd "$VENDURE_DIR"

# Clean install
rm -rf node_modules package-lock.json 2>/dev/null || true
npm install

echo "Vendure dependencies installed"

# ============================================
# Build Vendure
# ============================================
echo ""
echo -e "${GREEN}[5/8] Building Vendure...${NC}"

npm run build

echo "Vendure built successfully"

# ============================================
# Install Frontend Dependencies
# ============================================
echo ""
echo -e "${GREEN}[6/8] Installing Frontend dependencies...${NC}"

cd "$FRONTEND_DIR"

# Clean install
rm -rf node_modules package-lock.json .next 2>/dev/null || true
npm install

echo "Frontend dependencies installed"

# ============================================
# Build Frontend
# ============================================
echo ""
echo -e "${GREEN}[7/8] Building Frontend...${NC}"

# Generate GraphQL types (may fail if backend not running)
npm run codegen 2>/dev/null || echo "Skipping codegen (will retry after backend starts)"

# Build Next.js
npm run build

echo "Frontend built successfully"

# ============================================
# Start Services with PM2
# ============================================
echo ""
echo -e "${GREEN}[8/8] Starting services...${NC}"

# Ensure logs directory exists
mkdir -p "$LOGS_DIR"
chown -R "${HESTIA_USER}:${HESTIA_USER}" "$LOGS_DIR"

# Start Vendure
cd "$VENDURE_DIR"
pm2 start npm --name "vendure" -- run start \
    --log "${LOGS_DIR}/vendure.log" \
    --time

# Wait for Vendure to be ready
echo "Waiting for Vendure API to be healthy..."
MAX_RETRIES=60
RETRY_COUNT=0
until curl -sf "http://localhost:8085/shop-api?query=%7B__typename%7D" > /dev/null 2>&1; do
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
        echo -e "${RED}ERROR: Vendure failed to start within timeout${NC}"
        echo "Check logs: pm2 logs vendure"
        pm2 logs vendure --lines 50 --nostream
        exit 1
    fi
    echo "  Waiting... ($RETRY_COUNT/$MAX_RETRIES)"
    sleep 2
done
echo -e "${GREEN}Vendure API is healthy!${NC}"

# Start Frontend
cd "$FRONTEND_DIR"
pm2 start npm --name "frontend" -- run start \
    --log "${LOGS_DIR}/frontend.log" \
    --time

# Wait for Frontend to be ready
echo "Waiting for Frontend to be healthy..."
MAX_RETRIES=30
RETRY_COUNT=0
until curl -sf "http://localhost:3000" > /dev/null 2>&1; do
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
        echo -e "${RED}ERROR: Frontend failed to start within timeout${NC}"
        echo "Check logs: pm2 logs frontend"
        pm2 logs frontend --lines 50 --nostream
        exit 1
    fi
    echo "  Waiting... ($RETRY_COUNT/$MAX_RETRIES)"
    sleep 2
done
echo -e "${GREEN}Frontend is healthy!${NC}"

# Save PM2 configuration
pm2 save

# Set correct ownership
chown -R "${HESTIA_USER}:${HESTIA_USER}" "$WEB_DIR"

# ============================================
# Summary
# ============================================
echo ""
echo -e "${BLUE}========================================"
echo "  Deployment Complete!"
echo "========================================${NC}"
echo ""
pm2 status
echo ""
echo "Services:"
echo "  Vendure API:   http://localhost:8085/shop-api"
echo "  Vendure Admin: http://localhost:8086/admin"
echo "  Frontend:      http://localhost:3000"
echo ""
echo "Public URLs (after DNS propagation):"
echo "  Website:       https://${DOMAIN}"
echo "  Admin Panel:   https://${DOMAIN}/admin"
echo "  Shop API:      https://${DOMAIN}/shop-api"
echo ""
echo "Logs:"
echo "  pm2 logs vendure"
echo "  pm2 logs frontend"
echo "  tail -f ${LOGS_DIR}/*.log"
echo ""
echo -e "${GREEN}Deployment finished at $(date '+%Y-%m-%d %H:%M:%S')${NC}"
echo ""
echo -e "${YELLOW}Next step: Configure SSL with ./06-ssl-setup.sh${NC}"
