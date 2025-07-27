"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const mail_1 = require("../config/mail");
require("dotenv/config");
const connection = {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD,
    tls: {}, // Required for Upstash (enables SSL)
};
const worker = new bullmq_1.Worker('emailQueue', async (job) => {
    const { to, name, subject, html } = job.data;
    await (0, mail_1.sendMail)({ to, name, subject, html });
}, {
    connection,
    concurrency: 5, // Process up to 5 jobs in parallel
});
worker.on('completed', job => {
    console.log(`Email job ${job.id} completed`);
});
worker.on('failed', (job, err) => {
    console.error(`Email job ${job?.id} failed:`, err);
});
