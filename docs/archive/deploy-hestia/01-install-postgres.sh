#!/bin/bash
#
# OSCAR Deployment - Step 1: Install PostgreSQL
# For VPS with HestiaCP (MariaDB already installed)
#
# Usage: sudo ./01-install-postgres.sh
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
echo "  OSCAR - Install PostgreSQL"
echo "  (Alongside existing MariaDB)"
echo "========================================${NC}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Please run as root (sudo ./01-install-postgres.sh)${NC}"
    exit 1
fi

# Configuration
DB_NAME="oscar_vendure"
DB_USER="oscar"
DB_PASSWORD="majmajBS13.."

# ============================================
# Check if PostgreSQL is already installed
# ============================================
if command -v psql &> /dev/null; then
    echo -e "${YELLOW}PostgreSQL is already installed${NC}"
    psql --version

    read -p "Do you want to skip installation and just create the database? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        SKIP_INSTALL=true
    else
        echo "Exiting. Remove PostgreSQL first if you want to reinstall."
        exit 0
    fi
else
    SKIP_INSTALL=false
fi

# ============================================
# Install PostgreSQL
# ============================================
if [ "$SKIP_INSTALL" = false ]; then
    echo -e "${GREEN}[1/4] Installing PostgreSQL...${NC}"

    # Update package list
    apt update

    # Install PostgreSQL
    apt install -y postgresql postgresql-contrib

    # Start and enable PostgreSQL
    systemctl start postgresql
    systemctl enable postgresql

    echo -e "${GREEN}PostgreSQL installed successfully${NC}"
    psql --version
fi

# ============================================
# Configure PostgreSQL
# ============================================
echo ""
echo -e "${GREEN}[2/4] Configuring PostgreSQL...${NC}"

# Ensure PostgreSQL is running
systemctl start postgresql

# Wait for PostgreSQL to be ready
sleep 2

# ============================================
# Create Database and User
# ============================================
echo ""
echo -e "${GREEN}[3/4] Creating database and user...${NC}"

# Check if database already exists
DB_EXISTS=$(sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" 2>/dev/null || echo "0")

if [ "$DB_EXISTS" = "1" ]; then
    echo -e "${YELLOW}Database '${DB_NAME}' already exists${NC}"
    read -p "Do you want to drop and recreate it? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        sudo -u postgres psql -c "DROP DATABASE ${DB_NAME};"
        sudo -u postgres psql -c "DROP USER IF EXISTS ${DB_USER};"
        DB_EXISTS="0"
    else
        echo "Keeping existing database"
    fi
fi

if [ "$DB_EXISTS" != "1" ]; then
    # Create user and database
    sudo -u postgres psql <<EOF
-- Create user
CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASSWORD}';

-- Create database
CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};

-- Connect to database and setup schema permissions
\c ${DB_NAME}
GRANT ALL ON SCHEMA public TO ${DB_USER};
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ${DB_USER};
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ${DB_USER};
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO ${DB_USER};
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO ${DB_USER};
EOF

    echo -e "${GREEN}Database '${DB_NAME}' created with user '${DB_USER}'${NC}"
fi

# ============================================
# Configure pg_hba.conf for local connections
# ============================================
echo ""
echo -e "${GREEN}[4/4] Configuring authentication...${NC}"

# Find pg_hba.conf location
PG_HBA=$(sudo -u postgres psql -t -P format=unaligned -c "SHOW hba_file;")

# Backup original
cp "$PG_HBA" "${PG_HBA}.backup.$(date +%Y%m%d)"

# Check if our config already exists
if ! grep -q "oscar_vendure" "$PG_HBA"; then
    # Add local connection for oscar user
    echo "" >> "$PG_HBA"
    echo "# OSCAR Vendure - Added by deployment script" >> "$PG_HBA"
    echo "local   ${DB_NAME}    ${DB_USER}                              md5" >> "$PG_HBA"
    echo "host    ${DB_NAME}    ${DB_USER}    127.0.0.1/32            md5" >> "$PG_HBA"
    echo "host    ${DB_NAME}    ${DB_USER}    ::1/128                 md5" >> "$PG_HBA"
fi

# Reload PostgreSQL
systemctl reload postgresql

# ============================================
# Test Connection
# ============================================
echo ""
echo -e "${GREEN}Testing database connection...${NC}"

if PGPASSWORD="${DB_PASSWORD}" psql -h localhost -U "${DB_USER}" -d "${DB_NAME}" -c "SELECT version();" > /dev/null 2>&1; then
    echo -e "${GREEN}Database connection successful!${NC}"
else
    echo -e "${RED}Database connection failed. Please check credentials.${NC}"
fi

# ============================================
# Save Credentials
# ============================================
CREDS_FILE="/root/oscar-db-credentials.txt"
cat > "$CREDS_FILE" <<EOF
========================================
OSCAR PostgreSQL Credentials
Generated: $(date)
========================================

Host: localhost
Port: 5432
Database: ${DB_NAME}
Username: ${DB_USER}
Password: ${DB_PASSWORD}

Connection String:
postgresql://${DB_USER}:${DB_PASSWORD}@localhost:5432/${DB_NAME}

Test connection:
PGPASSWORD="${DB_PASSWORD}" psql -h localhost -U ${DB_USER} -d ${DB_NAME}

========================================
IMPORTANT: Delete this file after saving
credentials securely!
========================================
EOF

chmod 600 "$CREDS_FILE"

# ============================================
# Summary
# ============================================
echo ""
echo -e "${BLUE}========================================"
echo "  PostgreSQL Installation Complete!"
echo "========================================${NC}"
echo ""
echo "Database credentials saved to: ${CREDS_FILE}"
echo ""
echo -e "${YELLOW}IMPORTANT: Save these credentials and delete the file!${NC}"
echo ""
cat "$CREDS_FILE"
echo ""
echo -e "${GREEN}Next step: Run ./02-setup-domain.sh${NC}"
