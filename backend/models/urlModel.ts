import mongoose from "mongoose";
import { customAlphabet } from "nanoid";
import { IUrl } from "../utils/types";

const generateShortId = customAlphabet("1234567890abcdefghijklmnopqrstuvwxyz", 6);

const urlSchema = new mongoose.Schema({
    shortId: { type: String, unique: true, default: () => generateShortId() },
    url: { type: String, required: true },
    clicks: { type: Number, default: 0 },
    ownerId: { type: mongoose.Types.ObjectId, ref: "User", default: null },
    expiresAt: { type: Date, default: null },
}, { timestamps: true });

// Ensure shortId is unique before saving
urlSchema.pre<IUrl>("save", async function (next) {
    let isUnique = false;
    while (!isUnique) {
        const existingUrl = await mongoose.model("URL").findOne({ shortId: this.shortId });
        if (!existingUrl) {
            isUnique = true;
        } else {
            this.shortId = generateShortId();
        }
    }
    next();
});

// Expired Links: Auto-delete when `expiresAt` passes
urlSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const urlModel = mongoose.models.url || mongoose.model<IUrl>("URL", urlSchema);
export default urlModel;
