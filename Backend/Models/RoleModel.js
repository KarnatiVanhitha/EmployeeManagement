const { sql } = require("../config/db");

async function getRoles() {
const result = await sql.query(`
    SELECT RoleID, RoleName
    FROM Roles
`);
    return result.recordset;
}
async function getRolesByDepartment(departmentId) {
    try {
        // Query to get roles filtered by DepartmentID
        const result = await new sql.Request()
            .input("DepartmentID", sql.Int, departmentId)
            .query(`
                SELECT RoleID, RoleName, DepartmentID
                FROM Roles
                WHERE DepartmentID = @DepartmentID
                ORDER BY RoleName ASC
            `);

        // If no roles found for this department, return empty array
        if (result.recordset.length === 0) {
            return [];
        }

        return result.recordset;
    } catch (err) {
        console.error("Error in getRolesByDepartment:", err);
        // If error occurs (e.g., column doesn't exist), return all roles as fallback
        return getRoles();
    }
}
async function getRoleById(roleId) {

    const result = await new sql.Request()

        .input("RoleID", sql.Int, roleId)

        .query(`

        SELECT

            RoleID,

            RoleName,

            IsManager

        FROM Roles

        WHERE RoleID=@RoleID

        `);

    return result.recordset[0];

}


async function initRoleTable() {
    try {
        await sql.query(`
            UPDATE Roles
            SET IsManager = 0
            WHERE LOWER(RoleName) LIKE '%lead%' OR LOWER(RoleName) LIKE '%team lead%';
        `);
    } catch (err) {
        console.error("Error updating Roles table:", err.message);
    }
}

module.exports = {
    initRoleTable,
    getRoles,
    getRolesByDepartment,
    getRoleById
};