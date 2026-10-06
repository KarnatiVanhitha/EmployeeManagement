const { sql } = require("../config/db");

async function initPromotionHistoryTable() {
    await sql.query(`
        IF OBJECT_ID('dbo.EmployeePromotionHistory', 'U') IS NULL
        BEGIN
            CREATE TABLE dbo.EmployeePromotionHistory (
                PromotionID INT IDENTITY(1,1) PRIMARY KEY,
                EmployeeID INT NOT NULL,
                PreviousRoleName NVARCHAR(100) NOT NULL,
                NewRoleName NVARCHAR(100) NOT NULL,
                ChangedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
            );
        END
    `);
}

async function initSelfSignupColumns() {
    await sql.query(`
        IF EXISTS (
            SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'Employees'
              AND COLUMN_NAME = 'Gender' AND IS_NULLABLE = 'NO'
        )
            ALTER TABLE dbo.Employees ALTER COLUMN Gender varchar(20) NULL;

        IF EXISTS (
            SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'Employees'
              AND COLUMN_NAME = 'DateOfBirth' AND IS_NULLABLE = 'NO'
        )
            ALTER TABLE dbo.Employees ALTER COLUMN DateOfBirth date NULL;

        IF EXISTS (
            SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'Employees'
              AND COLUMN_NAME = 'JoiningDate' AND IS_NULLABLE = 'NO'
        )
            ALTER TABLE dbo.Employees ALTER COLUMN JoiningDate date NULL;

        IF EXISTS (
            SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'Employees'
              AND COLUMN_NAME = 'DepartmentID' AND IS_NULLABLE = 'NO'
        )
            ALTER TABLE dbo.Employees ALTER COLUMN DepartmentID int NULL;

        IF EXISTS (
            SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'Employees'
              AND COLUMN_NAME = 'RoleID' AND IS_NULLABLE = 'NO'
        )
            ALTER TABLE dbo.Employees ALTER COLUMN RoleID int NULL;

        IF EXISTS (
            SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'Employees'
              AND COLUMN_NAME = 'EmploymentType' AND IS_NULLABLE = 'NO'
        )
            ALTER TABLE dbo.Employees ALTER COLUMN EmploymentType varchar(30) NULL;
    `);
}

async function getPromotions() {
    const result = await sql.query(`
        SELECT
            promotion.PromotionID,
            promotion.EmployeeID,
            promotion.PreviousRoleName,
            promotion.NewRoleName,
            promotion.ChangedAt,
            employee.FullName,
            employee.EmployeePhoto
        FROM dbo.EmployeePromotionHistory promotion
        INNER JOIN Employees employee ON employee.EmployeeID = promotion.EmployeeID
        WHERE employee.IsActive = 1
          AND promotion.ChangedAt >= DATEADD(day, -30, SYSUTCDATETIME())
        ORDER BY promotion.ChangedAt DESC
    `);
    return result.recordset;
}

async function getEmployees() {
    const result = await sql.query(`
        SELECT 
            e.*,
            r.RoleName,
            d.DepartmentName
        FROM Employees e
        LEFT JOIN Roles r ON e.RoleID = r.RoleID
        LEFT JOIN Departments d ON e.DepartmentID = d.DepartmentID
        WHERE e.IsActive = 1
    `);
    return result.recordset;
}

async function addEmployee(employee) {

    const result = await new sql.Request()

         .input("EmployeePhoto", sql.NVarChar(sql.MAX), employee.EmployeePhoto || null)
       .input("FullName", sql.NVarChar(100), employee.FullName)
        .input("Email", sql.NVarChar(100), employee.Email)
        .input("MobileNumber", sql.NVarChar(20), employee.MobileNumber)
        .input("Password", sql.NVarChar(255), employee.Password)
        .input("Gender", sql.NVarChar(20), employee.Gender)
        .input("DateOfBirth", sql.Date, employee.DateOfBirth)
        .input("JoiningDate", sql.Date, employee.JoiningDate)
        .input("DepartmentID", sql.Int, employee.DepartmentID)
        .input("RoleID", sql.Int, employee.RoleID)
        .input("EmploymentType", sql.NVarChar(50), employee.EmploymentType)
        .input("Salary", sql.Decimal(10,2), employee.Salary)
        .input("Experience", sql.Decimal(4,1), employee.Experience)
        .input("PresentAddress", sql.NVarChar(sql.MAX), employee.PresentAddress)
        .input("PermanentAddress", sql.NVarChar(sql.MAX), employee.PermanentAddress)
        .input("EmergencyContactName", sql.NVarChar(100), employee.EmergencyContactName)
       .input("EmergencyRelationship", sql.NVarChar(100), employee.EmergencyRelationship)
        .input("EmergencyPhoneNumber", sql.NVarChar(20), employee.EmergencyPhoneNumber)

        .query(`

        INSERT INTO Employees
        (
            EmployeePhoto,
            FullName,
            Email,
            MobileNumber,
            Password,
            Gender,
            DateOfBirth,
            JoiningDate,
            DepartmentID,
            RoleID,
            EmploymentType,
            Salary,
            Experience,
            PresentAddress,
            PermanentAddress,
            EmergencyContactName,
            EmergencyRelationship,
            EmergencyPhoneNumber
        )

        OUTPUT INSERTED.EmployeeID,
               INSERTED.FullName,
               INSERTED.Email

        VALUES
        (
            @EmployeePhoto,
            @FullName,
            @Email,
            @MobileNumber,
            @Password,
            @Gender,
            @DateOfBirth,
            @JoiningDate,
            @DepartmentID,
            @RoleID,
            @EmploymentType,
            @Salary,
            @Experience,
            @PresentAddress,
            @PermanentAddress,
            @EmergencyContactName,
            @EmergencyRelationship,
            @EmergencyPhoneNumber
        )

        `);

    return result.recordset[0];

}

async function registerEmployeeAccount(account) {
    const result = await new sql.Request()
        .input("FullName", sql.NVarChar(100), account.FullName)
        .input("Email", sql.NVarChar(100), account.Email)
        .input("Password", sql.NVarChar(255), account.Password)
        .query(`
            INSERT INTO Employees (FullName, Email, Password, IsActive)
            OUTPUT INSERTED.EmployeeID, INSERTED.FullName, INSERTED.Email
            VALUES (@FullName, @Email, @Password, 1)
        `);

    return result.recordset[0];
}


// UPDATE
async function updateEmployee(id, employee) {

    const currentEmployee = await new sql.Request()
        .input("EmployeeID", sql.Int, id)
        .query(`
            SELECT employee.RoleID, role.RoleName
            FROM Employees employee
            LEFT JOIN Roles role ON role.RoleID = employee.RoleID
            WHERE employee.EmployeeID = @EmployeeID
        `);
    const previousRole = currentEmployee.recordset[0];

    await sql.query`
        UPDATE Employees
        SET
            EmployeePhoto = ${employee.EmployeePhoto},
            FullName = ${employee.FullName},
            Email = ${employee.Email},
            MobileNumber = ${employee.MobileNumber},
            Password = ${employee.Password},
            Gender = ${employee.Gender},
            DateOfBirth = ${employee.DateOfBirth},
            DepartmentID = ${employee.DepartmentID},
            JoiningDate = ${employee.JoiningDate},
            EmploymentType = ${employee.EmploymentType},
            Salary = ${employee.Salary},
            Experience = ${employee.Experience},
            PresentAddress = ${employee.PresentAddress},
            PermanentAddress = ${employee.PermanentAddress},
            EmergencyRelationship = ${employee.EmergencyRelationship},
            EmergencyPhoneNumber = ${employee.EmergencyPhoneNumber},
            RoleID = ${employee.RoleID}
        WHERE EmployeeID = ${id}
    `;

    if (previousRole && Number(previousRole.RoleID) !== Number(employee.RoleID)) {
        const newRoleResult = await new sql.Request()
            .input("RoleID", sql.Int, employee.RoleID)
            .query("SELECT RoleName FROM Roles WHERE RoleID = @RoleID");
        const newRoleName = newRoleResult.recordset[0]?.RoleName;

        if (previousRole.RoleName && newRoleName) {
            await new sql.Request()
                .input("EmployeeID", sql.Int, id)
                .input("PreviousRoleName", sql.NVarChar(100), previousRole.RoleName)
                .input("NewRoleName", sql.NVarChar(100), newRoleName)
                .query(`
                    INSERT INTO dbo.EmployeePromotionHistory
                        (EmployeeID, PreviousRoleName, NewRoleName)
                    VALUES
                        (@EmployeeID, @PreviousRoleName, @NewRoleName)
                `);
        }
    }

}

// DELETE
async function deleteEmployee(id) {

    await sql.query`

        UPDATE Employees
        SET IsActive = 0
        WHERE EmployeeID = ${id};
    `
    ;

}
async function getEmployeeById(id) {

    const result = await sql.query`

        SELECT 
            e.*,
            r.RoleName,
            d.DepartmentName
        FROM Employees e
        LEFT JOIN Roles r ON e.RoleID = r.RoleID
        LEFT JOIN Departments d ON e.DepartmentID = d.DepartmentID
        WHERE e.EmployeeID = ${id}

    `;

    return result.recordset[0];

}
async function login(Email, Password) {

  const result = await sql.query`
    SELECT
      e.EmployeeID,
      e.FullName,
      e.Email,
      e.RoleID,
      e.DepartmentID,
      d.DepartmentName,
      r.RoleName
    FROM Employees e

    LEFT JOIN Roles r
      ON e.RoleID = r.RoleID

    LEFT JOIN Departments d
      ON e.DepartmentID = d.DepartmentID

    WHERE e.Email = ${Email}
      AND e.Password = ${Password}
      AND e.IsActive = 1
  `;

  return result.recordset[0];
}
/* ===========================
verify email
=========================== */
const getEmployeeByEmail = async (Email) => {

    const result = await new sql.Request()

        .input("Email", sql.NVarChar(100), Email)

        .query(`
            SELECT *
            FROM Employees
            WHERE Email=@Email
        `);

    return result.recordset[0];

};

/* ===========================
   RESET PASSWORD
=========================== */
const updatePassword = async (Email, Password) => {

    const result = await new sql.Request()

        .input("Email", sql.NVarChar(100), Email)
        .input("Password", sql.NVarChar(255), Password)

        .query(`
            UPDATE Employees
            SET Password = @Password
            WHERE Email = @Email
        `);

    return result;

};
async function getManagers() {

    const result = await new sql.Request()
        .query(`
            SELECT
                e.EmployeeID,
                e.FullName,
                e.DepartmentID,
                d.DepartmentName,
                e.RoleID,
                r.RoleName
            FROM Employees e

            INNER JOIN Departments d
                ON e.DepartmentID = d.DepartmentID

            INNER JOIN Roles r
                ON e.RoleID = r.RoleID

            WHERE e.IsActive = 1
              AND (r.IsManager = 1 OR LOWER(r.RoleName) LIKE '%manager%')

            ORDER BY
                d.DepartmentName,
                e.FullName
        `);

    return result.recordset;
}
module.exports = {
    getEmployees,
    getPromotions,
    initPromotionHistoryTable,
    initSelfSignupColumns,
    addEmployee,
    registerEmployeeAccount,
    updateEmployee,
    deleteEmployee,
    getEmployeeById,
    login,
    getEmployeeByEmail,
    updatePassword,
    getManagers
}