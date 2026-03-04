const express = require("express");
const router = express.Router();
const { exec } = require("child_process");

const Simulation = require("../models/Simulation");

router.post("/simulate", async (req, res) => {

    // safety check
    if (!req.body) {
        return res.status(400).json({ error: "No data received" });
    }

    const {
        income,
        expenses,
        current_savings,
        planned_expense,
        time_horizon
    } = req.body;

    if (!income || !expenses || !current_savings || !planned_expense || !time_horizon) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    // command to run Python prediction
    const command = `py ../ml/predict.py ${income} ${expenses} ${current_savings} ${planned_expense} ${time_horizon}`;

    exec(command, async (error, stdout, stderr) => {

        if (error) {
            console.error(error);
            return res.status(500).json({ error: "Prediction failed" });
        }

        if (stderr) {
            console.error(stderr);
        }

        const prediction = parseFloat(stdout);

// Financial AI insight logic
let financial_health = "Stable";
let insight = "Your savings trajectory looks healthy.";

if (prediction < 50000) {
    financial_health = "Risky";
    insight = "Your projected savings are low. Reducing expenses may improve financial stability.";
}
else if (prediction < 120000) {
    financial_health = "Moderate";
    insight = "Your financial growth is moderate. Controlling expenses could improve savings.";
}

        try {

            const newSimulation = new Simulation({
                income,
                expenses,
                current_savings,
                planned_expense,
                time_horizon,
                predicted_savings: prediction
            });

            await newSimulation.save();

            res.json({
    predicted_savings: prediction,
    financial_health,
    insight
});

        } catch (dbError) {
            console.error(dbError);
            res.status(500).json({ error: "Database error" });
        }

    });

});

module.exports = router;