const { chatHandler } = require("../api-handlers/_lib/chat-handler");

module.exports = async function handler(req, res) {
  return chatHandler(req, res);
};
