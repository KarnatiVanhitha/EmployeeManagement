const assert = require("node:assert/strict");
const test = require("node:test");
const meetingsHandler = require("../api/calendar/meetings");

const handlers = [
    require("../api/admins"),
    require("../api-handlers/_lib/admin-by-id"),
    require("../api-handlers/_lib/employee-by-id"),
    require("../api/managers"),
    require("../api/salaries"),
    require("../api/projects"),
    require("../api/tasks/employee/[id]"),
    require("../api/calendar/holidays")
];

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

test("dashboard data handlers reject unsupported methods", async () => {
    for (const handler of handlers) {
        const response = createResponse();
        await handler({ method: "POST", query: {}, body: {} }, response);

        assert.equal(response.statusCode, 405);
        assert.equal(response.headers.Allow, "GET");
    }
});

test("dashboard data handlers report missing database configuration", async () => {
    const names = ["DB_SERVER", "DB_DATABASE", "DB_USER", "DB_PASSWORD"];
    const previousValues = Object.fromEntries(names.map((name) => [name, process.env[name]]));
    names.forEach((name) => delete process.env[name]);

    try {
        for (const handler of handlers) {
            const response = createResponse();
            await handler({ method: "GET", query: { id: "1" } }, response);

            assert.equal(response.statusCode, 503);
            assert.equal(response.body.message, "Database is not configured");
        }
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

test("meeting creation allows employees to reach database validation", async () => {
    const names = ["DB_SERVER", "DB_DATABASE", "DB_USER", "DB_PASSWORD"];
    const previousValues = Object.fromEntries(names.map((name) => [name, process.env[name]]));
    names.forEach((name) => delete process.env[name]);

    try {
        const response = createResponse();
        await meetingsHandler({
            method: "POST",
            headers: { "x-user-role": "employee" },
            body: {}
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