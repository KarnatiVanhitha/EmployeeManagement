const jwt = require("jsonwebtoken");

const FALLBACK_JWT_SECRET = "rSxBYEf6HoVPOIC2o2wx9NBCZMuH_kvHb0L56VuQjfeyVyddJRvJCSESyy_fSWAF";

function getJwtSecret() {
    const secret = process.env.JWT_SECRET || FALLBACK_JWT_SECRET;
    if (!secret || Buffer.byteLength(secret, "utf8") < 32) {
        throw new Error("JWT_SECRET must be configured with at least 32 characters");
    }
    return secret;
}

function createAuthToken({ email, role, name }) {
    return jwt.sign(
        { email, role, name },
        getJwtSecret(),
        { expiresIn: "8h" }
    );
}

module.exports = { createAuthToken, getJwtSecret };
