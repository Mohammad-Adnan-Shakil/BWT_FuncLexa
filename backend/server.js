const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const simulateRoutes = require("./routes/simulate");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI =
    process.env.MONGO_URI ||
    (process.env.NODE_ENV !== "production"
        ? "mongodb+srv://CentSight_db_user:bH1J9na7g29fVuo7@centsight-server.9fjskud.mongodb.net/?appName=CentSight-server"
        : "");
const corsOrigins = (process.env.CORS_ORIGIN || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

if (!MONGO_URI) {
    throw new Error("Missing MONGO_URI environment variable");
}

// Middleware
app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || corsOrigins.length === 0 || corsOrigins.includes(origin)) {
                return callback(null, true);
            }
            return callback(new Error("Not allowed by CORS"));
        }
    })
);
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", simulateRoutes);

// Health check (useful for demo + debugging)
app.get("/api/health", (req, res) => {
    res.json({ status: "CentSight backend running" });
});

// MongoDB connection
mongoose.connect(MONGO_URI);

mongoose.connection.once("open", () => {
    console.log("MongoDB connected");
});

// Basic error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Internal Server Error" });
});
app.use(errorHandler);
// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
