/**
 * Script to clean up stuck jobs directly from the database
 * Run with: npm run cleanup-db
 *
 * This script connects directly to the database without starting Vendure server
 */
import 'dotenv/config';
// @ts-ignore - pg types not installed
import { Client } from 'pg';

async function cleanupJobsDB() {
  console.log('🧹 Connecting to database to clean up jobs...\n');

  const client = new Client({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Get job statistics
    const statsResult = await client.query(`
      SELECT state, COUNT(*) as count
      FROM job_record
      GROUP BY state
      ORDER BY count DESC
    `);

    console.log('📊 Current job statistics:');
    statsResult.rows.forEach((row: any) => {
      console.log(`   - ${row.state}: ${row.count}`);
    });

    // Delete PENDING jobs
    const pendingResult = await client.query(`
      DELETE FROM job_record WHERE state = 'PENDING'
    `);
    console.log(`\n🗑️  Deleted ${pendingResult.rowCount} stuck PENDING jobs`);

    // Delete CANCELLED jobs
    const cancelledResult = await client.query(`
      DELETE FROM job_record WHERE state = 'CANCELLED'
    `);
    console.log(`🗑️  Deleted ${cancelledResult.rowCount} CANCELLED jobs`);

    // Delete FAILED jobs
    const failedResult = await client.query(`
      DELETE FROM job_record WHERE state = 'FAILED'
    `);
    console.log(`🗑️  Deleted ${failedResult.rowCount} FAILED jobs`);

    // Delete old COMPLETED jobs (older than 7 days)
    const oldCompletedResult = await client.query(`
      DELETE FROM job_record
      WHERE state = 'COMPLETED'
      AND "settledAt" < NOW() - INTERVAL '7 days'
    `);
    console.log(`🗑️  Deleted ${oldCompletedResult.rowCount} old COMPLETED jobs`);

    // Get updated statistics
    const newStatsResult = await client.query(`
      SELECT state, COUNT(*) as count
      FROM job_record
      GROUP BY state
      ORDER BY count DESC
    `);

    console.log('\n📊 Updated job statistics:');
    if (newStatsResult.rows.length === 0) {
      console.log('   No jobs remaining');
    } else {
      newStatsResult.rows.forEach((row: any) => {
        console.log(`   - ${row.state}: ${row.count}`);
      });
    }

    console.log('\n✅ Cleanup complete!');
    console.log('\n📌 Next steps:');
    console.log('   1. Go to the backoffice: http://localhost:5173/settings');
    console.log('   2. Click on "Systeme" tab');
    console.log('   3. Click "Reconstruire l\'index" to trigger a fresh reindex');
    console.log('   (The Vendure server is already running, so jobs should process)');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

cleanupJobsDB();
