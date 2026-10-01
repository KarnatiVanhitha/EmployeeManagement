const express = require("express");
const router = express.Router();
const notificationController = require("../Controllers/NotificationController");

router.get("/", notificationController.getNotificationsData);

module.exports = router;