#!/bin/bash
#
# OSCAR Deployment - Step 2: Setup Domain in HestiaCP
# Creates domain oscarfashion.com with Nginx proxy configuration
#
# Usage: sudo ./02-setup-domain.sh
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
echo "  OSCAR - Setup Domain in HestiaCP"
echo "========================================${NC}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Please run as root (sudo ./02-setup-domain.sh)${NC}"
    exit 1
fi

# Configuration
DOMAIN="oscarfashion.com"
HESTIA_USER="oscar"  # HestiaCP user for deployment

# ============================================
# Check HestiaCP Installation
# ============================================
if [ ! -d "/usr/local/hestia" ]; then
    echo -e "${RED}HestiaCP not found! This script requires HestiaCP.${NC}"
    exit 1
fi

# Source HestiaCP functions
source /usr/local/hestia/func/main.sh
source /etc/hestiacp/hestia.conf

echo -e "${GREEN}HestiaCP detected${NC}"
echo "Hestia version: $(cat /usr/local/hestia/version)"

# ============================================
# Step 1: Create HestiaCP User (if not exists)
# ============================================
echo ""
echo -e "${GREEN}[1/4] Checking HestiaCP user '${HESTIA_USER}'...${NC}"

if /usr/local/hestia/bin/v-list-user "$HESTIA_USER" &> /dev/null; then
    echo -e "${YELLOW}User '${HESTIA_USER}' already exists in HestiaCP${NC}"
else
    echo "Creating HestiaCP user '${HESTIA_USER}'..."

    # Password for HestiaCP user
    USER_PASSWORD="majmajBS13.."

    # Create user
    /usr/local/hestia/bin/v-add-user "$HESTIA_USER" "$USER_PASSWORD" "admin@oscarfashion.com" default

    echo -e "${GREEN}User '${HESTIA_USER}' created${NC}"
    echo "Password: ${USER_PASSWORD}"

    # Save credentials
    cat >> ~/oscar-credentials.txt <<EOF

HestiaCP User: ${HESTIA_USER}
HestiaCP Password: ${USER_PASSWORD}
EOF
fi

# ============================================
# Step 2: Add Domain
# ============================================
echo ""
echo -e "${GREEN}[2/4] Adding domain '${DOMAIN}'...${NC}"

if /usr/local/hestia/bin/v-list-web-domain "$HESTIA_USER" "$DOMAIN" &> /dev/null; then
    echo -e "${YELLOW}Domain '${DOMAIN}' already exists${NC}"
else
    # Add domain
    /usr/local/hestia/bin/v-add-web-domain "$HESTIA_USER" "$DOMAIN"

    # Add www alias
    /usr/local/hestia/bin/v-add-web-domain-alias "$HESTIA_USER" "$DOMAIN" "www.${DOMAIN}"

    echo -e "${GREEN}Domain '${DOMAIN}' added${NC}"
fi

# ============================================
# Step 3: Create Nginx Proxy Configuration
# ============================================
echo ""
echo -e "${GREEN}[3/4] Creating Nginx proxy configuration...${NC}"

# Get the web domain directory
WEB_DIR="/home/${HESTIA_USER}/web/${DOMAIN}"

# Create directories
mkdir -p "${WEB_DIR}/public_html"
mkdir -p "${WEB_DIR}/private"

# Create custom Nginx template for HestiaCP
NGINX_TEMPLATE_DIR="/usr/local/hestia/data/templates/web/nginx"
TEMPLATE_NAME="oscar-proxy"

# Create the Nginx template
cat > "${NGINX_TEMPLATE_DIR}/${TEMPLATE_NAME}.tpl" <<'NGINX_TPL'
server {
    listen      %ip%:%web_port%;
    server_name %domain_idn% %alias_idn%;

    root        %sdocroot%;
    index       index.html;
    access_log  /var/log/%web_system%/domains/%domain%.log combined;
    error_log   /var/log/%web_system%/domains/%domain%.error.log error;

    # Vendure Admin API
    location /admin-api {
        proxy_pass http://127.0.0.1:8085;
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
        proxy_pass http://127.0.0.1:8085;
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
        proxy_pass http://127.0.0.1:8086;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Vendure Assets
    location /assets {
        proxy_pass http://127.0.0.1:8085;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_valid 200 7d;
        expires 7d;
        add_header Cache-Control "public, immutable";
    }

    # Vendure mailbox (dev only - remove in production)
    location /mailbox {
        proxy_pass http://127.0.0.1:8085;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    # Backoffice (React Admin Panel)
    location /backoffice {
        proxy_pass http://127.0.0.1:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Next.js Frontend (all other routes)
    location / {
        proxy_pass http://127.0.0.1:3001;
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
        proxy_pass http://127.0.0.1:3001;
        proxy_cache_valid 200 365d;
        expires 365d;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Client body size for file uploads
    client_max_body_size 50M;

    location ~ /\.(?!well-known) { deny all; return 404; }

    include %home%/%user%/conf/web/%domain%/nginx.conf_*;
}
NGINX_TPL

# Create SSL template (copy with SSL additions)
cat > "${NGINX_TEMPLATE_DIR}/${TEMPLATE_NAME}.stpl" <<'NGINX_STPL'
server {
    listen      %ip%:%web_ssl_port% ssl;
    server_name %domain_idn% %alias_idn%;

    ssl_certificate     %ssl_pem%;
    ssl_certificate_key %ssl_key%;
    ssl_stapling        on;
    ssl_stapling_verify on;

    root        %sdocroot%;
    index       index.html;
    access_log  /var/log/%web_system%/domains/%domain%.log combined;
    error_log   /var/log/%web_system%/domains/%domain%.error.log error;

    # Vendure Admin API
    location /admin-api {
        proxy_pass http://127.0.0.1:8085;
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
        proxy_pass http://127.0.0.1:8085;
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
        proxy_pass http://127.0.0.1:8086;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Vendure Assets
    location /assets {
        proxy_pass http://127.0.0.1:8085;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_valid 200 7d;
        expires 7d;
        add_header Cache-Control "public, immutable";
    }

    # Vendure mailbox (dev only - remove in production)
    location /mailbox {
        proxy_pass http://127.0.0.1:8085;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    # Backoffice (React Admin Panel)
    location /backoffice {
        proxy_pass http://127.0.0.1:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Next.js Frontend (all other routes)
    location / {
        proxy_pass http://127.0.0.1:3001;
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
        proxy_pass http://127.0.0.1:3001;
        proxy_cache_valid 200 365d;
        expires 365d;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Client body size for file uploads
    client_max_body_size 50M;

    location ~ /\.(?!well-known) { deny all; return 404; }

    include %home%/%user%/conf/web/%domain%/nginx.ssl.conf_*;
}
NGINX_STPL

echo -e "${GREEN}Nginx templates created${NC}"

# ============================================
# Step 4: Apply Template to Domain
# ============================================
echo ""
echo -e "${GREEN}[4/4] Applying proxy template to domain...${NC}"

# Change web template
/usr/local/hestia/bin/v-change-web-domain-tpl "$HESTIA_USER" "$DOMAIN" "$TEMPLATE_NAME"

# Restart Nginx
systemctl restart nginx

echo -e "${GREEN}Template applied successfully${NC}"

# ============================================
# Create placeholder page
# ============================================
cat > "${WEB_DIR}/public_html/index.html" <<'HTML'
<!DOCTYPE html>
<html>
<head>
    <title>OSCAR Fashion - Coming Soon</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
        h1 { color: #2C3E50; }
        p { color: #666; }
    </style>
</head>
<body>
    <h1>OSCAR Fashion</h1>
    <p>Site en cours de déploiement...</p>
    <p>Site under deployment...</p>
</body>
</html>
HTML

chown -R "${HESTIA_USER}:${HESTIA_USER}" "${WEB_DIR}"

# ============================================
# Summary
# ============================================
echo ""
echo -e "${BLUE}========================================"
echo "  Domain Setup Complete!"
echo "========================================${NC}"
echo ""
echo "Domain: ${DOMAIN}"
echo "Web root: ${WEB_DIR}/public_html"
echo "User: ${HESTIA_USER}"
echo ""
echo "Proxy routes configured:"
echo "  /              → Next.js   (port 3001)"
echo "  /shop-api      → Vendure   (port 8085)"
echo "  /admin-api     → Vendure   (port 8085)"
echo "  /admin         → Vendure   (port 8086)"
echo "  /assets        → Vendure   (port 8085)"
echo "  /backoffice    → Backoffice (port 3002)"
echo ""
echo -e "${YELLOW}Note: SSL will be configured after DNS propagation${NC}"
echo ""
echo -e "${GREEN}Next step: Run ./03-setup-nodejs.sh${NC}"
