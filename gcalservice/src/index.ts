import express from 'express';
import cron from 'node-cron';
import { env } from './config.js';
import { performSync } from './sync.js';

const app = express();
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'gcalservice' });
});

// Manual sync trigger (for testing/debugging)
app.post('/sync', async (req, res) => {
  try {
    await performSync();
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start server
const port = parseInt(env.PORT, 10);
app.listen(port, () => {
  console.log(`gcalservice running on port ${port}`);
  console.log(`Sync interval: ${env.SYNC_INTERVAL_MINUTES} minutes`);

  // Perform initial sync on startup
  performSync().catch(console.error);
});

// Schedule periodic sync
const cronExpression = `*/${env.SYNC_INTERVAL_MINUTES} * * * *`;
cron.schedule(cronExpression, () => {
  console.log('[CRON] Triggering scheduled sync');
  performSync().catch(console.error);
});
