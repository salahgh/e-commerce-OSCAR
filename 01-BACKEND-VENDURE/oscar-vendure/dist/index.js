"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@vendure/core");
const vendure_config_1 = require("./vendure-config");
// Enable debug logging for job queue
core_1.Logger.info('Starting OSCAR Vendure Server...', 'Bootstrap');
(0, core_1.runMigrations)(vendure_config_1.config)
    .then(() => (0, core_1.bootstrap)(vendure_config_1.config))
    .then(async (app) => {
    console.log('\n🚀 OSCAR Vendure Server is running');
    console.log('📊 Admin API: http://localhost:8085/admin-api');
    console.log('🛒 Shop API: http://localhost:8085/shop-api');
    console.log('🎛️  Admin UI: http://localhost:8085/admin');
    // Verify job queue is running
    const jobQueueService = app.get(core_1.JobQueueService);
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
//# sourceMappingURL=index.js.map