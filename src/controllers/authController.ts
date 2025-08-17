import { Request, Response } from "express";
import { signinSchema, signupSchema } from "../validations/authValidations";
import { ZodError } from "zod";
import { formatZodError } from "../Utils";
import prisma from "../config/database";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from 'uuid';
import jwt from "jsonwebtoken";
import 'dotenv/config';
import { getHtml } from "../config/mail";
import { emailQueue } from "../queues/emailQueue";
export const signup = async (req: Request, res: Response) => {
    try {
        const body = req.body;
        const payload = signupSchema.parse(body);
        let user = await prisma.user.findUnique({
            where: {
                email: payload.email
            }
        });
        if (user) {
            return res.status(402).json({ errors: { email: "User already exists" } });
        }

        const passwordSalt = await bcrypt.genSalt(10);
        payload.password = await bcrypt.hash(payload.password, passwordSalt);
        const tokenSalt = await bcrypt.genSalt(10);
        const token = await bcrypt.hash(uuidv4(), tokenSalt);
        const verification_link = `${process.env.CLIENT_APP_URL}/api/verify?email=${payload.email}&token=${token}`;
        const html = getHtml("verifyEmail", { verification_link, name: payload.name });
        const { name, email, password } = payload;
        await prisma.user.create({
            data: { name, email, password, email_verification_token: token }
        });
        const result = await emailQueue.add('sendEmail', {
            to: payload.email,
            name: payload.name,
            subject: 'Account Verification for Portfolio Maker',
            html,
        }, {
            attempts: 2,
            backoff: {
                type: 'fixed',
                delay: 2000,
            },
        });
        res.status(200).json({ message: "User created successfully. Please check your inbox and verify your email." });

    } catch (err: any) {
        if (err instanceof ZodError) {
            return res.status(400).json(formatZodError(err));
        }
        return res.status(401).json(err);
    }
};
export const signin = async (req: Request, res: Response) => {
    try {
        const body = req.body;
        const payload = signinSchema.parse(body);
        let user = await prisma.user.findUnique({
            where: {
                email: payload.email
            }
        });
        if (!user) {
            return res.status(422).json({ errors: { email: "Email does not exist" } });
        }
        const isPasswordValid = await bcrypt.compare(payload.password, user.password);
        if (!isPasswordValid) {
            return res.status(422).json({ errors: { password: "Invalid password" } });
        }
        const jwtPayload = {
            id: user.id,
            email: user.email,
            name: user.name,
            isVerified: user.email_verified_at !== null
        };
        const token = jwt.sign(jwtPayload, process.env.SECRET_KEY!, { expiresIn: '30d' });
        res.cookie('auth_token', token, {
            httpOnly: true, 
            sameSite: "none",
            secure: process.env.NODE_ENV === 'production',
            maxAge: 30 * 24 * 60 * 60 * 1000
        });
        return res.status(200).json({
            message: "User signed in successfully",
            data: {
                ...jwtPayload
            }
        });

    } catch (err: any) {
        if (err instanceof ZodError) {
            return res.status(400).json(formatZodError(err));
        }
        return res.status(401).json(err);
    }
};

export const getUser = async (req: Request & Partial<{ user: any }>, res: Response) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    res.json({ user });
}

export const signout = (req: Request, res: Response) => {
    res.clearCookie('auth_token', {
        httpOnly: true,
        sameSite: "none",
        secure: process.env.NODE_ENV === 'production',
    });
    res.status(200).json({ message: "Signed out successfully" });
};