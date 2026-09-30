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

module.exports = async function departmentsHandler(req, res) {
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
        const result = await pool.request().query(`
            SELECT DepartmentID, DepartmentName
            FROM Departments
        `);

        return res.status(200).json(result.recordset);
    } catch (error) {
        console.error("Departments API failed:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to load departments"
        });
    }
};