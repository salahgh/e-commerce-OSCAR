# 02 — System dependencies

Install (or simply check) all the system packages OSCAR Fashion needs.

The script is **fully idempotent and safe to re-run** at any time. It begins
with a preflight survey of what's already installed and version-checks each
piece before doing anything. Anything present at the right version is left
alone.

## Run

```bash
ssh oscar@YOUR_VPS_IP
bash /var/www/oscar/deploy/scripts/01-install-deps.sh
```

(Or fetch the file directly if you haven't cloned the repo yet — see
[05 — First deploy](05-first-deploy.md).)

## What the preflight looks like

The first thing the script prints is a survey of your current state. Example
output on a partially-set-up VPS:

```
─────────── Preflight: existing dependencies ───────────
✓  node      v20.19.0
·  pnpm      (not installed)
✓  corepack  0.29.0
✓  psql      16.4  [systemd: active]
·  pm2       (not installed)
·  caddy     (not installed)
✓  git       2.43.0
────────────────────────────────────────────────────────
```

A `✓` means it's present and the script will skip the install step (and
just ensure the systemd service is running for postgres/caddy). A `·` means
the script will install it.

## What gets installed (or verified)

| Package | Required version | Action if already present |
|---|---|---|
| Node.js | **20.x LTS** | Skip if `node -v` starts with `v20`. Otherwise warn and leave it alone (see below). |
| pnpm | **10.29.3** | Skip if `pnpm -v` matches exactly. Otherwise re-activate via corepack. |
| PostgreSQL | Default Ubuntu LTS (14/16) | Skip install. If the systemd service isn't active, start + enable it. |
| PM2 | Latest global npm | Skip if `pm2` is on PATH. |
| Caddy | Stable from Cloudsmith repo | Skip install. If the service isn't active, start + enable it. |
| git, build-essential | apt defaults | Apt-installed — `apt-get install -y` is a no-op when already present. |

## Final summary

After installing/verifying everything, the script prints:

```
─────────────── Installed versions ─────────────────────
Node:     v20.19.0
pnpm:     10.29.3
Postgres: 16.4
PM2:      5.4.2
Caddy:    v2.8.4
git:      2.43.0
────────────────────────────────────────────────────────
```

If anything shows `MISSING`, the script failed silently for that
component — re-run with `bash -x` to debug.

## "I already have Node, but not v20"

The script will **not** silently replace your existing Node. Instead it
prints something like:

```
⚠   Node v18.20.4 is installed, but this project targets Node 20 LTS.
    Leaving it alone. If pnpm install fails later, rerun with:
      FORCE_NODE=1 bash deploy/scripts/01-install-deps.sh
```

You have three options:

1. **Recommended:** rerun the script with `FORCE_NODE=1` to replace it via
   NodeSource:
   ```bash
   FORCE_NODE=1 bash deploy/scripts/01-install-deps.sh
   ```
2. Use [`fnm`](https://github.com/Schniz/fnm) or [`nvm`](https://github.com/nvm-sh/nvm)
   to manage multiple Node versions, then set v20 as the default.
3. Leave it; if your existing Node major is ≥ 20 (e.g. v22), pnpm install
   will work anyway — Vendure 3.5 and Next.js 16 both support Node 20+.

## "I already have pnpm at a different version"

The script switches the active version via `corepack prepare pnpm@10.29.3
--activate`. If you previously installed pnpm via `npm i -g pnpm`, both
copies will coexist on PATH; corepack's shim should win because it's earlier
on `$PATH`, but if `pnpm -v` still shows the wrong version after the
script, run `which -a pnpm` to find the stale one and remove it:

```bash
which -a pnpm
sudo rm /usr/local/bin/pnpm   # adjust path to whichever is the old one
hash -r
pnpm -v   # should now be 10.29.3
```

## Re-running the script later

100% safe. The preflight at the top shows you what changed since last time
(e.g. you upgraded Node). Nothing destructive runs unless you set
`FORCE_NODE=1`.

## Manual sanity checks

After the script finishes, you can also confirm by hand:

```bash
node -v                          # v20.x.x
pnpm -v                          # 10.29.3
psql --version                   # psql (PostgreSQL) 14.x or 16.x
pm2 -v
caddy version
git --version
systemctl is-active postgresql   # active
systemctl is-active caddy        # active
```

## Notes

- **pnpm via corepack.** Node 16.10+ ships with [corepack](https://nodejs.org/api/corepack.html);
  the script enables it and pins pnpm to the version this repo requires.
  If you later see `pnpm: command not found`, run
  `sudo corepack enable && sudo corepack prepare pnpm@10.29.3 --activate`.
- **PM2 daemon ownership.** PM2's daemon runs as the user that first started
  it — so we always run `pm2 …` as `oscar`, never via sudo.
- **Caddy default config.** A stock `/etc/caddy/Caddyfile` is installed and
  Caddy is started; [08-caddy-apply.sh](../scripts/08-caddy-apply.sh)
  overwrites it later with ours.

Next: [03 — Database](03-database.md).
