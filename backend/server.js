const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const simulateRoutes = require("./routes/simulate");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", simulateRoutes);

// Health check (useful for demo + debugging)
app.get("/api/health", (req, res) => {
    res.json({ status: "CentSight backend running" });
});

// MongoDB connection
mongoose.connect(
    "mongodb+srv://CentSight_db_user:bH1J9na7g29fVuo7@centsight-server.9fjskud.mongodb.net/?appName=CentSight-server"
);

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
app.listen(5000, () => {
    console.log("Server running on port 5000");
});