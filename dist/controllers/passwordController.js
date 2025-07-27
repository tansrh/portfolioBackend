"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = void 0;
const zod_1 = require("zod");
const passwordValidations_1 = require("../validations/passwordValidations");
const Utils_1 = require("../Utils");
const database_1 = __importDefault(require("../config/database"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const uuid_1 = require("uuid");
const mail_1 = require("../config/mail");
const emailQueue_1 = require("../queues/emailQueue");
const forgotPassword = async (req, res) => {
    try {
        const body = req.body;
        const payload = passwordValidations_1.forgotPasswordSchema.parse(body);
        let user = await database_1.default.user.findUnique({
            where: {
                email: payload.email
            }
        });
        if (!user) {
            return res.status(404).json({ message: "User not found", errors: { email: "Email doesn't exist." } });
        }
        const salt = await bcrypt_1.default.genSalt(10);
        const token = await bcrypt_1.default.hash((0, uuid_1.v4)(), salt);
        await database_1.default.user.update({
            data: {
                password_reset_token: token,
                token_sent_at: new Date().toISOString()
            },
            where: {
                email: payload.email
            }
        });
        const reset_link = `${process.env.CLIENT_APP_URL}/reset-password?email=${payload.email}&token=${token}`;
        const html = (0, mail_1.getHtml)("resetPassword", { reset_link });
        const result = await emailQueue_1.emailQueue.add('sendEmail', {
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
        if (error instanceof zod_1.ZodError) {
            return res.status(400).json((0, Utils_1.formatZodError)(error));
        }
        return res.status(401).json(error);
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res) => {
    try {
        const body = req.body;
        const payload = passwordValidations_1.resetPasswordSchema.parse(body);
        const user = await database_1.default.user.findUnique({
            where: { email: body.email }
        });
        if (!user || !user.password_reset_token || user.password_reset_token !== body.token || (0, Utils_1.getTimeDiff)(user.token_sent_at).asHours() > 2) {
            return res.status(404).json({ message: "Invalid or expired reset token." });
        }
        const passwordSalt = await bcrypt_1.default.genSalt(10);
        const hashedPassword = await bcrypt_1.default.hash(payload.password, passwordSalt);
        await database_1.default.user.update({
            where: { email: payload.email },
            data: {
                password: hashedPassword,
                password_reset_token: null,
                token_sent_at: null
            }
        });
        res.status(200).json({ message: "Password reset successfully." });
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            return res.status(400).json((0, Utils_1.formatZodError)(error));
        }
        return res.status(500).json({ message: "An error occurred while resetting the password." });
    }
};
exports.resetPassword = resetPassword;
