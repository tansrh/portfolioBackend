import { Router} from "express";
import { getUPortfolio } from "../controllers/uControllers";
const router = Router();
router.get("/:portfolioUrl", getUPortfolio);
export default router;
