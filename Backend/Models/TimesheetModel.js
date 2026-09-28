const { sql } = require("../config/db");

async function initTimesheetTable() {
    try {
        await sql.query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Timesheets' AND xtype='U')
            CREATE TABLE Timesheets (
                TimesheetID INT IDENTITY(1,1) PRIMARY KEY,
                TaskID INT NOT NULL,
                EmployeeID INT NOT NULL,
                LoggedHours DECIMAL(10, 2) NOT NULL,
                LoggedDate DATE NOT NULL,
                Description NVARCHAR(MAX),
                CreatedDate DATETIME NOT NULL
            );
        `);
    } catch (err) {
        console.error("Error creating Timesheets table:", err);
    }
}

async function getTimesheets() {
    await initTimesheetTable();
    const result = await sql.query(`
        SELECT
            t.TimesheetID AS timesheetId,
            t.TaskID AS taskId,
            t.EmployeeID AS employeeId,
            t.LoggedHours AS loggedHours,
            t.LoggedDate AS loggedDate,
            t.Description AS description,
            t.CreatedDate AS createdDate,
            COALESCE(pt.TaskName, pt.Title, '') AS taskName,
            pt.Status AS taskStatus,
            pt.ProjectID AS projectId,
            p.ProjectName AS projectName,
            e.FullName AS employeeName
        FROM Timesheets t
        LEFT JOIN ProjectTasks pt ON t.TaskID = pt.TaskID
        LEFT JOIN Projects p ON pt.ProjectID = p.ProjectID
        LEFT JOIN Employees e ON t.EmployeeID = e.EmployeeID
        ORDER BY t.TimesheetID DESC
    `);
    return result.recordset;
}

async function getTimesheetsByEmployee(employeeId) {
    await initTimesheetTable();
    const result = await new sql.Request()
        .input("EmployeeID", sql.Int, employeeId)
        .query(`
            SELECT
                t.TimesheetID AS timesheetId,
                t.TaskID AS taskId,
                t.EmployeeID AS employeeId,
                t.LoggedHours AS loggedHours,
                t.LoggedDate AS loggedDate,
                t.Description AS description,
                t.CreatedDate AS createdDate,
                COALESCE(pt.TaskName, pt.Title, '') AS taskName,
                pt.Status AS taskStatus,
                pt.ProjectID AS projectId,
                p.ProjectName AS projectName,
                e.FullName AS employeeName
            FROM Timesheets t
            LEFT JOIN ProjectTasks pt ON t.TaskID = pt.TaskID
            LEFT JOIN Projects p ON pt.ProjectID = p.ProjectID
            LEFT JOIN Employees e ON t.EmployeeID = e.EmployeeID
            WHERE t.EmployeeID = @EmployeeID
            ORDER BY t.TimesheetID DESC
        `);
    return result.recordset;
}

async function getTimesheetsByProject(projectId) {
    await initTimesheetTable();
    const result = await new sql.Request()
        .input("ProjectID", sql.Int, projectId)
        .query(`
            SELECT
                t.TimesheetID AS timesheetId,
                t.TaskID AS taskId,
                t.EmployeeID AS employeeId,
                t.LoggedHours AS loggedHours,
                t.LoggedDate AS loggedDate,
                t.Description AS description,
                t.CreatedDate AS createdDate,
                COALESCE(pt.TaskName, pt.Title, '') AS taskName,
                pt.Status AS taskStatus,
                pt.ProjectID AS projectId,
                p.ProjectName AS projectName,
                e.FullName AS employeeName
            FROM Timesheets t
            INNER JOIN ProjectTasks pt ON t.TaskID = pt.TaskID
            LEFT JOIN Projects p ON pt.ProjectID = p.ProjectID
            LEFT JOIN Employees e ON t.EmployeeID = e.EmployeeID
            WHERE pt.ProjectID = @ProjectID
            ORDER BY t.TimesheetID DESC
        `);
    return result.recordset;
}

async function getTimesheetsByTask(taskId) {
    await initTimesheetTable();
    const result = await new sql.Request()
        .input("TaskID", sql.Int, taskId)
        .query(`
            SELECT
                t.TimesheetID AS timesheetId,
                t.TaskID AS taskId,
                t.EmployeeID AS employeeId,
                t.LoggedHours AS loggedHours,
                t.LoggedDate AS loggedDate,
                t.Description AS description,
                t.CreatedDate AS createdDate,
                COALESCE(pt.TaskName, pt.Title, '') AS taskName,
                pt.Status AS taskStatus,
                pt.ProjectID AS projectId,
                p.ProjectName AS projectName,
                e.FullName AS employeeName
            FROM Timesheets t
            LEFT JOIN ProjectTasks pt ON t.TaskID = pt.TaskID
            LEFT JOIN Projects p ON pt.ProjectID = p.ProjectID
            LEFT JOIN Employees e ON t.EmployeeID = e.EmployeeID
            WHERE t.TaskID = @TaskID
            ORDER BY t.TimesheetID DESC
        `);
    return result.recordset;
}

async function addTimesheet(timesheet) {
    await initTimesheetTable();
    const result = await new sql.Request()
        .input("TaskID", sql.Int, timesheet.TaskID)
        .input("EmployeeID", sql.Int, timesheet.EmployeeID)
        .input("LoggedHours", sql.Decimal(10, 2), timesheet.LoggedHours)
        .input("LoggedDate", sql.Date, timesheet.LoggedDate || new Date())
        .input("Description", sql.NVarChar(sql.MAX), timesheet.Description || null)
        .input("CreatedDate", sql.DateTime, new Date())
        .query(`
            INSERT INTO Timesheets (TaskID, EmployeeID, LoggedHours, LoggedDate, Description, CreatedDate)
            OUTPUT INSERTED.TimesheetID AS timesheetId
            VALUES (@TaskID, @EmployeeID, @LoggedHours, @LoggedDate, @Description, @CreatedDate)
        `);
    return result.recordset[0];
}

async function deleteTimesheet(timesheetId) {
    await new sql.Request()
        .input("TimesheetID", sql.Int, timesheetId)
        .query(`DELETE FROM Timesheets WHERE TimesheetID = @TimesheetID`);
    return true;
}

module.exports = {
    initTimesheetTable,
    getTimesheets,
    getTimesheetsByEmployee,
    getTimesheetsByProject,
    getTimesheetsByTask,
    addTimesheet,
    deleteTimesheet
};
