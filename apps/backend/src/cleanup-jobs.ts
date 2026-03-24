/**
 * Script to clean up old stuck jobs and trigger a fresh reindex
 * Run with: npm run cleanup-jobs
 */
import { bootstrap, JobQueueService } from '@vendure/core';
import { config } from './vendure-config';

async function cleanupJobs() {
  console.log('🧹 Starting job cleanup...\n');

  const app = await bootstrap(config);

  try {
    const connection = app.get('Connection');
    const jobRepo = connection.getRepository('job_record');

    // Count jobs by state
    const stats = await jobRepo
      .createQueryBuilder('job')
      .select('job.state', 'state')
      .addSelect('COUNT(*)', 'count')
      .groupBy('job.state')
      .getRawMany();

    console.log('📊 Current job statistics:');
    stats.forEach((row: any) => {
      console.log(`   - ${row.state}: ${row.count}`);
    });

    // Delete all PENDING jobs (they're stuck anyway)
    const pendingResult = await jobRepo.delete({ state: 'PENDING' });
    console.log(`\n🗑️  Deleted ${pendingResult.affected || 0} stuck PENDING jobs`);

    // Delete old COMPLETED jobs (older than 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const oldCompletedResult = await jobRepo
      .createQueryBuilder()
      .delete()
      .where('state = :state', { state: 'COMPLETED' })
      .andWhere('"settledAt" < :date', { date: sevenDaysAgo })
      .execute();
    console.log(`🗑️  Deleted ${oldCompletedResult.affected || 0} old COMPLETED jobs`);

    // Delete FAILED jobs
    const failedResult = await jobRepo.delete({ state: 'FAILED' });
    console.log(`🗑️  Deleted ${failedResult.affected || 0} FAILED jobs`);

    // Delete CANCELLED jobs
    const cancelledResult = await jobRepo.delete({ state: 'CANCELLED' });
    console.log(`🗑️  Deleted ${cancelledResult.affected || 0} CANCELLED jobs`);

    // Now trigger a fresh reindex using the JobQueueService
    console.log('\n🔍 Triggering fresh search index rebuild...');

    const jobQueueService = app.get(JobQueueService);

    // Make sure workers are running
    console.log('   Starting job queue workers...');
    await jobQueueService.start();

    // Get the SearchIndexService from the app container
    // It's registered by the DefaultSearchPlugin
    const searchIndexService = app.get('SearchIndexService');

    if (!searchIndexService) {
      console.log('❌ SearchIndexService not found. Is DefaultSearchPlugin enabled?');
    } else {
      // Create a minimal request context
      const { RequestContext, Channel } = await import('@vendure/core');
      const channelRepo = connection.getRepository(Channel);
      const defaultChannel = await channelRepo.findOne({ where: { code: '__default_channel__' } });

      if (defaultChannel) {
        const ctx = new RequestContext({
          channel: defaultChannel,
          apiType: 'admin',
          isAuthorized: true,
          authorizedAsOwnerOnly: false,
        });

        const job = await searchIndexService.reindex(ctx);
        console.log(`✅ Created reindex job: ${job.id}`);

        // Wait for it to start processing
        console.log('\n⏱️  Waiting for job to process...');

        let attempts = 0;
        while (attempts < 60) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          attempts++;

          const currentJob = await jobRepo.findOne({ where: { id: job.id } });
          if (!currentJob) {
            console.log('\n❌ Job not found');
            break;
          }

          process.stdout.write(`\r   [${attempts}s] ${currentJob.state} - ${currentJob.progress}%    `);

          if (currentJob.state === 'COMPLETED') {
            console.log('\n\n✅ Reindex COMPLETED successfully!');
            console.log(`   Duration: ${currentJob.duration}ms`);
            break;
          }

          if (currentJob.state === 'FAILED') {
            console.log('\n\n❌ Reindex FAILED:', currentJob.error);
            break;
          }

          if (currentJob.state === 'CANCELLED') {
            console.log('\n\n⚠️  Reindex was CANCELLED');
            break;
          }
        }

        if (attempts >= 60) {
          console.log('\n\n⚠️  Timeout after 60 seconds');
        }
      } else {
        console.log('❌ Default channel not found');
      }
    }

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
  }

  console.log('\n👋 Shutting down...');
  await app.close();
  process.exit(0);
}

cleanupJobs();
