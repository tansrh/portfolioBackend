import {rateLimit} from "express-rate-limit";
import 'dotenv/config';
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 15 : 500, // limit each IP to 15 requests per windowMs
  message: {message: "Too many requests, please try again later."},
});

export const appLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, 
  max: process.env.NODE_ENV === 'production' ? 200: 500, 
  message: "Too many requests, please try again later.",
});
export const verifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: process.env.NODE_ENV === 'production' ? 5 : 500, 
  message: {message: "Too many verification requests, please try again later."},
});