const express = require("express");
const router = express.Router();
const { execFile } = require("child_process");
const path = require("path");

const Simulation = require("../models/simulation");
const auth = require("../middleware/auth");

function runPythonPrediction(args) {
    const scriptPath = path.resolve(__dirname, "../../ml/predict.py");
    const pythonCandidates = ["py", "python", "python3"];

    return new Promise((resolve, reject) => {
        let index = 0;

        const tryNext = () => {
            if (index >= pythonCandidates.length) {
                return reject(new Error("No working Python runtime found"));
            }

            const cmd = pythonCandidates[index++];
            execFile(cmd, [scriptPath, ...args.map(String)], { windowsHide: true }, (error, stdout, stderr) => {
                if (error) {
                    return tryNext();
                }
                if (stderr) {
                    console.error(stderr);
                }

                const prediction = Number.parseFloat(String(stdout).trim());
                if (!Number.isFinite(prediction)) {
                    return tryNext();
                }
                resolve(prediction);
            });
        };

        tryNext();
    });
}

function fallbackPrediction(income, expenses, currentSavings, plannedExpense, horizon) {
    const monthlyDisposable = income - expenses;
    const conservativeGrowth = monthlyDisposable * horizon * 0.92;
    const plannedImpact = plannedExpense * 0.35;
    return Number((currentSavings + conservativeGrowth - plannedImpact).toFixed(2));
}

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

        if (
            income === undefined ||
            expenses === undefined ||
            current_savings === undefined ||
            planned_expense === undefined ||
            time_horizon === undefined ||
            income === "" ||
            expenses === "" ||
            current_savings === "" ||
            planned_expense === "" ||
            time_horizon === ""
        ) {
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

        let prediction;
        try {
            prediction = await runPythonPrediction([incomeNum, expensesNum, savingsNum, plannedExpenseNum, horizonNum]);
        } catch (predictionError) {
            console.error("Python prediction failed, using fallback:", predictionError.message);
            prediction = fallbackPrediction(incomeNum, expensesNum, savingsNum, plannedExpenseNum, horizonNum);
        }

        const growth = Number.parseFloat((prediction - savingsNum).toFixed(2));

        // Financial insight logic
        let financial_health = "Stable";
        let insight = "Your savings trajectory looks healthy.";

        if (prediction < 50000) {
            financial_health = "Risky";
            insight = "Your projected savings are low. Reducing expenses may improve financial stability.";
        } else if (prediction < 120000) {
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
        } catch (dbError) {
            // Do not fail API response if persistence fails.
            console.error("Simulation save failed:", dbError.message);
        }

        res.json({
            predicted_savings: prediction,
            growth,
            financial_health,
            risk_score,
            insight
        });

    } catch (err) {
        next(err);
    }

});

router.get("/simulate/history", auth, async (req, res, next) => {

    try {
        const limitRaw = Number(req.query.limit || 20);
        const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 100) : 20;

        const rows = await Simulation.find({ user: req.userId })
            .sort({ created_at: -1 })
            .limit(limit)
            .lean();

        res.json({
            reports: rows.map((row) => ({
                id: String(row._id),
                created_at: row.created_at,
                income: row.income,
                expenses: row.expenses,
                current_savings: row.current_savings,
                planned_expense: row.planned_expense,
                time_horizon: row.time_horizon,
                predicted_savings: row.predicted_savings
            }))
        });
    } catch (err) {
        next(err);
    }

});

module.exports = router;
