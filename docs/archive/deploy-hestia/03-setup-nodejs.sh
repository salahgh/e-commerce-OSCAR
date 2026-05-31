#!/bin/bash
#
# OSCAR Deployment - Step 3: Install Node.js 20 LTS + PM2
#
# Usage: sudo ./03-setup-nodejs.sh
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
echo "  OSCAR - Install Node.js 20 LTS + PM2"
echo "========================================${NC}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Please run as root (sudo ./03-setup-nodejs.sh)${NC}"
    exit 1
fi

# ============================================
# Check existing Node.js installation
# ============================================
if command -v node &> /dev/null; then
    CURRENT_NODE=$(node -v)
    echo -e "${YELLOW}Node.js already installed: ${CURRENT_NODE}${NC}"

    # Check if it's version 18+
    NODE_MAJOR=$(echo "$CURRENT_NODE" | cut -d. -f1 | tr -d 'v')

    if [ "$NODE_MAJOR" -ge 18 ]; then
        echo -e "${GREEN}Node.js version is compatible (>= 18)${NC}"
        read -p "Do you want to upgrade to Node.js 20 LTS anyway? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "Keeping current Node.js version"
            SKIP_NODE_INSTALL=true
        else
            SKIP_NODE_INSTALL=false
        fi
    else
        echo -e "${YELLOW}Node.js version is too old. Will upgrade to v20.${NC}"
        SKIP_NODE_INSTALL=false
    fi
else
    SKIP_NODE_INSTALL=false
fi

# ============================================
# Install Node.js 20 LTS
# ============================================
if [ "$SKIP_NODE_INSTALL" = false ]; then
    echo ""
    echo -e "${GREEN}[1/3] Installing Node.js 20 LTS...${NC}"

    # Remove old NodeSource list if exists
    rm -f /etc/apt/sources.list.d/nodesource.list

    # Install Node.js 20.x
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs

    echo ""
    echo -e "${GREEN}Node.js installed:${NC}"
    echo "  Node: $(node -v)"
    echo "  npm: $(npm -v)"
fi

# ============================================
# Install PM2 Globally
# ============================================
echo ""
echo -e "${GREEN}[2/3] Installing PM2 process manager...${NC}"

if command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}PM2 already installed: $(pm2 -v)${NC}"
    npm update -g pm2
else
    npm install -g pm2
fi

echo "PM2 version: $(pm2 -v)"

# ============================================
# Configure PM2 Startup
# ============================================
echo ""
echo -e "${GREEN}[3/3] Configuring PM2 startup...${NC}"

# Setup PM2 to start on boot
pm2 startup systemd -u root --hp /root

# Create PM2 ecosystem file template
cat > /home/oscar/ecosystem.config.js <<'EOF'
module.exports = {
  apps: [
    {
      name: 'vendure',
      cwd: '/var/www/oscar/vendure',
      script: 'npm',
      args: 'run start',
      env: {
        NODE_ENV: 'production',
        PORT: 8085
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: '/var/www/oscar/logs/vendure-error.log',
      out_file: '/var/www/oscar/logs/vendure-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    },
    {
      name: 'frontend',
      cwd: '/var/www/oscar/frontend',
      script: 'npm',
      args: 'run start',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      error_file: '/var/www/oscar/logs/frontend-error.log',
      out_file: '/var/www/oscar/logs/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
};
EOF

echo "PM2 ecosystem config created at /home/oscar/ecosystem.config.js"

# ============================================
# Install useful global packages
# ============================================
echo ""
echo -e "${GREEN}Installing useful global packages...${NC}"

npm install -g typescript ts-node

# ============================================
# Summary
# ============================================
echo ""
echo -e "${BLUE}========================================"
echo "  Node.js Setup Complete!"
echo "========================================${NC}"
echo ""
echo "Installed:"
echo "  - Node.js $(node -v)"
echo "  - npm $(npm -v)"
echo "  - PM2 $(pm2 -v)"
echo "  - TypeScript $(tsc -v)"
echo ""
echo "PM2 ecosystem config: /root/ecosystem.config.js"
echo ""
echo -e "${GREEN}Next step: Run ./04-create-user.sh${NC}"
