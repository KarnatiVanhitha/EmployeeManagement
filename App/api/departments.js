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

// ─── Router ──────────────────────────────────────────────────────────────────

module.exports = async function departmentsHandler(req, res) {
    const config = getDatabaseConfig();
    if (!config) {
        return res.status(503).json({ success: false, message: "Database is not configured" });
    }

    try {
        const pool = await getConnectionPool(config);

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