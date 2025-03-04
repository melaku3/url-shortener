import mongoose from "mongoose";
import crypto from "crypto";
import { IAnalytics } from "../utils/types";

// Analytics Schema
const analyticsSchema = new mongoose.Schema({
    shortId: { type: mongoose.Types.ObjectId, ref: "URL", required: true },
    timestamp: { type: Date, default: Date.now },
    ip: { type: String, required: false },
    userAgent: { type: String, required: false },
    referer: { type: String, required: false },
    location: { type: String, required: false },
}, { timestamps: true });

// Ensure IP is hashed before saving
analyticsSchema.pre<IAnalytics>("save", async function (next) {
    if (!this.ip) {
        this.ip = crypto.createHash("sha256").update(this.id).digest("hex");
    }
    next();
});

// create model
const analyticsModel = mongoose.models.analytics || mongoose.model<IAnalytics>("Analytics", analyticsSchema);
export default analyticsModel;
