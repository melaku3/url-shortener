import mongoose from "mongoose";
import { IUrl, generateShortId } from "../utils/types";

const urlSchema = new mongoose.Schema({
    shortId: { type: String, unique: true, default: () => generateShortId() },
    url: { type: String, required: true },
    clicks: { type: Number, default: 0 },
    ownerId: { type: mongoose.Types.ObjectId, ref: "User", default: null },
    expiresAt: { type: Date, default: null },
}, { timestamps: true });

// Expired Links: Auto-delete when `expiresAt` passes
urlSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const urlModel = mongoose.models.url || mongoose.model<IUrl>("URL", urlSchema);
export default urlModel;
