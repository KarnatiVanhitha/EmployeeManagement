const sql = require("mssql");
const { getDatabaseConfig, getConnectionPool } = require("../serverless/database");

// ─── Helpers ─────────────────────────────────────────────────────────────────

function extractDepartmentId(req) {
    if (req.query && (req.query.departmentId || req.query.department || req.query.id)) {
        const raw = req.query.departmentId || req.query.department || req.query.id;
        const parsed = parseInt(raw, 10);
        if (!isNaN(parsed)) return parsed;
    }

    if (req.url) {
        const match = req.url.match(/\/department\/(\d+)/i);
        if (match && match[1]) {
            const parsed = parseInt(match[1], 10);
            if (!isNaN(parsed)) return parsed;
        }
    }

    return null;
}

// ─── Departments ─────────────────────────────────────────────────────────────

async function handleDepartments(req, res, pool) {
    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        return res.status(405).json({ success: false, message: "Method not allowed" });
    }

    if (req.query?.aggregate === "roles") {
        const [departmentResult, roleResult] = await Promise.all([
            pool.request().query(`SELECT DepartmentID, DepartmentName FROM Departments`),
            pool.request().query(`SELECT RoleID, RoleName, DepartmentID FROM Roles ORDER BY RoleName ASC`)
        ]);

        return res.status(200).json({
            departments: departmentResult.recordset,
            roles: roleResult.recordset
        });
    }

    const result = await pool.request().query(`SELECT DepartmentID, DepartmentName FROM Departments`);
    return res.status(200).json(result.recordset);
}

// ─── Roles ───────────────────────────────────────────────────────────────────

async function handleRoles(req, res, pool) {
    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        return res.status(405).json({ success: false, message: "Method not allowed" });
    }

    const departmentId = extractDepartmentId(req);

    if (departmentId !== null) {
        try {
            const request = pool.request();
            request.input("DepartmentID", sql.Int, departmentId);
            const result = await request.query(`
                SELECT RoleID, RoleName, DepartmentID
                FROM Roles
                WHERE DepartmentID = @DepartmentID
                ORDER BY RoleName ASC
            `);
            return res.status(200).json(result.recordset);
        } catch (filterError) {
            console.warn("Filtering roles by DepartmentID failed, falling back to all roles:", filterError.message);
            const fallbackResult = await pool.request().query(`
                SELECT RoleID, RoleName FROM Roles ORDER BY RoleName ASC
            `);
            return res.status(200).json(fallbackResult.recordset);
        }
    }

    const result = await pool.request().query(`
        SELECT RoleID, RoleName, DepartmentID FROM Roles ORDER BY RoleName ASC
    `);
    return res.status(200).json(result.recordset);
}

// ─── Managers ────────────────────────────────────────────────────────────────

async function handleManagers(req, res, pool) {
    const manager = req.body || {};
    const managerId = Number(req.query?.id || manager.ManagerID);

    if (req.method === "POST") {
        await pool.request()
            .input("ManagerID", sql.Int, managerId)
            .input("ManagerName", sql.NVarChar(100), manager.ManagerName)
            .input("Email", sql.NVarChar(100), manager.Email)
            .input("TeamName", sql.NVarChar(100), manager.TeamName)
            .input("Members", sql.Int, Number(manager.Members) || 0)
            .input("Projects", sql.Int, Number(manager.Projects) || 0)
            .input("IsActive", sql.Bit, 1)
            .query(`
                INSERT INTO TeamManagers
                (ManagerID, ManagerName, Email, TeamName, Members, Projects, IsActive)
                VALUES
                (@ManagerID, @ManagerName, @Email, @TeamName, @Members, @Projects, @IsActive)
            `);
        return res.status(201).json({ message: "Manager added successfully." });
    }

    if (req.method === "PUT") {
        const result = await pool.request()
            .input("ManagerID", sql.Int, managerId)
            .input("ManagerName", sql.NVarChar(100), manager.ManagerName)
            .input("Email", sql.NVarChar(100), manager.Email)
            .input("TeamName", sql.NVarChar(100), manager.TeamName)
            .query(`
                UPDATE Employees
                SET FullName = @ManagerName,
                    Email = @Email,
                    DepartmentID = COALESCE(
                        (SELECT TOP 1 DepartmentID FROM Departments WHERE DepartmentName = @TeamName),
                        DepartmentID
                    )
                WHERE EmployeeID = @ManagerID
            `);
        if (!result.rowsAffected[0]) {
            return res.status(404).json({ message: "Manager employee not found" });
        }
        return res.status(200).json({ message: "Manager profile updated successfully." });
    }

    const result = await pool.request().query(`
        SELECT
            e.EmployeeID AS ManagerID,
            e.EmployeeID AS managerId,
            e.EmployeeID AS EmployeeID,
            e.FullName AS ManagerName,
            e.FullName AS managerName,
            e.FullName AS FullName,
            e.Email,
            e.Email AS email,
            e.EmployeePhoto,
            e.EmployeePhoto AS employeePhoto,
            e.DepartmentID,
            e.DepartmentID AS departmentId,
            d.DepartmentID,
            COALESCE(d.DepartmentName, '') AS TeamName,
            COALESCE(d.DepartmentName, '') AS teamName,
            COALESCE(d.DepartmentName, '') AS DepartmentName,
            r.RoleName,
            r.RoleName AS roleName,
            0 AS Members,
            0 AS Projects,
            1 AS IsActive
        FROM Employees e
        INNER JOIN Roles r ON e.RoleID = r.RoleID
        LEFT JOIN Departments d ON e.DepartmentID = d.DepartmentID
        WHERE e.IsActive = 1
            AND (COALESCE(r.IsManager, 0) = 1 OR LOWER(r.RoleName) LIKE '%manager%')
            AND LOWER(r.RoleName) NOT LIKE '%lead%'
            AND (r.DepartmentID IS NULL OR r.DepartmentID = e.DepartmentID)
        ORDER BY d.DepartmentName, e.FullName
    `);
    return res.status(200).json(result.recordset);
}

// ─── Router ──────────────────────────────────────────────────────────────────

module.exports = async function departmentsHandler(req, res) {
    if (req.query?.resource === "managers") {
        if (req.method !== "GET" && req.method !== "POST" && req.method !== "PUT") {
            res.setHeader("Allow", "GET, POST, PUT");
            return res.status(405).json({ success: false, message: "Method not allowed" });
        }

        const manager = req.body || {};
        const managerId = Number(req.query?.id || manager.ManagerID);
        if (req.method === "POST" &&
            (!Number.isInteger(managerId) || managerId < 1 || !manager.ManagerName || !manager.Email || !manager.TeamName)) {
            return res.status(400).json({ message: "Manager ID, name, email, and team are required" });
        }
        if (req.method === "PUT" &&
            (!Number.isInteger(managerId) || managerId < 1 || !manager.ManagerName || !manager.Email || !manager.TeamName)) {
            return res.status(400).json({ message: "Manager ID, name, email, and department are required" });
        }
    }

    const config = getDatabaseConfig();
    if (!config) {
        return res.status(503).json({ success: false, message: "Database is not configured" });
    }

    try {
        const pool = await getConnectionPool(config);

        // Route: /api/managers (rewritten to /api/departments?resource=managers)
        if (req.query.resource === "managers") {
            return await handleManagers(req, res, pool);
        }

        // Route: /api/departments?resource=roles  OR  /api/roles (rewritten)
        if (req.query.resource === "roles" || req.query._route === "roles") {
            return await handleRoles(req, res, pool);
        }

        return await handleDepartments(req, res, pool);
    } catch (error) {
        console.error("Departments API failed:", error);
        return res.status(500).json({ success: false, message: "Unable to load data" });
    }
};