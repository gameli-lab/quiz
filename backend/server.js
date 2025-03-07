import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads/quizzes directory exists
const uploadDir = path.join(__dirname, "uploads/quizzes");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/quizzes", quizRoutes);

// MongoDB connection
// ... existing code ...

// MongoDB connection with fallback
mongoose
  .connect(process.env.MONGO_URI_ATLAS)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => {
    console.error("MongoDB Atlas connection error:", err);
    console.log("Attempting to connect to MongoDB Localhost...");
    return mongoose.connect(process.env.MONGO_URI_LOCALHOST);
  })
  .then(() => console.log("Connected to MongoDB Localhost"))
  .catch((err) => console.error("MongoDB Localhost connection error:", err));

// ... existing code ...
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
