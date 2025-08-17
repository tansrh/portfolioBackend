"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const portfolioController_1 = require("../controllers/portfolioController");
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const router = (0, express_1.Router)();
router.get("/", authMiddleware_1.default, portfolioController_1.getPortfolio);
router.get("/:id", portfolioController_1.getPortfolioById);
router.post("/", authMiddleware_1.default, portfolioController_1.createPortfolio);
router.delete("/", authMiddleware_1.default, portfolioController_1.deletePortfolio);
router.put("/", authMiddleware_1.default, portfolioController_1.updatePortfolio);
exports.default = router;
