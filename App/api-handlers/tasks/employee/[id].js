const { sql, getDatabaseConfig, getConnectionPool } = require("../../../serverless/database");

module.exports = async function employeeTasksHandler(req, res) {
    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        return res.status(405).json({ success: false, message: "Method not allowed" });
    }

    const employeeId = Number(req.query?.id);
    if (!Number.isInteger(employeeId) || employeeId < 1) {
        return res.status(400).json({ message: "A valid employee ID is required" });
    }

    const config = getDatabaseConfig();
    if (!config) {
        return res.status(503).json({ success: false, message: "Database is not configured" });
    }

    try {
        const pool = await getConnectionPool(config);
        const result = await pool.request()
            .input("EmployeeID", sql.Int, employeeId)
            .query(`
                SELECT
                    t.TaskID AS taskId,
                    t.ProjectID AS projectId,
                    COALESCE(t.TaskName, t.Title, '') AS taskName,
                    t.Description AS description,
                    t.AssignedTo AS assignedTo,
                    e.FullName AS assignedToName,
                    t.StartDate AS startDate,
                    t.DueDate AS dueDate,
                    t.Status AS status,
                    t.Priority AS priority,
                    t.Progress AS progress,
                    t.CreatedDate AS createdDate
                FROM ProjectTasks t
                LEFT JOIN Employees e ON t.AssignedTo = e.EmployeeID
                WHERE t.AssignedTo = @EmployeeID
                ORDER BY t.TaskID DESC
            `);
        return res.status(200).json(result.recordset);
    } catch (error) {
        console.error("Employee tasks API failed:", error);
        return res.status(500).json({ message: error.message });
    }
};