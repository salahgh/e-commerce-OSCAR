import { generateMigration } from '@vendure/core';
import { config } from './vendure-config';

/**
 * Generate a TypeORM migration from the current VendureConfig.
 *
 * The repo's `migration:generate` script points the typeorm CLI at
 * `vendure-config.ts`, but that exports a `VendureConfig` (not a TypeORM
 * `DataSource`), so the CLI cannot introspect it. Vendure's `generateMigration`
 * helper boots the schema from the config and writes the diff for us.
 *
 * Usage: `pnpm --filter @oscar/backend migration:gen <MigrationName>`
 */
const name = process.argv[2] || 'Migration';

generateMigration(config, { name, outputDir: __dirname + '/migrations' })
  .then((file) => {
    console.log(`✓ Migration generated: ${file ?? '(no schema changes detected)'}`);
    process.exit(0);
  })
  .catch((err) => {
    console.error('Migration generation failed:', err);
    process.exit(1);
  });
