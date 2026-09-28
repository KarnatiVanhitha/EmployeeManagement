const express = require("express");
const router = express.Router();

const roleController = require("../Controllers/RoleController");

// GET Roles by Department
router.get("/department/:id", roleController.getRolesByDepartment);

// GET All Roles
router.get("/", roleController.getRoles);

module.exports = router;