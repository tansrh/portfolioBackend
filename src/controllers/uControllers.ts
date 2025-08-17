import { Request, Response } from "express";
import prisma from "../config/database";
export const getUPortfolio = async (req: Request, res: Response) => {
  const { portfolioUrl } = req.params;
  try {
    const portfolio = await prisma.portfolio.findUnique({ where: { portfolioUrl } });
    if (!portfolio) {
      return res.status(404).json({ message: "Portfolio not found" });
    }
    const blogs = await prisma.blog.findMany({ where: { portfolioId: portfolio.id } });
    res.status(200).json({ portfolio, blogs });
  } catch (error) {
    console.error("Error fetching user portfolio:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
