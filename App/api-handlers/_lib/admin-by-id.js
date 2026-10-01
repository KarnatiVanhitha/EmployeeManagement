const sql = require("mssql");
const { getDatabaseConfig, getConnectionPool } = require("../../serverless/database");

module.exports = async function adminByIdHandler(req, res) {
    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        return res.status(405).json({ success: false, message: "Method not allowed" });
    }

    const adminId = Number(req.query?.id);
    if (!Number.isInteger(adminId) || adminId < 1) {
        return res.status(400).json({ message: "A valid admin ID is required" });
    }

    const config = getDatabaseConfig();
    if (!config) {
        return res.status(503).json({ success: false, message: "Database is not configured" });
    }

    try {
        const pool = await getConnectionPool(config);
        const result = await pool.request()
            .input("AdminID", sql.Int, adminId)
            .query(`
                SELECT AdminID, FullName, Email, MobileNumber, AdminType, IsActive
                FROM Admins
                WHERE AdminID = @AdminID
            `);

        if (!result.recordset[0]) {
            return res.status(404).json({ message: "Admin not found" });
        }

        return res.status(200).json(result.recordset[0]);
    } catch (error) {
        console.error("Admin lookup API failed:", error);
        return res.status(500).json({ message: error.message });
    }
};