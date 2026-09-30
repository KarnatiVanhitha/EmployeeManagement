const { getDatabaseConfig, getConnectionPool } = require("../serverless/database");

module.exports = async function adminsHandler(req, res) {
    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        return res.status(405).json({ success: false, message: "Method not allowed" });
    }

    const config = getDatabaseConfig();
    if (!config) {
        return res.status(503).json({ success: false, message: "Database is not configured" });
    }

    try {
        const pool = await getConnectionPool(config);
        const result = await pool.request().query(`
            SELECT AdminID, FullName, Email, MobileNumber, AdminType, IsActive
            FROM Admins
            ORDER BY AdminID DESC
        `);
        return res.status(200).json(result.recordset);
    } catch (error) {
        console.error("Admins API failed:", error);
        return res.status(500).json({ message: error.message });
    }
};