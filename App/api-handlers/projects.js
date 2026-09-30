const { getDatabaseConfig, getConnectionPool } = require("../serverless/database");

module.exports = async function projectsHandler(req, res) {
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
        const result = await pool.request().query(`
            SELECT
                p.ProjectID AS projectId,
                p.ProjectID AS ProjectID,
                p.ProjectName AS projectName,
                p.ProjectName AS ProjectName,
                p.Description AS description,
                p.Description AS Description,
                p.ManagerID AS managerId,
                p.ManagerID AS ManagerID,
                e.FullName AS managerName,
                e.DepartmentID AS departmentId,
                d.DepartmentName AS departmentName,
                p.StartDate AS startDate,
                p.EndDate AS endDate,
                CASE
                    WHEN p.Status IN ('Completed', 'On Hold', 'Cancelled') THEN p.Status
                    WHEN p.ManagerID IS NOT NULL AND p.ManagerID > 0 THEN 'Active'
                    ELSE 'Pending'
                END AS status,
                p.Priority AS priority,
                p.Budget AS budget,
                p.CreatedDate AS createdDate
            FROM Projects p
            LEFT JOIN Employees e ON p.ManagerID = e.EmployeeID
            LEFT JOIN Departments d ON e.DepartmentID = d.DepartmentID
            ORDER BY p.ProjectID DESC
        `);
        return res.status(200).json(result.recordset);
    } catch (error) {
        console.error("Projects API failed:", error);
        return res.status(500).json({ message: error.message });
    }
};