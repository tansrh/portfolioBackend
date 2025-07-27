"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Utils_1 = require("../Utils");
const authMiddleware = (req, res, next) => {
    const token = (0, Utils_1.getCookie)(req, 'auth_token');
    if (!token) {
        return res.status(401).json({ message: "Authorization token is missing" });
    }
    jsonwebtoken_1.default.verify(token, process.env.SECRET_KEY, (err, decodedUser) => {
        if (err) {
            return res.status(401).json({ message: "Invalid token" });
        }
        req.user = decodedUser;
        next();
    });
};
exports.default = authMiddleware;
