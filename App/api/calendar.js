const sql = require("mssql");
const { getDatabaseConfig, getConnectionPool } = require("../serverless/database");

// ─── Holidays ────────────────────────────────────────────────────────────────

async function handleHolidays(req, res, pool) {
    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        return res.status(405).json({ success: false, message: "Method not allowed" });
    }

    const result = await pool.request().query(`
        SELECT HolidayID AS id, Title AS title, Date AS date, Description AS description
        FROM Holidays
    `);
    return res.status(200).json(result.recordset);
}

// ─── Meetings ────────────────────────────────────────────────────────────────

async function handleMeetings(req, res, pool) {
    if (req.method !== "GET" && req.method !== "POST") {
        res.setHeader("Allow", "GET, POST");
        return res.status(405).json({ success: false, message: "Method not allowed" });
    }

    if (req.method === "POST") {
        const meeting = req.body || {};
        const result = await pool.request()
            .input("Title", sql.NVarChar(250), meeting.title)
            .input("Type", sql.NVarChar(100), meeting.type)
            .input("Date", sql.Date, meeting.date)
            .input("Time", sql.NVarChar(50), meeting.time)
            .input("Organizer", sql.NVarChar(150), meeting.organizer)
            .input("Location", sql.NVarChar(250), meeting.location)
            .input("Description", sql.NVarChar(sql.MAX), meeting.description)
            .query(`
                INSERT INTO Meetings (Title, Type, Date, Time, Organizer, Location, Description)
                OUTPUT INSERTED.MeetingID AS id
                VALUES (@Title, @Type, @Date, @Time, @Organizer, @Location, @Description)
            `);

        return res.status(200).json({
            message: "Meeting Added Successfully",
            ...result.recordset[0]
        });
    }

    const result = await pool.request().query(`
        SELECT MeetingID AS id, Title AS title, Type AS type, Date AS date,
            Time AS time, Organizer AS organizer, Location AS location,
            Description AS description
        FROM Meetings
    `);
    return res.status(200).json(result.recordset);
}

// ─── Router ──────────────────────────────────────────────────────────────────

module.exports = async function calendarHandler(req, res) {
    const config = getDatabaseConfig();
    if (!config) {
        return res.status(503).json({ success: false, message: "Database is not configured" });
    }

    try {
        const pool = await getConnectionPool(config);
        const resource = req.query.resource;

        if (resource === "holidays") {
            return await handleHolidays(req, res, pool);
        }
        if (resource === "meetings") {
            return await handleMeetings(req, res, pool);
        }

        return res.status(400).json({ success: false, message: "Missing ?resource= (holidays | meetings)" });
    } catch (error) {
        console.error("Calendar API failed:", error);
        return res.status(500).json({ error: error.message });
    }
};
