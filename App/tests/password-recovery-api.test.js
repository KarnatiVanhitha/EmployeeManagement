const assert = require("node:assert/strict");
const test = require("node:test");
const adminsHandler = require("../api/admins");
const employeesHandler = require("../api/employees");
const vercelConfig = require("../vercel.json");

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

test("Vercel rewrites password recovery URLs to the corresponding API handlers", () => {
    const rewriteSources = vercelConfig.rewrites.map((rewrite) => rewrite.source);

    for (const route of [
        "/api/admins/verify-email",
        "/api/admins/reset-password",
        "/api/employees/verify-email",
        "/api/employees/reset-password",
        "/api/employees/signup"
    ]) {
        assert.ok(rewriteSources.includes(route), `Missing Vercel rewrite for ${route}`);
    }
});

test("admin and employee password recovery routes reach database configuration validation", async () => {
    const names = ["DB_SERVER", "DB_DATABASE", "DB_USER", "DB_PASSWORD"];
    const previousValues = Object.fromEntries(names.map((name) => [name, process.env[name]]));
    names.forEach((name) => delete process.env[name]);

    try {
        for (const handler of [adminsHandler, employeesHandler]) {
            for (const route of ["verify-email", "reset-password"]) {
                const response = createResponse();
                await handler({
                    method: "POST",
                    query: { route },
                    body: {
                        Email: "user@desidea.com",
                        NewPassword: "NewPassword1!"
                    }
                }, response);

                assert.equal(response.statusCode, 503);
                assert.equal(response.body.message, "Database is not configured");
            }
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
