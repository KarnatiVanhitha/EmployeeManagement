const assert = require("node:assert/strict");
const test = require("node:test");
const adminLoginHandler = require("../api-handlers/admins/login");

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

test("rejects methods other than POST", async () => {
    const response = createResponse();
    await adminLoginHandler({ method: "GET" }, response);

    assert.equal(response.statusCode, 405);
    assert.equal(response.headers.Allow, "POST");
});

test("requires email and password", async () => {
    const response = createResponse();
    await adminLoginHandler({ method: "POST", body: {} }, response);

    assert.equal(response.statusCode, 400);
    assert.deepEqual(response.body, { message: "Email and password are required" });
});

test("returns a configuration error when database environment variables are missing", async () => {
    const names = ["DB_SERVER", "DB_DATABASE", "DB_USER", "DB_PASSWORD"];
    const previousValues = Object.fromEntries(names.map((name) => [name, process.env[name]]));
    names.forEach((name) => delete process.env[name]);

    try {
        const response = createResponse();
        await adminLoginHandler({
            method: "POST",
            body: { Email: "admin@example.com", Password: "password" }
        }, response);

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