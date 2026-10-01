const assert = require("node:assert/strict");
const test = require("node:test");
const jiraProxyHandler = require("../api-handlers/_lib/jira-proxy");

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
        send(body) {
            this.body = body;
            return this;
        }
    };
}

const credentialNames = ["JIRA_EMAIL", "JIRA_API_TOKEN", "CONFLUENCE_EMAIL", "CONFLUENCE_API_TOKEN"];

function saveCredentials() {
    return Object.fromEntries(credentialNames.map((name) => [name, process.env[name]]));
}

function clearCredentials() {
    credentialNames.forEach((name) => delete process.env[name]);
}

function restoreCredentials(values) {
    credentialNames.forEach((name) => {
        if (values[name] === undefined) {
            delete process.env[name];
        } else {
            process.env[name] = values[name];
        }
    });
}

test("reports missing Jira credentials clearly", async () => {
    const previous = saveCredentials();
    clearCredentials();

    try {
        const response = createResponse();
        await jiraProxyHandler({ method: "GET", query: { path: "projects" } }, response);

        assert.equal(response.statusCode, 503);
        assert.deepEqual(response.body, { message: "Jira credentials are not configured" });
    } finally {
        restoreCredentials(previous);
    }
});

test("forwards Jira project queries using configured credentials", async () => {
    const previous = saveCredentials();
    const previousFetch = global.fetch;
    process.env.JIRA_EMAIL = "jira@example.com";
    process.env.JIRA_API_TOKEN = "test-token";
    process.env.JIRA_HOST = "https://jira.example.com";
    let requestedUrl;
    let requestedOptions;
    global.fetch = async (url, options) => {
        requestedUrl = String(url);
        requestedOptions = options;
        return new Response(JSON.stringify({ values: [] }), {
            status: 200,
            headers: { "content-type": "application/json" }
        });
    };

    try {
        const response = createResponse();
        await jiraProxyHandler({
            method: "GET",
            query: {
                path: "projects",
                maxResults: "100",
                orderBy: "name"
            }
        }, response);

        assert.equal(response.statusCode, 200);
        assert.deepEqual(response.body, { values: [] });
        assert.equal(requestedUrl, "https://jira.example.com/rest/api/3/project/search?maxResults=100&orderBy=name");
        assert.equal(requestedOptions.method, "GET");
        assert.equal(
            requestedOptions.headers.Authorization,
            `Basic ${Buffer.from("jira@example.com:test-token").toString("base64")}`
        );
    } finally {
        global.fetch = previousFetch;
        delete process.env.JIRA_HOST;
        restoreCredentials(previous);
    }
});
