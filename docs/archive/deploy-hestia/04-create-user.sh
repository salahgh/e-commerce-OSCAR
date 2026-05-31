#!/bin/bash
#
# OSCAR Deployment - Step 4: Create Vendure User & Directory Structure
#
# Usage: sudo ./04-create-user.sh
#

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo -e "${BLUE}========================================"
echo "  OSCAR - Create User & Directory Structure"
echo "========================================${NC}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Please run as root (sudo ./04-create-user.sh)${NC}"
    exit 1
fi

# Configuration
HESTIA_USER="oscar"
DOMAIN="oscarfashion.com"
WEB_DIR="/home/${HESTIA_USER}/web/${DOMAIN}"

# ============================================
# Verify HestiaCP user exists
# ============================================
echo -e "${GREEN}[1/4] Verifying HestiaCP user...${NC}"

if ! id "$HESTIA_USER" &>/dev/null; then
    echo -e "${RED}System user '${HESTIA_USER}' does not exist!${NC}"
    echo "Please run ./02-setup-domain.sh first"
    exit 1
fi

echo -e "${GREEN}User '${HESTIA_USER}' exists${NC}"

# ============================================
# Create Directory Structure
# ============================================
echo ""
echo -e "${GREEN}[2/4] Creating directory structure...${NC}"

# Create main directories
mkdir -p "${WEB_DIR}/vendure"
mkdir -p "${WEB_DIR}/vendure/static/assets"
mkdir -p "${WEB_DIR}/frontend"
mkdir -p "${WEB_DIR}/backoffice"
mkdir -p "${WEB_DIR}/logs"
mkdir -p "${WEB_DIR}/backups"
mkdir -p "${WEB_DIR}/repo"

echo "Created directories:"
echo "  ${WEB_DIR}/vendure"
echo "  ${WEB_DIR}/frontend"
echo "  ${WEB_DIR}/backoffice"
echo "  ${WEB_DIR}/logs"
echo "  ${WEB_DIR}/backups"
echo "  ${WEB_DIR}/repo"

# ============================================
# Create Environment Files
# ============================================
echo ""
echo -e "${GREEN}[3/4] Creating environment file templates...${NC}"

# Read database credentials if available
# Database password
DB_PASSWORD="majmajBS13.."

# Credentials
SUPERADMIN_PASSWORD="majmajBS13.."
COOKIE_SECRET="oscar-production-cookie-secret-2024"

# Vendure .env file
cat > "${WEB_DIR}/vendure/.env" <<EOF
# ===========================================
# OSCAR Vendure - Production Environment
# ===========================================

# Database Configuration (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=oscar_vendure
DB_SCHEMA=public
DB_USERNAME=oscar
DB_PASSWORD=${DB_PASSWORD}

# Server Configuration
PORT=8085
NODE_ENV=production

# Authentication
SUPERADMIN_USERNAME=superadmin
SUPERADMIN_PASSWORD=${SUPERADMIN_PASSWORD}
COOKIE_SECRET=${COOKIE_SECRET}

# CORS - Frontend URLs (adjust as needed)
CORS_ORIGINS=https://oscarfashion.com,https://www.oscarfashion.com

# CIB Payment Gateway (configure with your credentials)
CIB_MERCHANT_ID=
CIB_TERMINAL_ID=
CIB_SECRET_KEY=
CIB_API_URL=https://cib.satim.dz/api/v1
CIB_TEST_MODE=false

# Baridimob Payment Gateway (configure with your credentials)
BARIDIMOB_MERCHANT_ACCOUNT=
BARIDIMOB_API_KEY=
BARIDIMOB_SECRET_KEY=
BARIDIMOB_API_URL=https://api.baridimob.dz/v1
BARIDIMOB_TEST_MODE=false

# Email Configuration (configure with your SMTP)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
EMAIL_FROM="OSCAR Fashion" <noreply@oscarfashion.com>

# Frontend URLs (for emails)
VERIFY_EMAIL_URL=https://oscarfashion.com/verify
PASSWORD_RESET_URL=https://oscarfashion.com/password-reset
CHANGE_EMAIL_URL=https://oscarfashion.com/verify-email-address-change
EOF

# Frontend .env.production file
cat > "${WEB_DIR}/frontend/.env.production" <<EOF
# ===========================================
# OSCAR Frontend - Production Environment
# ===========================================

# API Configuration - Vendure Shop API
NEXT_PUBLIC_GRAPHQL_URL=https://oscarfashion.com/shop-api
NEXT_PUBLIC_GRAPHQL_WS_URL=wss://oscarfashion.com/shop-api
NEXT_PUBLIC_SITE_URL=https://oscarfashion.com

# CDN Configuration
NEXT_PUBLIC_CDN_URL=https://oscarfashion.com/assets
NEXT_PUBLIC_IMAGE_OPTIMIZATION_URL=https://oscarfashion.com/_next/image

# Analytics (Optional - add your IDs)
NEXT_PUBLIC_GA_MEASUREMENT_ID=
NEXT_PUBLIC_FB_PIXEL_ID=

# Feature Flags
NEXT_PUBLIC_ENABLE_REVIEWS=true
NEXT_PUBLIC_ENABLE_WISHLIST=true
NEXT_PUBLIC_ENABLE_COMPARE=false
EOF

# Also create .env.local for frontend (same content)
cp "${WEB_DIR}/frontend/.env.production" "${WEB_DIR}/frontend/.env.local"

# Backoffice .env.production file
cat > "${WEB_DIR}/backoffice/.env.production" <<EOF
# ===========================================
# OSCAR Backoffice - Production Environment
# ===========================================

# API Configuration - Vendure Admin API
VITE_GRAPHQL_URL=https://oscarfashion.com/admin-api
VITE_SITE_URL=https://oscarfashion.com
VITE_CDN_URL=https://oscarfashion.com/assets

# Port (for preview server)
PORT=3002
EOF

echo "Environment files created"

# ============================================
# Set Permissions
# ============================================
echo ""
echo -e "${GREEN}[4/4] Setting permissions...${NC}"

# Set ownership
chown -R "${HESTIA_USER}:${HESTIA_USER}" "${WEB_DIR}"

# Secure env files
chmod 600 "${WEB_DIR}/vendure/.env"
chmod 600 "${WEB_DIR}/frontend/.env.production"
chmod 600 "${WEB_DIR}/frontend/.env.local"
chmod 600 "${WEB_DIR}/backoffice/.env.production"

# Make logs writable
chmod 755 "${WEB_DIR}/logs"

echo "Permissions set"

# ============================================
# Save Admin Credentials
# ============================================
CREDS_FILE="${WEB_DIR}/ADMIN-CREDENTIALS.txt"
cat > "$CREDS_FILE" <<EOF
========================================
OSCAR Admin Credentials
Generated: $(date)
========================================

VENDURE ADMIN PANEL
URL: https://oscarfashion.com/admin
Username: superadmin
Password: ${SUPERADMIN_PASSWORD}

========================================
IMPORTANT:
- Change the password after first login!
- Delete this file after saving credentials!
========================================
EOF

chmod 600 "$CREDS_FILE"
chown "${HESTIA_USER}:${HESTIA_USER}" "$CREDS_FILE"

# ============================================
# Summary
# ============================================
echo ""
echo -e "${BLUE}========================================"
echo "  User & Directory Setup Complete!"
echo "========================================${NC}"
echo ""
echo "Directory structure:"
echo "  ${WEB_DIR}/"
echo "  ├── vendure/        # Vendure backend"
echo "  │   ├── .env        # Environment config"
echo "  │   └── static/     # Assets storage"
echo "  ├── frontend/       # Next.js frontend"
echo "  │   └── .env.*      # Environment configs"
echo "  ├── logs/           # Application logs"
echo "  └── backups/        # Database backups"
echo ""
echo "Vendure Admin:"
echo "  URL: https://oscarfashion.com/admin"
echo "  Username: superadmin"
echo "  Password: ${SUPERADMIN_PASSWORD}"
echo ""
echo -e "${YELLOW}Credentials saved to: ${CREDS_FILE}${NC}"
echo -e "${RED}DELETE THIS FILE AFTER SAVING CREDENTIALS!${NC}"
echo ""
echo -e "${GREEN}Next step: Upload your code and run ./05-deploy.sh${NC}"
echo ""
echo "Upload commands:"
echo "  scp -r 01-BACKEND-VENDURE/oscar-vendure/* saleh@YOUR_VPS:/var/www/oscar/vendure/"
echo "  scp -r 02-FRONTEND/oscar-frontend/* saleh@YOUR_VPS:/var/www/oscar/frontend/"
