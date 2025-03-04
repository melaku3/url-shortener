import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import errorHandler from "./middlewares/errorHandler";
const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(cookieParser());
app.use(morgan("dev"));


app.get("/", (_req, res) => {
    res.json({ message: "Welcome to url shortener API" });
});

// Error handler
app.use(errorHandler);

export default app;