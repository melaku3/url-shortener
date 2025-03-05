import express from "express";
import { register, login, profile, logout } from "../controllers/authController";
import { protect } from "../middlewares/authMiddleware";

const authRoute = express.Router();

authRoute.post("/register", register);
authRoute.post("/login", login);
authRoute.get("/profile", protect, profile);
authRoute.post("/logout", protect, logout);

export default authRoute;
    