const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const test = require("node:test");
const { createAuthToken } = require("../api-handlers/_lib/auth-token");

test("creates an HS256 JWT compatible with backend authentication", () => {
    const previousSecret = process.env.JWT_SECRET;
    process.env.JWT_SECRET = "test-secret-with-at-least-32-characters";

    try {
        const token = createAuthToken({
            email: "employee@desidea.com",
            role: "Employee",
            name: "Test Employee"
        });
        const [encodedHeader, encodedPayload, signature] = token.split(".");
        const header = JSON.parse(Buffer.from(encodedHeader, "base64url").toString("utf8"));
        const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));
        const expectedSignature = crypto
            .createHmac("sha256", process.env.JWT_SECRET)
            .update(`${encodedHeader}.${encodedPayload}`)
            .digest("base64url");

        assert.deepEqual(header, { alg: "HS256", typ: "JWT" });
        assert.equal(signature, expectedSignature);
        assert.equal(payload.email, "employee@desidea.com");
        assert.equal(payload.role, "Employee");
        assert.equal(payload.name, "Test Employee");
        assert.equal(payload.exp - payload.iat, 8 * 60 * 60);
    } finally {
        if (previousSecret === undefined) {
            delete process.env.JWT_SECRET;
        } else {
            process.env.JWT_SECRET = previousSecret;
        }
    }
});

test("requires a strong JWT secret", () => {
    const previousSecret = process.env.JWT_SECRET;
    delete process.env.JWT_SECRET;

    try {
        assert.throws(
            () => createAuthToken({ email: "employee@desidea.com", role: "Employee" }),
            /JWT_SECRET must be configured/
        );
    } finally {
        if (previousSecret !== undefined) {
            process.env.JWT_SECRET = previousSecret;
        }
    }
});
