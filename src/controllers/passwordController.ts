import { ZodError } from "zod";
import { forgotPasswordSchema, resetPasswordSchema } from "../validations/passwordValidations";
import { Request, Response } from "express";
import { formatZodError, getTimeDiff } from "../Utils";
import prisma from "../config/database";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from 'uuid';
import { getHtml } from "../config/mail";
import { emailQueue } from "../queues/emailQueue";
export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const body = req.body;
        const payload = forgotPasswordSchema.parse(body);
        let user = await prisma.user.findUnique({
            where: {
                email: payload.email
            }
        });
        if(!user){
            return res.status(404).json({ message: "User not found", errors: { email: "Email doesn't exist."} });
        }
        const salt = await bcrypt.genSalt(10);
        const token = await bcrypt.hash(uuidv4(), salt);
        await prisma.user.update({
            data:{
                password_reset_token: token,
                token_sent_at: new Date().toISOString()
            },
            where: {
                email: payload.email
            }
        });
        const reset_link = `${process.env.CLIENT_APP_URL}/reset-password?email=${payload.email}&token=${token}`;
        const html = getHtml("resetPassword", { reset_link});
        const result = await emailQueue.add('sendEmail', {
            to: payload.email,
            subject: 'Reset Password for Portfolio Maker',
            html,
        }, {
            attempts: 2,
            backoff: {
                type: 'fixed',
                delay: 2000,
            },
        });
        res.status(200).json({ message: "Reset email sent successfully. Please check your inbox." });
    }
    catch (error) {
        if (error instanceof ZodError) {
            return res.status(400).json(formatZodError(error));
        }
        return res.status(401).json(error);
    }
}

export const resetPassword = async(req: Request, res: Response) => {
    try {
        const body = req.body;
        const payload = resetPasswordSchema.parse(body);
        
        const user = await prisma.user.findUnique({
            where: { email: body.email }
        });

        if (!user || !user.password_reset_token || user.password_reset_token !== body.token || getTimeDiff(user.token_sent_at).asHours() > 2) {
            return res.status(404).json({ message: "Invalid or expired reset token." });
        }

        const passwordSalt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(payload.password, passwordSalt);

        await prisma.user.update({
            where: { email: payload.email },
            data: {
                password: hashedPassword,
                password_reset_token: null,
                token_sent_at: null
            }
        });

        res.status(200).json({ message: "Password reset successfully." });
    } catch (error) {
        if (error instanceof ZodError) {
            return res.status(400).json(formatZodError(error));
        }
        return res.status(500).json({ message: "An error occurred while resetting the password." });
    }
}