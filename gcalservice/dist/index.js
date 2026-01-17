import express from 'express';
import cron from 'node-cron';
import { env } from './config.js';
import { performSync } from './sync.js';
const app = express();
app.use(express.json());
// Health check endpoint
app.get('/health', (_req, res) => {
    res.json({ status: 'healthy', service: 'gcalservice' });
});
// Manual sync trigger (for testing/debugging)
app.post('/sync', async (_req, res) => {
    try {
        console.log('[API] Manual sync triggered via POST /sync');
        await performSync();
        res.json({ success: true });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('[API] Manual sync failed:', message);
        res.status(500).json({ success: false, error: message });
    }
});
/**
 * Wait for the main app to be healthy before performing initial sync
 */
async function waitForMainApp() {
    const maxAttempts = 30;
    const delayMs = 2000;
    console.log('[STARTUP] Waiting for main app to be ready...');
    console.log(`[STARTUP] Main app URL: ${env.MAIN_APP_URL}`);
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            console.log(`[STARTUP] Health check attempt ${attempt}/${maxAttempts}`);
            const healthUrl = `${env.MAIN_APP_URL}/api/health`;
            const response = await fetch(healthUrl, {
                method: 'GET',
                signal: AbortSignal.timeout(5000),
            });
            if (response.ok) {
                console.log('[STARTUP] Main app is healthy!');
                return true;
            }
            console.log(`[STARTUP] Main app returned status ${response.status}, retrying...`);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            console.log(`[STARTUP] Health check failed: ${message}`);
        }
        if (attempt < maxAttempts) {
            await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
    }
    console.warn('[STARTUP] Main app health check timed out after', maxAttempts, 'attempts');
    return false;
}
/**
 * Perform initial sync with retry logic
 */
async function performInitialSync() {
    const isHealthy = await waitForMainApp();
    if (!isHealthy) {
        console.error('[STARTUP] Skipping initial sync - main app not healthy');
        return;
    }
    console.log('[STARTUP] Performing initial sync...');
    try {
        await performSync();
        console.log('[STARTUP] Initial sync completed successfully');
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('[STARTUP] Initial sync failed:', message);
    }
}
// Start server
const port = parseInt(env.PORT, 10);
app.listen(port, async () => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('gcalservice started');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Port: ${port}`);
    console.log(`Sync interval: ${env.SYNC_INTERVAL_MINUTES} minutes`);
    console.log(`Main app URL: ${env.MAIN_APP_URL}`);
    console.log(`Calendar ID: ${env.GOOGLE_CALENDAR_ID}`);
    console.log(`Environment: ${env.NODE_ENV}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    // Perform initial sync on startup with health check
    await performInitialSync();
});
// Schedule periodic sync
const cronExpression = `*/${env.SYNC_INTERVAL_MINUTES} * * * *`;
console.log('[CRON] Scheduling periodic sync with expression:', cronExpression);
const task = cron.schedule(cronExpression, () => {
    const timestamp = new Date().toISOString();
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`[CRON] Scheduled sync triggered at ${timestamp}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    performSync().catch((error) => {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('[CRON] Scheduled sync failed:', message);
    });
});
console.log('[CRON] Periodic sync scheduled successfully');
console.log('[CRON] Task status:', task ? 'active' : 'inactive');
