const leaveModel = require("../Models/LeaveModel");

async function addLeave(req, res) {
    try {
        const leave = await leaveModel.addLeave(req.body);
        res.status(201).json({
            message: "Leave Applied Successfully",
            leave
        });
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
}

async function getLeaves(req, res) {
    try {
        const leaves = await leaveModel.getLeaves();
        res.status(200).json(leaves);
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
}

async function getEmployeeLeaves(req, res) {
    try {
        const leaves = await leaveModel.getEmployeeLeaves();
        res.status(200).json(leaves);
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
}

async function getLeavesByEmployeeId(req, res) {
    try {
        const employeeId = Number(req.params.id);
        const leaves = await leaveModel.getLeavesByEmployeeId(employeeId);
        res.status(200).json(leaves);
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
}

async function updateLeaveStatus(req, res) {
    try {
        const { status } = req.body;
        await leaveModel.updateLeaveStatus(req.params.id, status);
        res.status(200).json({
            message: "Leave status updated successfully"
        });
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
}

module.exports = {
    addLeave,
    getLeaves,
    getEmployeeLeaves,
    getLeavesByEmployeeId,
    updateLeaveStatus
};
