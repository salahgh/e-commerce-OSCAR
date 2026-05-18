// PM2 process declarations for OSCAR Fashion.
// Run from the repo root:   pm2 start deploy/scripts/ecosystem.config.cjs
//
// pm2 loads the matching apps/*/.env* file via `env_file` so changes to
// the .env files are picked up after `pm2 reload <name> --update-env`.

const path = require('path');
const repoRoot = path.resolve(__dirname, '..', '..');

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
      cwd: path.join(repoRoot, 'apps/frontend'),
      // Calling the next binary directly avoids spawning a pnpm wrapper process.
      script: path.join(repoRoot, 'apps/frontend/node_modules/next/dist/bin/next'),
      args: 'start -p 3000',
      env_file: path.join(repoRoot, 'apps/frontend/.env.production'),
      max_memory_restart: '1G',
      instances: 1,
      exec_mode: 'fork',
      time: true,
    },
  ],
};
