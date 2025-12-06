"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@vendure/core");
const vendure_config_1 = require("./vendure-config");
(0, core_1.runMigrations)(vendure_config_1.config)
    .then(() => (0, core_1.bootstrap)(vendure_config_1.config))
    .then(() => {
    console.log('🚀 OSCAR Vendure Server is running');
    console.log('📊 Admin API: http://localhost:8085/admin-api');
    console.log('🛒 Shop API: http://localhost:8085/shop-api');
    console.log('🎛️  Admin UI: http://localhost:3002/admin');
})
    .catch((err) => {
    console.error('Error starting Vendure server:', err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map