const assert = require("node:assert/strict");
const test = require("node:test");
const calendarHandler = require("../api/calendar");
const meetingsHandler = (req, res) => calendarHandler({
    ...req,
    query: { ...req.query, resource: "meetings" }
}, res);
const holidaysHandler = (req, res) => calendarHandler({
    ...req,
    query: { ...req.query, resource: "holidays" }
}, res);

const handlers = [
    require("../api/admins"),
    require("../api-handlers/_lib/admin-by-id"),
    require("../api-handlers/_lib/employee-by-id"),
    (req, res) => require("../api/leaves")({
        ...req,
        query: { ...req.query, resource: "salaries" }
    }, res),
    require("../api/projects"),
    require("../api/tasks/employee/[id]"),
    holidaysHandler
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
        assert.ok(response.headers.Allow.includes("GET"));
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