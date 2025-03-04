import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { IUser } from "../utils/types";

const userSchema = new mongoose.Schema<IUser>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    lastLogin: { type: Date },
    profilePic: { type: String, default: "" },

}, {
    timestamps: true,
});

// Hash the password before saving the user model
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare user password
userSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
};

const userModel = mongoose.models.User || mongoose.model<IUser>("User", userSchema);
export default userModel;
