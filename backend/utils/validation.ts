import { z } from 'zod';

// userSchema
export const userSchema = z.object({
    name: z.string().min(3, { message: "Name must be at least 3 characters long" }).max(255, { message: "Name must be at most 255 characters long" }),
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters long" }).max(255, { message: "Password must be at most 255 characters long" }),
    role: z.enum(["admin", "user"], { message: "Role must be either 'admin' or 'user'" }).optional(),
    profilePics: z.string().optional(),
    _id: z.string().length(24, { message: "ID must be exactly 24 characters long" }).optional()
});

// urlSchema
export const urlSchema = z.object({
    url: z.string().url({ message: "Invalid URL format" }),
    shortId: z.string().optional(),
    clicks: z.number().int().positive({ message: "Clicks must be a positive integer" }).optional(),
    expiresAt: z.date({ message: "Invalid date format" }).optional(),
    ownerId: z.string().length(24, { message: "Owner ID must be exactly 24 characters long" }).optional()
});
