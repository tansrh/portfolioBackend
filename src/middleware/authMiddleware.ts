import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { getCookie } from "../Utils";

const authMiddleware = (req: Request & Partial<{ user: any }>, res: Response, next: NextFunction) => {

    const token = getCookie(req, 'auth_token');
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