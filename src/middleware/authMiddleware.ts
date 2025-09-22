import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

const authMiddleware = (req: Request & Partial<{ user: any }>, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: "Authorization token is missing" });
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: "Authorization token is missing" });
    }

    jwt.verify(token, process.env.SECRET_KEY!, (err: any, decodedUser: any) => {
        if (err) {
            return res.status(401).json({ message: "Invalid token" });
        }
        req.user = decodedUser;
        next();
    });
}
export default authMiddleware;