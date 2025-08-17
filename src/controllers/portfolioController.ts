import { Request, Response } from "express";
import prisma from "../config/database";
export async function getPortfolio(req: Request & Partial<{ user: any }>, res: Response) {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const portfolios = await prisma.portfolio.findMany({
            where: {
                userId: user.id
            }
        })
        if (!portfolios || portfolios.length === 0) {
            return res.status(404).json({ message: "No portfolios found." });
        }
        return res.status(200).json(portfolios);
    }
    catch (error) {
        console.error("Error fetching portfolio:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
}

export async function createPortfolio(req: Request & Partial<{ user: any }>, res: Response) {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const { title, description, ...rest } = req.body;

        if (!title || !description) {
            return res.status(400).json({ message: "Title and description are required." });
        }

        const existingPortfolio = await prisma.portfolio.findUnique({
            where: {
                portfolioUrl: rest.portfolioUrl
            }
        });
        if (existingPortfolio) {
            return res.status(409).json({ message: "Portfolio with this URL already exists." });
        }

        const newPortfolio = await prisma.portfolio.create({
            data: {
                title,
                description,
                userId: user.id,
                ...rest
            }
        });

        return res.status(201).json({ message: "Portfolio created successfully.", portfolio: newPortfolio });
    } catch (error) {
        console.error("Error creating portfolio:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
}

export async function updatePortfolio(req: Request & Partial<{ user: any }>, res: Response) {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const { id, title, description, ...rest } = req.body;

        if (!id || !title || !description) {
            return res.status(400).json({ message: "ID, title and description are required." });
        }

        const existingPortfolio = await prisma.portfolio.findUnique({
            where: {
                portfolioUrl: rest.portfolioUrl
            }
        });
        if (existingPortfolio) {
            return res.status(409).json({ message: "Portfolio with this URL already exists." });
        }

        const updatedPortfolio = await prisma.portfolio.update({
            where: { id, userId: user.id },
            data: {
                title,
                description,
                ...rest
            }
        });

        return res.status(200).json({ message: "Portfolio updated successfully.", portfolio: updatedPortfolio });
    } catch (error) {
        console.error("Error updating portfolio:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
}

export async function deletePortfolio(req: Request & Partial<{ user: any }>, res: Response) {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({ message: "ID is required." });
        }

        await prisma.portfolio.delete({
            where: { id, userId: user.id }
        });

        return res.status(200).json({ message: "Portfolio deleted successfully." });
    } catch (error) {
        console.error("Error deleting portfolio:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
}

export async function getPortfolioById(req: Request, res: Response) {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Portfolio ID is required." });
        }
        const portfolio = await prisma.portfolio.findUnique({
            where: { id }
        });
        if (!portfolio) {
            return res.status(404).json({ message: "Portfolio not found." });
        }
        return res.status(200).json(portfolio);
    }
    catch (error) {
        console.error("Error fetching portfolio by ID:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
}
