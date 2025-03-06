import mongoose from "mongoose";
import { customAlphabet } from "nanoid";

export const generateShortId = customAlphabet("1234567890abcdefghijklmnopqrstuvwxyz", 6);

// User Interface
export interface IUser extends mongoose.Document {
    name: string;
    email: string;
    password: string;
    role: "admin" | "user";
    createdAt: Date;
    updatedAt: Date;
    lastLogin?: Date;
    profilePic?: string;
    comparePassword: (password: string) => Promise<boolean>;
}

// URL Interface
export interface IUrl extends mongoose.Document {
    url: string;
    shortId: string;
    clicks: number;
    ownerId?: mongoose.Types.ObjectId;
    expiresAt?: Date;
    createdAt: Date;
}

// Analytics Interface
export interface IAnalytics extends mongoose.Document {
    shortId: mongoose.Types.ObjectId;
    timestamp: Date;
    ip?: string;
    userAgent?: string;
    referer?: string;
    location?: string;
}