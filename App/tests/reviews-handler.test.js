const assert = require("node:assert/strict");
const test = require("node:test");
const reviewsHandler = require("../api-handlers/_lib/reviews");

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

test("allows review creation to reach database setup without role restrictions", async () => {
    const names = ["DB_SERVER", "DB_DATABASE", "DB_USER", "DB_PASSWORD"];
    const previousValues = Object.fromEntries(names.map((name) => [name, process.env[name]]));
    names.forEach((name) => delete process.env[name]);

    try {
        const response = createResponse();
        await reviewsHandler({ method: "POST", query: { path: "" }, body: {} }, response);

        assert.equal(response.statusCode, 503);
        assert.deepEqual(response.body, {
            success: false,
            message: "Database is not configured"
        });
    } finally {
        names.forEach((name) => {
            if (previousValues[name] === undefined) {
                delete process.env[name];
            } else {
                process.env[name] = previousValues[name];
            }
        });
    }
});

test("rejects unsupported review routes", async () => {
    const response = createResponse();
    await reviewsHandler({ method: "GET", query: { path: "unknown" } }, response);

    assert.equal(response.statusCode, 404);
    assert.deepEqual(response.body, { message: "Review endpoint not found" });
});

test("rejects unsupported review methods", async () => {
    const response = createResponse();
    await reviewsHandler({ method: "PATCH", query: { path: "" } }, response);

    assert.equal(response.statusCode, 405);
    assert.equal(response.headers.Allow, "GET, POST");
});
