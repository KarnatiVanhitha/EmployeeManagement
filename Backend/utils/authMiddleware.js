const jwt = require("jsonwebtoken");
const { getJwtSecret } = require("./authTokens");

function verifyToken(req, res, next) {
    const authorization = req.headers.authorization || "";
    const match = authorization.match(/^Bearer\s+(.+)$/i);
    if (!match) {
        return res.status(401).json({ error: "Please log in." });
    }

    let secret;
    try {
        secret = getJwtSecret();
    } catch (error) {
        console.error("JWT configuration error:", error.message);
        return res.status(500).json({ error: "Authentication is not configured." });
    }

    try {
        req.user = jwt.verify(match[1], secret);
        return next();
    } catch {
        return res.status(401).json({ error: "Your session is invalid or expired. Please log in again." });
    }
}

module.exports = { verifyToken };
