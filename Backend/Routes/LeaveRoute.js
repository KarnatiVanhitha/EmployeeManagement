const express = require("express");

const router = express.Router();

const leaveController = require("../Controllers/LeaveController");

router.get("/", leaveController.getLeaves);
router.get("/employee-leaves/all", leaveController.getEmployeeLeaves);
router.get("/employee/:id", leaveController.getLeavesByEmployeeId);
router.post("/", leaveController.addLeave);
router.put("/:id/status", leaveController.updateLeaveStatus);

module.exports = router;
