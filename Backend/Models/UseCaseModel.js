const { sql } = require('../config/db');

async function initUseCaseTable() {
    try {
        await sql.query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='UseCases' AND xtype='U')
            CREATE TABLE UseCases (
                UseCaseID INT IDENTITY(1,1) PRIMARY KEY,
                ProjectID INT NOT NULL,
                Title NVARCHAR(200) NOT NULL,
                UseCaseType NVARCHAR(50) DEFAULT 'Epic',
                Description NVARCHAR(MAX),
                Priority NVARCHAR(20) DEFAULT 'Medium',
                Status NVARCHAR(30) DEFAULT 'Created',
                CreatedBy INT,
                CreatedAt DATETIME DEFAULT GETDATE()
            );
        `);

        await sql.query(`
            IF COL_LENGTH('UseCases', 'UseCaseType') IS NULL
                ALTER TABLE UseCases ADD UseCaseType NVARCHAR(50) NULL;
        `);
    } catch (err) {
        console.error("Error creating UseCases table:", err);
    }
}

const UseCaseModel = {

    initUseCaseTable,

    async createUseCase(data) {

        const request = new sql.Request();

        const result = await request
            .input('ProjectID', sql.Int, data.ProjectID)
            .input('Title', sql.NVarChar(200), data.Title)
            .input('UseCaseType', sql.NVarChar(50), data.UseCaseType || 'Epic')
            .input(
                'Description',
                sql.NVarChar(sql.MAX),
                data.Description || null
            )
            .input(
                'Priority',
                sql.NVarChar(20),
                data.Priority || 'Medium'
            )
            .input(
                'Status',
                sql.NVarChar(30),
                data.Status || 'Created'
            )
            .input(
                'CreatedBy',
                sql.Int,
                data.CreatedBy || null
            )
            .query(`
                INSERT INTO UseCases
                (
                    ProjectID,
                    Title,
                    UseCaseType,
                    Description,
                    Priority,
                    Status,
                    CreatedBy
                )
                OUTPUT INSERTED.*
                VALUES
                (
                    @ProjectID,
                    @Title,
                    @UseCaseType,
                    @Description,
                    @Priority,
                    @Status,
                    @CreatedBy
                )
            `);

        return result.recordset[0];
    },


    async getUseCasesByProject(projectID) {

        const request = new sql.Request();

        const result = await request
            .input('ProjectID', sql.Int, projectID)
            .query(`
                SELECT
                    U.UseCaseID,
                    U.ProjectID,
                    U.Title,
                    U.UseCaseType,
                    U.Description,
                    U.Priority,
                    U.Status,
                    U.CreatedBy,
                    U.CreatedAt
                FROM UseCases U
                WHERE U.ProjectID = @ProjectID
                ORDER BY U.CreatedAt DESC
            `);

        return result.recordset;
    }

};

module.exports = UseCaseModel;