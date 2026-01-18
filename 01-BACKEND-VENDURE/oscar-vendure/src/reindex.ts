/**
 * Script to rebuild the Vendure search index
 * Run with: npm run reindex
 */
import { bootstrap, JobQueueService } from '@vendure/core';
import { config } from './vendure-config';

async function reindexSearchIndex() {
  console.log('🚀 Starting Vendure to reindex search...');

  const app = await bootstrap(config);

  try {
    const jobQueueService = app.get(JobQueueService);

    console.log('🔍 Triggering search index rebuild...');

    // The reindex job is handled by the DefaultSearchPlugin
    // We need to trigger it via the job queue
    const { SearchIndexService } = await import('@vendure/core');
    const searchIndexService = app.get(SearchIndexService);

    // Trigger full reindex
    await searchIndexService.reindex({ ctx: undefined as any });

    console.log('✅ Search index rebuild triggered!');
    console.log('   The indexing will run in the background.');
    console.log('   Check the Vendure Admin UI > Settings > Job Queue for progress.');

    // Wait a bit for the job to be queued
    await new Promise(resolve => setTimeout(resolve, 2000));

  } catch (error: any) {
    console.error('❌ Error triggering reindex:', error.message);
    console.log('\n💡 Alternative: Use the Vendure Admin UI');
    console.log('   1. Go to http://localhost:8085/admin');
    console.log('   2. Navigate to Settings > Job Queue');
    console.log('   3. Click "Reindex"');
  }

  await app.close();
  process.exit(0);
}

reindexSearchIndex();
