#!/bin/bash
#
# OSCAR VPS Initial Setup Script (PostgreSQL Version - RECOMMENDED)
# Run this script ONCE on a fresh VPS
# Usage: chmod +x setup-vps-postgres.sh && sudo ./setup-vps-postgres.sh
#
# Tested on: Ubuntu 22.04 LTS, Debian 11/12
#

set -e

echo "========================================"
echo "  OSCAR VPS Setup (PostgreSQL)"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Please run as root (sudo ./setup-vps-postgres.sh)${NC}"
    exit 1
fi

# =============================================
# CONFIGURATION - CHANGE THESE VALUES!
# =============================================
PROJECT_ROOT="/var/www/oscar"
DOMAIN="your-domain.com"            # Change to your domain
DB_NAME="oscar_vendure"
DB_USER="oscar"
DB_PASSWORD="$(openssl rand -base64 24)"  # Random secure password
SUPERADMIN_PASSWORD="$(openssl rand -base64 16)"
COOKIE_SECRET="$(openssl rand -hex 32)"

# Export for use in subscripts
export PROJECT_ROOT DOMAIN DB_NAME DB_USER DB_PASSWORD SUPERADMIN_PASSWORD COOKIE_SECRET

echo ""
echo -e "${YELLOW}Configuration:${NC}"
echo "  Project Root: $PROJECT_ROOT"
echo "  Domain: $DOMAIN"
echo "  Database: $DB_NAME"
echo "  DB User: $DB_USER"
echo "  DB Password: $DB_PASSWORD"
echo "  Superadmin Password: $SUPERADMIN_PASSWORD"
echo ""
echo -e "${YELLOW}SAVE THESE CREDENTIALS SOMEWHERE SAFE!${NC}"
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
echo -e "${GREEN}[1/9] Updating system packages...${NC}"
apt update && apt upgrade -y

# ============================================
# 2. Install Essential Packages
# ============================================
echo ""
echo -e "${GREEN}[2/9] Installing essential packages...${NC}"
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
    unzip \
    rsync

# ============================================
# 3. Install Node.js 20 LTS
# ============================================
echo ""
echo -e "${GREEN}[3/9] Installing Node.js 20 LTS...${NC}"
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
# 4. Install PostgreSQL
# ============================================
echo ""
echo -e "${GREEN}[4/9] Installing PostgreSQL...${NC}"
if ! command -v psql &> /dev/null; then
    # Install PostgreSQL
    apt install -y postgresql postgresql-contrib

    # Start and enable PostgreSQL
    systemctl start postgresql
    systemctl enable postgresql

    echo "PostgreSQL installed successfully"
else
    echo "PostgreSQL already installed"
fi

# ============================================
# 5. Configure PostgreSQL for OSCAR
# ============================================
echo ""
echo -e "${GREEN}[5/9] Configuring PostgreSQL database...${NC}"

# Create database and user
sudo -u postgres psql <<EOF
-- Drop existing database and user if they exist (be careful in production!)
DROP DATABASE IF EXISTS ${DB_NAME};
DROP USER IF EXISTS ${DB_USER};

-- Create user with password
CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASSWORD}';

-- Create database
CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};

-- Connect to the database and set up schema permissions
\c ${DB_NAME}
GRANT ALL ON SCHEMA public TO ${DB_USER};
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ${DB_USER};
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ${DB_USER};
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO ${DB_USER};
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO ${DB_USER};
EOF

echo "Database '${DB_NAME}' created with user '${DB_USER}'"

# ============================================
# 6. Install Nginx
# ============================================
echo ""
echo -e "${GREEN}[6/9] Installing Nginx...${NC}"
apt install -y nginx

systemctl start nginx
systemctl enable nginx

# ============================================
# 7. Configure Firewall
# ============================================
echo ""
echo -e "${GREEN}[7/9] Configuring firewall...${NC}"
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
echo -e "${GREEN}[8/9] Creating project directory structure...${NC}"

mkdir -p "$PROJECT_ROOT"
mkdir -p "$PROJECT_ROOT/vendure"
mkdir -p "$PROJECT_ROOT/vendure/static/assets"
mkdir -p "$PROJECT_ROOT/frontend"
mkdir -p "$PROJECT_ROOT/logs"
mkdir -p "$PROJECT_ROOT/backups"

# ============================================
# Create Environment Files
# ============================================
echo ""
echo -e "${GREEN}[9/9] Creating environment files...${NC}"

# Vendure .env file (production ready)
cat > "$PROJECT_ROOT/vendure/.env" <<EOF
# Database Configuration (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=${DB_NAME}
DB_SCHEMA=public
DB_USERNAME=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}

# Server Configuration
PORT=8085
NODE_ENV=production

# Authentication
SUPERADMIN_USERNAME=superadmin
SUPERADMIN_PASSWORD=${SUPERADMIN_PASSWORD}
COOKIE_SECRET=${COOKIE_SECRET}

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
EOF

# Frontend .env.production file
cat > "$PROJECT_ROOT/frontend/.env.production" <<EOF
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

# Set proper ownership
chown -R www-data:www-data "$PROJECT_ROOT"
chmod -R 755 "$PROJECT_ROOT"
chmod 600 "$PROJECT_ROOT/vendure/.env"
chmod 600 "$PROJECT_ROOT/frontend/.env.production"

echo "Environment files created with secure permissions"

# ============================================
# Create Nginx Configuration
# ============================================
echo ""
echo -e "${GREEN}Creating Nginx configuration...${NC}"

cat > "/etc/nginx/sites-available/oscar" <<'NGINX_EOF'
# OSCAR Fashion - Nginx Configuration

# Vendure Admin UI
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
    server_name DOMAIN_PLACEHOLDER www.DOMAIN_PLACEHOLDER;

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
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
        proxy_buffering off;
    }

    # Vendure Shop API
    location /shop-api {
        proxy_pass http://vendure_api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
        proxy_buffering off;
    }

    # Vendure Admin UI
    location /admin {
        proxy_pass http://vendure_admin;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Vendure Assets (static files)
    location /assets {
        proxy_pass http://vendure_api;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Cache static assets
        proxy_cache_valid 200 7d;
        expires 7d;
        add_header Cache-Control "public, immutable";
    }

    # Vendure mailbox (dev only - remove in production)
    location /mailbox {
        proxy_pass http://vendure_api;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    # Next.js Frontend (all other routes)
    location / {
        proxy_pass http://nextjs;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
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
NGINX_EOF

# Replace domain placeholder
sed -i "s/DOMAIN_PLACEHOLDER/${DOMAIN}/g" /etc/nginx/sites-available/oscar

# Enable the site
ln -sf /etc/nginx/sites-available/oscar /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Reload Nginx
systemctl reload nginx

echo "Nginx configured"

# ============================================
# Install Certbot for SSL
# ============================================
echo ""
echo -e "${GREEN}Installing Certbot for SSL certificates...${NC}"
apt install -y certbot python3-certbot-nginx

# ============================================
# Save Credentials to File
# ============================================
CREDENTIALS_FILE="$PROJECT_ROOT/CREDENTIALS.txt"
cat > "$CREDENTIALS_FILE" <<EOF
========================================
OSCAR DEPLOYMENT CREDENTIALS
Generated: $(date)
========================================

DATABASE:
  Host: localhost
  Port: 5432
  Database: ${DB_NAME}
  Username: ${DB_USER}
  Password: ${DB_PASSWORD}

VENDURE ADMIN:
  URL: https://${DOMAIN}/admin
  Username: superadmin
  Password: ${SUPERADMIN_PASSWORD}

IMPORTANT:
- Delete this file after saving credentials securely!
- Change the superadmin password after first login!
========================================
EOF

chmod 600 "$CREDENTIALS_FILE"

echo ""
echo -e "${GREEN}========================================"
echo "  VPS Setup Complete!"
echo "========================================${NC}"
echo ""
echo -e "${YELLOW}CREDENTIALS SAVED TO: $CREDENTIALS_FILE${NC}"
echo -e "${RED}DELETE THIS FILE AFTER SAVING CREDENTIALS SECURELY!${NC}"
echo ""
cat "$CREDENTIALS_FILE"
echo ""
echo "Next steps:"
echo ""
echo "1. Upload your project code:"
echo "   scp -r 01-BACKEND-VENDURE/oscar-vendure/* user@vps:$PROJECT_ROOT/vendure/"
echo "   scp -r 02-FRONTEND/oscar-frontend/* user@vps:$PROJECT_ROOT/frontend/"
echo ""
echo "2. SSH into VPS and run deployment:"
echo "   cd $PROJECT_ROOT && ./deploy.sh"
echo ""
echo "3. Set up SSL certificate (after DNS is configured):"
echo "   sudo certbot --nginx -d ${DOMAIN} -d www.${DOMAIN}"
echo ""
echo "4. Populate initial data (optional):"
echo "   cd $PROJECT_ROOT/vendure && npm run populate"
echo ""
