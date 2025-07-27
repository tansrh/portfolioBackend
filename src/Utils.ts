import moment from "moment";
import { ZodError } from "zod";
import { Request } from "express";
export const formatZodError = (err: ZodError) => {
    const errObj = JSON.parse(err as any);
    const error: any = {};
    console.error("Zod Error:", errObj);
    try {
        errObj.forEach((e: any) => {
            error[e.path?.[0]] = e.message;
        });
    }
    catch (e) {
        console.error("Error formatting Zod error:", e);
        return err;
    }
    return { errors: error };
}

export const getTimeDiff = (date: string | Date | null) => {
    const now = moment();
    const pastDate = moment(date);
    const difference = moment.duration(now.diff(pastDate));
    return difference;
}

export const getCookie = (req: Request, cookie: string) => {
    const cookieHeader = req?.headers?.cookie;
    let token: string | undefined;

    if (cookieHeader) {
        
        const cookies = cookieHeader.split(';').map(cookie => cookie.trim());
        
        const targetCookie = cookies.find(c => c.startsWith(`${cookie}=`));
        if (targetCookie) {
            token = targetCookie.split('=')[1];
        }
    }
    return token;
}