import { Queue } from 'bullmq';
import { RedisOptions } from 'ioredis';
import 'dotenv/config';
const connection: RedisOptions = {
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  password: process.env.REDIS_PASSWORD, 
  tls: {}, // Required for Upstash (enables SSL)
};

export const emailQueue = new Queue('emailQueue', { connection });
