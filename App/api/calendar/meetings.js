const { getDatabaseConfig, getConnectionPool } = require("../../serverless/database");

module.exports = async function meetingsHandler(req, res) {
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
            SELECT MeetingID AS id, Title AS title, Type AS type, Date AS date,
                Time AS time, Organizer AS organizer, Location AS location,
                Description AS description
            FROM Meetings
        `);
        return res.status(200).json(result.recordset);
    } catch (error) {
        console.error("Meetings API failed:", error);
        return res.status(500).json({ error: error.message });
    }
};