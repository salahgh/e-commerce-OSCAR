// PM2 process declarations for OSCAR Fashion.
// Run from the repo root:   pm2 start deploy/scripts/ecosystem.config.cjs
//
// pm2 loads the matching apps/*/.env* file via `env_file` so changes to
// the .env files are picked up after `pm2 reload <name> --update-env`.

const path = require('path');
const repoRoot = path.resolve(__dirname, '..', '..');
const frontendDir = path.join(repoRoot, 'apps/frontend');

// pnpm with node-linker=hoisted puts `next` at the workspace root, not under
// apps/frontend/node_modules. Use Node's resolver so this works regardless
// of where pnpm decided to drop the package.
const nextBin = require.resolve('next/dist/bin/next', { paths: [frontendDir] });

module.exports = {
  apps: [
    {
      name: 'oscar-backend',
      cwd: path.join(repoRoot, 'apps/backend'),
      script: 'dist/index.js',
      node_args: '--enable-source-maps',
      env_file: path.join(repoRoot, 'apps/backend/.env'),
      max_memory_restart: '1G',
      // Vendure starts the job queue in-process, so a single instance is correct.
      instances: 1,
      exec_mode: 'fork',
      time: true,
    },
    {
      name: 'oscar-frontend',
      cwd: frontendDir,
      script: nextBin,
      args: 'start -p 3001',
      // Preload: purge zero-byte files from .next/cache/images before Next.js
      // scans it. A single empty file poisoned the whole image cache for two
      // weeks (2026-08-31 → 09-14). See clean-image-cache.cjs.
      node_args: ['--require', path.join(__dirname, 'clean-image-cache.cjs')],
      env_file: path.join(frontendDir, '.env.production'),
      max_memory_restart: '1G',
      // PM2's default is 1.6 s, after which it SIGKILLs — that is how the
      // half-written cache file above came to exist. Give Next.js time to
      // finish in-flight responses and cache writes.
      kill_timeout: 10000,
      instances: 1,
      exec_mode: 'fork',
      time: true,
    },
  ],
};
