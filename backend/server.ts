import app from "./app";
import dotenv from "dotenv";
import db from "./config/db";
import mongoose from "mongoose";
// Load environment variables
dotenv.config();

// Connect to database
db();

const PORT = process.env.PORT || 3000;

// Start the server
mongoose.connection.once("open", () => app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`)));
