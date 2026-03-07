const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

const SECRET = process.env.JWT_SECRET || "centsight_secret";


// ==========================
// Signup Route
// ==========================

router.post("/signup", async (req, res, next) => {

    try {

        const { name, email, password } = req.body || {};

        if (!name || !email || !password) {
            return res.status(400).json({ error: "Name, email and password are required" });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }

        const hashed = await bcrypt.hash(password, 10);

        const user = new User({
            name,
            email,
            password: hashed
        });

        await user.save();

        res.json({ message: "User created successfully" });

    } catch (err) {
        next(err);
    }

});


// ==========================
// Login Route
// ==========================

router.post("/login", async (req, res, next) => {

    try {

        const { email, password } = req.body || {};

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password required" });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ error: "User not found" });
        }

        const valid = await bcrypt.compare(password, user.password);

        if (!valid) {
            return res.status(401).json({ error: "Invalid password" });
        }

        const token = jwt.sign(
            { userId: user._id },
            SECRET,
            { expiresIn: "1d" }
        );

        res.json({ token });

    } catch (err) {
        next(err);
    }

});

module.exports = router;
