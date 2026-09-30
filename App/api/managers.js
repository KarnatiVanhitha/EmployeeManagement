const { getDatabaseConfig, getConnectionPool } = require("../serverless/database");

module.exports = async function managersHandler(req, res) {
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
                tm.ManagerID,
                tm.ManagerID AS managerId,
                tm.ManagerID AS EmployeeID,
                e.FullName AS ManagerName,
                e.FullName AS managerName,
                e.FullName AS FullName,
                e.Email,
                e.Email AS email,
                e.EmployeePhoto,
                e.EmployeePhoto AS employeePhoto,
                d.DepartmentID,
                d.DepartmentID AS departmentId,
                COALESCE(d.DepartmentName, tm.TeamName, '') AS TeamName,
                COALESCE(d.DepartmentName, tm.TeamName, '') AS teamName,
                COALESCE(d.DepartmentName, tm.TeamName, '') AS DepartmentName,
                r.RoleName,
                r.RoleName AS roleName,
                tm.Members,
                tm.Projects,
                tm.IsActive
            FROM TeamManagers tm
            INNER JOIN Employees e ON tm.ManagerID = e.EmployeeID
            LEFT JOIN Departments d ON e.DepartmentID = d.DepartmentID
            LEFT JOIN Roles r ON e.RoleID = r.RoleID
            WHERE tm.IsActive = 1
        `);
        return res.status(200).json(result.recordset);
    } catch (error) {
        console.error("Managers API failed:", error);
        return res.status(500).json({ message: error.message });
    }
};