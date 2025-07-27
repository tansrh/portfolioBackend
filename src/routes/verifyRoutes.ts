import { Router, Request, Response } from "express";
import { verifyEmail } from "../controllers/verifyController";
import { verifyLimiter } from "../config/limiters";
const router = Router();

router.get("/", verifyLimiter, verifyEmail);

export default router;
