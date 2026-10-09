const express = require('express');

const router = express.Router();

const { chat } = require('../Controllers/chatbotcontroller');
const { verifyToken } = require('../utils/authMiddleware');

router.post('/', verifyToken, chat);

module.exports = router;