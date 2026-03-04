const mongoose = require("mongoose");

const SimulationSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    income: Number,
    expenses: Number,
    current_savings: Number,
    planned_expense: Number,
    time_horizon: Number,
    predicted_savings: Number,

    created_at: {
        type: Date,
        default: Date.now
    }

});

module.exports = mongoose.model("Simulation", SimulationSchema);