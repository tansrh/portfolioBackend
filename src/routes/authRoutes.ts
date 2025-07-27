import { Router, Request, Response } from "express";
import { getUser, signin, signout, signup } from "../controllers/authController";
import authMiddleware  from "../middleware/authMiddleware";
const router = Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/signout", authMiddleware, signout);
router.get("/user", authMiddleware, getUser);

export default router;
