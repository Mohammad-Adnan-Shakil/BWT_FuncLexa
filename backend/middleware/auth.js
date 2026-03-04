const jwt = require("jsonwebtoken");

const SECRET = "centsight_secret";

module.exports = function (req, res, next) {

    const token = req.headers.authorization;

    if (!token) return res.status(401).json({ error: "No token" });

    try {

        const decoded = jwt.verify(token, SECRET);

        req.userId = decoded.userId;

        next();

    } catch {
        res.status(401).json({ error: "Invalid token" });
    }

};