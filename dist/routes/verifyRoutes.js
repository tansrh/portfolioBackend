"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verifyController_1 = require("../controllers/verifyController");
const limiters_1 = require("../config/limiters");
const router = (0, express_1.Router)();
router.get("/", limiters_1.verifyLimiter, verifyController_1.verifyEmail);
exports.default = router;
