import { bootstrap, runMigrations } from '@vendure/core';
import { config } from './vendure-config';

runMigrations(config)
  .then(() => bootstrap(config))
  .then(() => {
    console.log('🚀 OSCAR Vendure Server is running');
    console.log('📊 Admin API: http://localhost:8085/admin-api');
    console.log('🛒 Shop API: http://localhost:8085/shop-api');
    console.log('🎛️  Admin UI: http://localhost:3002/admin');
  })
  .catch((err) => {
    console.error('Error starting Vendure server:', err);
    process.exit(1);
  });
