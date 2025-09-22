import { Request, Response } from "express";
import { signinSchema, signupSchema } from "../validations/authValidations";
import { ZodError } from "zod";
import { formatZodError, getCookie } from "../Utils";
import prisma from "../config/database";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from 'uuid';
import jwt from "jsonwebtoken";
import 'dotenv/config';
import { getHtml } from "../config/mail";
import { emailQueue } from "../queues/emailQueue";
import redisClient from "../config/redisClient";


const ACCESS_TOKEN_LIFE = "30m";
const REFRESH_TOKEN_LIFE = "2h";

function generateAccessToken(payload: object) {
    return jwt.sign(payload, process.env.SECRET_KEY!, { expiresIn: ACCESS_TOKEN_LIFE });
}

function generateRefreshToken(payload: object) {
    return jwt.sign(payload, process.env.REFRESH_SECRET!, { expiresIn: REFRESH_TOKEN_LIFE });
}
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
        const accessToken = generateAccessToken(jwtPayload);
        const refreshToken = generateRefreshToken(jwtPayload);

        // Store refresh token in Redis with user ID as key
        await redisClient.set(`refreshToken:${user.id}`, refreshToken, "EX", 24 * 60 * 60); // 1 day expiry

        return res.status(200).json({
            message: "User signed in successfully",
            data: {
                ...jwtPayload,
                accessToken,
                refreshToken
            }
        });

    } catch (err: any) {
        console.log("Signin Error: ", err)
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

export const signout = async (req: Request & Partial<{ user: any }>, res: Response) => {
    if (req.user && req.user.id) {
        await redisClient.del(`refreshToken:${req.user.id}`);
    }
    res.status(200).json({ message: "Signed out successfully" });
};

export const refreshToken = async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: "No refresh token" });
    }
    const refreshTokenHeader = req.headers['x-refresh-token'];
    const refreshToken = Array.isArray(refreshTokenHeader) ? refreshTokenHeader[0] : refreshTokenHeader;
    if (!refreshToken || typeof refreshToken !== 'string') {
        return res.status(401).json({ message: "No valid refresh token provided" });
    }
    try {
        const payload = jwt.verify(refreshToken, process.env.REFRESH_SECRET!);
        const { exp, iat, ...rest } = payload as any;
        // Check Redis for stored refresh token
        const storedToken = await redisClient.get(`refreshToken:${rest.id}`);
        if (storedToken !== refreshToken) {
            return res.status(401).json({ message: "Refresh token invalid or revoked" });
        }
        const accessToken = generateAccessToken(rest as object);
        const newRefreshToken = generateRefreshToken(rest as object);

        // Update Redis with new refresh token
        await redisClient.set(`refreshToken:${rest.id}`, newRefreshToken, "EX", 24 * 60 * 60);

        return res.status(200).json({
            message: "Tokens refreshed successfully",
            accessToken,
            refreshToken: newRefreshToken
        });
    } catch (err) {
        return res.status(401).json({ message: "Invalid refresh token" });
    }
};