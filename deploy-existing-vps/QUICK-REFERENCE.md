# OSCAR Deployment - Quick Reference

## Domain: oscarfashion.com

---

## Quick Commands

### View Status
```bash
./maintenance.sh status
pm2 status
```

### View Logs
```bash
pm2 logs vendure
pm2 logs frontend
./maintenance.sh logs
```

### Restart Services
```bash
sudo ./maintenance.sh restart
# Or individually:
pm2 restart vendure
pm2 restart frontend
```

### Backup Database
```bash
sudo ./maintenance.sh backup
```

### Update Code
```bash
# Upload new code
scp -r 01-BACKEND-VENDURE/oscar-vendure/* saleh@VPS:/var/www/oscar/vendure/
scp -r 02-FRONTEND/oscar-frontend/* saleh@VPS:/var/www/oscar/frontend/

# Deploy
sudo ./05-deploy.sh
```

---

## File Locations

| Item | Path |
|------|------|
| Vendure Backend | `/var/www/oscar/vendure/` |
| Frontend | `/var/www/oscar/frontend/` |
| Vendure .env | `/var/www/oscar/vendure/.env` |
| Frontend .env | `/var/www/oscar/frontend/.env.production` |
| Logs | `/var/www/oscar/logs/` |
| Backups | `/var/www/oscar/backups/` |
| Nginx Config | `/etc/nginx/conf.d/domains/oscarfashion.com.conf` |
| HestiaCP Templates | `/usr/local/hestia/data/templates/web/nginx/` |

---

## URLs

| Service | URL |
|---------|-----|
| Website | https://oscarfashion.com |
| Admin Panel | https://oscarfashion.com/admin |
| Shop API | https://oscarfashion.com/shop-api |
| Admin API | https://oscarfashion.com/admin-api |
| HestiaCP | https://YOUR_IP:8083 |

---

## Ports (Internal)

| Service | Port |
|---------|------|
| Vendure API | 8085 |
| Vendure Admin UI | 8086 |
| Next.js | 3000 |
| PostgreSQL | 5432 |
| MariaDB (HestiaCP) | 3306 |

---

## Database Access

```bash
# PostgreSQL shell
./maintenance.sh shell

# Or manually:
source /var/www/oscar/vendure/.env
PGPASSWORD="$DB_PASSWORD" psql -h localhost -U oscar -d oscar_vendure
```

---

## Deployment Steps (First Time)

```bash
# On VPS as saleh:
cd ~/oscar-deploy

# 1. Install PostgreSQL
sudo ./01-install-postgres.sh

# 2. Setup domain in HestiaCP
sudo ./02-setup-domain.sh

# 3. Install Node.js + PM2
sudo ./03-setup-nodejs.sh

# 4. Create user & directories
sudo ./04-create-user.sh

# 5. Upload code (from local machine)
scp -r 01-BACKEND-VENDURE/oscar-vendure/* saleh@VPS:/var/www/oscar/vendure/
scp -r 02-FRONTEND/oscar-frontend/* saleh@VPS:/var/www/oscar/frontend/

# 6. Deploy
sudo ./05-deploy.sh

# 7. Setup SSL (after DNS propagation)
sudo ./06-ssl-setup.sh
```

---

## Troubleshooting

### Vendure not starting
```bash
pm2 logs vendure --lines 50
# Check .env file
cat /var/www/oscar/vendure/.env
# Test database connection
./maintenance.sh shell
```

### Frontend not starting
```bash
pm2 logs frontend --lines 50
# Check .env file
cat /var/www/oscar/frontend/.env.production
```

### 502 Bad Gateway
```bash
# Check if services are running
pm2 status
# Restart services
./maintenance.sh restart
# Check Nginx
nginx -t
systemctl restart nginx
```

### SSL Issues
```bash
# Check certificate
echo | openssl s_client -servername oscarfashion.com -connect oscarfashion.com:443 2>/dev/null | openssl x509 -noout -dates

# Force renewal
./maintenance.sh ssl-renew
```

### Database Issues
```bash
# Check PostgreSQL status
systemctl status postgresql

# Check connection
./maintenance.sh shell

# Restore from backup
./maintenance.sh restore
```

---

## Credentials Location

**IMPORTANT**: Delete after saving securely!

- Database: `/root/oscar-db-credentials.txt`
- Admin: `/var/www/oscar/ADMIN-CREDENTIALS.txt`

---

## Cron Jobs (Automatic)

HestiaCP manages these automatically:
- SSL renewal: Daily check
- Log rotation: Weekly
- Backup: Configure in HestiaCP panel

---

## Emergency Contacts

- HestiaCP Docs: https://hestiacp.com/docs/
- Vendure Docs: https://docs.vendure.io/
- Next.js Docs: https://nextjs.org/docs
