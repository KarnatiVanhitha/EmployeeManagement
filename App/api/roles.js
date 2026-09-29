const sql = require("mssql");

let poolPromise;

function getDatabaseConfig() {
    const { DB_SERVER, DB_DATABASE, DB_USER, DB_PASSWORD } = process.env;
    if (!DB_SERVER || !DB_DATABASE || !DB_USER || !DB_PASSWORD) {
        return null;
    }

    return {
        server: DB_SERVER,
        database: DB_DATABASE,
        user: DB_USER,
        password: DB_PASSWORD,
        port: Number(process.env.DB_PORT || 1433),
        options: {
            encrypt: true,
            trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === "true"
        },
        connectionTimeout: 15000,
        requestTimeout: 15000,
        pool: {
            max: 3,
            min: 0,
            idleTimeoutMillis: 30000
        }
    };
}

function getConnectionPool(config) {
    if (!poolPromise) {
        poolPromise = new sql.ConnectionPool(config).connect().catch((error) => {
            poolPromise = undefined;
            throw error;
        });
    }

    return poolPromise;
}

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

module.exports = async function rolesHandler(req, res) {
    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        return res.status(405).json({ success: false, message: "Method not allowed" });
    }

    const config = getDatabaseConfig();
    if (!config) {
        return res.status(503).json({
            success: false,
            message: "Database is not configured"
        });
    }

    try {
        const pool = await getConnectionPool(config);
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
                    SELECT RoleID, RoleName
                    FROM Roles
                    ORDER BY RoleName ASC
                `);
                return res.status(200).json(fallbackResult.recordset);
            }
        }

        const result = await pool.request().query(`
            SELECT RoleID, RoleName, DepartmentID
            FROM Roles
            ORDER BY RoleName ASC
        `);

        return res.status(200).json(result.recordset);
    } catch (error) {
        console.error("Roles API failed:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to load roles"
        });
    }
};
