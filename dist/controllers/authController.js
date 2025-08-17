"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signout = exports.getUser = exports.signin = exports.signup = void 0;
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
        const token = jsonwebtoken_1.default.sign(jwtPayload, process.env.SECRET_KEY, { expiresIn: '30d' });
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
        secure: process.env.NODE_ENV === 'production',
    });
    res.status(200).json({ message: "Signed out successfully" });
};
exports.signout = signout;
