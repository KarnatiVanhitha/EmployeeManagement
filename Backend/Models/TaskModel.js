const { sql } = require("../config/db");

async function initTaskTable() {
    try {
        await sql.query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ProjectTasks' AND xtype='U')
            BEGIN
                CREATE TABLE ProjectTasks (
                    TaskID INT IDENTITY(1,1) PRIMARY KEY,
                    ProjectID INT NOT NULL,
                    TaskName NVARCHAR(150) NULL,
                    Title NVARCHAR(150) NULL,
                    Description NVARCHAR(MAX) NULL,
                    AssignedTo INT NULL,
                    TeamLeadID INT NULL,
                    SprintID INT NULL,
                    TaskType NVARCHAR(50) NULL,
                    StartDate DATE NULL,
                    DueDate DATE NULL,
                    Status NVARCHAR(50) DEFAULT 'Pending',
                    Priority NVARCHAR(20) DEFAULT 'Medium',
                    Progress INT DEFAULT 0,
                    CreatedDate DATETIME DEFAULT GETDATE()
                );
            END
            ELSE
            BEGIN
                IF COL_LENGTH('ProjectTasks', 'ProjectName') IS NULL
                    ALTER TABLE ProjectTasks ADD ProjectName NVARCHAR(200) NULL;

                IF COL_LENGTH('ProjectTasks', 'TaskName') IS NULL
                    ALTER TABLE ProjectTasks ADD TaskName NVARCHAR(150) NULL;

                IF COL_LENGTH('ProjectTasks', 'Title') IS NULL
                    ALTER TABLE ProjectTasks ADD Title NVARCHAR(150) NULL;

                IF COL_LENGTH('ProjectTasks', 'SprintID') IS NULL
                    ALTER TABLE ProjectTasks ADD SprintID INT NULL;

                IF COL_LENGTH('ProjectTasks', 'TeamLeadID') IS NULL
                    ALTER TABLE ProjectTasks ADD TeamLeadID INT NULL;

                IF COL_LENGTH('ProjectTasks', 'TaskType') IS NULL
                    ALTER TABLE ProjectTasks ADD TaskType NVARCHAR(50) NULL;

                IF COL_LENGTH('ProjectTasks', 'StartDate') IS NULL
                    ALTER TABLE ProjectTasks ADD StartDate DATE NULL;

                IF COL_LENGTH('ProjectTasks', 'DueDate') IS NULL
                    ALTER TABLE ProjectTasks ADD DueDate DATE NULL;

                IF COL_LENGTH('ProjectTasks', 'Status') IS NULL
                    ALTER TABLE ProjectTasks ADD Status NVARCHAR(50) NULL;

                IF COL_LENGTH('ProjectTasks', 'Priority') IS NULL
                    ALTER TABLE ProjectTasks ADD Priority NVARCHAR(20) NULL;

                IF COL_LENGTH('ProjectTasks', 'Progress') IS NULL
                    ALTER TABLE ProjectTasks ADD Progress INT NULL;

                IF COL_LENGTH('ProjectTasks', 'CreatedDate') IS NULL
                    ALTER TABLE ProjectTasks ADD CreatedDate DATETIME NULL;

                -- Ensure columns allow NULL values so tasks can be assigned later
                IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('ProjectTasks') AND name = 'ProjectName' AND is_nullable = 0)
                    ALTER TABLE ProjectTasks ALTER COLUMN ProjectName NVARCHAR(200) NULL;

                IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('ProjectTasks') AND name = 'AssignedTo' AND is_nullable = 0)
                    ALTER TABLE ProjectTasks ALTER COLUMN AssignedTo INT NULL;

                IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('ProjectTasks') AND name = 'TeamLeadID' AND is_nullable = 0)
                    ALTER TABLE ProjectTasks ALTER COLUMN TeamLeadID INT NULL;

                IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('ProjectTasks') AND name = 'SprintID' AND is_nullable = 0)
                    ALTER TABLE ProjectTasks ALTER COLUMN SprintID INT NULL;

                IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('ProjectTasks') AND name = 'TaskType' AND is_nullable = 0)
                    ALTER TABLE ProjectTasks ALTER COLUMN TaskType NVARCHAR(50) NULL;

                IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('ProjectTasks') AND name = 'StartDate' AND is_nullable = 0)
                    ALTER TABLE ProjectTasks ALTER COLUMN StartDate DATE NULL;

                IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('ProjectTasks') AND name = 'DueDate' AND is_nullable = 0)
                    ALTER TABLE ProjectTasks ALTER COLUMN DueDate DATE NULL;

                IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('ProjectTasks') AND name = 'Description' AND is_nullable = 0)
                    ALTER TABLE ProjectTasks ALTER COLUMN Description NVARCHAR(MAX) NULL;

                IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('ProjectTasks') AND name = 'Title' AND is_nullable = 0)
                    ALTER TABLE ProjectTasks ALTER COLUMN Title NVARCHAR(150) NULL;

                IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('ProjectTasks') AND name = 'TaskName' AND is_nullable = 0)
                    ALTER TABLE ProjectTasks ALTER COLUMN TaskName NVARCHAR(150) NULL;

                DECLARE @alterSql NVARCHAR(MAX) = '';
                SELECT @alterSql = @alterSql + 'ALTER TABLE ProjectTasks ALTER COLUMN [' + c.name + '] ' + 
                    t.name + CASE 
                        WHEN t.name IN ('nvarchar', 'varchar', 'nchar', 'char') THEN '(' + CASE WHEN c.max_length = -1 THEN 'MAX' ELSE CAST(CASE WHEN t.name LIKE 'n%' THEN c.max_length/2 ELSE c.max_length END AS VARCHAR(10)) END + ')'
                        WHEN t.name IN ('decimal', 'numeric') THEN '(' + CAST(c.precision AS VARCHAR(10)) + ',' + CAST(c.scale AS VARCHAR(10)) + ')'
                        ELSE ''
                    END + ' NULL; '
                FROM sys.columns c
                JOIN sys.types t ON c.user_type_id = t.user_type_id
                WHERE c.object_id = OBJECT_ID('ProjectTasks')
                  AND c.name NOT IN ('TaskID', 'ProjectID')
                  AND c.is_nullable = 0
                  AND c.is_computed = 0
                  AND c.default_object_id = 0;

                IF @alterSql <> ''
                    EXEC sp_executesql @alterSql;

                -- Drop rigid CHECK constraints on Status in ProjectTasks
                DECLARE @chkName NVARCHAR(255);
                DECLARE @chkSql NVARCHAR(MAX);
                DECLARE chk_cursor CURSOR FOR
                SELECT name 
                FROM sys.check_constraints 
                WHERE parent_object_id = OBJECT_ID('ProjectTasks') 
                  AND (name LIKE '%Statu%' OR definition LIKE '%Status%');

                OPEN chk_cursor;
                FETCH NEXT FROM chk_cursor INTO @chkName;

                WHILE @@FETCH_STATUS = 0
                BEGIN
                    SET @chkSql = 'ALTER TABLE ProjectTasks DROP CONSTRAINT [' + @chkName + ']';
                    BEGIN TRY
                        EXEC sp_executesql @chkSql;
                    END TRY
                    BEGIN CATCH
                    END CATCH;
                    FETCH NEXT FROM chk_cursor INTO @chkName;
                END

                CLOSE chk_cursor;
                DEALLOCATE chk_cursor;

                EXEC('UPDATE ProjectTasks SET TaskName = Title WHERE TaskName IS NULL AND Title IS NOT NULL');
                EXEC('UPDATE ProjectTasks SET Title = TaskName WHERE Title IS NULL AND TaskName IS NOT NULL');
            END
        `);
    } catch (err) {
        console.error("Error updating ProjectTasks table:", err.message);
    }
}

async function addTask(task) {
    await initTaskTable();

    const taskTitle = task.TaskName || task.Title || task.TicketTitle || task.taskName || '';
    
    let projectName = task.ProjectName || task.projectName || '';
    if (!projectName && task.ProjectID) {
        try {
            const projResult = await sql.query`SELECT ProjectName FROM Projects WHERE ProjectID = ${task.ProjectID}`;
            if (projResult.recordset && projResult.recordset.length > 0) {
                projectName = projResult.recordset[0].ProjectName || '';
            }
        } catch (e) {
            console.error("Error fetching ProjectName:", e.message);
        }
    }

    const request = new sql.Request()
        .input("ProjectID", sql.Int, task.ProjectID)
        .input("ProjectName", sql.NVarChar(200), projectName)
        .input("TaskName", sql.NVarChar(150), taskTitle)
        .input("Title", sql.NVarChar(150), taskTitle)
        .input("Description", sql.NVarChar(sql.MAX), task.Description || null)
        .input("AssignedTo", sql.Int, task.AssignedTo || null)
        .input("TeamLeadID", sql.Int, task.TeamLeadID || null)
        .input("SprintID", sql.Int, task.SprintID || null)
        .input("TaskType", sql.NVarChar(50), task.TaskType || null)
        .input("StartDate", sql.Date, task.StartDate || null)
        .input("DueDate", sql.Date, task.DueDate || null)
        .input("Status", sql.NVarChar(50), task.Status || "Pending")
        .input("Priority", sql.NVarChar(20), task.Priority || "Medium")
        .input("Progress", sql.Int, task.Progress || 0)
        .input("CreatedDate", sql.DateTime, new Date());

    const result = await request.query(`
        INSERT INTO ProjectTasks
        (
            ProjectID,
            ProjectName,
            TaskName,
            Title,
            Description,
            AssignedTo,
            TeamLeadID,
            SprintID,
            TaskType,
            StartDate,
            DueDate,
            Status,
            Priority,
            Progress,
            CreatedDate
        )
        OUTPUT INSERTED.*
        VALUES
        (
            @ProjectID,
            @ProjectName,
            @TaskName,
            @Title,
            @Description,
            @AssignedTo,
            @TeamLeadID,
            @SprintID,
            @TaskType,
            @StartDate,
            @DueDate,
            @Status,
            @Priority,
            @Progress,
            @CreatedDate
        )
    `);

    return result.recordset[0];
}

async function getTasks() {
    await initTaskTable();

    const result = await sql.query`
        SELECT
            t.TaskID AS taskId,
            t.TaskID AS TaskID,
            t.ProjectID AS projectId,
            t.ProjectID AS ProjectID,
            COALESCE(t.TaskName, t.Title, '') AS taskName,
            COALESCE(t.TaskName, t.Title, '') AS TaskName,
            COALESCE(t.TaskName, t.Title, '') AS TicketTitle,
            t.Description AS description,
            t.Description AS Description,
            t.AssignedTo AS assignedTo,
            t.AssignedTo AS AssignedTo,
            e.FullName AS assignedToName,
            t.TeamLeadID AS teamLeadId,
            t.TeamLeadID AS TeamLeadID,
            tl.FullName AS teamLeadName,
            t.SprintID AS sprintId,
            t.SprintID AS SprintID,
            t.TaskType AS taskType,
            t.TaskType AS TaskType,
            t.StartDate AS startDate,
            t.StartDate AS StartDate,
            t.DueDate AS dueDate,
            t.DueDate AS DueDate,
            t.Status AS status,
            t.Status AS Status,
            t.Priority AS priority,
            t.Priority AS Priority,
            t.Progress AS progress,
            t.Progress AS Progress,
            t.CreatedDate AS createdDate,
            t.CreatedDate AS CreatedDate
        FROM ProjectTasks t
        LEFT JOIN Employees e ON t.AssignedTo = e.EmployeeID
        LEFT JOIN Employees tl ON t.TeamLeadID = tl.EmployeeID
        ORDER BY t.TaskID DESC
    `;

    return result.recordset;
}

async function getTaskById(taskId) {
    const result = await new sql.Request()
        .input("TaskID", sql.Int, taskId)
        .query(`
            SELECT
                t.TaskID AS taskId,
                t.ProjectID AS projectId,
                COALESCE(t.TaskName, t.Title, '') AS taskName,
                t.Description AS description,
                t.AssignedTo AS assignedTo,
                e.FullName AS assignedToName,
                t.StartDate AS startDate,
                t.DueDate AS dueDate,
                t.Status AS status,
                t.Priority AS priority,
                t.Progress AS progress,
                t.CreatedDate AS createdDate
            FROM ProjectTasks t
            LEFT JOIN Employees e ON t.AssignedTo = e.EmployeeID
            WHERE t.TaskID = @TaskID
        `);

    return result.recordset[0];
}

async function getTasksByProjectId(projectId) {
    const result = await new sql.Request()
        .input("ProjectID", sql.Int, projectId)
        .query(`
            SELECT
                t.TaskID AS taskId,
                t.TaskID AS TaskID,
                t.ProjectID AS projectId,
                t.ProjectID AS ProjectID,
                COALESCE(t.TaskName, t.Title, '') AS taskName,
                COALESCE(t.TaskName, t.Title, '') AS TaskName,
                COALESCE(t.TaskName, t.Title, '') AS TicketTitle,
                t.Description AS description,
                t.Description AS Description,
                t.AssignedTo AS assignedTo,
                t.AssignedTo AS AssignedTo,
                e.FullName AS assignedToName,
                t.TeamLeadID AS teamLeadId,
                t.TeamLeadID AS TeamLeadID,
                tl.FullName AS teamLeadName,
                t.SprintID AS sprintId,
                t.SprintID AS SprintID,
                t.TaskType AS taskType,
                t.TaskType AS TaskType,
                t.StartDate AS startDate,
                t.StartDate AS StartDate,
                t.DueDate AS dueDate,
                t.DueDate AS DueDate,
                t.Status AS status,
                t.Status AS Status,
                t.Priority AS priority,
                t.Priority AS Priority,
                t.Progress AS progress,
                t.Progress AS Progress,
                t.CreatedDate AS createdDate,
                t.CreatedDate AS CreatedDate
            FROM ProjectTasks t
            LEFT JOIN Employees e ON t.AssignedTo = e.EmployeeID
            LEFT JOIN Employees tl ON t.TeamLeadID = tl.EmployeeID
            WHERE t.ProjectID = @ProjectID
            ORDER BY t.TaskID DESC
        `);

    return result.recordset;
}

async function getTasksByEmployeeId(employeeId) {
    const result = await new sql.Request()
        .input("EmployeeID", sql.Int, employeeId)
        .query(`
            SELECT
                t.TaskID AS taskId,
                t.ProjectID AS projectId,
                COALESCE(t.TaskName, t.Title, '') AS taskName,
                t.Description AS description,
                t.AssignedTo AS assignedTo,
                e.FullName AS assignedToName,
                t.StartDate AS startDate,
                t.DueDate AS dueDate,
                t.Status AS status,
                t.Priority AS priority,
                t.Progress AS progress,
                t.CreatedDate AS createdDate
            FROM ProjectTasks t
            LEFT JOIN Employees e ON t.AssignedTo = e.EmployeeID
            WHERE t.AssignedTo = @EmployeeID
            ORDER BY t.TaskID DESC
        `);

    return result.recordset;
}

async function updateTask(taskId, task) {
    const result = await new sql.Request()
        .input("TaskID", sql.Int, taskId)
        .input("TaskName", sql.NVarChar(150), task.TaskName ?? task.Title ?? null)
        .input("Description", sql.NVarChar(sql.MAX), task.Description ?? null)
        .input("AssignedTo", sql.Int, task.AssignedTo ?? null)
        .input("StartDate", sql.Date, task.StartDate ?? null)
        .input("DueDate", sql.Date, task.DueDate ?? null)
        .input("Status", sql.NVarChar(50), task.Status ?? null)
        .input("Priority", sql.NVarChar(20), task.Priority ?? null)
        .input("Progress", sql.Int, task.Progress ?? null)
        .query(`
            UPDATE ProjectTasks
            SET
                TaskName = COALESCE(@TaskName, TaskName),
                Title = COALESCE(@TaskName, Title, TaskName),
                Description = COALESCE(@Description, Description),
                AssignedTo = COALESCE(@AssignedTo, AssignedTo),
                StartDate = COALESCE(@StartDate, StartDate),
                DueDate = COALESCE(@DueDate, DueDate),
                Status = COALESCE(@Status, Status),
                Priority = COALESCE(@Priority, Priority),
                Progress = COALESCE(@Progress, Progress)
            WHERE TaskID = @TaskID;

            SELECT
                t.TaskID AS taskId,
                t.ProjectID AS projectId,
                COALESCE(t.TaskName, t.Title, '') AS taskName,
                t.Description AS description,
                t.AssignedTo AS assignedTo,
                e.FullName AS assignedToName,
                t.StartDate AS startDate,
                t.DueDate AS dueDate,
                t.Status AS status,
                t.Priority AS priority,
                t.Progress AS progress,
                t.CreatedDate AS createdDate
            FROM ProjectTasks t
            LEFT JOIN Employees e ON t.AssignedTo = e.EmployeeID
            WHERE t.TaskID = @TaskID;
        `);

    return result.recordset[0];
}

async function assignTask(taskId, assignedTo, status) {
    await initTaskTable();

    const targetStatus = status || 'Assigned';

    try {
        const result = await new sql.Request()
            .input("TaskID", sql.Int, taskId)
            .input("AssignedTo", sql.Int, assignedTo)
            .input("Status", sql.NVarChar(50), targetStatus)
            .query(`
                UPDATE ProjectTasks
                SET
                    AssignedTo = @AssignedTo,
                    Status = @Status
                WHERE TaskID = @TaskID;

                SELECT
                    t.TaskID AS taskId,
                    t.ProjectID AS projectId,
                    COALESCE(t.TaskName, t.Title, '') AS taskName,
                    t.Description AS description,
                    t.AssignedTo AS assignedTo,
                    e.FullName AS assignedToName,
                    t.StartDate AS startDate,
                    t.DueDate AS dueDate,
                    t.Status AS status,
                    t.Priority AS priority,
                    t.Progress AS progress,
                    t.CreatedDate AS createdDate
                FROM ProjectTasks t
                LEFT JOIN Employees e ON t.AssignedTo = e.EmployeeID
                WHERE t.TaskID = @TaskID;
            `);

        return result.recordset[0];
    } catch (err) {
        if (err.message && err.message.includes('Status')) {
            const fallbackResult = await new sql.Request()
                .input("TaskID", sql.Int, taskId)
                .input("AssignedTo", sql.Int, assignedTo)
                .query(`
                    UPDATE ProjectTasks
                    SET
                        AssignedTo = @AssignedTo
                    WHERE TaskID = @TaskID;

                    SELECT
                        t.TaskID AS taskId,
                        t.ProjectID AS projectId,
                        COALESCE(t.TaskName, t.Title, '') AS taskName,
                        t.Description AS description,
                        t.AssignedTo AS assignedTo,
                        e.FullName AS assignedToName,
                        t.StartDate AS startDate,
                        t.DueDate AS dueDate,
                        t.Status AS status,
                        t.Priority AS priority,
                        t.Progress AS progress,
                        t.CreatedDate AS createdDate
                    FROM ProjectTasks t
                    LEFT JOIN Employees e ON t.AssignedTo = e.EmployeeID
                    WHERE t.TaskID = @TaskID;
                `);
            return fallbackResult.recordset[0];
        }
        throw err;
    }
}

async function updateTaskStatus(taskId, status, progress) {
    let progressVal = progress;
    if (progressVal === undefined || progressVal === null) {
        switch ((status || '').toUpperCase()) {
            case 'COMPLETED':
                progressVal = 100;
                break;
            case 'SPRINT REVIEW':
                progressVal = 90;
                break;
            case 'QA':
            case 'TESTING':
                progressVal = 75;
                break;
            case 'DEVELOPMENT':
            case 'IN PROGRESS':
                progressVal = 30;
                break;
            case 'QA FAILED':
                progressVal = 40;
                break;
            default:
                progressVal = null;
                break;
        }
    }

    const result = await new sql.Request()
        .input("TaskID", sql.Int, taskId)
        .input("Status", sql.NVarChar(50), status)
        .input("Progress", sql.Int, progressVal)
        .query(`
            UPDATE ProjectTasks
            SET
                Status = @Status,
                Progress = COALESCE(@Progress, Progress, 0)
            WHERE TaskID = @TaskID;

            SELECT
                t.TaskID AS taskId,
                t.TaskID AS TaskID,
                t.ProjectID AS projectId,
                t.ProjectID AS ProjectID,
                COALESCE(t.TaskName, t.Title, '') AS taskName,
                t.Description AS description,
                t.AssignedTo AS assignedTo,
                e.FullName AS assignedToName,
                t.StartDate AS startDate,
                t.DueDate AS dueDate,
                t.Status AS status,
                t.Priority AS priority,
                t.Progress AS progress,
                t.CreatedDate AS createdDate
            FROM ProjectTasks t
            LEFT JOIN Employees e ON t.AssignedTo = e.EmployeeID
            WHERE t.TaskID = @TaskID;
        `);

    return result.recordset[0];
}

async function deleteTask(taskId) {
    await new sql.Request()
        .input("TaskID", sql.Int, taskId)
        .query("DELETE FROM ProjectTasks WHERE TaskID = @TaskID");
    return true;
}

module.exports = {
    initTaskTable,
    addTask,
    getTasks,
    getTaskById,
    getTasksByProjectId,
    getTasksByEmployeeId,
    updateTask,
    assignTask,
    updateTaskStatus,
    deleteTask
};
