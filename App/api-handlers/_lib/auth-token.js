const crypto = require("node:crypto");

function getJwtSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret || Buffer.byteLength(secret, "utf8") < 32) {
        throw new Error("JWT_SECRET must be configured with at least 32 characters");
    }
    return secret;
}

function createAuthToken({ email, role, name }) {
    const issuedAt = Math.floor(Date.now() / 1000);
    const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
    const payload = Buffer.from(JSON.stringify({
        email,
        role,
        name,
        iat: issuedAt,
        exp: issuedAt + 8 * 60 * 60
    })).toString("base64url");
    const unsignedToken = `${header}.${payload}`;
    const signature = crypto
        .createHmac("sha256", getJwtSecret())
        .update(unsignedToken)
        .digest("base64url");

    return `${unsignedToken}.${signature}`;
}

module.exports = { createAuthToken, getJwtSecret };
