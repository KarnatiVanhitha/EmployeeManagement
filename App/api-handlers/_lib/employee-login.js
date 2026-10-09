const sql = require("mssql");
const { getDatabaseConfig, getConnectionPool } = require("../../serverless/database");
const { createAuthToken, getJwtSecret } = require("./auth-token");

module.exports = async function employeeLoginHandler(req, res) {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return res.status(405).json({ success: false, message: "Method not allowed" });
    }

    const { Email: submittedEmail, Password } = req.body || {};
    const Email = String(submittedEmail || "").trim();
    if (!/^[^\s@]+@desidea\.com$/i.test(Email)) {
        return res.status(401).json({
            message: "Only @desidea.com employee accounts can sign in"
        });
    }

    try {
        getJwtSecret();
    } catch (error) {
        console.error("Employee login authentication configuration error:", error.message);
        return res.status(503).json({
            success: false,
            message: "Login service is not configured. Please contact support."
        });
    }

    const config = getDatabaseConfig();
    if (!config) {
        return res.status(503).json({ success: false, message: "Database is not configured" });
    }

    try {
        const pool = await getConnectionPool(config);
        const result = await pool.request()
            .input("Email", sql.NVarChar(100), Email)
            .input("Password", sql.NVarChar(255), Password)
            .query(`
                SELECT
                    e.EmployeeID,
                    e.FullName,
                    e.Email,
                    e.RoleID,
                    e.DepartmentID,
                    d.DepartmentName,
                    r.RoleName
                FROM Employees e
                LEFT JOIN Roles r ON e.RoleID = r.RoleID
                LEFT JOIN Departments d ON e.DepartmentID = d.DepartmentID
                WHERE e.Email = @Email
                    AND e.Password = @Password
                    AND e.IsActive = 1
            `);

        const user = result.recordset[0];
        if (!user) {
            return res.status(401).json({ message: "Invalid Email or Password" });
        }

        return res.status(200).json({
            message: "Login Successful",
            role: user.RoleName,
            user,
            token: createAuthToken({
                email: user.Email || Email,
                role: user.RoleName,
                name: user.FullName
            })
        });
    } catch (error) {
        console.error("Employee login API failed:", error);
        return res.status(500).json({
            message: "Login failed",
            error: error.message
        });
    }
};