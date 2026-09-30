const assert = require("node:assert/strict");
const test = require("node:test");
const departmentsHandler = require("../api-handlers/departments");

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

test("returns a configuration error when database environment variables are missing", async () => {
    const names = ["DB_SERVER", "DB_DATABASE", "DB_USER", "DB_PASSWORD"];
    const previousValues = Object.fromEntries(names.map((name) => [name, process.env[name]]));
    names.forEach((name) => delete process.env[name]);

    const response = createResponse();
    await departmentsHandler({ method: "GET" }, response);

    names.forEach((name) => {
        if (previousValues[name] === undefined) {
            delete process.env[name];
        } else {
            process.env[name] = previousValues[name];
        }
    });

    assert.equal(response.statusCode, 503);
    assert.deepEqual(response.body, {
        success: false,
        message: "Database is not configured"
    });
});

test("rejects methods other than GET", async () => {
    const response = createResponse();
    await departmentsHandler({ method: "POST" }, response);

    assert.equal(response.statusCode, 405);
    assert.equal(response.headers.Allow, "GET");
});