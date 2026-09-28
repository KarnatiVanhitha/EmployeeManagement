const { sql } = require("../config/db");

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


// UPDATE
async function updateEmployee(id, employee) {

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

    INNER JOIN Roles r
      ON e.RoleID = r.RoleID

    INNER JOIN Departments d
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
    addEmployee,
    updateEmployee,
    deleteEmployee,
    getEmployeeById,
    login,
    getEmployeeByEmail,
    updatePassword,
    getManagers
}