/**
 * Script to rebuild the Vendure search index
 * Run with: npm run reindex
 *
 * This script bootstraps Vendure, triggers a reindex, and waits for completion.
 */
import { bootstrap, JobQueueService, JobState } from '@vendure/core';
import { config } from './vendure-config';

async function reindexSearchIndex() {
  console.log('🚀 Starting Vendure to reindex search...\n');

  const app = await bootstrap(config);

  try {
    // Get services
    const jobQueueService = app.get(JobQueueService);
    const { SearchIndexService } = await import('@vendure/core');
    const searchIndexService = app.get(SearchIndexService);

    // Log active queues
    const queues = await jobQueueService.getJobQueues();
    console.log('📋 Active Job Queues:');
    queues.forEach(q => {
      console.log(`   - ${q.name} (running: ${q.running})`);
    });

    console.log('\n🔍 Triggering search index rebuild...');

    // Trigger full reindex
    const job = await searchIndexService.reindex({ ctx: undefined as any });
    console.log(`   Created job: ${job.id} (queue: ${job.queueName})`);

    // Get database connection to poll job status
    const connection = app.get('Connection');
    const jobRepo = connection.getRepository('job_record');

    // Poll for job completion
    console.log('\n⏱️  Waiting for job to complete...');
    let lastProgress = -1;

    while (true) {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const currentJob = await jobRepo.findOne({ where: { id: job.id } });
      if (!currentJob) {
        console.log('   ❌ Job not found');
        break;
      }

      // Log progress updates
      if (currentJob.progress !== lastProgress) {
        lastProgress = currentJob.progress;
        process.stdout.write(`\r   Progress: ${currentJob.progress}% (${currentJob.state})   `);
      }

      if (currentJob.state === JobState.COMPLETED) {
        console.log('\n\n✅ Search index rebuilt successfully!');
        console.log(`   Duration: ${currentJob.duration}ms`);
        break;
      }

      if (currentJob.state === JobState.FAILED) {
        console.log('\n\n❌ Reindex job failed:');
        console.log(`   Error: ${currentJob.error}`);
        break;
      }

      if (currentJob.state === JobState.CANCELLED) {
        console.log('\n\n⚠️  Reindex job was cancelled');
        break;
      }

      // Timeout after 5 minutes
      if (Date.now() - new Date(currentJob.createdAt).getTime() > 5 * 60 * 1000) {
        console.log('\n\n⚠️  Timeout: Job taking too long');
        break;
      }
    }

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
  }

  console.log('\n👋 Shutting down...');
  await app.close();
  process.exit(0);
}

reindexSearchIndex();
