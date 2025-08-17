import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware";
import { contactUs } from "../controllers/contactController";

const router = Router();
router.post("/", authMiddleware,contactUs);
export default router;