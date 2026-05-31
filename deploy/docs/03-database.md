# 03 — PostgreSQL setup

Create a dedicated Postgres role and database for Vendure.

## Run

```bash
bash deploy/scripts/02-setup-postgres.sh
```

The script:

1. Generates a 32-character random password (`openssl rand -base64 24`).
2. Creates the role `oscar` (or rotates its password if it already exists).
3. Creates the database `oscar_fashion` owned by `oscar` (skip if it exists).
4. Writes the connection string to **`~/.oscar-db-url`** (mode 600).
5. Verifies the connection by running `\conninfo` over TCP.

The connection string format matches what
`apps/backend/src/vendure-config.ts` expects:

```
DATABASE_URL=postgres://oscar:<password>@127.0.0.1:5432/oscar_fashion
```

> **No `?schema=public` query param** — `psql` rejects it as invalid, and
> Vendure's config defaults the schema to `public` whenever the URL is
> plain (apps/backend/src/vendure-config.ts:34). Behaviour is identical
> to the Prisma-style URL, but this form also works with ad-hoc
> `psql "$DATABASE_URL"` commands.

## Why TCP instead of the Unix socket?

Vendure's `vendure-config.ts` parses `DATABASE_URL` into host + port. The default
Ubuntu Postgres setup ships with `host all all 127.0.0.1/32 scram-sha-256` in
`pg_hba.conf`, so password auth over the loopback interface works out of the
box. No `pg_hba.conf` edits needed.

## Verify manually

```bash
# Reads the password from the saved file.
source ~/.oscar-db-url
psql "$DATABASE_URL" -c '\conninfo'
psql "$DATABASE_URL" -c '\dt'   # before migrations: empty list
```

## Sizing & tuning

For a low-traffic store on a 2 GiB VPS the defaults are fine. As you scale:

- Bump `shared_buffers` to ~25% of RAM in `/etc/postgresql/16/main/postgresql.conf`.
- Restart with `sudo systemctl restart postgresql` (then PM2's restart will
  reconnect Vendure automatically).

## Backups (recommended)

Not automated by these scripts. The simplest starting point is a daily cron:

```bash
sudo crontab -u oscar -e
# Add:
0 3 * * * pg_dump --no-owner "$(cat ~/.oscar-db-url | cut -d= -f2-)" | gzip > ~/backups/oscar_fashion_$(date +\%Y\%m\%d).sql.gz
```

Make sure `~/backups` exists.

## Rotating the DB password later

```bash
rm ~/.oscar-db-url        # force regeneration
bash deploy/scripts/02-setup-postgres.sh
FORCE=1 bash deploy/scripts/04-write-env.sh   # rewrite backend .env
pm2 reload oscar-backend --update-env
```

Next: [04 — Env files](04-env-files.md).
