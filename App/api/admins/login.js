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

function withoutPassword(user) {
    if (!user) return user;
    const { Password, ...safeUser } = user;
    return safeUser;
}

module.exports = async function adminLoginHandler(req, res) {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return res.status(405).json({ success: false, message: "Method not allowed" });
    }

    const { Email, Password } = req.body || {};
    if (!Email || !Password) {
        return res.status(400).json({ message: "Email and password are required" });
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
        const superAdminResult = await pool.request()
            .input("Email", sql.NVarChar(100), Email)
            .input("Password", sql.NVarChar(255), Password)
            .query(`
                SELECT *
                FROM SuperAdmins
                WHERE Email = @Email
                    AND Password = @Password
                    AND IsActive = 1
            `);

        const superAdmin = superAdminResult.recordset[0];
        if (superAdmin) {
            return res.status(200).json({
                message: "Super Admin Login Successful",
                role: "SuperAdmin",
                user: withoutPassword(superAdmin)
            });
        }

        const adminResult = await pool.request()
            .input("Email", sql.NVarChar(100), Email)
            .input("Password", sql.NVarChar(255), Password)
            .query(`
                SELECT *
                FROM Admins
                WHERE Email = @Email
                    AND Password = @Password
                    AND IsActive = 1
            `);

        const admin = adminResult.recordset[0];
        if (!admin) {
            return res.status(401).json({ message: "Invalid Email or Password" });
        }

        if (String(admin.AdminType || "").toLowerCase() === "school") {
            return res.status(403).json({ message: "School access is temporarily disabled" });
        }

        return res.status(200).json({
            message: "Admin Login Successful",
            role: admin.AdminType,
            user: withoutPassword(admin)
        });
    } catch (error) {
        console.error("Admin login API failed:", error);
        return res.status(500).json({ message: error.message });
    }
};