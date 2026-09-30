const { sql, getDatabaseConfig, getConnectionPool } = require("../../serverless/database");

module.exports = async function employeeByIdHandler(req, res) {
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
                    e.EmployeeID, e.EmployeePhoto, e.FullName, e.Email, e.MobileNumber,
                    e.Gender, e.DateOfBirth, e.DepartmentID, e.Designation, e.JoiningDate,
                    e.EmploymentType, e.Salary, e.Experience, e.PresentAddress,
                    e.PermanentAddress, e.EmergencyContactName, e.EmergencyRelationship,
                    e.EmergencyPhoneNumber, e.RoleID, e.IsActive,
                    r.RoleName, d.DepartmentName
                FROM Employees e
                LEFT JOIN Roles r ON e.RoleID = r.RoleID
                LEFT JOIN Departments d ON e.DepartmentID = d.DepartmentID
                WHERE e.EmployeeID = @EmployeeID
            `);

        if (!result.recordset[0]) {
            return res.status(404).json({ message: "Employee not found" });
        }

        return res.status(200).json(result.recordset[0]);
    } catch (error) {
        console.error("Employee lookup API failed:", error);
        return res.status(500).json({ message: error.message });
    }
};