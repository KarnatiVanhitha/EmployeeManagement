const assert = require("node:assert/strict");
const test = require("node:test");
const departmentsHandler = require("../api/[...path]");

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

test("department requests report missing backend configuration", async () => {
    const previousBackendUrl = process.env.BACKEND_URL;
    delete process.env.BACKEND_URL;
    const response = createResponse();
    await departmentsHandler({ method: "GET", url: "/api/departments", headers: {} }, response);
    if (previousBackendUrl === undefined) delete process.env.BACKEND_URL;
    else process.env.BACKEND_URL = previousBackendUrl;

    assert.equal(response.statusCode, 503);
    assert.deepEqual(response.body, { message: "BACKEND_URL is not configured" });
});