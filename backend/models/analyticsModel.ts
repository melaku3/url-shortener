import mongoose from "mongoose";
import crypto from "crypto";
import { IAnalytics } from "../utils/types";

// Analytics Schema
const analyticsSchema = new mongoose.Schema({
    shortId: { type: mongoose.Types.ObjectId, ref: "URL", required: true },
    timestamp: { type: Date, default: Date.now },
    ip: { type: String },
    userAgent: { type: String },
    referrer: { type: String },
    location: { type: String },
}, { timestamps: true });

// Ensure IP is hashed before saving
analyticsSchema.pre<IAnalytics>("save", async function (next) {
    if (this.ip) {
        this.ip = crypto.createHash("sha256").update(this.ip).digest("hex");
    }
    next();
});

// create model
const analyticsModel = mongoose.models.analytics || mongoose.model<IAnalytics>("Analytics", analyticsSchema);
export default analyticsModel;
