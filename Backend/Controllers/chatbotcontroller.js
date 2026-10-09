const { askChatbot } = require("../service/chatservice");

exports.chat = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Please log in." });
    }

    const { message, history, today, events } = req.body;

    if (!message || !String(message).trim()) {
      return res.status(400).json({ error: "Message is required." });
    }

    const reply = await askChatbot(
      String(message).trim(),
      Array.isArray(history) ? history : [],
      req.user,
      /^\d{4}-\d{2}-\d{2}$/.test(today || "") ? today : null,
      Array.isArray(events) ? events.slice(0, 50) : []
    );

    res.json({ reply });
  } catch (error) {
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

      // Detailed diagnostic logging (does not print secret values)
      console.error("Chatbot AI provider returned HTTP 429:", providerCode || "rate limited");
      try {
        console.error("AI provider diagnostic:", {
          name: error.name,
          status: error.status || error.response?.status,
          providerCode,
          providerMessage,
          // show whether relevant env vars are present (true/false) without revealing values
          hasGEMINI_API_KEY: !!process.env.GEMINI_API_KEY,
          hasGROQ_API_KEY: !!process.env.GROQ_API_KEY,
          model: process.env.LLM_MODEL || null,
          // include the provider response body if present (useful for debugging)
          providerResponse: error.response?.data || error.error || null,
        });
      } catch (logErr) {
        console.error('Error while logging AI provider diagnostic', logErr);
      }

      return res.status(429).json({
        error: quotaExceeded
          ? "The AI provider quota for this model or API key has been reached. Check the provider quota and billing, or try again after the quota resets."
          : "The AI service is temporarily rate-limiting requests. Please wait a minute and try again."
      });
    }

    console.error(error);
    res.status(500).json({ error: "AI chatbot error" });
  }
};