const { sql } = require("../config/db");

async function addSalary(salary) {

    const result = await new sql.Request()

        .input("EmployeeID", sql.Int, salary.EmployeeID)
        .input("BasicSalary", sql.Decimal(10,2), salary.BasicSalary)
        .input("Allowances", sql.Decimal(10,2), salary.Allowances)
        .input("Bonus", sql.Decimal(10,2), salary.Bonus)
        .input("Deductions", sql.Decimal(10,2), salary.Deductions)
        .input("ExperienceYears", sql.Decimal(4,1), salary.ExperienceYears)
        .input("HikePercentage", sql.Decimal(5,2), salary.HikePercentage)
        .input("HikeAmount", sql.Decimal(10,2), salary.HikeAmount)
        .input("SalaryMonth", sql.Date, salary.SalaryMonth)
        .input("PaymentDate", sql.Date, salary.PaymentDate)
        .input("PaymentStatus", sql.VarChar(20), salary.PaymentStatus)

        .query(`
        INSERT INTO Salaries
        (
            EmployeeID,
            BasicSalary,
            Allowances,
            Bonus,
            Deductions,
            ExperienceYears,
            HikePercentage,
            HikeAmount,
            SalaryMonth,
            PaymentDate,
            PaymentStatus
        )

        OUTPUT INSERTED.*

        VALUES
        (
            @EmployeeID,
            @BasicSalary,
            @Allowances,
            @Bonus,
            @Deductions,
            @ExperienceYears,
            @HikePercentage,
            @HikeAmount,
            @SalaryMonth,
            @PaymentDate,
            @PaymentStatus
        )
        `);

    return result.recordset[0];

}
async function getSalaries() {

    const result = await sql.query`

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
    LEFT JOIN Employees e
        ON s.EmployeeID = e.EmployeeID
    LEFT JOIN Roles r
        ON e.RoleID = r.RoleID
    LEFT JOIN Departments d
        ON e.DepartmentID = d.DepartmentID
    ORDER BY s.SalaryID DESC

    `;

    return result.recordset;

}

async function getSalariesByEmployeeId(employeeId) {
    const result = await new sql.Request()
        .input("EmployeeID", sql.Int, employeeId)
        .query(`
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
            LEFT JOIN Employees e
                ON s.EmployeeID = e.EmployeeID
            LEFT JOIN Roles r
                ON e.RoleID = r.RoleID
            LEFT JOIN Departments d
                ON e.DepartmentID = d.DepartmentID
            WHERE s.EmployeeID = @EmployeeID
            ORDER BY s.SalaryID DESC
        `);

    return result.recordset;

}

async function getSalariesByRoleId(roleId) {

    const result = await new sql.Request()
        .input("RoleID", sql.Int, roleId)
        .query(`
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
            LEFT JOIN Employees e
                ON s.EmployeeID = e.EmployeeID
            LEFT JOIN Roles r
                ON e.RoleID = r.RoleID
            LEFT JOIN Departments d
                ON e.DepartmentID = d.DepartmentID
            WHERE e.RoleID = @RoleID
            ORDER BY s.SalaryID DESC
        `);

    return result.recordset;

}

async function getSalaryById(id) {
    const result = await sql.query`

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
    LEFT JOIN Employees e
        ON s.EmployeeID = e.EmployeeID
    LEFT JOIN Roles r
        ON e.RoleID = r.RoleID
    LEFT JOIN Departments d
        ON e.DepartmentID = d.DepartmentID
    WHERE s.SalaryID=${id}

    `;

    return result.recordset[0];

}
async function updateSalary(id, salary) {

    const result = await new sql.Request()

        .input("SalaryID", sql.Int, id)
        .input("BasicSalary", sql.Decimal(10,2), salary.BasicSalary)
        .input("Allowances", sql.Decimal(10,2), salary.Allowances)
        .input("Bonus", sql.Decimal(10,2), salary.Bonus)
        .input("Deductions", sql.Decimal(10,2), salary.Deductions)
        .input("ExperienceYears", sql.Decimal(4,1), salary.ExperienceYears)
        .input("HikePercentage", sql.Decimal(5,2), salary.HikePercentage)
        .input("HikeAmount", sql.Decimal(10,2), salary.HikeAmount)
        .input("SalaryMonth", sql.Date, salary.SalaryMonth)
        .input("PaymentDate", sql.Date, salary.PaymentDate)
        .input("PaymentStatus", sql.VarChar(20), salary.PaymentStatus)

        .query(`

        UPDATE Salaries

        SET

        BasicSalary=@BasicSalary,

        Allowances=@Allowances,

        Bonus=@Bonus,

        Deductions=@Deductions,

        ExperienceYears=@ExperienceYears,

        HikePercentage=@HikePercentage,

        HikeAmount=@HikeAmount,

        SalaryMonth=@SalaryMonth,

        PaymentDate=@PaymentDate,

        PaymentStatus=@PaymentStatus

        WHERE SalaryID=@SalaryID

        `);

    return result;

}
async function deleteSalary(id) {

    const result = await sql.query`

    DELETE FROM Salaries

    WHERE SalaryID=${id}

    `;

    return result;

}
module.exports = {

    addSalary,

    getSalaries,

    getSalariesByRoleId,
    getSalariesByEmployeeId,

    getSalaryById,

    updateSalary,

    deleteSalary

};