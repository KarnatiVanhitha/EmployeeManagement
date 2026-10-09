const { verifyAuthToken } = require("./auth-token");
const { askChatbot } = require("./chat/chatservice");

async function chatHandler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const authorization = req.headers.authorization || "";
  const tokenMatch = authorization.match(/^Bearer\s+(.+)$/i);
  if (!tokenMatch) {
    return res.status(401).json({ error: "Please log in." });
  }

  const user = verifyAuthToken(tokenMatch[1]);
  if (!user) {
    return res.status(401).json({ error: "Your session is invalid or expired. Please log in again." });
  }

  const { message, history, today, events } = req.body || {};
  if (!message || !String(message).trim()) {
    return res.status(400).json({ error: "Message is required." });
  }

  // If a separate backend URL is explicitly configured, attempt to proxy
  if (process.env.BACKEND_URL || process.env.CHAT_BACKEND_URL) {
    const targetUrl = (process.env.BACKEND_URL || process.env.CHAT_BACKEND_URL).replace(/\/+$/, "") + "/api/chat";
    try {
      const proxyRes = await fetch(targetUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": authorization
        },
        body: JSON.stringify(req.body)
      });
      const data = await proxyRes.json();
      return res.status(proxyRes.status).json(data);
    } catch (proxyErr) {
      console.warn("Backend proxy attempt failed, falling back to serverless chat:", proxyErr.message);
    }
  }

  try {
    const reply = await askChatbot(
      String(message).trim(),
      Array.isArray(history) ? history : [],
      user,
      /^\d{4}-\d{2}-\d{2}$/.test(today || "") ? today : null,
      Array.isArray(events) ? events.slice(0, 50) : []
    );

    return res.status(200).json({ reply });
  } catch (error) {
    console.error("Chatbot API error:", error);

    if (error.status === 429) {
      const providerCode = String(
        error.code || error.error?.code || error.error?.status || ""
      ).toLowerCase();
      const providerMessage = String(
        error.message || error.error?.message || ""
      ).toLowerCase();
      const quotaExceeded =
        providerCode.includes("resource_exhausted") ||
        providerCode.includes("quota") ||
        providerMessage.includes("quota");

      return res.status(429).json({
        error: quotaExceeded
          ? "The AI provider quota for this model or API key has been reached. Please check the quota or try again later."
          : "The AI service is temporarily rate-limiting requests. Please wait a moment and try again."
      });
    }

    const messageText = typeof error?.message === "string" ? error.message : "AI chatbot error";
    return res.status(500).json({ error: messageText });
  }
}

module.exports = { chatHandler };
