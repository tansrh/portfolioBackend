"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailQueue = void 0;
const bullmq_1 = require("bullmq");
require("dotenv/config");
const connection = {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD,
    tls: {}, // Required for Upstash (enables SSL)
};
exports.emailQueue = new bullmq_1.Queue('emailQueue', { connection });
