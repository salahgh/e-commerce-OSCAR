import { bootstrap, runMigrations, JobQueueService, Logger } from '@vendure/core';
import { config } from './vendure-config';

// Enable debug logging for job queue
Logger.info('Starting OSCAR Vendure Server...', 'Bootstrap');
Logger.info(`DATABASE_URL is ${process.env.DATABASE_URL ? 'SET' : 'NOT SET'}`, 'Bootstrap');
Logger.info(`DB_HOST is ${process.env.DB_HOST || 'NOT SET'}`, 'Bootstrap');

// Auto-run pending DB migrations on every startup (idempotent — TypeORM tracks applied
// migrations in the `migrations` table and runs each only once). This is what makes a
// production deploy self-migrate: push new migration files, restart, they apply on boot.
//
// Caveat: Vendure's runMigrations() does NOT throw when invoked outside its CLI — on a
// failed migration it logs the error, sets process.exitCode = 1, and resolves. In dev
// that's fine (synchronize builds the schema, so a fresh-DB migration error is harmless).
// In production synchronize is OFF, so we must NOT boot on a half-migrated schema: fail
// fast instead, letting the deploy/healthcheck catch it rather than serving bad data.
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

runMigrations(config)
  .then(() => {
    if (IS_PRODUCTION && process.exitCode === 1) {
      throw new Error('Database migrations failed — aborting startup (see errors above).');
    }
    return bootstrap(config);
  })
  .then(async (app) => {
    // Normalize backslashes in asset URLs (Windows path fix)
    const expressApp = app.getHttpAdapter().getInstance();
    expressApp.use('/assets', (req: any, _res: any, next: any) => {
      if (req.url.includes('\\')) {
        req.url = req.url.replace(/\\/g, '/');
      }
      next();
    });

    console.log('\n🚀 OSCAR Vendure Server is running');
    console.log('📊 Admin API: http://localhost:8085/admin-api');
    console.log('🛒 Shop API: http://localhost:8085/shop-api');
    console.log('🎛️  Admin UI: http://localhost:8085/admin');

    // Verify job queue is running
    const jobQueueService = app.get(JobQueueService);
    console.log('\n⚙️  Job Queue Service initialized');

    // Log active job queues
    const queues = await jobQueueService.getJobQueues();
    console.log('📋 Active Job Queues:');
    queues.forEach(q => {
      console.log(`   - ${q.name}: running=${q.running}`);
    });

    // Start the job queue if not already running
    if (queues.some(q => !q.running)) {
      console.log('\n🔄 Starting job queue workers...');
      await jobQueueService.start();
      console.log('✅ Job queue workers started');
    }

    console.log('\n✅ Server ready to handle requests!\n');
  })
  .catch((err) => {
    console.error('Error starting Vendure server:', err);
    process.exit(1);
  });
