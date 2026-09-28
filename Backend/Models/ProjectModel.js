const { sql } = require("../config/db");

async function initProjectsTable() {
    try {
        await sql.query(`
            IF EXISTS (
                SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = 'Projects' 
                AND COLUMN_NAME = 'ManagerID' 
                AND IS_NULLABLE = 'NO'
            )
            BEGIN
                ALTER TABLE Projects ALTER COLUMN ManagerID INT NULL;
            END

            -- Sync statuses: Active if manager assigned, Pending if not attended/assigned
            UPDATE Projects
            SET Status = 'Active'
            WHERE (ManagerID IS NOT NULL AND ManagerID > 0)
              AND (Status IS NULL OR Status = 'Pending' OR Status = '' OR Status = 'Created');

            UPDATE Projects
            SET Status = 'Pending'
            WHERE (ManagerID IS NULL OR ManagerID = 0)
              AND (Status IS NULL OR Status = 'Active' OR Status = '');
        `);
    } catch (err) {
        console.error("Error initializing Projects table:", err.message);
    }
}

async function addProject(project) {
    const isManagerAssigned = project.ManagerID && Number(project.ManagerID) > 0;
    const computedStatus = isManagerAssigned
        ? "Active"
        : (project.Status === "Completed" ? "Completed" : "Pending");

    const result = await new sql.Request()
        .input("ProjectName", sql.NVarChar(150), project.ProjectName)
        .input("Description", sql.NVarChar(sql.MAX), project.Description)
        .input("ManagerID", sql.Int, isManagerAssigned ? project.ManagerID : null)
        .input("StartDate", sql.Date, project.StartDate)
        .input("EndDate", sql.Date, project.EndDate)
        .input("Status", sql.NVarChar(50), computedStatus)
        .input("Priority", sql.NVarChar(20), project.Priority || "Medium")
        .input("Budget", sql.Decimal(10, 2), project.Budget || 0)
        .input("CreatedDate", sql.DateTime, new Date())
        .query(`
            INSERT INTO Projects
            (
                ProjectName,
                Description,
                ManagerID,
                StartDate,
                EndDate,
                Status,
                Priority,
                Budget,
                CreatedDate
            )
            OUTPUT INSERTED.*
            VALUES
            (
                @ProjectName,
                @Description,
                @ManagerID,
                @StartDate,
                @EndDate,
                @Status,
                @Priority,
                @Budget,
                @CreatedDate
            )
        `);

    return result.recordset[0];
}

async function getProjects() {
    const result = await sql.query`
        SELECT
            p.ProjectID AS projectId,
            p.ProjectID AS ProjectID,
            p.ProjectName AS projectName,
            p.ProjectName AS ProjectName,
            p.Description AS description,
            p.Description AS Description,
            p.ManagerID AS managerId,
            p.ManagerID AS ManagerID,
            e.FullName AS managerName,
            e.FullName AS ManagerName,
            e.DepartmentID AS departmentId,
            e.DepartmentID AS DepartmentID,
            d.DepartmentName AS departmentName,
            d.DepartmentName AS DepartmentName,
            p.StartDate AS startDate,
            p.StartDate AS StartDate,
            p.EndDate AS endDate,
            p.EndDate AS EndDate,
            CASE
                WHEN p.Status = 'Completed' THEN 'Completed'
                WHEN p.Status = 'On Hold' THEN 'On Hold'
                WHEN p.Status = 'Cancelled' THEN 'Cancelled'
                WHEN p.ManagerID IS NOT NULL AND p.ManagerID > 0 THEN 'Active'
                ELSE 'Pending'
            END AS status,
            CASE
                WHEN p.Status = 'Completed' THEN 'Completed'
                WHEN p.Status = 'On Hold' THEN 'On Hold'
                WHEN p.Status = 'Cancelled' THEN 'Cancelled'
                WHEN p.ManagerID IS NOT NULL AND p.ManagerID > 0 THEN 'Active'
                ELSE 'Pending'
            END AS Status,
            p.Priority AS priority,
            p.Priority AS Priority,
            p.Budget AS budget,
            p.Budget AS Budget,
            p.CreatedDate AS createdDate,
            p.CreatedDate AS CreatedDate
        FROM Projects p
        LEFT JOIN Employees e ON p.ManagerID = e.EmployeeID
        LEFT JOIN Departments d ON e.DepartmentID = d.DepartmentID
        ORDER BY p.ProjectID DESC
    `;

    return result.recordset;
}

async function getProjectById(projectId) {
    const result = await new sql.Request()
        .input("ProjectID", sql.Int, projectId)
        .query(`
            SELECT
                p.ProjectID AS projectId,
                p.ProjectID AS ProjectID,
                p.ProjectName AS projectName,
                p.ProjectName AS ProjectName,
                p.Description AS description,
                p.Description AS Description,
                p.ManagerID AS managerId,
                p.ManagerID AS ManagerID,
                e.FullName AS managerName,
                e.FullName AS ManagerName,
                e.DepartmentID AS departmentId,
                e.DepartmentID AS DepartmentID,
                d.DepartmentName AS departmentName,
                d.DepartmentName AS DepartmentName,
                p.StartDate AS startDate,
                p.StartDate AS StartDate,
                p.EndDate AS endDate,
                p.EndDate AS EndDate,
                CASE
                    WHEN p.Status = 'Completed' THEN 'Completed'
                    WHEN p.Status = 'On Hold' THEN 'On Hold'
                    WHEN p.Status = 'Cancelled' THEN 'Cancelled'
                    WHEN p.ManagerID IS NOT NULL AND p.ManagerID > 0 THEN 'Active'
                    ELSE 'Pending'
                END AS status,
                CASE
                    WHEN p.Status = 'Completed' THEN 'Completed'
                    WHEN p.Status = 'On Hold' THEN 'On Hold'
                    WHEN p.Status = 'Cancelled' THEN 'Cancelled'
                    WHEN p.ManagerID IS NOT NULL AND p.ManagerID > 0 THEN 'Active'
                    ELSE 'Pending'
                END AS Status,
                p.Priority AS priority,
                p.Priority AS Priority,
                p.Budget AS budget,
                p.Budget AS Budget,
                p.CreatedDate AS createdDate,
                p.CreatedDate AS CreatedDate
            FROM Projects p
            LEFT JOIN Employees e ON p.ManagerID = e.EmployeeID
            LEFT JOIN Departments d ON e.DepartmentID = d.DepartmentID
            WHERE p.ProjectID = @ProjectID
        `);

    return result.recordset[0];
}

async function getProjectsByManagerId(managerId) {
    const result = await new sql.Request()
        .input("ManagerID", sql.Int, managerId)
        .query(`
            SELECT
                p.ProjectID AS projectId,
                p.ProjectID AS ProjectID,
                p.ProjectName AS projectName,
                p.ProjectName AS ProjectName,
                p.Description AS description,
                p.Description AS Description,
                p.ManagerID AS managerId,
                p.ManagerID AS ManagerID,
                e.FullName AS managerName,
                e.FullName AS ManagerName,
                e.DepartmentID AS departmentId,
                e.DepartmentID AS DepartmentID,
                d.DepartmentName AS departmentName,
                d.DepartmentName AS DepartmentName,
                p.StartDate AS startDate,
                p.StartDate AS StartDate,
                p.EndDate AS endDate,
                p.EndDate AS EndDate,
                CASE
                    WHEN p.Status = 'Completed' THEN 'Completed'
                    WHEN p.Status = 'On Hold' THEN 'On Hold'
                    WHEN p.Status = 'Cancelled' THEN 'Cancelled'
                    WHEN p.ManagerID IS NOT NULL AND p.ManagerID > 0 THEN 'Active'
                    ELSE 'Pending'
                END AS status,
                CASE
                    WHEN p.Status = 'Completed' THEN 'Completed'
                    WHEN p.Status = 'On Hold' THEN 'On Hold'
                    WHEN p.Status = 'Cancelled' THEN 'Cancelled'
                    WHEN p.ManagerID IS NOT NULL AND p.ManagerID > 0 THEN 'Active'
                    ELSE 'Pending'
                END AS Status,
                p.Priority AS priority,
                p.Priority AS Priority,
                p.Budget AS budget,
                p.Budget AS Budget,
                p.CreatedDate AS createdDate,
                p.CreatedDate AS CreatedDate
            FROM Projects p
            LEFT JOIN Employees e ON p.ManagerID = e.EmployeeID
            LEFT JOIN Departments d ON e.DepartmentID = d.DepartmentID
            WHERE p.ManagerID = @ManagerID
            ORDER BY p.ProjectID DESC
        `);

    return result.recordset;
}

async function updateProject(projectId, project) {
    const isManagerAssigned = project.ManagerID && Number(project.ManagerID) > 0;
    let computedStatus = project.Status;
    if (isManagerAssigned) {
        if (!computedStatus || computedStatus === 'Pending') {
            computedStatus = 'Active';
        }
    } else {
        if (!computedStatus || computedStatus === 'Active') {
            computedStatus = 'Pending';
        }
    }

    const result = await new sql.Request()
        .input("ProjectID", sql.Int, projectId)
        .input("ProjectName", sql.NVarChar(150), project.ProjectName)
        .input("Description", sql.NVarChar(sql.MAX), project.Description)
        .input("ManagerID", sql.Int, isManagerAssigned ? project.ManagerID : null)
        .input("StartDate", sql.Date, project.StartDate)
        .input("EndDate", sql.Date, project.EndDate)
        .input("Status", sql.NVarChar(50), computedStatus)
        .input("Priority", sql.NVarChar(20), project.Priority)
        .input("Budget", sql.Decimal(10, 2), project.Budget)
        .query(`
            UPDATE Projects
            SET
                ProjectName = @ProjectName,
                Description = @Description,
                ManagerID = @ManagerID,
                StartDate = @StartDate,
                EndDate = @EndDate,
                Status = @Status,
                Priority = @Priority,
                Budget = @Budget
            WHERE ProjectID = @ProjectID;

            SELECT * FROM Projects WHERE ProjectID = @ProjectID;
        `);

    return result.recordset[0];
}

async function assignManager(projectId, managerId) {
    const isManagerAssigned = managerId && Number(managerId) > 0;
    const computedStatus = isManagerAssigned ? 'Active' : 'Pending';

    const result = await new sql.Request()
        .input("ProjectID", sql.Int, projectId)
        .input("ManagerID", sql.Int, isManagerAssigned ? managerId : null)
        .input("Status", sql.NVarChar(50), computedStatus)
        .query(`
            UPDATE Projects
            SET ManagerID = @ManagerID,
                Status = @Status
            WHERE ProjectID = @ProjectID;

            SELECT
                p.ProjectID AS projectId,
                p.ProjectID AS ProjectID,
                p.ProjectName AS projectName,
                p.ProjectName AS ProjectName,
                p.Description AS description,
                p.Description AS Description,
                p.ManagerID AS managerId,
                p.ManagerID AS ManagerID,
                e.FullName AS managerName,
                e.FullName AS ManagerName,
                e.DepartmentID AS departmentId,
                e.DepartmentID AS DepartmentID,
                d.DepartmentName AS departmentName,
                d.DepartmentName AS DepartmentName,
                p.StartDate AS startDate,
                p.StartDate AS StartDate,
                p.EndDate AS endDate,
                p.EndDate AS EndDate,
                CASE
                    WHEN p.Status = 'Completed' THEN 'Completed'
                    WHEN p.Status = 'On Hold' THEN 'On Hold'
                    WHEN p.Status = 'Cancelled' THEN 'Cancelled'
                    WHEN p.ManagerID IS NOT NULL AND p.ManagerID > 0 THEN 'Active'
                    ELSE 'Pending'
                END AS status,
                CASE
                    WHEN p.Status = 'Completed' THEN 'Completed'
                    WHEN p.Status = 'On Hold' THEN 'On Hold'
                    WHEN p.Status = 'Cancelled' THEN 'Cancelled'
                    WHEN p.ManagerID IS NOT NULL AND p.ManagerID > 0 THEN 'Active'
                    ELSE 'Pending'
                END AS Status,
                p.Priority AS priority,
                p.Priority AS Priority,
                p.Budget AS budget,
                p.Budget AS Budget,
                p.CreatedDate AS createdDate,
                p.CreatedDate AS CreatedDate
            FROM Projects p
            LEFT JOIN Employees e ON p.ManagerID = e.EmployeeID
            LEFT JOIN Departments d ON e.DepartmentID = d.DepartmentID
            WHERE p.ProjectID = @ProjectID;
        `);

    return result.recordset[0];
}

async function deleteProject(projectId) {
    const result = await new sql.Request()
        .input("ProjectID", sql.Int, projectId)
        .query(`
            DELETE FROM ProjectTasks WHERE ProjectID = @ProjectID;
            DELETE FROM Projects WHERE ProjectID = @ProjectID;
        `);

    return result;
}
async function getManagers() {
    try {
        const result = await new sql.Request()
            .query(`
                SELECT
                    e.EmployeeID AS employeeId,
                    e.EmployeeID AS EmployeeID,
                    e.FullName AS employeeName,
                    e.FullName AS FullName,
                    e.DepartmentID AS departmentId,
                    e.DepartmentID AS DepartmentID,
                    d.DepartmentName AS departmentName,
                    d.DepartmentName AS DepartmentName,
                    e.RoleID AS roleId,
                    e.RoleID AS RoleID,
                    r.RoleName AS roleName,
                    r.RoleName AS RoleName
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
    } catch (error) {
        console.error("Error in getManagers:", error.message);
        throw error;
    }
}

module.exports = {
    initProjectsTable,
    addProject,
    getProjects,
    getProjectById,
    getProjectsByManagerId,
    updateProject,
    assignManager,
    deleteProject,
    getManagers
};
