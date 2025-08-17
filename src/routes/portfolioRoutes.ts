import { Router, Request, Response } from "express";
import { createPortfolio, deletePortfolio, getPortfolio, getPortfolioById, updatePortfolio } from "../controllers/portfolioController";
import authMiddleware from "../middleware/authMiddleware";
const router = Router();
router.get("/", authMiddleware, getPortfolio)
router.get("/:id", getPortfolioById); 
router.post("/", authMiddleware, createPortfolio);
router.delete("/", authMiddleware, deletePortfolio);
router.put("/", authMiddleware, updatePortfolio);
export default router;
