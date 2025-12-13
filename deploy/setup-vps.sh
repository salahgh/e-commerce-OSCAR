#!/bin/bash
#
# OSCAR VPS Initial Setup Script
# Run this script ONCE on a fresh VPS
# Usage: chmod +x setup-vps.sh && ./setup-vps.sh
#
# Tested on: Ubuntu 22.04 LTS, Debian 11/12
#

set -e

echo "========================================"
echo "  OSCAR VPS Setup - Initial Configuration"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Please run as root (sudo ./setup-vps.sh)${NC}"
    exit 1
fi

# Configuration - CHANGE THESE VALUES
PROJECT_ROOT="/var/www/oscar"
DOMAIN="your-domain.com"            # Change to your domain
DB_NAME="oscar_vendure"
DB_USER="oscar"
DB_PASSWORD="oscar_secure_password_123"  # CHANGE THIS!
SUPERADMIN_PASSWORD="superadmin123"      # CHANGE THIS!
COOKIE_SECRET="oscar-production-cookie-secret-$(openssl rand -hex 16)"

# Export for use in subscripts
export PROJECT_ROOT DOMAIN DB_NAME DB_USER DB_PASSWORD SUPERADMIN_PASSWORD COOKIE_SECRET

echo ""
echo -e "${YELLOW}Configuration:${NC}"
echo "  Project Root: $PROJECT_ROOT"
echo "  Domain: $DOMAIN"
echo "  Database: $DB_NAME"
echo "  DB User: $DB_USER"
echo ""

# Prompt to continue
read -p "Continue with this configuration? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 1
fi

# ============================================
# 1. System Update
# ============================================
echo ""
echo -e "${GREEN}[1/8] Updating system packages...${NC}"
apt update && apt upgrade -y

# ============================================
# 2. Install Essential Packages
# ============================================
echo ""
echo -e "${GREEN}[2/8] Installing essential packages...${NC}"
apt install -y \
    curl \
    wget \
    git \
    build-essential \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release \
    ufw \
    fail2ban \
    htop \
    unzip

# ============================================
# 3. Install Node.js 20 LTS
# ============================================
echo ""
echo -e "${GREEN}[3/8] Installing Node.js 20 LTS...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
    echo "Node.js version: $(node -v)"
    echo "npm version: $(npm -v)"
else
    echo "Node.js already installed: $(node -v)"
fi

# Install PM2 globally
npm install -g pm2

# ============================================
# 4. Install MariaDB
# ============================================
echo ""
echo -e "${GREEN}[4/8] Installing MariaDB...${NC}"
if ! command -v mariadb &> /dev/null; then
    apt install -y mariadb-server mariadb-client

    # Start and enable MariaDB
    systemctl start mariadb
    systemctl enable mariadb

    echo "MariaDB installed successfully"
else
    echo "MariaDB already installed"
fi

# ============================================
# 5. Configure MariaDB for OSCAR
# ============================================
echo ""
echo -e "${GREEN}[5/8] Configuring MariaDB database...${NC}"

# Note: Vendure uses PostgreSQL natively, but can work with MariaDB/MySQL
# We'll set up MariaDB and provide instructions for either option

# Create database and user
mariadb -u root <<EOF
-- Drop existing database and user if they exist
DROP DATABASE IF EXISTS ${DB_NAME};
DROP USER IF EXISTS '${DB_USER}'@'localhost';

-- Create new database
CREATE DATABASE ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user with password
CREATE USER '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';

-- Grant privileges
GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';
FLUSH PRIVILEGES;
EOF

echo "Database '${DB_NAME}' created with user '${DB_USER}'"

# ============================================
# ALTERNATIVE: Install PostgreSQL (Recommended for Vendure)
# ============================================
# Uncomment the following section if you prefer PostgreSQL:

# echo ""
# echo -e "${GREEN}[5/8] Installing PostgreSQL...${NC}"
# apt install -y postgresql postgresql-contrib
#
# systemctl start postgresql
# systemctl enable postgresql
#
# # Create database and user
# sudo -u postgres psql <<EOF
# DROP DATABASE IF EXISTS ${DB_NAME};
# DROP USER IF EXISTS ${DB_USER};
# CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASSWORD}';
# CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};
# GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};
# \q
# EOF

# ============================================
# 6. Install Nginx
# ============================================
echo ""
echo -e "${GREEN}[6/8] Installing Nginx...${NC}"
apt install -y nginx

systemctl start nginx
systemctl enable nginx

# ============================================
# 7. Configure Firewall
# ============================================
echo ""
echo -e "${GREEN}[7/8] Configuring firewall...${NC}"
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 'Nginx Full'
ufw --force enable

echo "Firewall configured"

# ============================================
# 8. Create Project Directory Structure
# ============================================
echo ""
echo -e "${GREEN}[8/8] Creating project directory structure...${NC}"

mkdir -p "$PROJECT_ROOT"
mkdir -p "$PROJECT_ROOT/vendure"
mkdir -p "$PROJECT_ROOT/frontend"
mkdir -p "$PROJECT_ROOT/logs"
mkdir -p "$PROJECT_ROOT/backups"

# Set proper ownership (assuming www-data for nginx)
chown -R www-data:www-data "$PROJECT_ROOT"
chmod -R 755 "$PROJECT_ROOT"

echo "Project directories created at $PROJECT_ROOT"

# ============================================
# Create Environment Files Templates
# ============================================
echo ""
echo -e "${GREEN}Creating environment file templates...${NC}"

# Vendure .env template
cat > "$PROJECT_ROOT/vendure/.env.template" <<EOF
# Database Configuration (MariaDB)
# NOTE: For MariaDB, change type to 'mysql' in vendure-config.ts
DB_HOST=localhost
DB_PORT=3306
DB_NAME=${DB_NAME}
DB_SCHEMA=public
DB_USERNAME=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}

# For PostgreSQL (recommended), use:
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=${DB_NAME}
# DB_SCHEMA=public
# DB_USERNAME=${DB_USER}
# DB_PASSWORD=${DB_PASSWORD}

# Server Configuration
PORT=8085
NODE_ENV=production

# Authentication
SUPERADMIN_USERNAME=superadmin
SUPERADMIN_PASSWORD=${SUPERADMIN_PASSWORD}
COOKIE_SECRET=${COOKIE_SECRET}

# CIB Payment Gateway
CIB_MERCHANT_ID=your_cib_merchant_id
CIB_TERMINAL_ID=your_cib_terminal_id
CIB_SECRET_KEY=your_cib_secret_key
CIB_API_URL=https://cib.satim.dz/api/v1
CIB_TEST_MODE=false

# Baridimob Payment Gateway
BARIDIMOB_MERCHANT_ACCOUNT=your_baridimob_account
BARIDIMOB_API_KEY=your_baridimob_api_key
BARIDIMOB_SECRET_KEY=your_baridimob_secret_key
BARIDIMOB_API_URL=https://api.baridimob.dz/v1
BARIDIMOB_TEST_MODE=false

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
EOF

# Frontend .env template
cat > "$PROJECT_ROOT/frontend/.env.template" <<EOF
# API Configuration - Vendure Shop API
NEXT_PUBLIC_GRAPHQL_URL=https://${DOMAIN}/shop-api
NEXT_PUBLIC_GRAPHQL_WS_URL=wss://${DOMAIN}/shop-api
NEXT_PUBLIC_SITE_URL=https://${DOMAIN}

# CDN Configuration
NEXT_PUBLIC_CDN_URL=https://${DOMAIN}/assets
NEXT_PUBLIC_IMAGE_OPTIMIZATION_URL=https://${DOMAIN}/_next/image

# Analytics (Optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=
NEXT_PUBLIC_FB_PIXEL_ID=

# Feature Flags
NEXT_PUBLIC_ENABLE_REVIEWS=true
NEXT_PUBLIC_ENABLE_WISHLIST=true
NEXT_PUBLIC_ENABLE_COMPARE=false
EOF

echo "Environment templates created"

# ============================================
# Create Nginx Configuration
# ============================================
echo ""
echo -e "${GREEN}Creating Nginx configuration...${NC}"

cat > "/etc/nginx/sites-available/oscar" <<EOF
# OSCAR Fashion - Nginx Configuration

# Vendure Admin UI (optional, can be removed in production)
upstream vendure_admin {
    server 127.0.0.1:8086;
    keepalive 64;
}

# Vendure API
upstream vendure_api {
    server 127.0.0.1:8085;
    keepalive 64;
}

# Next.js Frontend
upstream nextjs {
    server 127.0.0.1:3000;
    keepalive 64;
}

server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN} www.${DOMAIN};

    # Redirect HTTP to HTTPS (uncomment after SSL setup)
    # return 301 https://\$server_name\$request_uri;

    # Logging
    access_log /var/log/nginx/oscar.access.log;
    error_log /var/log/nginx/oscar.error.log;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Vendure Admin API
    location /admin-api {
        proxy_pass http://vendure_api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 60s;
    }

    # Vendure Shop API
    location /shop-api {
        proxy_pass http://vendure_api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 60s;
    }

    # Vendure Admin UI (remove in production if not needed)
    location /admin {
        proxy_pass http://vendure_admin;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Vendure Assets
    location /assets {
        proxy_pass http://vendure_api;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;

        # Cache static assets
        proxy_cache_valid 200 7d;
        expires 7d;
        add_header Cache-Control "public, immutable";
    }

    # Next.js Frontend (all other routes)
    location / {
        proxy_pass http://nextjs;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Next.js static files
    location /_next/static {
        proxy_pass http://nextjs;
        proxy_cache_valid 200 365d;
        expires 365d;
        add_header Cache-Control "public, immutable";
    }

    # Favicon and robots.txt
    location = /favicon.ico {
        proxy_pass http://nextjs;
        log_not_found off;
        access_log off;
    }

    location = /robots.txt {
        proxy_pass http://nextjs;
        log_not_found off;
        access_log off;
    }

    # Client body size for file uploads
    client_max_body_size 50M;
}

# HTTPS Server (uncomment after obtaining SSL certificate)
# server {
#     listen 443 ssl http2;
#     listen [::]:443 ssl http2;
#     server_name ${DOMAIN} www.${DOMAIN};
#
#     # SSL Certificate (Let's Encrypt)
#     ssl_certificate /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
#     ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;
#     ssl_session_timeout 1d;
#     ssl_session_cache shared:SSL:50m;
#     ssl_session_tickets off;
#
#     # Modern SSL configuration
#     ssl_protocols TLSv1.2 TLSv1.3;
#     ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
#     ssl_prefer_server_ciphers off;
#
#     # HSTS
#     add_header Strict-Transport-Security "max-age=63072000" always;
#
#     # ... (copy all location blocks from HTTP server above)
# }
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/oscar /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Reload Nginx
systemctl reload nginx

echo "Nginx configured"

# ============================================
# Install Certbot for SSL (optional)
# ============================================
echo ""
echo -e "${GREEN}Installing Certbot for SSL certificates...${NC}"
apt install -y certbot python3-certbot-nginx

echo ""
echo -e "${GREEN}========================================"
echo "  VPS Setup Complete!"
echo "========================================${NC}"
echo ""
echo "Next steps:"
echo ""
echo "1. Edit the environment files:"
echo "   - $PROJECT_ROOT/vendure/.env.template -> .env"
echo "   - $PROJECT_ROOT/frontend/.env.template -> .env"
echo ""
echo "2. Upload your project code to:"
echo "   - Vendure: $PROJECT_ROOT/vendure"
echo "   - Frontend: $PROJECT_ROOT/frontend"
echo ""
echo "3. Run the deployment script:"
echo "   ./deploy.sh"
echo ""
echo "4. Set up SSL certificate (after DNS is configured):"
echo "   sudo certbot --nginx -d ${DOMAIN} -d www.${DOMAIN}"
echo ""
echo "Database credentials:"
echo "   Database: ${DB_NAME}"
echo "   Username: ${DB_USER}"
echo "   Password: ${DB_PASSWORD}"
echo ""
echo -e "${YELLOW}IMPORTANT: Change the default passwords in production!${NC}"
echo ""
