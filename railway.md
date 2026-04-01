# Deploying OSCAR Fashion on Railway

## Architecture on Railway

```
Railway Project
├── PostgreSQL (database add-on)
├── Backend   (Vendure API)        → Dockerfile.backend  → port 8085
├── Frontend  (Next.js storefront) → Dockerfile.frontend  → port 3000
└── Backoffice (Vite admin panel)  → Dockerfile.backoffice → port 80
```

## Step-by-Step Setup

### 1. Create a Railway Project

1. Go to [railway.app](https://railway.app) and create a new project
2. Connect your GitHub repo (`salahgh/e-commerce-OSCAR`)

### 2. Add PostgreSQL Database

1. Click **"+ New"** → **"Database"** → **"PostgreSQL"**
2. Railway will provision the database and generate connection variables
3. Note the variable names: `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`

### 3. Create the Backend Service

1. Click **"+ New"** → **"GitHub Repo"** → select your repo
2. Go to **Settings** tab:
   - **Root Directory**: `/` (leave empty — monorepo root)
   - **Dockerfile Path**: `Dockerfile.backend`
   - **Watch Paths**: `/apps/backend/**`, `/packages/**`
3. Go to **Variables** tab and add:

```
NODE_ENV=production
PORT=8085
DB_HOST=${{Postgres.PGHOST}}
DB_PORT=${{Postgres.PGPORT}}
DB_NAME=${{Postgres.PGDATABASE}}
DB_USERNAME=${{Postgres.PGUSER}}
DB_PASSWORD=${{Postgres.PGPASSWORD}}
DB_SCHEMA=public
SUPERADMIN_USERNAME=superadmin
SUPERADMIN_PASSWORD=<generate-a-strong-password>
COOKIE_SECRET=<generate-a-random-string>
CORS_ORIGINS=${{Frontend.RAILWAY_PUBLIC_DOMAIN_VALUE}},${{Backoffice.RAILWAY_PUBLIC_DOMAIN_VALUE}}
```

4. Go to **Networking** → **Generate Domain** (e.g., `oscar-backend-xxx.up.railway.app`)

### 4. Create the Frontend Service

1. Click **"+ New"** → **"GitHub Repo"** → select your repo
2. Go to **Settings** tab:
   - **Root Directory**: `/`
   - **Dockerfile Path**: `Dockerfile.frontend`
   - **Watch Paths**: `/apps/frontend/**`, `/packages/**`
3. Go to **Variables** tab and add:

```
NEXT_PUBLIC_GRAPHQL_URL=https://<backend-domain>.up.railway.app/shop-api
NEXT_PUBLIC_GRAPHQL_WS_URL=wss://<backend-domain>.up.railway.app/shop-api
NEXT_PUBLIC_SITE_URL=https://<frontend-domain>.up.railway.app
```

4. Go to **Networking** → **Generate Domain**

### 5. Create the Backoffice Service

1. Click **"+ New"** → **"GitHub Repo"** → select your repo
2. Go to **Settings** tab:
   - **Root Directory**: `/`
   - **Dockerfile Path**: `Dockerfile.backoffice`
   - **Watch Paths**: `/apps/backoffice/**`, `/packages/**`
3. Go to **Variables** tab and add:

```
VITE_GRAPHQL_URL=https://<backend-domain>.up.railway.app/admin-api
```

> **Important**: Vite env vars are embedded at **build time**. After setting `VITE_GRAPHQL_URL`, trigger a redeploy for the variable to take effect.

4. Go to **Networking** → **Generate Domain**

### 6. Update CORS Origins

After all services have domains, go back to the **Backend** service variables and update `CORS_ORIGINS` with the actual frontend and backoffice domains:

```
CORS_ORIGINS=https://oscar-frontend-xxx.up.railway.app,https://oscar-backoffice-xxx.up.railway.app
```

### 7. Seed the Database (First Deploy Only)

After the backend is running, open the Railway **shell** for the backend service:

```bash
cd /app/apps/backend
node -e "require('./dist/populate')"
```

Or use the Railway CLI:
```bash
railway run --service backend -- node apps/backend/dist/populate.js
```

## Asset Storage

By default, Vendure stores uploaded assets on the local filesystem (`static/assets/`). Railway's filesystem is **ephemeral** — files are lost on redeploy.

For production, configure an external storage provider:
- **Railway Volume**: Attach a persistent volume mounted at `/app/apps/backend/static/assets`
- **S3/Cloudflare R2**: Use `@vendure/asset-server-plugin` with an S3 storage strategy

### Adding a Railway Volume (simplest)

1. Go to the Backend service → **Volumes**
2. Click **"+ New Volume"**
3. Set mount path: `/app/apps/backend/static/assets`

## Custom Domains

1. Go to each service → **Settings** → **Networking**
2. Add your custom domain (e.g., `api.oscarfashion.dz`, `oscarfashion.dz`, `admin.oscarfashion.dz`)
3. Add the DNS records Railway provides to your domain registrar
4. Update the environment variables to use the custom domains

## Railway CLI Shortcuts

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to project
railway link

# Deploy manually
railway up

# View logs
railway logs --service backend

# Open shell
railway shell --service backend
```
