const sql = require("mssql");
const { getDatabaseConfig, getConnectionPool } = require("../serverless/database");

// ─── Holidays ────────────────────────────────────────────────────────────────

async function handleHolidays(req, res, pool) {
    if (!["GET", "POST", "PUT", "DELETE"].includes(req.method)) {
        res.setHeader("Allow", "GET, POST, PUT, DELETE");
        return res.status(405).json({ success: false, message: "Method not allowed" });
    }

    if (req.method === "GET") {
        const result = await pool.request().query(`
            SELECT HolidayID AS id, Title AS title, Date AS date, Description AS description
            FROM Holidays
        `);
        return res.status(200).json(result.recordset);
    }

    const holidayId = Number(req.query?.id);
    if (req.method === "DELETE") {
        if (!Number.isInteger(holidayId) || holidayId < 1) {
            return res.status(400).json({ message: "A valid holiday ID is required" });
        }

        const result = await pool.request()
            .input("HolidayID", sql.Int, holidayId)
            .query(`
                DELETE FROM Holidays
                OUTPUT DELETED.HolidayID AS id
                WHERE HolidayID = @HolidayID
            `);
        if (!result.recordset.length) {
            return res.status(404).json({ message: "Holiday not found" });
        }
        return res.status(200).json({ message: "Holiday Deleted Successfully" });
    }

    const holiday = req.body || {};
    const title = String(holiday.title || "").trim();
    const date = String(holiday.date || "");
    if (!title || !date) {
        return res.status(400).json({ message: "Holiday name and date are required" });
    }

    const request = pool.request()
        .input("Title", sql.NVarChar(250), title)
        .input("Date", sql.Date, date)
        .input("Description", sql.NVarChar(sql.MAX), holiday.description || null);

    if (req.method === "POST") {
        const result = await request.query(`
            INSERT INTO Holidays (Title, Date, Description)
            OUTPUT INSERTED.HolidayID AS id, INSERTED.Title AS title,
                INSERTED.Date AS date, INSERTED.Description AS description
            VALUES (@Title, @Date, @Description)
        `);
        return res.status(201).json({
            message: "Holiday Added Successfully",
            ...result.recordset[0]
        });
    }

    if (!Number.isInteger(holidayId) || holidayId < 1) {
        return res.status(400).json({ message: "A valid holiday ID is required" });
    }
    request.input("HolidayID", sql.Int, holidayId);

    if (req.method === "PUT") {
        const result = await request.query(`
            UPDATE Holidays
            SET Title = @Title, Date = @Date, Description = @Description
            OUTPUT INSERTED.HolidayID AS id, INSERTED.Title AS title,
                INSERTED.Date AS date, INSERTED.Description AS description
            WHERE HolidayID = @HolidayID
        `);
        if (!result.recordset.length) {
            return res.status(404).json({ message: "Holiday not found" });
        }
        return res.status(200).json({
            message: "Holiday Updated Successfully",
            ...result.recordset[0]
        });
    }

    return res.status(405).json({ success: false, message: "Method not allowed" });
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
    const resource = req.query?.resource;
    if (resource === "holidays" && !["GET", "POST", "PUT", "DELETE"].includes(req.method)) {
        res.setHeader("Allow", "GET, POST, PUT, DELETE");
        return res.status(405).json({ success: false, message: "Method not allowed" });
    }

    const config = getDatabaseConfig();
    if (!config) {
        return res.status(503).json({ success: false, message: "Database is not configured" });
    }

    try {
        const pool = await getConnectionPool(config);

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
