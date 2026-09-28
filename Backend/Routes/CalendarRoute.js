const express = require("express");
const router = express.Router();
const CalendarModel = require("../Models/CalendarModel");

// Meetings endpoints
router.get("/meetings", async (req, res) => {
    try {
        const meetings = await CalendarModel.getMeetings();
        res.json(meetings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post("/meetings", async (req, res) => {
    try {
        const meeting = await CalendarModel.addMeeting(req.body);
        res.json({ message: "Meeting Added Successfully", ...meeting });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put("/meetings/:id", async (req, res) => {
    try {
        const meeting = await CalendarModel.updateMeeting(Number(req.params.id), req.body);
        res.json({ message: "Meeting Updated Successfully", ...meeting });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete("/meetings/:id", async (req, res) => {
    try {
        await CalendarModel.deleteMeeting(Number(req.params.id));
        res.json({ message: "Meeting Deleted Successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Holidays endpoints
router.get("/holidays", async (req, res) => {
    try {
        const holidays = await CalendarModel.getHolidays();
        res.json(holidays);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post("/holidays", async (req, res) => {
    try {
        const holiday = await CalendarModel.addHoliday(req.body);
        res.json({ message: "Holiday Added Successfully", ...holiday });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put("/holidays/:id", async (req, res) => {
    try {
        const holiday = await CalendarModel.updateHoliday(Number(req.params.id), req.body);
        res.json({ message: "Holiday Updated Successfully", ...holiday });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete("/holidays/:id", async (req, res) => {
    try {
        await CalendarModel.deleteHoliday(Number(req.params.id));
        res.json({ message: "Holiday Deleted Successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
