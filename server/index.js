import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import diagnosesRouter from "./routes/diagnoses.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();
const PORT = process.env.PORT || 3001; 
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.warn("WARNING: MONGODB_URI not defined. Defaulting to local instance.");
}

const dbUri = MONGODB_URI || "mongodb://localhost:27017/ceres-vision";

// Middleware
app.use(cors()); 
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Request Logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// API Routes
app.use("/api/diagnoses", diagnosesRouter);

// Health check
app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        db: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
        timestamp: new Date().toISOString(),
    });
});

// Serve static files from the React app (output of 'vite build')
const distPath = path.join(__dirname, "../dist");
app.use(express.static(distPath));

// All remaining requests return the React app, so it can handle routing
app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
});

// Connect to MongoDB then start server
if (process.env.NODE_ENV !== "production") {
    mongoose
        .connect(dbUri)
        .then(() => {
            console.log(`Connected to Database Successfully`);
            app.listen(PORT, () => {
                console.log(`Leafy Platform running on port ${PORT}`);
            });
        })
        .catch((err) => {
            console.error("Critical: MongoDB connection failed:", err.message);
        });
} else {
    // On Vercel, we just connect, the serverless handler manages the rest
    mongoose.connect(dbUri).catch(err => console.error("Database connection error:", err));
}

export default app;
