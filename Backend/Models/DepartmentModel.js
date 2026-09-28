const { sql } = require("../config/db");

const getDepartments = async () => {

    const result = await sql.query(`
        SELECT
            DepartmentID,
            DepartmentName
        FROM Departments
    `);

    return result.recordset;
};

module.exports = {
    getDepartments
};