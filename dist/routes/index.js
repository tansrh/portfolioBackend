"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authRoutes_1 = __importDefault(require("./authRoutes"));
const verifyRoutes_1 = __importDefault(require("./verifyRoutes"));
const passwordRoutes_1 = __importDefault(require("./passwordRoutes"));
const limiters_1 = require("../config/limiters");
const router = (0, express_1.Router)();
router.use("/api/auth", limiters_1.authLimiter, authRoutes_1.default);
router.use("/api/verify", verifyRoutes_1.default);
router.use("/api/auth", limiters_1.authLimiter, passwordRoutes_1.default);
exports.default = router;
