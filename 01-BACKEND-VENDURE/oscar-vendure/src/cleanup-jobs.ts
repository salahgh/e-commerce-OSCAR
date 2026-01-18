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
      .andWhere('settledAt < :date', { date: sevenDaysAgo })
      .execute();
    console.log(`🗑️  Deleted ${oldCompletedResult.affected || 0} old COMPLETED jobs`);

    // Delete FAILED jobs
    const failedResult = await jobRepo.delete({ state: 'FAILED' });
    console.log(`🗑️  Deleted ${failedResult.affected || 0} FAILED jobs`);

    // Now trigger a fresh reindex
    console.log('\n🔍 Triggering fresh search index rebuild...');

    const jobQueueService = app.get(JobQueueService);

    // Make sure workers are running
    await jobQueueService.start();
    console.log('✅ Job queue workers started');

    const { SearchIndexService } = await import('@vendure/core');
    const searchIndexService = app.get(SearchIndexService);

    const job = await searchIndexService.reindex({ ctx: undefined as any });
    console.log(`✅ Created reindex job: ${job.id}`);

    // Wait for it to start processing
    console.log('\n⏱️  Waiting for job to start...');

    let attempts = 0;
    while (attempts < 30) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;

      const currentJob = await jobRepo.findOne({ where: { id: job.id } });
      if (!currentJob) {
        console.log('❌ Job not found');
        break;
      }

      process.stdout.write(`\r   Attempt ${attempts}: ${currentJob.state} (${currentJob.progress}%)   `);

      if (currentJob.state === 'RUNNING') {
        console.log('\n\n✅ Job is now RUNNING! Workers are processing.');
        break;
      }

      if (currentJob.state === 'COMPLETED') {
        console.log('\n\n✅ Job COMPLETED!');
        break;
      }

      if (currentJob.state === 'FAILED') {
        console.log('\n\n❌ Job FAILED:', currentJob.error);
        break;
      }
    }

    if (attempts >= 30) {
      console.log('\n\n⚠️  Job still PENDING after 30 seconds.');
      console.log('   This indicates the job queue workers are not running.');
      console.log('   Try keeping the Vendure server running: npm run dev');
    }

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
  }

  console.log('\n👋 Done!');
  await app.close();
  process.exit(0);
}

cleanupJobs();
