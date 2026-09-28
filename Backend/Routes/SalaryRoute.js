const express = require("express");

const router = express.Router();

const salaryController = require("../Controllers/SalaryController");

router.post("/", salaryController.addSalary);

router.get("/", salaryController.getSalaries);

router.get("/employee/:id", salaryController.getSalariesByEmployeeId);
router.get("/role/:roleId", salaryController.getSalariesByRoleId);

router.get("/:id", salaryController.getSalaryById);

router.put("/:id", salaryController.updateSalary);

router.delete("/:id", salaryController.deleteSalary);

module.exports = router;