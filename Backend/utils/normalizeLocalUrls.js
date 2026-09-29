const localUrlOrigin = /(?:https?:)?\/\/(?:localhost|127(?:\.\d{1,3}){3}|0\.0\.0\.0|\[::1\])(?::\d+)?(?=\/|[?#]|\s|$)/gi;

function normalizeLocalUrls(value) {
    if (typeof value === "string") {
        return value.replace(localUrlOrigin, "");
    }

    if (Array.isArray(value)) {
        return value.map(normalizeLocalUrls);
    }

    if (!value || typeof value !== "object" || value instanceof Date || Buffer.isBuffer(value)) {
        return value;
    }

    return Object.fromEntries(
        Object.entries(value).map(([key, nestedValue]) => [key, normalizeLocalUrls(nestedValue)])
    );
}

module.exports = { normalizeLocalUrls };