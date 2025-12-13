# OSCAR Deployment - Existing VPS with HestiaCP

Deployment scripts for OSCAR Fashion on a VPS with HestiaCP already installed.

## Prerequisites

- VPS with HestiaCP installed
- MariaDB already running (via HestiaCP)
- Domain: `oscarfashion.com` pointed to VPS IP
- SSH access as user `saleh` with sudo privileges

## Files

| Script | Purpose |
|--------|---------|
| `01-install-postgres.sh` | Install PostgreSQL alongside existing MariaDB |
| `02-setup-domain.sh` | Configure domain in HestiaCP + Nginx proxy |
| `03-setup-nodejs.sh` | Install Node.js 20 + PM2 |
| `04-create-user.sh` | Create dedicated `oscar` HestiaCP user + directories |
| `05-deploy.sh` | Deploy/update Vendure + Next.js |
| `06-ssl-setup.sh` | Configure SSL via HestiaCP |
| `maintenance.sh` | Common maintenance tasks |

## Quick Start

```bash
# 1. Upload scripts to VPS (from your local machine)
scp -r deploy-existing-vps/* saleh@YOUR_VPS_IP:~/oscar-deploy/

# 2. SSH into VPS as saleh
ssh saleh@YOUR_VPS_IP
cd ~/oscar-deploy

# 3. Run scripts in order (with sudo)
chmod +x *.sh
sudo ./01-install-postgres.sh
sudo ./02-setup-domain.sh
sudo ./03-setup-nodejs.sh
sudo ./04-create-user.sh

# 4. Upload project code (from your local machine)
scp -r 01-BACKEND-VENDURE/oscar-vendure/* saleh@YOUR_VPS_IP:/var/www/oscar/vendure/
scp -r 02-FRONTEND/oscar-frontend/* saleh@YOUR_VPS_IP:/var/www/oscar/frontend/

# 5. Deploy
sudo ./05-deploy.sh

# 6. Setup SSL (after DNS propagation)
sudo ./06-ssl-setup.sh
```

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    HestiaCP VPS                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐ │
│  │   Nginx     │    │  PostgreSQL │    │   MariaDB   │ │
│  │  (HestiaCP) │    │   :5432     │    │   :3306     │ │
│  │   :80/443   │    │  (Vendure)  │    │  (HestiaCP) │ │
│  └──────┬──────┘    └─────────────┘    └─────────────┘ │
│         │                                               │
│         │ Reverse Proxy                                 │
│         ▼                                               │
│  ┌─────────────────────────────────────────────────┐   │
│  │              oscarfashion.com                    │   │
│  ├─────────────────────────────────────────────────┤   │
│  │  /              → Next.js    :3000              │   │
│  │  /shop-api      → Vendure    :8085              │   │
│  │  /admin-api     → Vendure    :8085              │   │
│  │  /admin         → Vendure UI :8086              │   │
│  │  /assets        → Vendure    :8085              │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  User: oscar (HestiaCP user for deployment)             │
│  Home: /var/www/oscar                │
│  SSH User: saleh (your login user)                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Ports Used

| Service | Port | Access |
|---------|------|--------|
| Nginx (HestiaCP) | 80, 443 | Public |
| HestiaCP Admin | 8083 | Public (or restricted) |
| Vendure API | 8085 | Internal (via Nginx) |
| Vendure Admin UI | 8086 | Internal (via Nginx) |
| Next.js | 3000 | Internal (via Nginx) |
| Backoffice | 3001 | Internal (via Nginx) |
| PostgreSQL | 5432 | Internal only |
| MariaDB | 3306 | Internal only |

## Domain Structure

- `oscarfashion.com` - Main storefront (Next.js)
- `oscarfashion.com/admin` - Admin panel (Vendure Admin UI)
- `oscarfashion.com/backoffice` - Custom backoffice (React/Vite)
- `oscarfashion.com/shop-api` - Shop GraphQL API
- `oscarfashion.com/admin-api` - Admin GraphQL API

## Directory Structure (on VPS)

```
/var/www/oscar/
├── repo/                    # Git repository clone
├── vendure/                 # Vendure backend
│   ├── .env                 # Environment variables
│   ├── dist/                # Compiled code
│   ├── static/assets/       # Uploaded assets
│   └── node_modules/
├── frontend/                # Next.js frontend
│   ├── .env.production      # Environment variables
│   ├── .next/               # Built app
│   └── node_modules/
├── backoffice/              # React backoffice (Vite)
│   ├── .env.production      # Environment variables
│   ├── dist/                # Built app
│   └── node_modules/
├── logs/                    # Application logs
├── backups/                 # Database backups
└── ADMIN-CREDENTIALS.txt    # Generated credentials (DELETE after saving!)
```

## Environment Files

### Vendure (`/var/www/oscar/vendure/.env`)

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=oscar_vendure
DB_USERNAME=oscar
DB_PASSWORD=your_password
PORT=8085
NODE_ENV=production
SUPERADMIN_USERNAME=superadmin
SUPERADMIN_PASSWORD=your_admin_password
COOKIE_SECRET=your_secret
```

### Frontend (`/var/www/oscar/frontend/.env.production`)

```env
NEXT_PUBLIC_GRAPHQL_URL=https://oscarfashion.com/shop-api
NEXT_PUBLIC_SITE_URL=https://oscarfashion.com
NEXT_PUBLIC_CDN_URL=https://oscarfashion.com/assets
```

### Backoffice (`/var/www/oscar/backoffice/.env.production`)

```env
VITE_GRAPHQL_URL=https://oscarfashion.com/admin-api
VITE_SITE_URL=https://oscarfashion.com
VITE_CDN_URL=https://oscarfashion.com/assets
PORT=3001
```

## Important Notes

1. **SSH User**: Connect as `saleh`, use `sudo` for admin commands
2. **HestiaCP User**: `oscar` - dedicated user for the deployment
3. **HestiaCP Nginx**: Custom proxy template for reverse proxy
4. **PostgreSQL**: Installed separately from HestiaCP's MariaDB
5. **PM2**: Process manager for Node.js apps

## Credentials

After running the scripts, credentials are saved to:

- **Database**: `~/oscar-credentials.txt` (on VPS)
- **Vendure Admin**: `/var/www/oscar/ADMIN-CREDENTIALS.txt`

**Important**: Delete these files after saving credentials securely!
