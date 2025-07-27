import 'dotenv/config';
import { emailQueue } from '../queues/emailQueue';

const DRAIN_INTERVAL_MINUTES = 5; // Change as needed
let isDraining = false;
let interval: NodeJS.Timeout | null = null;

async function drainQueue() {
  if (isDraining) {
    console.log('Drain already in progress, skipping this interval.');
    return;
  }
  isDraining = true;
  try {
    await emailQueue.drain(true);
    await emailQueue.obliterate({ force: true });
    console.log(`[${new Date().toISOString()}] Email queue drained! All jobs removed.`);
  } catch (err) {
    console.error('Failed to drain queue:', err);
  } finally {
    isDraining = false;
  }
}

function startDrainInterval() {
  if (interval) {
    clearInterval(interval);
  }
  interval = setInterval(drainQueue, DRAIN_INTERVAL_MINUTES * 60 * 1000);
}

async function shutdown() {
  if (interval) clearInterval(interval);
  await emailQueue.close();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

startDrainInterval();
