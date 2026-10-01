const assert = require("node:assert/strict");
const test = require("node:test");
const managersHandler = require("../api/managers");

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

test("manager registration POST reaches database configuration", async () => {
    const names = ["DB_SERVER", "DB_DATABASE", "DB_USER", "DB_PASSWORD"];
    const previousValues = Object.fromEntries(names.map((name) => [name, process.env[name]]));
    names.forEach((name) => delete process.env[name]);

    try {
        const response = createResponse();
        await managersHandler({
            method: "POST",
            body: {
                ManagerID: 42,
                ManagerName: "Test Manager",
                Email: "manager@example.com",
                TeamName: "Engineering"
            }
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

test("manager registration requires manager details", async () => {
    const response = createResponse();
    await managersHandler({ method: "POST", body: {} }, response);

    assert.equal(response.statusCode, 400);
    assert.deepEqual(response.body, {
        message: "Manager ID, name, email, and team are required"
    });
});