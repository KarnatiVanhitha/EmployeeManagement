const express = require("express");

const router = express.Router();

const taskController = require("../Controllers/TaskController");

// Get all tasks
router.get("/", taskController.getTasks);

// Get tasks by project
router.get("/project/:id", taskController.getTasksByProjectId);

// Get tasks by employee
router.get("/employee/:id", taskController.getTasksByEmployeeId);

// Get task by ID
router.get("/:id", taskController.getTaskById);

// Create task
router.post("/", taskController.addTask);

// Update task
router.put("/:id", taskController.updateTask);

// Assign task
router.put("/:id/assign", taskController.assignTask);

// Update task status
router.put("/:id/status", taskController.updateTaskStatus);

// Delete task
router.delete("/:id", taskController.deleteTask);

module.exports = router;