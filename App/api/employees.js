const sql = require("mssql");

let poolPromise;

function getDatabaseConfig() {
    const { DB_SERVER, DB_DATABASE, DB_USER, DB_PASSWORD } = process.env;
    if (!DB_SERVER || !DB_DATABASE || !DB_USER || !DB_PASSWORD) {
        return null;
    }

    return {
        server: DB_SERVER,
        database: DB_DATABASE,
        user: DB_USER,
        password: DB_PASSWORD,
        port: Number(process.env.DB_PORT || 1433),
        options: {
            encrypt: true,
            trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === "true"
        },
        connectionTimeout: 15000,
        requestTimeout: 15000,
        pool: {
            max: 3,
            min: 0,
            idleTimeoutMillis: 30000
        }
    };
}

function getConnectionPool(config) {
    if (!poolPromise) {
        poolPromise = new sql.ConnectionPool(config).connect().catch((error) => {
            poolPromise = undefined;
            throw error;
        });
    }

    return poolPromise;
}

function isDesideaEmail(email) {
    return /^[^\s@]+@desidea\.com$/i.test(String(email || "").trim());
}

module.exports = async function employeesHandler(req, res) {
    if (req.method !== "GET" && req.method !== "POST") {
        res.setHeader("Allow", "GET, POST");
        return res.status(405).json({ success: false, message: "Method not allowed" });
    }

    const config = getDatabaseConfig();
    if (!config) {
        return res.status(503).json({
            success: false,
            message: "Database is not configured"
        });
    }

    try {
        const pool = await getConnectionPool(config);

        if (req.method === "GET") {
            const result = await pool.request().query(`
                SELECT
                    e.*,
                    r.RoleName,
                    d.DepartmentName
                FROM Employees e
                LEFT JOIN Roles r ON e.RoleID = r.RoleID
                LEFT JOIN Departments d ON e.DepartmentID = d.DepartmentID
                WHERE e.IsActive = 1
            `);

            return res.status(200).json(result.recordset);
        }

        const employeeData = req.body || {};
        if (!isDesideaEmail(employeeData.Email)) {
            return res.status(400).json({
                message: "Employee email must use the @desidea.com domain"
            });
        }

        const insertResult = await pool.request()
            .input("FullName", sql.NVarChar(100), employeeData.FullName)
            .input("Email", sql.NVarChar(100), employeeData.Email)
            .input("MobileNumber", sql.NVarChar(20), employeeData.MobileNumber)
            .input("Password", sql.NVarChar(255), employeeData.Password)
            .input("Gender", sql.NVarChar(20), employeeData.Gender)
            .input("DateOfBirth", sql.Date, employeeData.DateOfBirth)
            .input("JoiningDate", sql.Date, employeeData.JoiningDate)
            .input("DepartmentID", sql.Int, employeeData.DepartmentID)
            .input("RoleID", sql.Int, employeeData.RoleID)
            .input("EmploymentType", sql.NVarChar(50), employeeData.EmploymentType)
            .input("Salary", sql.Decimal(10, 2), employeeData.Salary)
            .input("Experience", sql.Decimal(4, 1), employeeData.Experience)
            .input("PresentAddress", sql.NVarChar(sql.MAX), employeeData.PresentAddress)
            .input("PermanentAddress", sql.NVarChar(sql.MAX), employeeData.PermanentAddress)
            .input("EmergencyContactName", sql.NVarChar(100), employeeData.EmergencyContactName)
            .input("EmergencyRelationship", sql.NVarChar(100), employeeData.EmergencyRelationship)
            .input("EmergencyPhoneNumber", sql.NVarChar(20), employeeData.EmergencyPhoneNumber)
            .query(`
                INSERT INTO Employees
                (
                    FullName, Email, MobileNumber, Password, Gender, DateOfBirth,
                    JoiningDate, DepartmentID, RoleID, EmploymentType, Salary,
                    Experience, PresentAddress, PermanentAddress, EmergencyContactName,
                    EmergencyRelationship, EmergencyPhoneNumber
                )
                OUTPUT INSERTED.EmployeeID, INSERTED.FullName, INSERTED.Email
                VALUES
                (
                    @FullName, @Email, @MobileNumber, @Password, @Gender, @DateOfBirth,
                    @JoiningDate, @DepartmentID, @RoleID, @EmploymentType, @Salary,
                    @Experience, @PresentAddress, @PermanentAddress, @EmergencyContactName,
                    @EmergencyRelationship, @EmergencyPhoneNumber
                )
            `);

        const employee = insertResult.recordset[0];
        const roleResult = await pool.request()
            .input("RoleID", sql.Int, employeeData.RoleID)
            .query("SELECT RoleName, IsManager FROM Roles WHERE RoleID = @RoleID");
        const role = roleResult.recordset[0];
        const roleName = String(role?.RoleName || "").toLowerCase().trim();
        const isTeamLead = roleName.includes("team lead") || roleName.includes("lead") || roleName === "teamlead";
        const isManager = role?.IsManager && !isTeamLead &&
            (roleName.includes("manager") || roleName === "admin" || roleName === "product owner") ? 1 : 0;

        try {
            const basicSalary = parseFloat(employeeData.Salary) || 0;
            const experience = parseFloat(employeeData.Experience) || 0;
            const hikePercentage = experience < 1 ? 2 : experience < 3 ? 5 : experience < 5 ? 10 : experience < 10 ? 15 : 20;
            const hikeAmount = +(basicSalary * (hikePercentage / 100)).toFixed(2);
            const bonus = +(basicSalary * Math.min(experience * 0.01, 0.2)).toFixed(2);

            const salaryResult = await pool.request()
                .input("EmployeeID", sql.Int, employee.EmployeeID)
                .input("BasicSalary", sql.Decimal(10, 2), basicSalary)
                .input("Allowances", sql.Decimal(10, 2), 0)
                .input("Bonus", sql.Decimal(10, 2), bonus)
                .input("Deductions", sql.Decimal(10, 2), 0)
                .input("ExperienceYears", sql.Decimal(4, 1), experience)
                .input("HikePercentage", sql.Decimal(5, 2), hikePercentage)
                .input("HikeAmount", sql.Decimal(10, 2), hikeAmount)
                .input("SalaryMonth", sql.Date, new Date())
                .input("PaymentDate", sql.Date, null)
                .input("PaymentStatus", sql.VarChar(20), "Pending")
                .query(`
                    INSERT INTO Salaries
                    (
                        EmployeeID, BasicSalary, Allowances, Bonus, Deductions,
                        ExperienceYears, HikePercentage, HikeAmount, SalaryMonth,
                        PaymentDate, PaymentStatus
                    )
                    OUTPUT INSERTED.*
                    VALUES
                    (
                        @EmployeeID, @BasicSalary, @Allowances, @Bonus, @Deductions,
                        @ExperienceYears, @HikePercentage, @HikeAmount, @SalaryMonth,
                        @PaymentDate, @PaymentStatus
                    )
                `);

            employee.initialSalary = salaryResult.recordset[0];
        } catch (salaryError) {
            console.error("Failed to create salary record:", salaryError.message || salaryError);
        }

        return res.status(201).json({
            message: "Employee Added Successfully",
            employee,
            isManager
        });
    } catch (error) {
        console.error("Employees API failed:", error);
        return res.status(500).json({ message: error.message });
    }
};