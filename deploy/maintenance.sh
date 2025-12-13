#!/bin/bash
#
# OSCAR Maintenance Script
# Usage: ./maintenance.sh [command]
#
# Commands:
#   status    - Show service status
#   logs      - Show logs (follow mode)
#   restart   - Restart all services
#   backup    - Create database backup
#   ssl       - Setup/renew SSL certificate
#   update    - Update application (runs deploy.sh)
#

set -e

PROJECT_ROOT="/var/www/oscar"
VENDURE_DIR="$PROJECT_ROOT/vendure"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
BACKUP_DIR="$PROJECT_ROOT/backups"
DOMAIN="your-domain.com"  # Change this

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

show_help() {
    echo ""
    echo -e "${BLUE}OSCAR Maintenance Script${NC}"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  status    - Show all service status"
    echo "  logs      - Show application logs (follow mode)"
    echo "  restart   - Restart all services"
    echo "  backup    - Create database backup"
    echo "  restore   - Restore database from backup"
    echo "  ssl       - Setup/renew SSL certificate"
    echo "  update    - Update application (runs deploy.sh)"
    echo "  populate  - Run Vendure data population"
    echo "  shell     - Open PostgreSQL shell"
    echo ""
}

show_status() {
    echo -e "${BLUE}=== Service Status ===${NC}"
    echo ""

    echo -e "${GREEN}PM2 Processes:${NC}"
    pm2 status

    echo ""
    echo -e "${GREEN}Nginx:${NC}"
    systemctl status nginx --no-pager -l | head -10

    echo ""
    echo -e "${GREEN}PostgreSQL:${NC}"
    systemctl status postgresql --no-pager -l | head -10

    echo ""
    echo -e "${GREEN}Disk Usage:${NC}"
    df -h /var/www

    echo ""
    echo -e "${GREEN}Memory:${NC}"
    free -h
}

show_logs() {
    echo "Which logs do you want to see?"
    echo "1) Vendure (backend)"
    echo "2) Frontend"
    echo "3) Both"
    echo "4) Nginx error log"
    read -p "Choice: " choice

    case $choice in
        1) pm2 logs vendure ;;
        2) pm2 logs frontend ;;
        3) pm2 logs ;;
        4) tail -f /var/log/nginx/oscar.error.log ;;
        *) echo "Invalid choice" ;;
    esac
}

restart_services() {
    echo -e "${YELLOW}Restarting all services...${NC}"

    pm2 restart vendure
    echo "Vendure restarted"

    pm2 restart frontend
    echo "Frontend restarted"

    sudo systemctl reload nginx
    echo "Nginx reloaded"

    echo ""
    echo -e "${GREEN}All services restarted${NC}"
    pm2 status
}

create_backup() {
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_FILE="$BACKUP_DIR/oscar_backup_$TIMESTAMP.sql"

    echo -e "${YELLOW}Creating database backup...${NC}"

    # Get DB credentials from .env
    source "$VENDURE_DIR/.env"

    mkdir -p "$BACKUP_DIR"

    PGPASSWORD="$DB_PASSWORD" pg_dump \
        -h "$DB_HOST" \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        > "$BACKUP_FILE"

    # Compress backup
    gzip "$BACKUP_FILE"

    echo -e "${GREEN}Backup created: ${BACKUP_FILE}.gz${NC}"

    # Show backup size
    ls -lh "${BACKUP_FILE}.gz"

    # Clean up old backups (keep last 7)
    echo ""
    echo "Cleaning up old backups (keeping last 7)..."
    ls -t "$BACKUP_DIR"/*.gz 2>/dev/null | tail -n +8 | xargs -r rm -f

    echo ""
    echo "Current backups:"
    ls -lh "$BACKUP_DIR"/*.gz 2>/dev/null || echo "No backups found"
}

restore_backup() {
    echo "Available backups:"
    ls -1 "$BACKUP_DIR"/*.gz 2>/dev/null || { echo "No backups found"; exit 1; }

    echo ""
    read -p "Enter backup filename to restore: " BACKUP_NAME
    BACKUP_FILE="$BACKUP_DIR/$BACKUP_NAME"

    if [ ! -f "$BACKUP_FILE" ]; then
        echo -e "${RED}Backup file not found: $BACKUP_FILE${NC}"
        exit 1
    fi

    echo -e "${YELLOW}WARNING: This will overwrite the current database!${NC}"
    read -p "Are you sure? (yes/no) " confirm

    if [ "$confirm" != "yes" ]; then
        echo "Aborted"
        exit 1
    fi

    source "$VENDURE_DIR/.env"

    echo "Stopping Vendure..."
    pm2 stop vendure

    echo "Restoring database..."
    gunzip -c "$BACKUP_FILE" | PGPASSWORD="$DB_PASSWORD" psql \
        -h "$DB_HOST" \
        -U "$DB_USER" \
        -d "$DB_NAME"

    echo "Starting Vendure..."
    pm2 start vendure

    echo -e "${GREEN}Database restored from $BACKUP_FILE${NC}"
}

setup_ssl() {
    echo -e "${YELLOW}Setting up SSL certificate...${NC}"

    read -p "Enter your domain (e.g., example.com): " domain

    if [ -z "$domain" ]; then
        echo -e "${RED}Domain cannot be empty${NC}"
        exit 1
    fi

    sudo certbot --nginx -d "$domain" -d "www.$domain"

    echo ""
    echo -e "${GREEN}SSL certificate installed!${NC}"
    echo "Certificate will auto-renew via certbot timer"

    # Test renewal
    echo ""
    echo "Testing renewal process..."
    sudo certbot renew --dry-run
}

update_app() {
    if [ -f "$PROJECT_ROOT/deploy.sh" ]; then
        cd "$PROJECT_ROOT"
        ./deploy.sh
    else
        echo -e "${RED}deploy.sh not found in $PROJECT_ROOT${NC}"
        exit 1
    fi
}

populate_data() {
    echo -e "${YELLOW}Running Vendure population script...${NC}"
    cd "$VENDURE_DIR"
    npm run populate
    echo -e "${GREEN}Population complete${NC}"
}

open_shell() {
    source "$VENDURE_DIR/.env"
    PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME"
}

# Main
case "${1:-help}" in
    status)     show_status ;;
    logs)       show_logs ;;
    restart)    restart_services ;;
    backup)     create_backup ;;
    restore)    restore_backup ;;
    ssl)        setup_ssl ;;
    update)     update_app ;;
    populate)   populate_data ;;
    shell)      open_shell ;;
    help|*)     show_help ;;
esac
