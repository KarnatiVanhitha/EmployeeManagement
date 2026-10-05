const sql = require("mssql");
const { getDatabaseConfig, getConnectionPool } = require("../../serverless/database");

function isDesideaEmail(email) {
    return /^[^\s@]+@desidea\.com$/i.test(String(email || "").trim());
}

module.exports = async function employeeByIdHandler(req, res) {
    if (req.method !== "GET" && req.method !== "PUT" && req.method !== "DELETE") {
        res.setHeader("Allow", "GET, PUT, DELETE");
        return res.status(405).json({ success: false, message: "Method not allowed" });
    }

    const employeeId = Number(req.query?.id || req.body?.EmployeeID);
    if (!Number.isInteger(employeeId) || employeeId < 1) {
        return res.status(400).json({ message: "A valid employee ID is required" });
    }

    const config = getDatabaseConfig();
    if (!config) {
        return res.status(503).json({ success: false, message: "Database is not configured" });
    }

    try {
        const pool = await getConnectionPool(config);

        if (req.method === "GET") {
            const result = await pool.request()
                .input("EmployeeID", sql.Int, employeeId)
                .query(`
                    SELECT
                        e.EmployeeID, e.EmployeePhoto, e.FullName, e.Email, e.MobileNumber,
                        e.Gender, e.DateOfBirth, e.DepartmentID, e.JoiningDate,
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
        }

        if (req.method === "PUT") {
            const employeeData = req.body || {};
            if (employeeData.Email && !isDesideaEmail(employeeData.Email)) {
                return res.status(400).json({
                    message: "Employee email must use the @desidea.com domain"
                });
            }

            const departmentId = employeeData.DepartmentID ? Number(employeeData.DepartmentID) : null;
            const roleId = employeeData.RoleID ? Number(employeeData.RoleID) : null;
            const salary = employeeData.Salary !== undefined && employeeData.Salary !== null && employeeData.Salary !== ""
                ? Number(employeeData.Salary)
                : null;
            const experience = employeeData.Experience !== undefined && employeeData.Experience !== null && employeeData.Experience !== ""
                ? Number(employeeData.Experience)
                : null;

            await pool.request()
                .input("EmployeeID", sql.Int, employeeId)
                .input("EmployeePhoto", sql.NVarChar(sql.MAX), employeeData.EmployeePhoto || null)
                .input("FullName", sql.NVarChar(100), employeeData.FullName || null)
                .input("Email", sql.NVarChar(100), employeeData.Email || null)
                .input("MobileNumber", sql.NVarChar(20), employeeData.MobileNumber || null)
                .input("Password", sql.NVarChar(255), employeeData.Password || null)
                .input("Gender", sql.NVarChar(20), employeeData.Gender || null)
                .input("DateOfBirth", sql.Date, employeeData.DateOfBirth || null)
                .input("JoiningDate", sql.Date, employeeData.JoiningDate || null)
                .input("DepartmentID", sql.Int, departmentId)
                .input("RoleID", sql.Int, roleId)
                .input("EmploymentType", sql.NVarChar(50), employeeData.EmploymentType || null)
                .input("Salary", sql.Decimal(10, 2), salary)
                .input("Experience", sql.Decimal(4, 1), experience)
                .input("PresentAddress", sql.NVarChar(sql.MAX), employeeData.PresentAddress || null)
                .input("PermanentAddress", sql.NVarChar(sql.MAX), employeeData.PermanentAddress || null)
                .input("EmergencyContactName", sql.NVarChar(100), employeeData.EmergencyContactName || null)
                .input("EmergencyRelationship", sql.NVarChar(100), employeeData.EmergencyRelationship || null)
                .input("EmergencyPhoneNumber", sql.NVarChar(20), employeeData.EmergencyPhoneNumber || null)
                .query(`
                    UPDATE Employees
                    SET
                        EmployeePhoto = COALESCE(@EmployeePhoto, EmployeePhoto),
                        FullName = COALESCE(@FullName, FullName),
                        Email = COALESCE(@Email, Email),
                        MobileNumber = COALESCE(@MobileNumber, MobileNumber),
                        Password = CASE WHEN @Password IS NOT NULL AND LEN(TRIM(@Password)) > 0 THEN @Password ELSE Password END,
                        Gender = COALESCE(@Gender, Gender),
                        DateOfBirth = COALESCE(@DateOfBirth, DateOfBirth),
                        DepartmentID = COALESCE(@DepartmentID, DepartmentID),
                        JoiningDate = COALESCE(@JoiningDate, JoiningDate),
                        EmploymentType = COALESCE(@EmploymentType, EmploymentType),
                        Salary = COALESCE(@Salary, Salary),
                        Experience = COALESCE(@Experience, Experience),
                        PresentAddress = COALESCE(@PresentAddress, PresentAddress),
                        PermanentAddress = COALESCE(@PermanentAddress, PermanentAddress),
                        EmergencyContactName = COALESCE(@EmergencyContactName, EmergencyContactName),
                        EmergencyRelationship = COALESCE(@EmergencyRelationship, EmergencyRelationship),
                        EmergencyPhoneNumber = COALESCE(@EmergencyPhoneNumber, EmergencyPhoneNumber),
                        RoleID = COALESCE(@RoleID, RoleID)
                    WHERE EmployeeID = @EmployeeID;
                `);

            return res.status(200).json({
                message: "Employee Updated Successfully"
            });
        }

        if (req.method === "DELETE") {
            await pool.request()
                .input("EmployeeID", sql.Int, employeeId)
                .query(`
                    UPDATE Employees
                    SET IsActive = 0
                    WHERE EmployeeID = @EmployeeID;
                `);

            return res.status(200).json({
                message: "Employee Deleted Successfully"
            });
        }
    } catch (error) {
        console.error("Employee lookup API failed:", error);
        return res.status(500).json({ message: error.message });
    }
};