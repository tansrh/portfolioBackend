import prisma from "../config/database";
import { Request, Response } from "express";

export const verifyEmail = async (req: Request, res: Response) => {
    try {
        const email = req.query.email as string;
        const token = req.query.token as string;
        if (!email || !token) {
            res.cookie('x-error', 'Invalid email or token.', { path: '/signup', httpOnly: true, sameSite: 'lax' });
            return res.redirect(`${process.env.CLIENT_APP_URL}/signup`);
        }

        const user = await prisma.user.findUnique({
            where: { email }
        });
        
        if (!user) {
            // Set a cookie named 'redirect-error' with the error message
            res.cookie('x-error', 'User not found', { path: '/signup', httpOnly: true, sameSite: 'lax' });
            return res.redirect(`${process.env.CLIENT_APP_URL}/signup`);
        }
        if (user) {
            if (token === user.email_verification_token) {
                await prisma.user.update({
                    where: { email },
                    data: { email_verification_token: null, email_verified_at: new Date() }
                });
                return res.redirect(`${process.env.CLIENT_APP_URL}/signin`);
            }

        }

        res.status(200).json({ message: "Email verified successfully." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error." });
    }
}   
