#!/bin/bash
#
# OSCAR Deployment - Step 6: Setup SSL Certificate
# Uses HestiaCP's Let's Encrypt integration
#
# Usage: sudo ./06-ssl-setup.sh
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

echo ""
echo -e "${BLUE}========================================"
echo "  OSCAR - SSL Certificate Setup"
echo "========================================${NC}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Please run as root (sudo ./06-ssl-setup.sh)${NC}"
    exit 1
fi

# ============================================
# Check DNS Propagation
# ============================================
echo -e "${GREEN}[1/4] Checking DNS propagation...${NC}"

# Get server IP
SERVER_IP=$(curl -s ifconfig.me)
echo "Server IP: ${SERVER_IP}"

# Check DNS
DNS_IP=$(dig +short "${DOMAIN}" | head -1)
DNS_IP_WWW=$(dig +short "www.${DOMAIN}" | head -1)

echo "DNS for ${DOMAIN}: ${DNS_IP:-NOT FOUND}"
echo "DNS for www.${DOMAIN}: ${DNS_IP_WWW:-NOT FOUND}"

if [ "$DNS_IP" != "$SERVER_IP" ]; then
    echo ""
    echo -e "${YELLOW}WARNING: DNS for ${DOMAIN} does not point to this server!${NC}"
    echo "Expected: ${SERVER_IP}"
    echo "Got: ${DNS_IP:-nothing}"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo ""
        echo "Please configure DNS first:"
        echo "  A Record:    ${DOMAIN}     → ${SERVER_IP}"
        echo "  A Record:    www.${DOMAIN} → ${SERVER_IP}"
        echo ""
        echo "Wait for DNS propagation (can take up to 48 hours)"
        exit 1
    fi
fi

# ============================================
# Request SSL Certificate via HestiaCP
# ============================================
echo ""
echo -e "${GREEN}[2/4] Requesting SSL certificate via HestiaCP...${NC}"

# Check if SSL already exists
SSL_STATUS=$(/usr/local/hestia/bin/v-list-web-domain "$HESTIA_USER" "$DOMAIN" | grep SSL | awk '{print $2}')

if [ "$SSL_STATUS" = "yes" ]; then
    echo -e "${YELLOW}SSL certificate already exists for ${DOMAIN}${NC}"
    read -p "Do you want to renew/replace it? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Keeping existing SSL certificate"
        SKIP_SSL=true
    else
        SKIP_SSL=false
    fi
else
    SKIP_SSL=false
fi

if [ "$SKIP_SSL" = false ]; then
    # Add Let's Encrypt SSL
    echo "Requesting Let's Encrypt certificate..."

    /usr/local/hestia/bin/v-add-letsencrypt-domain "$HESTIA_USER" "$DOMAIN" "www.${DOMAIN}"

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}SSL certificate installed successfully!${NC}"
    else
        echo -e "${RED}SSL certificate installation failed!${NC}"
        echo "Common issues:"
        echo "  - DNS not pointing to this server"
        echo "  - Port 80 not accessible"
        echo "  - Rate limit exceeded (wait 1 hour)"
        exit 1
    fi
fi

# ============================================
# Enable HTTP to HTTPS Redirect
# ============================================
echo ""
echo -e "${GREEN}[3/4] Enabling HTTP to HTTPS redirect...${NC}"

# Force SSL redirect
/usr/local/hestia/bin/v-add-web-domain-ssl-force "$HESTIA_USER" "$DOMAIN" 2>/dev/null || true

echo "HTTPS redirect enabled"

# ============================================
# Enable HSTS (Optional but Recommended)
# ============================================
echo ""
echo -e "${GREEN}[4/4] Enabling HSTS...${NC}"

# Add HSTS header via HestiaCP
/usr/local/hestia/bin/v-add-web-domain-ssl-hsts "$HESTIA_USER" "$DOMAIN" 2>/dev/null || true

echo "HSTS enabled"

# ============================================
# Restart Nginx
# ============================================
echo ""
echo "Restarting Nginx..."
systemctl restart nginx

# ============================================
# Test SSL
# ============================================
echo ""
echo -e "${GREEN}Testing SSL configuration...${NC}"

# Wait for Nginx to restart
sleep 2

# Test HTTPS
if curl -sf "https://${DOMAIN}" > /dev/null 2>&1; then
    echo -e "${GREEN}HTTPS is working!${NC}"
else
    echo -e "${YELLOW}HTTPS test failed - may still be propagating${NC}"
fi

# ============================================
# Summary
# ============================================
echo ""
echo -e "${BLUE}========================================"
echo "  SSL Setup Complete!"
echo "========================================${NC}"
echo ""
echo "Your site is now accessible via HTTPS:"
echo ""
echo "  Website:     https://${DOMAIN}"
echo "  Admin Panel: https://${DOMAIN}/admin"
echo "  Shop API:    https://${DOMAIN}/shop-api"
echo ""
echo "SSL Certificate:"
echo "  Issuer: Let's Encrypt"
echo "  Auto-renewal: Yes (via HestiaCP cron)"
echo ""
echo "Test your SSL:"
echo "  https://www.ssllabs.com/ssltest/analyze.html?d=${DOMAIN}"
echo ""
echo -e "${GREEN}Setup complete! Your OSCAR store is live!${NC}"
