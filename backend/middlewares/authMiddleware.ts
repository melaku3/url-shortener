import expressAsyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";

// @docs: Middleware to protect routes
export const protect = expressAsyncHandler(async (req, res, next) => {
    const cookie = req.headers.cookie;
    if (!cookie) {
        res.status(401);
        throw new Error("Not authorized");
    }

    const token = cookie.split("=")[1];
    if (!token) {
        res.status(401);
        throw new Error("Not authorized");
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        req.body.user = decoded;
        next();

    } catch (error) {
        res.status(401);
        throw new Error("Not authorized, token failed");
    }
});