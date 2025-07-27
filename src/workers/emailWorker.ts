import { Worker } from 'bullmq';
import { sendMail } from '../config/mail';
import { RedisOptions } from 'ioredis'; 
import 'dotenv/config';
const connection: RedisOptions = {
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  password: process.env.REDIS_PASSWORD, 
  tls: {}, // Required for Upstash (enables SSL)
};

const worker = new Worker(
  'emailQueue',
  async job => {
    const { to, name, subject, html } = job.data;
    await sendMail({ to, name, subject, html });
  },
  {
    connection,
    concurrency: 5, // Process up to 5 jobs in parallel
  }
);

worker.on('completed', job => {
  console.log(`Email job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`Email job ${job?.id} failed:`, err);
});
