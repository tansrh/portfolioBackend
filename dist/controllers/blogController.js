"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBlogs = getBlogs;
exports.createBlog = createBlog;
exports.updateBlog = updateBlog;
exports.deleteBlog = deleteBlog;
exports.getBlogById = getBlogById;
const database_1 = __importDefault(require("../config/database"));
async function getBlogs(req, res) {
    try {
        const portfolioId = req.query.portfolioId;
        const blogs = await database_1.default.blog.findMany({
            where: { portfolioId: portfolioId },
            orderBy: { createdAt: 'desc' }
        });
        if (!blogs || blogs.length === 0) {
            return res.status(404).json({ message: "No blogs found." });
        }
        return res.status(200).json(blogs);
    }
    catch (error) {
        console.error("Error fetching blogs:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
}
async function createBlog(req, res) {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const { title, content, portfolioId, imageUrl } = req.body;
        if (!title || !content || !portfolioId) {
            return res.status(400).json({ message: "Title, content, and portfolioId are required." });
        }
        const newBlog = await database_1.default.blog.create({
            data: {
                title,
                content,
                portfolioId,
                imageUrl,
                userId: user.id
            }
        });
        return res.status(200).json({ message: "Blog created successfully.", blog: newBlog });
    }
    catch (error) {
        console.error("Error creating blog:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
}
async function updateBlog(req, res) {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const { id, title, content, imageUrl } = req.body;
        if (!id || !title || !content) {
            return res.status(400).json({ message: "ID, title, and content are required." });
        }
        const updatedBlog = await database_1.default.blog.update({
            where: { id, userId: user.id },
            data: { title, content, ...(imageUrl ? { imageUrl } : {}) }
        });
        return res.status(200).json({ message: "Blog updated successfully.", data: updatedBlog });
    }
    catch (error) {
        console.error("Error updating blog:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
}
async function deleteBlog(req, res) {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const { id } = req.params;
        console.log("Deleting blog with ID:", id);
        if (!id) {
            return res.status(400).json({ message: "ID is required." });
        }
        await database_1.default.blog.delete({
            where: { id, userId: user.id }
        });
        return res.status(200).json({ message: "Blog deleted successfully.", id });
    }
    catch (error) {
        console.error("Error deleting blog:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
}
async function getBlogById(req, res) {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const blogId = req.params.id;
        if (!blogId) {
            return res.status(400).json({ message: "Blog ID is required." });
        }
        const blog = await database_1.default.blog.findUnique({
            where: { id: blogId }
        });
        if (!blog) {
            return res.status(404).json({ message: "Blog not found." });
        }
        return res.status(200).json(blog);
    }
    catch (error) {
        console.error("Error fetching blog by ID:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
}
