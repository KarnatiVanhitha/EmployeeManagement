const { sql, config } = require("../config/db");

// Get All Managers
async function getManagers() {

    const result = await sql.query`

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

    INNER JOIN Employees e
        ON tm.ManagerID = e.EmployeeID

    LEFT JOIN Departments d
        ON e.DepartmentID = d.DepartmentID

    LEFT JOIN Roles r
        ON e.RoleID = r.RoleID

    WHERE tm.IsActive = 1

    `;

    return result.recordset;

}
// Get Manager By ID
const getManagerById = async (id) => {
    await sql.connect(config);

    const request = new sql.Request();

    request.input("ManagerID", sql.Int, id);

    const result = await request.query(`
        SELECT *
        FROM TeamManagers
        WHERE ManagerID = @ManagerID
    `);

    return result.recordset[0];
};

// Add Manager
async function addManager(manager) {

    await new sql.Request()

        .input("ManagerID", sql.Int, manager.ManagerID)

        .input("ManagerName", sql.NVarChar(100), manager.ManagerName)

        .input("Email", sql.NVarChar(100), manager.Email)

        .input("TeamName", sql.NVarChar(100), manager.TeamName)

        .input("Members", sql.Int, manager.Members)

        .input("Projects", sql.Int, manager.Projects)

        .query(`

        INSERT INTO TeamManagers
        (

            ManagerID,

            ManagerName,

            Email,

            TeamName,

            Members,

            Projects

        )

        VALUES
        (

            @ManagerID,

            @ManagerName,

            @Email,

            @TeamName,

            @Members,

            @Projects

        )

        `);

}
// Update Manager
const updateManager = async (id, manager) => {
    await sql.connect(config);

    const request = new sql.Request();

    request.input("ManagerID", sql.Int, id);
    request.input("ManagerName", sql.NVarChar, manager.ManagerName);
    request.input("Email", sql.NVarChar, manager.Email);
    request.input("TeamName", sql.NVarChar, manager.TeamName);
    request.input("Members", sql.Int, manager.Members);
    request.input("Projects", sql.Int, manager.Projects);

    return await request.query(`
        UPDATE TeamManagers
        SET
            ManagerName = @ManagerName,
            Email = @Email,
            TeamName = @TeamName,
            Members = @Members,
            Projects = @Projects,
            UpdatedAt = GETDATE()
        WHERE ManagerID = @ManagerID
    `);
};

// Delete Manager (Soft Delete)
const deleteManager = async (id) => {
    await sql.connect(config);

    const request = new sql.Request();

    request.input("ManagerID", sql.Int, id);

    return await request.query(`
        UPDATE TeamManagers
        SET IsActive = 0
        WHERE ManagerID = @ManagerID
    `);
};

module.exports = {
    getManagers,
    getManagerById,
    addManager,
    updateManager,
    deleteManager
};