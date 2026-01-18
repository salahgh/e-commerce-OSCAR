import { bootstrap, runMigrations, JobQueueService, Logger } from '@vendure/core';
import { config } from './vendure-config';

// Enable debug logging for job queue
Logger.info('Starting OSCAR Vendure Server...', 'Bootstrap');

runMigrations(config)
  .then(() => bootstrap(config))
  .then(async (app) => {
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

    // Check for pending jobs
    const connection = app.get('Connection');
    const pendingCount = await connection.getRepository('job_record').count({
      where: { state: 'PENDING' },
    });

    if (pendingCount > 0) {
      console.log(`\n⚠️  Found ${pendingCount} pending jobs in queue`);
      console.log('   They will be processed automatically');
    }

    console.log('\n✅ Server ready to handle requests!\n');
  })
  .catch((err) => {
    console.error('Error starting Vendure server:', err);
    process.exit(1);
  });
