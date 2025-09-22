import Redis from 'ioredis';
import 'dotenv/config';

const redisClient = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  password: process.env.REDIS_PASSWORD,
  tls: {} , // enables SSL if needed
});

export default redisClient;