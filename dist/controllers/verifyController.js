"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyEmail = void 0;
const database_1 = __importDefault(require("../config/database"));
const verifyEmail = async (req, res) => {
    try {
        const email = req.query.email;
        const token = req.query.token;
        if (!email || !token) {
            res.cookie('x-error', 'Invalid email or token.', { path: '/signup', httpOnly: true, sameSite: 'lax' });
            return res.redirect(`${process.env.CLIENT_APP_URL}/signup`);
        }
        const user = await database_1.default.user.findUnique({
            where: { email }
        });
        if (!user) {
            // Set a cookie named 'redirect-error' with the error message
            res.cookie('x-error', 'User not found', { path: '/signup', httpOnly: true, sameSite: 'lax' });
            return res.redirect(`${process.env.CLIENT_APP_URL}/signup`);
        }
        if (user) {
            if (token === user.email_verification_token) {
                await database_1.default.user.update({
                    where: { email },
                    data: { email_verification_token: null, email_verified_at: new Date() }
                });
                return res.redirect(`${process.env.CLIENT_APP_URL}/signin`);
            }
        }
        res.status(200).json({ message: "Email verified successfully." });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error." });
    }
};
exports.verifyEmail = verifyEmail;
