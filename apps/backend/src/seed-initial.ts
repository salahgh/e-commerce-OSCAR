import 'dotenv/config';
import { bootstrap } from '@vendure/core';
import { populate } from '@vendure/core/cli';
import { config } from './vendure-config';
import { initialData } from './initial-data';

// One-time bootstrap of Vendure's baseline data:
//   - tax categories
//   - default zone (Algeria)
//   - countries
//   - default payment method (Cash on delivery)
//   - default shipping method
//
// Idempotent for inserts; if you re-run after editing initial-data,
// Vendure upserts where it knows how (taxRates, shippingMethods, etc.).
//
// Run with:
//   cd apps/backend && pnpm exec ts-node ./src/seed-initial.ts

populate(() => bootstrap(config), initialData)
  .then(app => app.close())
  .then(() => {
    console.log('\n✅ Initial Vendure data seeded.');
    console.log('   You can now run: pnpm exec ts-node ./src/populate.ts');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Failed to seed initial data:', err);
    process.exit(1);
  });
