import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import errorHandler from "./middlewares/errorHandler";
const app = express();

// Controllers
import { redirectToUrl } from "./controllers/urlController";

// Routes
import authRoute from "./routes/authRoute";
import urlRoute from "./routes/urlRoute";

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(cookieParser());
app.use(morgan("dev"));


// api endpoints
app.get("/:shortId", redirectToUrl);
app.use("/api/auth", authRoute);
app.use("/api/url", urlRoute);

// Error handler
app.use(errorHandler);

export default app;