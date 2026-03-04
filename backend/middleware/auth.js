const jwt = require("jsonwebtoken");

const SECRET = "centsight_secret";

module.exports = function (req, res, next) {

    const headerValue = req.headers.authorization || "";
    const raw = Array.isArray(headerValue) ? headerValue[0] : headerValue;
    const token = String(raw).replace(/^Bearer\s+/i, "").trim();

    if (!token) return res.status(401).json({ error: "No token" });

    try {

        const decoded = jwt.verify(token, SECRET);

        req.userId = decoded.userId;

        next();

    } catch {
        res.status(401).json({ error: "Invalid token" });
    }

};
