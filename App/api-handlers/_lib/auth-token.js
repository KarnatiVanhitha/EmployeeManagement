const crypto = require("node:crypto");
const path = require("node:path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "..", "..", "..", "Backend", ".env.local") });
dotenv.config({ path: path.resolve(__dirname, "..", "..", "..", "Backend", ".env") });
dotenv.config();

const FALLBACK_JWT_SECRET = "rSxBYEf6HoVPOIC2o2wx9NBCZMuH_kvHb0L56VuQjfeyVyddJRvJCSESyy_fSWAF";

function getJwtSecret() {
    const secret = process.env.JWT_SECRET || FALLBACK_JWT_SECRET;
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

function verifyAuthToken(token) {
    if (!token || typeof token !== "string") return null;
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [header, payload, signature] = parts;
    const expectedSignature = crypto
        .createHmac("sha256", getJwtSecret())
        .update(`${header}.${payload}`)
        .digest("base64url");
    if (signature !== expectedSignature) return null;
    try {
        const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
        if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
            return null;
        }
        return decoded;
    } catch {
        return null;
    }
}

module.exports = { createAuthToken, getJwtSecret, verifyAuthToken };
