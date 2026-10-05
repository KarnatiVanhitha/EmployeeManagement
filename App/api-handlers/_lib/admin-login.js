const sql = require("mssql");
const { getDatabaseConfig, getConnectionPool } = require("../../serverless/database");

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

    const { Email: submittedEmail, Password } = req.body || {};
    const Email = String(submittedEmail || "").trim();
    if (!Email || !Password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    const config = getDatabaseConfig();
    if (!config) {
        return res.status(503).json({ success: false, message: "Database is not configured" });
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