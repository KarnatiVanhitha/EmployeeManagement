const sql = require("mssql");
const { getDatabaseConfig, getConnectionPool } = require("../serverless/database");

module.exports = async function salariesHandler(req, res) {
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
        if (req.query?.aggregate === "data") {
            const employeeId = Number(req.query?.employeeId);
            const email = String(req.query?.email || "").trim();
            const [employeeResult, roleResult] = await Promise.all([
                pool.request().query(`
                    SELECT
                        e.EmployeeID,
                        e.FullName,
                        e.RoleID,
                        r.RoleName,
                        d.DepartmentName,
                        e.Experience,
                        e.Salary
                    FROM Employees e
                    LEFT JOIN Roles r ON e.RoleID = r.RoleID
                    LEFT JOIN Departments d ON e.DepartmentID = d.DepartmentID
                    WHERE e.IsActive = 1
                `),
                pool.request().query(`
                    SELECT RoleID, RoleName
                    FROM Roles
                    ORDER BY RoleName ASC
                `)
            ]);

            const salaryRequest = pool.request();
            let salaryFilter = "";
            if (Number.isInteger(employeeId) && employeeId > 0) {
                salaryRequest.input("EmployeeID", sql.Int, employeeId);
                salaryFilter = "WHERE s.EmployeeID = @EmployeeID";
            } else if (email) {
                salaryRequest.input("Email", sql.NVarChar(100), email);
                salaryFilter = "WHERE LOWER(e.Email) = LOWER(@Email)";
            }

            const salaryResult = await salaryRequest.query(`
                SELECT
                    s.SalaryID,
                    s.EmployeeID,
                    e.FullName AS employeeName,
                    e.Email AS email,
                    e.JoiningDate,
                    e.Salary AS salary,
                    e.DepartmentID,
                    e.RoleID,
                    d.DepartmentName AS department,
                    r.RoleName AS role,
                    s.BasicSalary,
                    s.Allowances,
                    s.Bonus,
                    s.Deductions,
                    s.ExperienceYears AS experience,
                    s.HikePercentage AS hikePercentage,
                    s.HikeAmount AS hikeAmount,
                    s.SalaryMonth,
                    s.PaymentDate,
                    s.PaymentStatus,
                    (s.BasicSalary + s.Allowances + s.Bonus + s.HikeAmount - s.Deductions) AS totalSalary
                FROM Salaries s
                LEFT JOIN Employees e ON s.EmployeeID = e.EmployeeID
                LEFT JOIN Roles r ON e.RoleID = r.RoleID
                LEFT JOIN Departments d ON e.DepartmentID = d.DepartmentID
                ${salaryFilter}
                ORDER BY s.SalaryID DESC
            `);

            return res.status(200).json({
                employees: employeeResult.recordset,
                roles: roleResult.recordset,
                salaries: salaryResult.recordset
            });
        }

        const result = await pool.request().query(`
            SELECT
                s.SalaryID,
                s.EmployeeID,
                e.FullName AS employeeName,
                e.Email AS email,
                e.JoiningDate,
                e.Salary AS salary,
                e.DepartmentID,
                e.RoleID,
                d.DepartmentName AS department,
                r.RoleName AS role,
                s.BasicSalary,
                s.Allowances,
                s.Bonus,
                s.Deductions,
                s.ExperienceYears AS experience,
                s.HikePercentage AS hikePercentage,
                s.HikeAmount AS hikeAmount,
                s.SalaryMonth,
                s.PaymentDate,
                s.PaymentStatus,
                (s.BasicSalary + s.Allowances + s.Bonus + s.HikeAmount - s.Deductions) AS totalSalary
            FROM Salaries s
            LEFT JOIN Employees e ON s.EmployeeID = e.EmployeeID
            LEFT JOIN Roles r ON e.RoleID = r.RoleID
            LEFT JOIN Departments d ON e.DepartmentID = d.DepartmentID
            ORDER BY s.SalaryID DESC
        `);
        return res.status(200).json(result.recordset);
    } catch (error) {
        console.error("Salaries API failed:", error);
        return res.status(500).json({ message: error.message });
    }
};