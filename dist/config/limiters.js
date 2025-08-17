"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyLimiter = exports.appLimiter = exports.authLimiter = void 0;
const express_rate_limit_1 = require("express-rate-limit");
exports.authLimiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 15, // limit each IP to 15 requests per windowMs
    message: { message: "Too many requests, please try again later." },
});
exports.appLimiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 30 * 60 * 1000,
    max: 200,
    message: "Too many requests, please try again later.",
});
exports.verifyLimiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { message: "Too many verification requests, please try again later." },
});
