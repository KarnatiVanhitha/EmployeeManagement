const taskModel = require("../Models/TaskModel");

async function addTask(req, res) {
    try {
        const task = await taskModel.addTask(req.body);
        res.status(201).json({
            message: "Task Created Successfully",
            task
        });
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
}

async function getTasks(req, res) {
    try {
        const tasks = await taskModel.getTasks();
        res.status(200).json(tasks);
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
}

async function getTaskById(req, res) {
    try {
        const taskId = Number(req.params.id);

        if (isNaN(taskId)) {
            return res.status(400).json({
                message: "Invalid Task ID"
            });
        }

        const task = await taskModel.getTaskById(taskId);

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        res.status(200).json(task);

    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
}

async function getTasksByProjectId(req, res) {
    try {
        const projectId = Number(req.params.id);
        const tasks = await taskModel.getTasksByProjectId(projectId);
        res.status(200).json(tasks);
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
}

async function getTasksByEmployeeId(req, res) {
    try {
        const employeeId = Number(req.params.id);
        const tasks = await taskModel.getTasksByEmployeeId(employeeId);
        res.status(200).json(tasks);
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
}

async function updateTask(req, res) {
    try {
        const taskId = Number(req.params.id);
        const task = await taskModel.updateTask(taskId, req.body);
        res.status(200).json({
            message: "Task Updated Successfully",
            task
        });
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
}

async function assignTask(req, res) {
    try {
        const taskId = Number(req.params.id);
        const assignedTo = Number(req.body.AssignedTo ?? req.body.assignedTo);
        const status = req.body.Status ?? req.body.status ?? 'Assigned';

        if (!taskId || isNaN(taskId)) {
            return res.status(400).json({
                message: "Invalid Task ID"
            });
        }

        if (!assignedTo || isNaN(assignedTo)) {
            return res.status(400).json({
                message: "Valid AssignedTo Employee ID is required"
            });
        }

        const task = await taskModel.assignTask(taskId, assignedTo, status);
        res.status(200).json({
            message: "Task Assigned Successfully",
            task
        });
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
}

async function updateTaskStatus(req, res) {
    try {
        const taskId = Number(req.params.id);
        const { status, progress } = req.body;
        const task = await taskModel.updateTaskStatus(taskId, status, progress);
        res.status(200).json({
            message: "Task Status Updated Successfully",
            task
        });
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
}

async function deleteTask(req, res) {
    try {
        const taskId = Number(req.params.id);
        await taskModel.deleteTask(taskId);
        res.status(200).json({
            message: "Task Deleted Successfully"
        });
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
}

module.exports = {
    addTask,
    getTasks,
    getTaskById,
    getTasksByProjectId,
    getTasksByEmployeeId,
    updateTask,
    assignTask,
    updateTaskStatus,
    deleteTask
};
