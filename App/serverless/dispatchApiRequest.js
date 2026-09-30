const routes = [
    { pattern: /^\/api\/admins\/login\/?$/, handler: require("../api-handlers/admins/login.js") },
    { pattern: /^\/api\/admins\/([^/]+)\/?$/, handler: require("../api-handlers/admins/[id].js"), idIndex: 1 },
    { pattern: /^\/api\/admins\/?$/, handler: require("../api-handlers/admins.js") },
    { pattern: /^\/api\/departments\/?$/, handler: require("../api-handlers/departments.js") },
    { pattern: /^\/api\/employees\/login\/?$/, handler: require("../api-handlers/employees/login.js") },
    { pattern: /^\/api\/employees\/([^/]+)\/?$/, handler: require("../api-handlers/employees/[id].js"), idIndex: 1 },
    { pattern: /^\/api\/employees\/?$/, handler: require("../api-handlers/employees.js") },
    { pattern: /^\/api\/leaves\/?$/, handler: require("../api-handlers/leaves.js") },
    { pattern: /^\/api\/managers\/?$/, handler: require("../api-handlers/managers.js") },
    { pattern: /^\/api\/projects\/?$/, handler: require("../api-handlers/projects.js") },
    { pattern: /^\/api\/roles(?:\/department\/([^/]+))?\/?$/, handler: require("../api-handlers/roles.js"), idIndex: 1 },
    { pattern: /^\/api\/salaries\/?$/, handler: require("../api-handlers/salaries.js") },
    { pattern: /^\/api\/calendar\/holidays\/?$/, handler: require("../api-handlers/calendar/holidays.js") },
    { pattern: /^\/api\/calendar\/meetings\/?$/, handler: require("../api-handlers/calendar/meetings.js") },
    { pattern: /^\/api\/tasks\/employee\/([^/]+)\/?$/, handler: require("../api-handlers/tasks/employee/[id].js"), idIndex: 1 }
];

function resolveRoute(pathname) {
    for (const route of routes) {
        const match = route.pattern.exec(pathname);
        if (match) {
            return {
                handler: route.handler,
                id: route.idIndex ? decodeURIComponent(match[route.idIndex]) : undefined
            };
        }
    }

    return null;
}

async function dispatchApiRequest(req, res) {
    const pathname = new URL(req.url, "http://localhost").pathname;
    const route = resolveRoute(pathname);
    if (!route) {
        return res.status(404).json({ message: "Not found" });
    }

    const routedRequest = Object.create(req);
    routedRequest.query = { ...(req.query || {}) };
    if (route.id !== undefined) {
        routedRequest.query.id = route.id;
    }

    return route.handler(routedRequest, res);
}

module.exports = dispatchApiRequest;
module.exports.resolveRoute = resolveRoute;