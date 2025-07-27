import { Router } from "express";
import authRoutes from "./authRoutes";
import verifyRoutes from "./verifyRoutes";
import passwordRoutes from "./passwordRoutes";
import { authLimiter } from "../config/limiters";
const router = Router();

router.use("/api/auth", authLimiter, authRoutes);
router.use("/api/verify", verifyRoutes);
router.use("/api/auth", authLimiter, passwordRoutes);
export default router;