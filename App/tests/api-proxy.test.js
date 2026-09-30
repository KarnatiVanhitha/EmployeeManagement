const assert = require("node:assert/strict");
const test = require("node:test");
const apiProxy = require("../api/[...path]");

function createResponse() {
    return {
        statusCode: undefined,
        body: undefined,
        headers: {},
        status(statusCode) {
            this.statusCode = statusCode;
            return this;
        },
        setHeader(name, value) {
            this.headers[name] = value;
        },
        send(body) {
            this.body = body;
            return this;
        },
        json(body) {
            this.body = body;
            return this;
        }
    };
}

test("returns a clear configuration error when the backend URL is missing", async () => {
    const previousBackendUrl = process.env.BACKEND_URL;
    delete process.env.BACKEND_URL;

    try {
        const response = createResponse();
        await apiProxy({ method: "GET", url: "/api/departments", headers: {} }, response);

        assert.equal(response.statusCode, 503);
        assert.deepEqual(response.body, { message: "BACKEND_URL is not configured" });
    } finally {
        if (previousBackendUrl === undefined) delete process.env.BACKEND_URL;
        else process.env.BACKEND_URL = previousBackendUrl;
    }
});

test("forwards API path, query, method, and JSON body to Express backend", async () => {
    const previousBackendUrl = process.env.BACKEND_URL;
    const previousFetch = global.fetch;
    let forwardedUrl;
    let forwardedOptions;
    process.env.BACKEND_URL = "https://backend.example.com/";
    global.fetch = async (url, options) => {
        forwardedUrl = url;
        forwardedOptions = options;
        return {
            status: 201,
            headers: { get: () => "application/json" },
            arrayBuffer: async () => Buffer.from('{"saved":true}')
        };
    };

    try {
        const response = createResponse();
        await apiProxy({
            method: "POST",
            url: "/api/employees?source=signup",
            headers: { "content-type": "application/json" },
            body: { Email: "employee@desidea.com" }
        }, response);

        assert.equal(forwardedUrl, "https://backend.example.com/api/employees?source=signup");
        assert.equal(forwardedOptions.method, "POST");
        assert.equal(forwardedOptions.body, '{"Email":"employee@desidea.com"}');
        assert.equal(response.statusCode, 201);
        assert.equal(response.headers["Content-Type"], "application/json");
        assert.equal(response.body.toString(), '{"saved":true}');
    } finally {
        global.fetch = previousFetch;
        if (previousBackendUrl === undefined) delete process.env.BACKEND_URL;
        else process.env.BACKEND_URL = previousBackendUrl;
    }
});