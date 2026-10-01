function buildQuery(query) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query || {})) {
        if (key === "proxy" || key === "path" || value === undefined || value === null) continue;
        for (const item of Array.isArray(value) ? value : [value]) {
            params.append(key, String(item));
        }
    }
    return params.toString();
}

function resolveRoute(path, method, boardId) {
    if (path === "projects" && method === "GET") return { path: "/rest/api/3/project/search", query: true };
    if (/^projects\/[^/]+$/.test(path) && method === "GET") {
        return { path: `/rest/api/3/project/${encodeURIComponent(path.split("/")[1])}` };
    }
    if (path === "issue-types" && method === "GET") return { path: "/rest/api/3/issuetype" };
    if (path === "spaces" && method === "GET") return { path: "/wiki/api/v2/spaces", query: true, confluence: true };
    if (path === "boards" && method === "GET") return { path: "/rest/agile/1.0/board", query: true };
    if (path === "sprints" && method === "GET") {
        return { path: `/rest/agile/1.0/board/${encodeURIComponent(String(boardId))}/sprint`, query: true };
    }
    if (path === "issues/search" && (method === "GET" || method === "POST")) {
        return { path: "/rest/api/3/search/jql", search: true };
    }
    if (path === "issues" && method === "POST") return { path: "/rest/api/3/issue", body: true };
    if (path === "myself" && method === "GET") return { path: "/rest/api/3/myself" };
    if (path === "users/assignable" && method === "GET") {
        return { path: "/rest/api/3/user/assignable/search", query: true };
    }

    const issueMatch = path.match(/^issues\/([^/]+)$/);
    if (issueMatch && ["GET", "PUT", "DELETE"].includes(method)) {
        return {
            path: `/rest/api/3/issue/${encodeURIComponent(issueMatch[1])}`,
            body: method === "PUT"
        };
    }

    return null;
}

module.exports = async function jiraProxyHandler(req, res) {
    const routePath = String(req.query?.path || "").replace(/^\/+|\/+$/g, "");
    const method = String(req.method || "GET").toUpperCase();

    const route = resolveRoute(routePath, method, req.query?.boardId || "100");
    if (!route) {
        return res.status(404).json({ message: "Jira endpoint not found" });
    }

    const email = route.confluence
        ? (process.env.CONFLUENCE_EMAIL || process.env.JIRA_EMAIL)
        : (process.env.JIRA_EMAIL || process.env.CONFLUENCE_EMAIL);
    const token = route.confluence
        ? (process.env.CONFLUENCE_API_TOKEN || process.env.JIRA_API_TOKEN)
        : (process.env.JIRA_API_TOKEN || process.env.CONFLUENCE_API_TOKEN);
    if (!email || !token) {
        return res.status(503).json({ message: "Jira credentials are not configured" });
    }

    try {
        const host = (process.env.JIRA_HOST || "https://karnativanhitha.atlassian.net").replace(/\/+$/, "");
        const query = route.query ? buildQuery(req.query) : "";
        const url = `${host}${route.path}${query ? `?${query}` : ""}`;
        const headers = {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Basic ${Buffer.from(`${email}:${token}`).toString("base64")}`
        };
        const options = { method, headers };

        if (route.search) {
            const body = req.method === "POST" ? (req.body || {}) : (req.query || {});
            const payload = {
                jql: String(body.jql || "project is not EMPTY").trim(),
                maxResults: Number(body.maxResults || 50),
                fields: [
                    "summary", "issuetype", "description", "priority", "status", "assignee",
                    "duedate", "parent", "project", "timespent", "timeoriginalestimate",
                    "timeestimate", "worklog"
                ]
            };
            if (body.nextPageToken) payload.nextPageToken = body.nextPageToken;
            options.method = "POST";
            options.body = JSON.stringify(payload);
        } else if (route.body) {
            options.body = JSON.stringify(req.body || {});
        }

        const response = await fetch(url, options);
        if (response.status === 204) {
            return res.status(200).json({ message: "Operation successful" });
        }

        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
            const data = await response.json();
            if (route.confluence && [401, 403, 404].includes(response.status)) {
                return res.status(200).json({ values: [] });
            }
            return res.status(response.status).json(data);
        }

        const text = await response.text();
        if (!response.ok) {
            if (route.confluence && [401, 403, 404].includes(response.status)) {
                return res.status(200).json({ values: [] });
            }
            return res.status(response.status).json({
                message: "Atlassian API returned a non-JSON response",
                status: response.status
            });
        }
        return res.status(response.status).send(text);
    } catch (error) {
        console.error("Jira proxy failed:", error);
        return res.status(502).json({ message: "Unable to fetch Jira details", error: error.message });
    }
};