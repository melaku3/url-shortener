import expressAsyncHandler from "express-async-handler";
import userModel from "../models/userModel";
import { userSchema } from "../utils/validation";
import jwt from "jsonwebtoken";

// @docs: Create a new user
// @access: Public
// @endpoint: POST /api/auth/register
export const register = expressAsyncHandler(async (req, res) => {
    const body = req.body;
    const validate = userSchema.safeParse(body);

    if (!validate.success) {
        const errorMsg = validate.error.issues[0].message;
        res.status(400).json({ message: errorMsg == "Required" ? `${validate.error.issues[0].path} is ${errorMsg.toLocaleLowerCase()}` : errorMsg });
        return;
    }

    // Check if email already exists
    const isEmailTaken = await userModel.exists({ email: validate.data.email });
    if (isEmailTaken) {
        res.status(400).json({ message: "Email already exists" });
        return;
    }

    // Create new user
    const user = new userModel(validate.data);
    await user.save();

    res.status(201).json({ message: "User registered successfully" });
});

// @docs: Login user
// @access: Public
// @endpoint: POST /api/auth/login
export const login = expressAsyncHandler(async (req, res) => {
    const body = req.body;

    const validate = userSchema.pick({ email: true, password: true }).safeParse(body);
    if (!validate.success) {
        const errorMsg = validate.error.issues[0].message;
        res.status(400).json({ message: errorMsg == "Required" ? `${validate.error.issues[0].path} is ${errorMsg.toLocaleLowerCase()}` : errorMsg });
        return;
    }

    // Check if user exists
    const userExists = await userModel.findOne({ email: validate.data.email });
    if (!userExists) {
        res.status(400).json({ message: "User not found" });
        return;
    }

    // Check if password is correct
    const isMatch = await userExists.comparePassword(validate.data.password);
    if (!isMatch) {
        res.status(400).json({ message: "Invalid credentials" });
        return;
    }

    // Generate token
    const token = jwt.sign({ id: userExists._id }, process.env.JWT_SECRET!, { expiresIn: "1d" });

    // Clear cookie before setting new one
    res.clearCookie("token");

    // Set token in cookie
    res.cookie("token", token, { httpOnly: true, expires: new Date(Date.now() + 24 * 60 * 60 * 1000), sameSite: 'strict', secure: true }); // 1 day

    res.json({ message: "Login successful" });
});

// @docs: Get user profile
// @access: Private
// @endpoint: GET /api/auth/profile
export const profile = expressAsyncHandler(async (req, res) => {
    const { user } = req.body;

    const validate = userSchema.pick({ _id: true }).safeParse({ _id: user.id });

    if (!validate.success) {
        const errorMsg = validate.error.issues[0].message;
        res.status(400).json({ message: errorMsg == "Required" ? `${validate.error.issues[0].path} is ${errorMsg.toLocaleLowerCase()}` : errorMsg });
        return;
    }

    // Get user profile
    const userProfile = await userModel.findById(validate.data).select("-password");

    // Check if user exists
    if (!userProfile) {
        res.status(400).json({ message: "User not found" });
        return;
    }

    res.json({ message: userProfile });

});

// @docs: Logout user
// @access: Private
// @endpoint: POST /api/auth/logout
export const logout = expressAsyncHandler(async (req, res) => {
    const { user } = req.body;

    const validate = userSchema.pick({ _id: true }).safeParse({ _id: user.id });

    if (!validate.success) {
        const errorMsg = validate.error.issues[0].message;
        res.status(400).json({ message: errorMsg == "Required" ? `${validate.error.issues[0].path} is ${errorMsg.toLocaleLowerCase()}` : errorMsg });
        return;
    }

    // Clear cookie 
    res.clearCookie("token");

    res.json({ message: "Logout successful" });
});

