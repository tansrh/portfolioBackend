"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const contactController_1 = require("../controllers/contactController");
const router = (0, express_1.Router)();
router.post("/", authMiddleware_1.default, contactController_1.contactUs);
exports.default = router;
