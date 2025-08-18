"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshToken = exports.signout = exports.getUser = exports.signin = exports.signup = void 0;
const authValidations_1 = require("../validations/authValidations");
const zod_1 = require("zod");
const Utils_1 = require("../Utils");
const database_1 = __importDefault(require("../config/database"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const uuid_1 = require("uuid");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
require("dotenv/config");
const mail_1 = require("../config/mail");
const emailQueue_1 = require("../queues/emailQueue");
const ACCESS_TOKEN_LIFE = "30m";
const REFRESH_TOKEN_LIFE = "7d";
function generateAccessToken(payload) {
    return jsonwebtoken_1.default.sign(payload, process.env.SECRET_KEY, { expiresIn: ACCESS_TOKEN_LIFE });
}
function generateRefreshToken(payload) {
    return jsonwebtoken_1.default.sign(payload, process.env.REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_LIFE });
}
const signup = async (req, res) => {
    try {
        const body = req.body;
        const payload = authValidations_1.signupSchema.parse(body);
        let user = await database_1.default.user.findUnique({
            where: {
                email: payload.email
            }
        });
        if (user) {
            return res.status(402).json({ errors: { email: "User already exists" } });
        }
        const passwordSalt = await bcrypt_1.default.genSalt(10);
        payload.password = await bcrypt_1.default.hash(payload.password, passwordSalt);
        const tokenSalt = await bcrypt_1.default.genSalt(10);
        const token = await bcrypt_1.default.hash((0, uuid_1.v4)(), tokenSalt);
        const verification_link = `${process.env.CLIENT_APP_URL}/api/verify?email=${payload.email}&token=${token}`;
        const html = (0, mail_1.getHtml)("verifyEmail", { verification_link, name: payload.name });
        const { name, email, password } = payload;
        await database_1.default.user.create({
            data: { name, email, password, email_verification_token: token }
        });
        const result = await emailQueue_1.emailQueue.add('sendEmail', {
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
    }
    catch (err) {
        if (err instanceof zod_1.ZodError) {
            return res.status(400).json((0, Utils_1.formatZodError)(err));
        }
        return res.status(401).json(err);
    }
};
exports.signup = signup;
const signin = async (req, res) => {
    try {
        const body = req.body;
        const payload = authValidations_1.signinSchema.parse(body);
        let user = await database_1.default.user.findUnique({
            where: {
                email: payload.email
            }
        });
        if (!user) {
            return res.status(422).json({ errors: { email: "Email does not exist" } });
        }
        const isPasswordValid = await bcrypt_1.default.compare(payload.password, user.password);
        if (!isPasswordValid) {
            return res.status(422).json({ errors: { password: "Invalid password" } });
        }
        const jwtPayload = {
            id: user.id,
            email: user.email,
            name: user.name,
            isVerified: user.email_verified_at !== null
        };
        // const token = jwt.sign(jwtPayload, process.env.SECRET_KEY!, { expiresIn: '30d' });
        const accessToken = generateAccessToken(jwtPayload);
        const refreshToken = generateRefreshToken(jwtPayload);
        res.cookie('auth_token', accessToken, {
            httpOnly: true,
            sameSite: "none",
            secure: process.env.NODE_ENV === 'production',
            maxAge: 30 * 60 * 1000
        });
        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            sameSite: "none",
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        return res.status(200).json({
            message: "User signed in successfully",
            data: {
                ...jwtPayload
            }
        });
    }
    catch (err) {
        if (err instanceof zod_1.ZodError) {
            return res.status(400).json((0, Utils_1.formatZodError)(err));
        }
        return res.status(401).json(err);
    }
};
exports.signin = signin;
const getUser = async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    res.json({ user });
};
exports.getUser = getUser;
const signout = (req, res) => {
    res.clearCookie('auth_token', {
        httpOnly: true,
        sameSite: "none",
        secure: process.env.NODE_ENV === 'production',
    });
    res.clearCookie('refresh_token', {
        httpOnly: true,
        sameSite: "none",
        secure: process.env.NODE_ENV === 'production',
    });
    res.status(200).json({ message: "Signed out successfully" });
};
exports.signout = signout;
const refreshToken = (req, res) => {
    const refreshToken = (0, Utils_1.getCookie)(req, 'refresh_token');
    if (!refreshToken) {
        return res.status(401).json({ message: "No refresh token" });
    }
    try {
        // Verify refresh token
        const payload = jsonwebtoken_1.default.verify(refreshToken, process.env.REFRESH_SECRET);
        // Issue new access token (shorter life)
        // const accessToken = jwt.sign(
        //     { id: payload.id, email: payload.email, name: payload.name },
        //     process.env.SECRET_KEY!,
        //     { expiresIn: "5m" } // 5 minutes for example
        // );
        const { exp, iat, ...rest } = payload;
        const accessToken = generateAccessToken(rest);
        const newRefreshToken = generateRefreshToken(rest);
        res.cookie("auth_token", accessToken, {
            httpOnly: true,
            sameSite: "none",
            secure: process.env.NODE_ENV === "production",
            maxAge: 30 * 60 * 1000, // 5 minutes
        });
        res.cookie("refresh_token", newRefreshToken, {
            httpOnly: true,
            sameSite: "none",
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        return res.status(200).json({ message: "Tokens refreshed successfully" });
    }
    catch (err) {
        console.error("Refresh token error:", err);
        return res.status(401).json({ message: "Invalid refresh token" });
    }
};
exports.refreshToken = refreshToken;
