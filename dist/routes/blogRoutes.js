"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const blogController_1 = require("../controllers/blogController");
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const router = (0, express_1.Router)();
router.get("/", blogController_1.getBlogs);
router.post("/", authMiddleware_1.default, blogController_1.createBlog);
router.put("/", authMiddleware_1.default, blogController_1.updateBlog);
router.delete("/:id", authMiddleware_1.default, blogController_1.deleteBlog);
router.get("/:id", blogController_1.getBlogById);
exports.default = router;
