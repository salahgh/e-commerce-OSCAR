#!/bin/bash
#
# OSCAR Maintenance Script
# Common maintenance tasks for HestiaCP deployment
#
# Usage: ./maintenance.sh [command]
#
# Commands:
#   status     - Show service status
#   logs       - Show/follow logs
#   restart    - Restart all services
#   backup     - Create database backup
#   restore    - Restore database from backup
#   update     - Update application code
#   populate   - Run Vendure data population
#   shell      - Open PostgreSQL shell
#   nginx      - Restart Nginx
#   ssl-renew  - Force SSL renewal
#

set -e

# Configuration
HESTIA_USER="oscar"
DOMAIN="oscarfashion.com"
WEB_DIR="/home/${HESTIA_USER}/web/${DOMAIN}"
VENDURE_DIR="${WEB_DIR}/vendure"
FRONTEND_DIR="${WEB_DIR}/frontend"
LOGS_DIR="${WEB_DIR}/logs"
BACKUP_DIR="${WEB_DIR}/backups"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# ============================================
# Functions
# ============================================

show_help() {
    echo ""
    echo -e "${BLUE}OSCAR Maintenance Script${NC}"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  status     - Show all service status"
    echo "  logs       - Show application logs"
    echo "  restart    - Restart all services"
    echo "  backup     - Create database backup"
    echo "  restore    - Restore database from backup"
    echo "  update     - Update application (re-deploy)"
    echo "  populate   - Run Vendure data population"
    echo "  shell      - Open PostgreSQL shell"
    echo "  nginx      - Restart Nginx"
    echo "  ssl-renew  - Force SSL certificate renewal"
    echo "  cleanup    - Clean logs and temp files"
    echo ""
}

show_status() {
    echo ""
    echo -e "${BLUE}=== OSCAR Service Status ===${NC}"
    echo ""

    echo -e "${GREEN}PM2 Processes:${NC}"
    pm2 status

    echo ""
    echo -e "${GREEN}Nginx:${NC}"
    systemctl status nginx --no-pager -l | head -5

    echo ""
    echo -e "${GREEN}PostgreSQL:${NC}"
    systemctl status postgresql --no-pager -l | head -5

    echo ""
    echo -e "${GREEN}HestiaCP:${NC}"
    systemctl status hestia --no-pager -l | head -5

    echo ""
    echo -e "${GREEN}Disk Usage:${NC}"
    df -h / /home | tail -2

    echo ""
    echo -e "${GREEN}Memory:${NC}"
    free -h | head -2

    echo ""
    echo -e "${GREEN}Service URLs:${NC}"
    echo "  Website:     https://${DOMAIN}"
    echo "  Admin Panel: https://${DOMAIN}/admin"
    echo "  Shop API:    https://${DOMAIN}/shop-api"
    echo "  HestiaCP:    https://$(hostname -I | awk '{print $1}'):8083"
}

show_logs() {
    echo "Which logs do you want to see?"
    echo "1) Vendure (backend)"
    echo "2) Frontend (Next.js)"
    echo "3) Both (PM2)"
    echo "4) Nginx access log"
    echo "5) Nginx error log"
    read -p "Choice [1-5]: " choice

    case $choice in
        1) pm2 logs vendure --lines 100 ;;
        2) pm2 logs frontend --lines 100 ;;
        3) pm2 logs --lines 100 ;;
        4) tail -f /var/log/nginx/domains/${DOMAIN}.log ;;
        5) tail -f /var/log/nginx/domains/${DOMAIN}.error.log ;;
        *) echo "Invalid choice" ;;
    esac
}

restart_services() {
    echo -e "${YELLOW}Restarting all services...${NC}"

    echo "Restarting Vendure..."
    pm2 restart vendure

    echo "Restarting Frontend..."
    pm2 restart frontend

    echo "Reloading Nginx..."
    systemctl reload nginx

    echo ""
    echo -e "${GREEN}All services restarted${NC}"
    pm2 status
}

create_backup() {
    echo -e "${YELLOW}Creating database backup...${NC}"

    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_FILE="${BACKUP_DIR}/oscar_backup_${TIMESTAMP}.sql"

    # Get DB credentials from .env
    source "${VENDURE_DIR}/.env"

    mkdir -p "$BACKUP_DIR"

    # Create backup
    PGPASSWORD="$DB_PASSWORD" pg_dump \
        -h "$DB_HOST" \
        -U "$DB_USERNAME" \
        -d "$DB_NAME" \
        > "$BACKUP_FILE"

    # Compress
    gzip "$BACKUP_FILE"

    # Set ownership
    chown "${HESTIA_USER}:${HESTIA_USER}" "${BACKUP_FILE}.gz"

    echo -e "${GREEN}Backup created: ${BACKUP_FILE}.gz${NC}"
    ls -lh "${BACKUP_FILE}.gz"

    # Clean up old backups (keep last 7)
    echo ""
    echo "Cleaning up old backups (keeping last 7)..."
    ls -t "${BACKUP_DIR}"/*.gz 2>/dev/null | tail -n +8 | xargs -r rm -f

    echo ""
    echo "Current backups:"
    ls -lh "${BACKUP_DIR}"/*.gz 2>/dev/null || echo "No backups found"
}

restore_backup() {
    echo "Available backups:"
    ls -1 "${BACKUP_DIR}"/*.gz 2>/dev/null || { echo "No backups found"; exit 1; }

    echo ""
    read -p "Enter backup filename (e.g., oscar_backup_20241215_120000.sql.gz): " BACKUP_NAME
    BACKUP_FILE="${BACKUP_DIR}/${BACKUP_NAME}"

    if [ ! -f "$BACKUP_FILE" ]; then
        echo -e "${RED}Backup file not found: ${BACKUP_FILE}${NC}"
        exit 1
    fi

    echo -e "${YELLOW}WARNING: This will overwrite the current database!${NC}"
    read -p "Are you sure? Type 'yes' to confirm: " confirm

    if [ "$confirm" != "yes" ]; then
        echo "Aborted"
        exit 1
    fi

    source "${VENDURE_DIR}/.env"

    echo "Stopping Vendure..."
    pm2 stop vendure

    echo "Restoring database..."
    gunzip -c "$BACKUP_FILE" | PGPASSWORD="$DB_PASSWORD" psql \
        -h "$DB_HOST" \
        -U "$DB_USERNAME" \
        -d "$DB_NAME"

    echo "Starting Vendure..."
    pm2 start vendure

    echo -e "${GREEN}Database restored from ${BACKUP_FILE}${NC}"
}

update_app() {
    echo -e "${YELLOW}Running deployment update...${NC}"

    if [ -f "$(dirname "$0")/05-deploy.sh" ]; then
        "$(dirname "$0")/05-deploy.sh"
    else
        echo -e "${RED}deploy script not found${NC}"
        exit 1
    fi
}

populate_data() {
    echo -e "${YELLOW}Running Vendure population script...${NC}"

    cd "$VENDURE_DIR"

    # Check if populate script exists
    if grep -q '"populate"' package.json; then
        npm run populate
        echo -e "${GREEN}Population complete${NC}"
    else
        echo -e "${RED}No populate script found in package.json${NC}"
    fi
}

open_shell() {
    source "${VENDURE_DIR}/.env"
    PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USERNAME" -d "$DB_NAME"
}

restart_nginx() {
    echo "Testing Nginx configuration..."
    nginx -t

    echo "Restarting Nginx..."
    systemctl restart nginx

    echo -e "${GREEN}Nginx restarted${NC}"
}

renew_ssl() {
    echo -e "${YELLOW}Forcing SSL certificate renewal...${NC}"

    /usr/local/hestia/bin/v-update-letsencrypt-ssl

    echo ""
    echo "Checking certificate for ${DOMAIN}..."
    echo | openssl s_client -servername "$DOMAIN" -connect "${DOMAIN}:443" 2>/dev/null | openssl x509 -noout -dates

    echo -e "${GREEN}SSL renewal complete${NC}"
}

cleanup() {
    echo -e "${YELLOW}Cleaning up logs and temp files...${NC}"

    # Truncate PM2 logs
    pm2 flush

    # Clean npm cache
    npm cache clean --force

    # Clean old logs (older than 7 days)
    find "${LOGS_DIR}" -name "*.log" -mtime +7 -delete 2>/dev/null || true

    # Clean temp files
    rm -rf /tmp/oscar-backup 2>/dev/null || true

    echo -e "${GREEN}Cleanup complete${NC}"

    # Show disk usage
    echo ""
    echo "Current disk usage:"
    du -sh "${WEB_DIR}"/*
}

# ============================================
# Main
# ============================================

case "${1:-help}" in
    status)     show_status ;;
    logs)       show_logs ;;
    restart)    restart_services ;;
    backup)     create_backup ;;
    restore)    restore_backup ;;
    update)     update_app ;;
    populate)   populate_data ;;
    shell)      open_shell ;;
    nginx)      restart_nginx ;;
    ssl-renew)  renew_ssl ;;
    cleanup)    cleanup ;;
    help|*)     show_help ;;
esac
