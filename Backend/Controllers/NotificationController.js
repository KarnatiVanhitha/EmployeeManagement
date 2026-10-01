const employeeModel = require("../Models/EmployeeModel");
const leaveModel = require("../Models/LeaveModel");
const projectModel = require("../Models/ProjectModel");
const reviewModel = require("../Models/ReviewModel");

async function getNotificationsData(req, res) {
    try {
        const [employeeRecords, leaves, projects, reviews] = await Promise.all([
            employeeModel.getEmployees(),
            leaveModel.getLeaves(),
            projectModel.getProjects(),
            reviewModel.getReviews()
        ]);
        const employees = employeeRecords.map(({ EmployeeID, FullName }) => ({
            EmployeeID,
            FullName
        }));

        res.status(200).json({ employees, leaves, projects, reviews });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

module.exports = { getNotificationsData };