const { sql } = require("../config/db");

const login = async (Email, Password) => {

    try {

        const result = await new sql.Request()
            .input("Email", sql.NVarChar, Email)
            .input("Password", sql.NVarChar, Password)
            .query(`
                SELECT *
                FROM SuperAdmins
                WHERE Email = @Email
                AND Password = @Password
                AND IsActive = 1
            `);

        return result.recordset[0];

    } catch (err) {

        throw err;

    }

};
const getByEmail = async (Email) => {

    const result = await new sql.Request()

        .input("Email", sql.NVarChar(100), Email)

        .query(`
            SELECT *
            FROM SuperAdmins
            WHERE Email = @Email
        `);

    return result.recordset[0];

};
const updatePassword = async (Email, NewPassword) => {

    await new sql.Request()

        .input("Email", sql.NVarChar(100), Email)

        .input("Password", sql.NVarChar(255), NewPassword)

        .query(`
            UPDATE SuperAdmins
            SET Password = @Password
            WHERE Email = @Email
        `);

};

module.exports = {
    login,
    getByEmail,
    updatePassword
};