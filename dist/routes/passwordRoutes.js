"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const passwordController_1 = require("../controllers/passwordController");
const router = (0, express_1.Router)();
router.post("/forgot-password", passwordController_1.forgotPassword);
router.post("/reset-password", passwordController_1.resetPassword);
exports.default = router;
