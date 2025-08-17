import { Router } from "express";
import { createBlog, deleteBlog, getBlogById, getBlogs, updateBlog } from "../controllers/blogController";
import authMiddleware from "../middleware/authMiddleware";

const router = Router();
router.get("/", getBlogs);
router.post("/", authMiddleware,createBlog);
router.put("/", authMiddleware,updateBlog);
router.delete("/:id", authMiddleware, deleteBlog);
router.get("/:id", getBlogById);
export default router;