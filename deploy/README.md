# OSCAR Deployment Guide

Automated deployment scripts for OSCAR Fashion E-commerce on Linux VPS.

## Files

| Script | Purpose |
|--------|---------|
| `setup-vps-postgres.sh` | Initial VPS setup with PostgreSQL (RECOMMENDED) |
| `setup-vps.sh` | Initial VPS setup with MariaDB |
| `deploy.sh` | Deploy/update application |

## Quick Start

### 1. Initial VPS Setup (Run Once)

SSH into your fresh VPS and run:

```bash
# Download the setup script (or upload manually)
wget https://raw.githubusercontent.com/your-repo/oscar/main/deploy/setup-vps-postgres.sh

# Make executable and run
chmod +x setup-vps-postgres.sh
sudo ./setup-vps-postgres.sh
```

**What it does:**
- Updates system packages
- Installs Node.js 20 LTS
- Installs PostgreSQL
- Creates database and user
- Installs Nginx with reverse proxy config
- Configures firewall (UFW)
- Creates project directories
- Generates secure credentials
- Creates environment files

### 2. Upload Your Code

From your local machine:

```bash
# Upload Vendure backend
scp -r 01-BACKEND-VENDURE/oscar-vendure/* root@YOUR_VPS_IP:/var/www/oscar/vendure/

# Upload Next.js frontend
scp -r 02-FRONTEND/oscar-frontend/* root@YOUR_VPS_IP:/var/www/oscar/frontend/

# Upload deploy script
scp deploy/deploy.sh root@YOUR_VPS_IP:/var/www/oscar/
```

Or clone from Git on the VPS:

```bash
cd /var/www
git clone https://github.com/your-username/e-commerce-OSCAR.git oscar-repo
cp -r oscar-repo/01-BACKEND-VENDURE/oscar-vendure/* /var/www/oscar/vendure/
cp -r oscar-repo/02-FRONTEND/oscar-frontend/* /var/www/oscar/frontend/
```

### 3. Deploy Application

```bash
cd /var/www/oscar
chmod +x deploy.sh
./deploy.sh
```

### 4. Setup SSL Certificate

After your DNS points to the VPS:

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 5. Populate Initial Data (Optional)

```bash
cd /var/www/oscar/vendure
npm run populate
```

## Directory Structure (on VPS)

```
/var/www/oscar/
├── vendure/           # Vendure backend
│   ├── .env           # Environment variables
│   ├── dist/          # Compiled code
│   ├── static/        # Assets
│   └── node_modules/
├── frontend/          # Next.js frontend
│   ├── .env.production
│   ├── .next/         # Built app
│   └── node_modules/
├── logs/              # Application logs
├── backups/           # Database backups
├── deploy.sh          # Deployment script
└── CREDENTIALS.txt    # Generated credentials (DELETE after saving!)
```

## Environment Variables

### Vendure Backend (`/var/www/oscar/vendure/.env`)

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=oscar_vendure
DB_SCHEMA=public
DB_USERNAME=oscar
DB_PASSWORD=your_password

# Server
PORT=8085
NODE_ENV=production

# Auth
SUPERADMIN_USERNAME=superadmin
SUPERADMIN_PASSWORD=your_password
COOKIE_SECRET=your_secret

# Payment Gateways
CIB_MERCHANT_ID=
CIB_TERMINAL_ID=
CIB_SECRET_KEY=
BARIDIMOB_MERCHANT_ACCOUNT=
BARIDIMOB_API_KEY=
BARIDIMOB_SECRET_KEY=
```

### Frontend (`/var/www/oscar/frontend/.env.production`)

```env
NEXT_PUBLIC_GRAPHQL_URL=https://yourdomain.com/shop-api
NEXT_PUBLIC_GRAPHQL_WS_URL=wss://yourdomain.com/shop-api
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_CDN_URL=https://yourdomain.com/assets
```

## Services & Ports

| Service | Port | URL Path |
|---------|------|----------|
| Vendure API | 8085 | `/shop-api`, `/admin-api` |
| Vendure Admin UI | 8086 | `/admin` |
| Next.js Frontend | 3000 | `/` |
| Nginx | 80/443 | Reverse proxy |

## PM2 Commands

```bash
# View all services
pm2 status

# View logs
pm2 logs vendure
pm2 logs frontend

# Restart services
pm2 restart vendure
pm2 restart frontend

# Stop services
pm2 stop all

# View process details
pm2 show vendure
```

## Updating the Application

Simply run the deploy script again:

```bash
cd /var/www/oscar
./deploy.sh
```

This will:
1. Backup environment files
2. Pull latest code (if using git)
3. Restore environment files
4. Rebuild and restart services

## Database Backup

Create a backup:

```bash
pg_dump -U oscar oscar_vendure > /var/www/oscar/backups/backup_$(date +%Y%m%d).sql
```

Restore from backup:

```bash
psql -U oscar oscar_vendure < /var/www/oscar/backups/backup_YYYYMMDD.sql
```

## Nginx SSL Configuration

After running certbot, enable HTTPS redirect by editing:

```bash
sudo nano /etc/nginx/sites-available/oscar
```

Add at the beginning of the HTTP server block:

```nginx
return 301 https://$server_name$request_uri;
```

Then reload:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

## Troubleshooting

### Check service status
```bash
pm2 status
systemctl status nginx
systemctl status postgresql
```

### View logs
```bash
pm2 logs vendure --lines 100
pm2 logs frontend --lines 100
tail -f /var/log/nginx/oscar.error.log
```

### Test database connection
```bash
psql -U oscar -d oscar_vendure -h localhost
```

### Test API manually
```bash
curl http://localhost:8085/shop-api?query={__typename}
curl http://localhost:3000
```

### Restart everything
```bash
pm2 restart all
sudo systemctl restart nginx
```

## Security Checklist

- [ ] Change default superadmin password
- [ ] Delete CREDENTIALS.txt after saving credentials
- [ ] Configure SMTP for emails
- [ ] Configure payment gateway credentials
- [ ] Enable HTTPS with certbot
- [ ] Set up automated backups
- [ ] Configure fail2ban rules
- [ ] Review Nginx security headers
