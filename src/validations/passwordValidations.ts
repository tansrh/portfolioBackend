import { z } from 'zod';
export const forgotPasswordSchema = z.object({
    email: z.string()
        .min(1, { message: "Email is required" })
        .refine(val => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(val), { message: "Invalid email format" })
});

export const resetPasswordSchema = z.object({
     email: z.string()
        .min(1, { message: "Email is required" })
        .refine(val => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(val), { message: "Invalid email format" }),
    token: z.string()
        .min(1, { message: "Token is required" }),
    password: z.string()
        .min(6, { message: "Password must be at least 6 characters long" }),
    confirmPassword: z.string()
        .min(6, { message: "Confirm Password must be at least 6 characters long" })
        
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
} )