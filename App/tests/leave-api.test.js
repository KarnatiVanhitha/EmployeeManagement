const assert = require("node:assert/strict");
const test = require("node:test");
const leavesHandler = require("../api/leaves");

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
        },
        end() {
            return this;
        }
    };
}

test("accepts leave submissions and reaches database configuration", async () => {
    const names = ["DB_SERVER", "DB_DATABASE", "DB_USER", "DB_PASSWORD"];
    const previousValues = Object.fromEntries(names.map((name) => [name, process.env[name]]));
    names.forEach((name) => delete process.env[name]);

    try {
        const response = createResponse();
        await leavesHandler({ method: "POST", body: {} }, response);

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
    await leavesHandler({ method: "PATCH" }, response);

    assert.equal(response.statusCode, 405);
    assert.equal(response.headers.Allow, "GET, POST, OPTIONS");
});

test("accepts CORS preflight requests", async () => {
    const response = createResponse();
    await leavesHandler({
        method: "OPTIONS",
        headers: {
            origin: "https://app.example.com",
            "access-control-request-headers": "content-type"
        }
    }, response);

    assert.equal(response.statusCode, 204);
    assert.equal(response.headers.Allow, "GET, POST, OPTIONS");
    assert.equal(response.headers["Access-Control-Allow-Origin"], "https://app.example.com");
    assert.equal(response.headers["Access-Control-Allow-Methods"], "GET, POST, OPTIONS");
    assert.equal(response.headers["Access-Control-Allow-Headers"], "content-type");
});