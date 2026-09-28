const express = require("express");
const router = express.Router();
const TimesheetModel = require("../Models/TimesheetModel");

router.get("/", async (req, res) => {
    try {
        const logs = await TimesheetModel.getTimesheets();
        res.json(logs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/employee/:employeeId", async (req, res) => {
    try {
        const logs = await TimesheetModel.getTimesheetsByEmployee(Number(req.params.employeeId));
        res.json(logs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/project/:projectId", async (req, res) => {
    try {
        const logs = await TimesheetModel.getTimesheetsByProject(Number(req.params.projectId));
        res.json(logs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/task/:taskId", async (req, res) => {
    try {
        const logs = await TimesheetModel.getTimesheetsByTask(Number(req.params.taskId));
        res.json(logs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post("/", async (req, res) => {
    try {
        const log = await TimesheetModel.addTimesheet(req.body);
        res.json({ message: "Timesheet logged successfully", ...log });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        await TimesheetModel.deleteTimesheet(Number(req.params.id));
        res.json({ message: "Timesheet log deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

