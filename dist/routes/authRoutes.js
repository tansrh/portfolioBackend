"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const router = (0, express_1.Router)();
router.post("/signup", authController_1.signup);
router.post("/signin", authController_1.signin);
router.post("/signout", authMiddleware_1.default, authController_1.signout);
router.get("/user", authMiddleware_1.default, authController_1.getUser);
router.post("/refresh", authController_1.refreshToken);
exports.default = router;
