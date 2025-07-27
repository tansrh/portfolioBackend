"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCookie = exports.getTimeDiff = exports.formatZodError = void 0;
const moment_1 = __importDefault(require("moment"));
const formatZodError = (err) => {
    const errObj = JSON.parse(err);
    const error = {};
    console.error("Zod Error:", errObj);
    try {
        errObj.forEach((e) => {
            error[e.path?.[0]] = e.message;
        });
    }
    catch (e) {
        console.error("Error formatting Zod error:", e);
        return err;
    }
    return { errors: error };
};
exports.formatZodError = formatZodError;
const getTimeDiff = (date) => {
    const now = (0, moment_1.default)();
    const pastDate = (0, moment_1.default)(date);
    const difference = moment_1.default.duration(now.diff(pastDate));
    return difference;
};
exports.getTimeDiff = getTimeDiff;
const getCookie = (req, cookie) => {
    const cookieHeader = req?.headers?.cookie;
    let token;
    if (cookieHeader) {
        const cookies = cookieHeader.split(';').map(cookie => cookie.trim());
        const targetCookie = cookies.find(c => c.startsWith(`${cookie}=`));
        if (targetCookie) {
            token = targetCookie.split('=')[1];
        }
    }
    return token;
};
exports.getCookie = getCookie;
