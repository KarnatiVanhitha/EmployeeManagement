module.exports = async function apiProxy(req, res) {
    const backendUrl = process.env.BACKEND_URL?.replace(/\/+$/, "");
    if (!backendUrl) {
        return res.status(503).json({ message: "BACKEND_URL is not configured" });
    }

    const requestUrl = new URL(req.url, "https://frontend.invalid");
    const targetUrl = `${backendUrl}${requestUrl.pathname}${requestUrl.search}`;
    const headers = new Headers();

    ["accept", "authorization", "content-type", "cookie"].forEach((headerName) => {
        const value = req.headers[headerName];
        if (value) headers.set(headerName, Array.isArray(value) ? value.join(", ") : value);
    });

    const body = ["GET", "HEAD"].includes(req.method)
        ? undefined
        : req.body === undefined
            ? undefined
            : typeof req.body === "string"
                ? req.body
                : JSON.stringify(req.body);

    try {
        const backendResponse = await fetch(targetUrl, {
            method: req.method,
            headers,
            body
        });
        const responseBody = Buffer.from(await backendResponse.arrayBuffer());

        res.status(backendResponse.status);
        const contentType = backendResponse.headers.get("content-type");
        if (contentType) res.setHeader("Content-Type", contentType);
        return res.send(responseBody);
    } catch (error) {
        console.error("Backend proxy failed:", error);
        return res.status(502).json({ message: "Backend service is unavailable" });
    }
};