const sql = require("mssql");
const { getDatabaseConfig, getConnectionPool } = require("../serverless/database");

module.exports = async function leavesHandler(req, res) {
    if (req.method === "OPTIONS") {
        res.setHeader("Allow", "GET, POST, OPTIONS");
        res.setHeader("Access-Control-Allow-Origin", req.headers?.origin || "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", req.headers?.["access-control-request-headers"] || "Content-Type");
        return res.status(204).end();
    }

    if (req.method !== "GET" && req.method !== "POST") {
        res.setHeader("Allow", "GET, POST, OPTIONS");
        return res.status(405).json({ success: false, message: "Method not allowed" });
    }

    const config = getDatabaseConfig();
    if (!config) {
        return res.status(503).json({ success: false, message: "Database is not configured" });
    }

    try {
        const pool = await getConnectionPool(config);
        if (req.method === "POST") {
            const leave = req.body || {};
            const result = await pool.request()
                .input("EmployeeID", sql.Int, leave.EmployeeID)
                .input("ApplicantName", sql.NVarChar(100), leave.ApplicantName)
                .input("ApplicantRole", sql.NVarChar(50), leave.ApplicantRole)
                .input("LeaveType", sql.NVarChar(50), leave.LeaveType)
                .input("StartDate", sql.Date, leave.StartDate)
                .input("EndDate", sql.Date, leave.EndDate)
                .input("ContactNumber", sql.NVarChar(20), leave.ContactNumber)
                .input("Reason", sql.NVarChar(sql.MAX), leave.Reason)
                .input("Status", sql.NVarChar(20), leave.Status || "Pending")
                .input("AppliedDate", sql.DateTime, leave.AppliedDate || new Date())
                .query(`
                    INSERT INTO Leaves
                    (
                        EmployeeID,
                        ApplicantName,
                        ApplicantRole,
                        LeaveType,
                        StartDate,
                        EndDate,
                        ContactNumber,
                        Reason,
                        Status,
                        AppliedDate
                    )
                    OUTPUT INSERTED.*
                    VALUES
                    (
                        @EmployeeID,
                        @ApplicantName,
                        @ApplicantRole,
                        @LeaveType,
                        @StartDate,
                        @EndDate,
                        @ContactNumber,
                        @Reason,
                        @Status,
                        @AppliedDate
                    )
                `);

            return res.status(201).json({
                message: "Leave Applied Successfully",
                leave: result.recordset[0]
            });
        }

        const view = req.query?.view;
        const request = pool.request();
        let whereClause = "";

        if (view === "employee") {
            const employeeId = Number(req.query?.id);
            if (!Number.isInteger(employeeId) || employeeId < 1) {
                return res.status(400).json({ message: "A valid employee ID is required" });
            }
            request.input("EmployeeID", sql.Int, employeeId);
            whereClause = "WHERE l.EmployeeID = @EmployeeID";
        } else if (view === "employee-leaves") {
            whereClause = "WHERE LOWER(l.ApplicantRole) NOT IN ('superadmin', 'school', 'office', 'admin', 'hr')";
        }

        const result = await request.query(`
            SELECT
                l.LeaveID AS leaveId,
                l.LeaveID AS LeaveID,
                l.EmployeeID AS employeeId,
                l.EmployeeID AS EmployeeID,
                COALESCE(l.ApplicantName, e.FullName, '') AS applicantName,
                COALESCE(l.ApplicantName, e.FullName, '') AS ApplicantName,
                COALESCE(l.ApplicantName, e.FullName, '') AS FullName,
                COALESCE(l.ApplicantName, e.FullName, '') AS name,
                COALESCE(l.ApplicantRole, r.RoleName, '') AS applicantRole,
                COALESCE(l.ApplicantRole, r.RoleName, '') AS ApplicantRole,
                COALESCE(d.DepartmentName, '') AS DepartmentName,
                COALESCE(d.DepartmentName, '') AS departmentName,
                e.DepartmentID AS DepartmentID,
                e.DepartmentID AS departmentId,
                e.EmployeePhoto AS employeePhoto,
                e.EmployeePhoto AS EmployeePhoto,
                e.EmployeePhoto AS image,
                l.LeaveType AS type,
                l.LeaveType AS LeaveType,
                l.LeaveType AS leaveType,
                l.StartDate AS startDate,
                l.StartDate AS StartDate,
                l.EndDate AS endDate,
                l.EndDate AS EndDate,
                l.ContactNumber AS contactNumber,
                l.Reason AS reason,
                l.Status AS status,
                l.Status AS Status,
                l.AppliedDate AS appliedDate,
                l.ActionDate AS actionDate
            FROM Leaves l
            LEFT JOIN Employees e ON l.EmployeeID = e.EmployeeID
            LEFT JOIN Roles r ON e.RoleID = r.RoleID
            LEFT JOIN Departments d ON e.DepartmentID = d.DepartmentID
            ${whereClause}
            ORDER BY l.LeaveID DESC
        `);
        return res.status(200).json(result.recordset);
    } catch (error) {
        console.error("Leaves API failed:", error);
        return res.status(500).json({ message: error.message });
    }
};