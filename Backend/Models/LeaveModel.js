const { sql } = require("../config/db");

async function addLeave(leave) {
    const result = await new sql.Request()
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

    return result.recordset[0];
}

async function getLeaves() {
    const result = await sql.query`
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
        ORDER BY l.LeaveID DESC
    `;

    return result.recordset;
}

async function getEmployeeLeaves() {
    const result = await sql.query`
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
        WHERE LOWER(l.ApplicantRole) NOT IN ('superadmin', 'school', 'office', 'admin', 'hr')
        ORDER BY l.LeaveID DESC
    `;

    return result.recordset;
}

async function getLeavesByEmployeeId(employeeId) {
    const result = await new sql.Request()
        .input("EmployeeID", sql.Int, employeeId)
        .query(`
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
            WHERE l.EmployeeID = @EmployeeID
            ORDER BY l.LeaveID DESC
        `);

    return result.recordset;
}

async function updateLeaveStatus(id, status) {
    const result = await new sql.Request()
        .input("LeaveID", sql.Int, id)
        .input("Status", sql.NVarChar(20), status)
        .query(`
            UPDATE Leaves
            SET Status = @Status,
                ActionDate = GETDATE()
            WHERE LeaveID = @LeaveID
        `);

    return result;
}

module.exports = {
    addLeave,
    getLeaves,
    getEmployeeLeaves,
    getLeavesByEmployeeId,
    updateLeaveStatus
};
