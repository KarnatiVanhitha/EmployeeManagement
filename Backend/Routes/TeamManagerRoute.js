const express = require("express");

const router = express.Router();

const managerController = require("../Controllers/TeamManagerController");

router.get("/", managerController.getManagers);

router.get("/:id", managerController.getManagerById);

router.post("/", managerController.addManager);

router.put("/:id", managerController.updateManager);

router.delete("/:id", managerController.deleteManager);

module.exports = router;