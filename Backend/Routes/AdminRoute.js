const express = require("express");

const router = express.Router();

const adminController = require("../Controllers/AdminController");

router.post("/login", adminController.login);

router.post("/", adminController.addAdmin);

router.get("/", adminController.getAdmins);

router.put("/:id", adminController.updateAdmin);

router.delete("/:id", adminController.deleteAdmin);

router.post("/verify-email", adminController.verifyEmail);

router.post("/reset-password", adminController.resetPassword);

router.get("/:id", adminController.getAdminById);

module.exports = router;