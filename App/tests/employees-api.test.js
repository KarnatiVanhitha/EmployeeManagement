const assert = require("node:assert/strict");
const test = require("node:test");
const employeesHandler = require("../api/employees");

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

    try {
        const response = createResponse();
        await employeesHandler({ method: "POST", body: {} }, response);

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

test("rejects methods other than GET and POST", async () => {
    const response = createResponse();
    await employeesHandler({ method: "PATCH" }, response);

    assert.equal(response.statusCode, 405);
    assert.equal(response.headers.Allow, "GET, POST");
});

test("validates signup account details before accessing the database", async () => {
    const response = createResponse();
    await employeesHandler({
        method: "POST",
        query: { route: "signup" },
        body: { FullName: "Taylor", Email: "invalid@example.com", Password: "password1" }
    }, response);

    assert.equal(response.statusCode, 400);
    assert.equal(response.body.message, "Employee email must use the @desidea.com domain");
});

test("requires a valid name and password for signup", async () => {
    const emptyNameResponse = createResponse();
    await employeesHandler({
        method: "POST",
        query: { route: "signup" },
        body: { FullName: " ", Email: "taylor@desidea.com", Password: "password1" }
    }, emptyNameResponse);
    assert.equal(emptyNameResponse.statusCode, 400);
    assert.equal(emptyNameResponse.body.message, "Full name is required");

    const shortPasswordResponse = createResponse();
    await employeesHandler({
        method: "POST",
        query: { route: "signup" },
        body: { FullName: "Taylor", Email: "taylor@desidea.com", Password: "short" }
    }, shortPasswordResponse);
    assert.equal(shortPasswordResponse.statusCode, 400);
    assert.equal(shortPasswordResponse.body.message, "Password must contain at least 8 characters");
});

test("valid signup requests reach database configuration validation", async () => {
    const names = ["DB_SERVER", "DB_DATABASE", "DB_USER", "DB_PASSWORD"];
    const previousValues = Object.fromEntries(names.map((name) => [name, process.env[name]]));
    names.forEach((name) => delete process.env[name]);

    try {
        const response = createResponse();
        await employeesHandler({
            method: "POST",
            query: { route: "signup" },
            body: {
                FullName: "Taylor Employee",
                Email: "taylor@desidea.com",
                Password: "Password1"
            }
        }, response);

        assert.equal(response.statusCode, 503);
        assert.equal(response.body.message, "Database is not configured");
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