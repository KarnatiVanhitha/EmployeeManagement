const express = require("express");

const router = express.Router();

const employeeController = require("../Controllers/EmployeeController");


// Get all employees
router.get("/", employeeController.getEmployees);


// IMPORTANT:
// /managers MUST COME BEFORE /:id
router.get("/managers", employeeController.getManagers);


// Get employee by ID
router.get("/:id", employeeController.getEmployeeById);


// Add employee
router.post("/", employeeController.addEmployee);


// Update employee
router.put("/:id", employeeController.updateEmployee);


// Delete employee
router.delete("/:id", employeeController.deleteEmployee);

router.post("/login", employeeController.login);

router.post("/verify-email", employeeController.verifyEmail);

router.post("/reset-password", employeeController.resetPassword);

module.exports = router;