const { getDatabaseConfig, getConnectionPool } = require("../../serverless/database");

module.exports = async function holidaysHandler(req, res) {
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
            SELECT HolidayID AS id, Title AS title, Date AS date, Description AS description
            FROM Holidays
        `);
        return res.status(200).json(result.recordset);
    } catch (error) {
        console.error("Holidays API failed:", error);
        return res.status(500).json({ error: error.message });
    }
};