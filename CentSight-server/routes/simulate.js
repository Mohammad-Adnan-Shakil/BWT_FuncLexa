const express = require("express");
const router = express.Router();
const { exec } = require("child_process");

const Simulation = require("../models/simulation");
const auth = require("../middleware/auth");

router.post("/simulate", auth, async (req, res, next) => {

    try {

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

        // Convert to numbers
        const incomeNum = Number(income);
        const expensesNum = Number(expenses);
        const savingsNum = Number(current_savings);
        const plannedExpenseNum = Number(planned_expense);
        const horizonNum = Number(time_horizon);

        // Basic data validation
        if (incomeNum <= 0) {
            return res.status(400).json({ error: "Income must be greater than 0" });
        }

        if (expensesNum < 0) {
            return res.status(400).json({ error: "Expenses cannot be negative" });
        }

        if (expensesNum >= incomeNum) {
            return res.status(400).json({ error: "Expenses cannot exceed income" });
        }

        if (![6, 12].includes(horizonNum)) {
            return res.status(400).json({ error: "Time horizon must be 6 or 12 months" });
        }

        const command = `py ../ml/predict.py ${incomeNum} ${expensesNum} ${savingsNum} ${plannedExpenseNum} ${horizonNum}`;

        exec(command, async (error, stdout, stderr) => {

            if (error) {
                console.error(error);
                return res.status(500).json({ error: "Prediction failed" });
            }

            if (stderr) {
                console.error(stderr);
            }

            const prediction = parseFloat(stdout);
            const growth = parseFloat((prediction - savingsNum).toFixed(2));

            // Financial insight logic
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

            // Risk score
            let risk_score = 50;

            if (expensesNum > incomeNum * 0.7) risk_score += 20;
            if (prediction < 60000) risk_score += 20;
            if (savingsNum < 20000) risk_score += 10;

            if (risk_score > 100) risk_score = 100;

            try {

                const newSimulation = new Simulation({
                    user: req.userId,
                    income: incomeNum,
                    expenses: expensesNum,
                    current_savings: savingsNum,
                    planned_expense: plannedExpenseNum,
                    time_horizon: horizonNum,
                    predicted_savings: prediction
                });

                await newSimulation.save();

                res.json({
                    predicted_savings: prediction,
                    growth,
                    financial_health,
                    risk_score,
                    insight
                });

            } catch (dbError) {

                console.error(dbError);
                res.status(500).json({ error: "Database error" });

            }

        });

    } catch (err) {
        next(err);
    }

});

module.exports = router;