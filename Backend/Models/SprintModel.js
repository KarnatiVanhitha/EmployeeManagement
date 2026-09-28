const { sql } = require('../config/db');

async function initSprintTable() {
    try {
        await sql.query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Sprints' AND xtype='U')
            BEGIN
                CREATE TABLE Sprints (
                    SprintID INT IDENTITY(1,1) PRIMARY KEY,
                    ProjectID INT NOT NULL,
                    UseCaseID INT NULL,
                    SprintName NVARCHAR(200) NOT NULL,
                    SprintGoal NVARCHAR(MAX),
                    StartDate DATE,
                    EndDate DATE,
                    Status NVARCHAR(30) DEFAULT 'Planned',
                    CreatedBy INT,
                    CreatedAt DATETIME DEFAULT GETDATE()
                );
            END
            ELSE
            BEGIN
                IF COL_LENGTH('Sprints', 'UseCaseID') IS NULL
                    ALTER TABLE Sprints ADD UseCaseID INT NULL;
            END
        `);
    } catch (err) {
        console.error("Error creating/updating Sprints table:", err);
    }
}

const SprintModel = {

    initSprintTable,

    async createSprint(data) {

        const request = new sql.Request();

        const result = await request

            .input(
                'ProjectID',
                sql.Int,
                data.ProjectID
            )

            .input(
                'UseCaseID',
                sql.Int,
                data.UseCaseID || null
            )

            .input(
                'SprintName',
                sql.NVarChar(200),
                data.SprintName
            )

            .input(
                'SprintGoal',
                sql.NVarChar(sql.MAX),
                data.SprintGoal || null
            )

            .input(
                'StartDate',
                sql.Date,
                data.StartDate
            )

            .input(
                'EndDate',
                sql.Date,
                data.EndDate
            )

            .input(
                'Status',
                sql.NVarChar(30),
                data.Status || 'Planned'
            )

            .input(
                'CreatedBy',
                sql.Int,
                data.CreatedBy || null
            )

            .query(`
                INSERT INTO Sprints
                (
                    ProjectID,
                    UseCaseID,
                    SprintName,
                    SprintGoal,
                    StartDate,
                    EndDate,
                    Status,
                    CreatedBy
                )
                OUTPUT INSERTED.*
                VALUES
                (
                    @ProjectID,
                    @UseCaseID,
                    @SprintName,
                    @SprintGoal,
                    @StartDate,
                    @EndDate,
                    @Status,
                    @CreatedBy
                )
            `);

        return result.recordset[0];
    },


   async getSprintsByProject(projectID) {
    try {
        const request = new sql.Request();

        const queryText = `
            SELECT 
                SprintID,
                ProjectID,
                SprintName,
                SprintGoal,
                StartDate,
                EndDate,
                Status,
                CreatedBy,
                CreatedAt
            FROM [dbo].[Sprints]
            WHERE ProjectID = @ProjectID
            ORDER BY StartDate DESC
        `;

        const result = await request
            .input('ProjectID', sql.Int, projectID)
            .query(queryText);

        return result.recordset;
    } catch (error) {
        console.error("Database Query Error in getSprintsByProject:", error.message);
        throw error;
    }
}

};

module.exports = SprintModel;