const { sql } = require("../config/db");

async function initCalendarTables() {
    try {
        await sql.query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Meetings' AND xtype='U')
            CREATE TABLE Meetings (
                MeetingID INT IDENTITY(1,1) PRIMARY KEY,
                Title NVARCHAR(250) NOT NULL,
                Type NVARCHAR(100),
                Date DATE NOT NULL,
                Time NVARCHAR(50),
                Organizer NVARCHAR(150),
                Location NVARCHAR(250),
                Description NVARCHAR(MAX)
            );

            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Holidays' AND xtype='U')
            CREATE TABLE Holidays (
                HolidayID INT IDENTITY(1,1) PRIMARY KEY,
                Title NVARCHAR(250) NOT NULL,
                Date DATE NOT NULL,
                Description NVARCHAR(MAX)
            );
        `);
    } catch (err) {
        console.error("Error creating Calendar tables:", err);
    }
}

async function getMeetings() {
    const result = await sql.query`SELECT MeetingID AS id, Title AS title, Type AS type, Date AS date, Time AS time, Organizer AS organizer, Location AS location, Description AS description FROM Meetings`;
    return result.recordset;
}

async function addMeeting(meeting) {
    const result = await new sql.Request()
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
    return result.recordset[0];
}

async function updateMeeting(id, meeting) {
    await new sql.Request()
        .input("MeetingID", sql.Int, id)
        .input("Title", sql.NVarChar(250), meeting.title)
        .input("Type", sql.NVarChar(100), meeting.type)
        .input("Date", sql.Date, meeting.date)
        .input("Time", sql.NVarChar(50), meeting.time)
        .input("Organizer", sql.NVarChar(150), meeting.organizer)
        .input("Location", sql.NVarChar(250), meeting.location)
        .input("Description", sql.NVarChar(sql.MAX), meeting.description)
        .query(`
            UPDATE Meetings SET
                Title = @Title,
                Type = @Type,
                Date = @Date,
                Time = @Time,
                Organizer = @Organizer,
                Location = @Location,
                Description = @Description
            WHERE MeetingID = @MeetingID
        `);
    return { id, ...meeting };
}

async function deleteMeeting(id) {
    await new sql.Request()
        .input("MeetingID", sql.Int, id)
        .query(`DELETE FROM Meetings WHERE MeetingID = @MeetingID`);
}

async function getHolidays() {
    const result = await sql.query`SELECT HolidayID AS id, Title AS title, Date AS date, Description AS description FROM Holidays`;
    return result.recordset;
}

async function addHoliday(holiday) {
    const result = await new sql.Request()
        .input("Title", sql.NVarChar(250), holiday.title)
        .input("Date", sql.Date, holiday.date)
        .input("Description", sql.NVarChar(sql.MAX), holiday.description)
        .query(`
            INSERT INTO Holidays (Title, Date, Description)
            OUTPUT INSERTED.HolidayID AS id
            VALUES (@Title, @Date, @Description)
        `);
    return result.recordset[0];
}

async function updateHoliday(id, holiday) {
    await new sql.Request()
        .input("HolidayID", sql.Int, id)
        .input("Title", sql.NVarChar(250), holiday.title)
        .input("Date", sql.Date, holiday.date)
        .input("Description", sql.NVarChar(sql.MAX), holiday.description)
        .query(`
            UPDATE Holidays SET
                Title = @Title,
                Date = @Date,
                Description = @Description
            WHERE HolidayID = @HolidayID
        `);
    return { id, ...holiday };
}

async function deleteHoliday(id) {
    await new sql.Request()
        .input("HolidayID", sql.Int, id)
        .query(`DELETE FROM Holidays WHERE HolidayID = @HolidayID`);
}

module.exports = {
    initCalendarTables,
    getMeetings,
    addMeeting,
    updateMeeting,
    deleteMeeting,
    getHolidays,
    addHoliday,
    updateHoliday,
    deleteHoliday
};
