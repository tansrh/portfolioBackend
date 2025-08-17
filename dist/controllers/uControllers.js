"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUPortfolio = void 0;
const database_1 = __importDefault(require("../config/database"));
const getUPortfolio = async (req, res) => {
    const { portfolioUrl } = req.params;
    try {
        const portfolio = await database_1.default.portfolio.findUnique({ where: { portfolioUrl } });
        if (!portfolio) {
            return res.status(404).json({ message: "Portfolio not found" });
        }
        const blogs = await database_1.default.blog.findMany({ where: { portfolioId: portfolio.id } });
        res.status(200).json({ portfolio, blogs });
    }
    catch (error) {
        console.error("Error fetching user portfolio:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.getUPortfolio = getUPortfolio;
