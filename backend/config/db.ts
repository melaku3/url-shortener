import mongoose from "mongoose";

const db = async () => {
    try {
        await mongoose.connect("mongodb://localhost:27017/your-db")
            .then(() => console.log("Connected to MongoDB"))
    } catch (error) {
        console.log("Error connecting to MongoDB: ", error);
    }
}

export default db;
