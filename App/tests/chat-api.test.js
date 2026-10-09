const assert = require("node:assert/strict");
const test = require("node:test");
const { chatHandler } = require("../api-handlers/_lib/chat-handler");
const { createAuthToken } = require("../api-handlers/_lib/auth-token");

function createResponse() {
    return {
        statusCode: undefined,
        body: undefined,
        headers: {},
        setHeader(name, value) {
            this.headers[name] = value;
        },
        status(statusCode) {
            this.statusCode = statusCode;
            return this;
        },
        json(body) {
            this.body = body;
            return this;
        }
    };
}

test("chatHandler rejects methods other than POST", async () => {
    const res = createResponse();
    await chatHandler({ method: "GET", headers: {} }, res);

    assert.equal(res.statusCode, 405);
    assert.equal(res.headers.Allow, "POST");
});

test("chatHandler rejects requests without Authorization header", async () => {
    const res = createResponse();
    await chatHandler({ method: "POST", headers: {}, body: { message: "Hello" } }, res);

    assert.equal(res.statusCode, 401);
    assert.deepEqual(res.body, { error: "Please log in." });
});

test("chatHandler rejects invalid or expired tokens", async () => {
    const res = createResponse();
    await chatHandler({
        method: "POST",
        headers: { authorization: "Bearer invalid.token.value" },
        body: { message: "Hello" }
    }, res);

    assert.equal(res.statusCode, 401);
    assert.match(res.body.error, /invalid or expired/i);
});

test("chatHandler rejects empty message", async () => {
    const token = createAuthToken({ email: "test@desidea.com", role: "Employee", name: "Tester" });
    const res = createResponse();
    await chatHandler({
        method: "POST",
        headers: { authorization: `Bearer ${token}` },
        body: { message: "   " }
    }, res);

    assert.equal(res.statusCode, 400);
    assert.deepEqual(res.body, { error: "Message is required." });
});
