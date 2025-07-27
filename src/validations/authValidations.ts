import { z } from 'zod';

export const signupSchema = z.object({
  name: z.string()
    .min(3, { message: "Name must be at least 3 characters long" }),
  email: z.string()
    .min(1, { message: "Email is required" })
    .refine(val => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(val), { message: "Invalid email format" }),
    password: z.string()
    .min(6, { message: "Password must be at least 6 characters long" }),
  confirmPassword: z.string()
    .min(6, { message: "Confirm Password must be at least 6 characters long" })
}).refine((data)=> data.password === data.confirmPassword, { message: "Passwords do not match", path: ["confirmPassword"] });

export const signinSchema = z.object({
  email: z.string()
  .min(1, { message: "Email is required" })
 .refine(val => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(val), { message: "Invalid email format" }),
  password: z.string()
  .min(1, { message: "Password is required." })

})