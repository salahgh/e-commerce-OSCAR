/**
 * Script to diagnose and fix stuck jobs in the Vendure job queue
 * Run with: npm run fix-jobs
 */
import { bootstrap, JobQueueService } from '@vendure/core';

// Job states as string literals (compatible with all Vendure versions)
const JobState = {
  PENDING: 'PENDING',
  RUNNING: 'RUNNING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
  RETRYING: 'RETRYING',
} as const;
import { config } from './vendure-config';

async function fixJobs() {
  console.log('🔧 Starting job queue diagnostic...\n');

  const app = await bootstrap(config);

  try {
    const jobQueueService = app.get(JobQueueService);

    // Get all job queues
    const queues = await jobQueueService.getJobQueues();
    console.log('📋 Available Job Queues:');
    queues.forEach(q => {
      console.log(`   - ${q.name} (running: ${q.running})`);
    });

    // Check for stuck jobs using raw query
    const connection = app.get('Connection');

    // Get count of jobs by state
    const jobCounts = await connection.getRepository('job_record').createQueryBuilder('job')
      .select('job.state', 'state')
      .addSelect('COUNT(*)', 'count')
      .groupBy('job.state')
      .getRawMany();

    console.log('\n📊 Job Counts by State:');
    jobCounts.forEach((row: any) => {
      console.log(`   - ${row.state}: ${row.count}`);
    });

    // Get pending jobs
    const pendingJobs = await connection.getRepository('job_record').find({
      where: { state: JobState.PENDING },
      order: { createdAt: 'DESC' },
      take: 10,
    });

    if (pendingJobs.length > 0) {
      console.log('\n⏳ Recent Pending Jobs:');
      pendingJobs.forEach((job: any) => {
        console.log(`   - ID: ${job.id}, Queue: ${job.queueName}, Created: ${job.createdAt}`);
      });

      // Option to reset stuck pending jobs
      console.log('\n🔄 Resetting old pending jobs to allow reprocessing...');

      // Delete very old pending jobs (older than 1 hour)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const result = await connection.getRepository('job_record').delete({
        state: JobState.PENDING,
        createdAt: { $lt: oneHourAgo } as any,
      });

      console.log(`   Deleted ${result.affected || 0} old stuck jobs`);
    } else {
      console.log('\n✅ No pending jobs found');
    }

    // Trigger a new reindex
    console.log('\n🔍 Triggering a fresh search index rebuild...');

    // Try to get SearchIndexService from elasticsearch plugin or default search plugin
    let searchIndexService: any;
    try {
      const { DefaultSearchPlugin } = await import('@vendure/core');
      searchIndexService = app.get('SearchIndexService', { strict: false });
    } catch {
      console.log('   SearchIndexService not available - skipping reindex trigger');
      console.log('   Please trigger reindex manually from admin UI');
      return;
    }

    if (!searchIndexService) {
      console.log('   SearchIndexService not found - skipping reindex trigger');
      return;
    }

    const job = await searchIndexService.reindex({ ctx: undefined as any });
    console.log(`   Created reindex job: ${job.id}`);
    console.log('   The job should start processing shortly...');

    // Wait and check job status
    console.log('\n⏱️  Waiting 5 seconds to check job progress...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    const updatedJob = await connection.getRepository('job_record').findOne({
      where: { id: job.id },
    });

    if (updatedJob) {
      console.log(`   Job ${job.id} state: ${updatedJob.state}, progress: ${updatedJob.progress}%`);

      if (updatedJob.state === JobState.PENDING) {
        console.log('\n⚠️  Job is still pending. This indicates the job worker is not running.');
        console.log('   Please restart the Vendure server: npm run dev');
      } else if (updatedJob.state === JobState.RUNNING) {
        console.log('\n✅ Job is processing! The worker is running correctly.');
      } else if (updatedJob.state === JobState.COMPLETED) {
        console.log('\n✅ Job completed successfully!');
      } else if (updatedJob.state === JobState.FAILED) {
        console.log('\n❌ Job failed:', updatedJob.error);
      }
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }

  await app.close();
  process.exit(0);
}

fixJobs();
