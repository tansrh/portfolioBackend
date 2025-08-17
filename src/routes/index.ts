import { Router } from "express";
import authRoutes from "./authRoutes";
import verifyRoutes from "./verifyRoutes";
import passwordRoutes from "./passwordRoutes";
import portfolioRoutes from "./portfolioRoutes";
import blogRoutes from "./blogRoutes";
import contactRoutes from "./contactRoutes";
import { authLimiter } from "../config/limiters";
import uRoutes from "./uRoutes";
const router = Router();

router.use("/api/auth", authLimiter, authRoutes);
router.use("/api/verify", verifyRoutes);
router.use("/api/auth", authLimiter, passwordRoutes);
router.use("/api/portfolio", portfolioRoutes);
router.use("/api/blogs", blogRoutes);
router.use("/api/contact", contactRoutes);
router.use("/api/u/", uRoutes);
export default router;