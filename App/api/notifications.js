const { getDatabaseConfig, getConnectionPool } = require("../serverless/database");
const reviewsHandler = require("../api-handlers/_lib/reviews");

module.exports = async function notificationsHandler(req, res) {
    if (req.query?.proxy === "reviews") {
        return reviewsHandler(req, res);
    }

    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        return res.status(405).json({ success: false, message: "Method not allowed" });
    }

    const config = getDatabaseConfig();
    if (!config) {
        return res.status(503).json({ success: false, message: "Database is not configured" });
    }

    try {
        const pool = await getConnectionPool(config);
        const [employeeResult, leaveResult, projectResult, reviewResult] = await Promise.all([
            pool.request().query(`
                SELECT EmployeeID, FullName
                FROM Employees
                WHERE IsActive = 1
            `),
            pool.request().query(`
                SELECT
                    l.LeaveID AS leaveId,
                    l.EmployeeID AS employeeId,
                    l.EmployeeID AS EmployeeID,
                    COALESCE(l.ApplicantName, e.FullName, '') AS applicantName,
                    l.LeaveType AS leaveType,
                    l.LeaveType AS LeaveType,
                    l.Status AS status,
                    l.Status AS Status,
                    l.AppliedDate AS appliedDate,
                    l.AppliedDate AS appliedOn,
                    l.ActionDate AS actionDate
                FROM Leaves l
                LEFT JOIN Employees e ON l.EmployeeID = e.EmployeeID
                ORDER BY l.LeaveID DESC
            `),
            pool.request().query(`
                SELECT
                    ProjectName AS projectName,
                    ManagerID AS managerId,
                    CreatedDate AS createdDate
                FROM Projects
                ORDER BY ProjectID DESC
            `),
            pool.request().query(`
                SELECT
                    ReviewID AS reviewId,
                    RevieweeID AS revieweeId,
                    ReviewerID AS reviewerId,
                    CreatedDate AS createdDate
                FROM Reviews
                ORDER BY ReviewID DESC
            `)
        ]);

        return res.status(200).json({
            employees: employeeResult.recordset,
            leaves: leaveResult.recordset,
            projects: projectResult.recordset,
            reviews: reviewResult.recordset
        });
    } catch (error) {
        console.error("Notifications API failed:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to load notifications data"
        });
    }
};