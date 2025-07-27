import {rateLimit} from "express-rate-limit";

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // limit each IP to 15 requests per windowMs
  message: "Too many requests, please try again later.",
});

export const appLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, 
  max: 200, 
  message: "Too many requests, please try again later.",
});
export const verifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5, 
  message: "Too many verification requests, please try again later.",
});