const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect("mongodb+srv://CentSight_db_user:bH1J9na7g29fVuo7@centsight-server.9fjskud.mongodb.net/?appName=CentSight-server");

mongoose.connection.once("open", () => {
    console.log("MongoDB connected");
});

const simulateRoute = require("./routes/simulate");

app.use("/api", simulateRoute);

app.get("/health", (req, res) => {
    res.json({ status: "Backend running" });
});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});