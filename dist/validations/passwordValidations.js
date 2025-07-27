"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordSchema = exports.forgotPasswordSchema = void 0;
const zod_1 = require("zod");
exports.forgotPasswordSchema = zod_1.z.object({
    email: zod_1.z.string()
        .min(1, { message: "Email is required" })
        .refine(val => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(val), { message: "Invalid email format" })
});
exports.resetPasswordSchema = zod_1.z.object({
    email: zod_1.z.string()
        .min(1, { message: "Email is required" })
        .refine(val => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(val), { message: "Invalid email format" }),
    token: zod_1.z.string()
        .min(1, { message: "Token is required" }),
    password: zod_1.z.string()
        .min(6, { message: "Password must be at least 6 characters long" }),
    confirmPassword: zod_1.z.string()
        .min(6, { message: "Confirm Password must be at least 6 characters long" })
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});
