const { sql } = require("../config/db");

/* ===========================
   LOGIN
=========================== */

const login = async (Email, Password) => {

    const result = await new sql.Request()

        .input("Email", sql.NVarChar(100), Email)
        .input("Password", sql.NVarChar(255), Password)

        .query(`
            SELECT *
            FROM Admins
            WHERE Email = @Email
              AND Password = @Password
              AND IsActive = 1
        `);

    return result.recordset[0];
};
/* ===========================
   ADD ADMIN
=========================== */

const addAdmin = async (admin) => {

    const result = await new sql.Request()

        .input("FullName", sql.NVarChar(100), admin.FullName)
        .input("Email", sql.NVarChar(100), admin.Email)
        .input("MobileNumber", sql.NVarChar(20), admin.MobileNumber)
        .input("Password", sql.NVarChar(255), admin.Password)
        .input("AdminType", sql.NVarChar(20), admin.AdminType)
        .input("IsActive", sql.Bit, admin.IsActive ?? true)

        .query(`
            INSERT INTO Admins
            (
                FullName,
                Email,
                MobileNumber,
                Password,
                AdminType,
                IsActive
            )

            VALUES
            (
                @FullName,
                @Email,
                @MobileNumber,
                @Password,
                @AdminType,
                @IsActive
            )
        `);

    return result;
};


/* ===========================
   GET ALL ADMINS
=========================== */

const getAdmins = async () => {

    const result = await new sql.Request()

        .query(`
            SELECT
                AdminID,
                FullName,
                Email,
                MobileNumber,
                AdminType,
                IsActive
            FROM Admins
            ORDER BY AdminID DESC
        `);

    return result.recordset;

};


/* ===========================
   GET ADMIN BY ID
=========================== */

const getAdminById = async (id) => {

    const result = await new sql.Request()

        .input("AdminID", sql.Int, id)

        .query(`
            SELECT *
            FROM Admins
            WHERE AdminID = @AdminID
        `);

    return result.recordset[0];

};


/* ===========================
   UPDATE ADMIN
=========================== */

const updateAdmin = async (id, admin) => {

    const result = await new sql.Request()

        .input("AdminID", sql.Int, id)
        .input("FullName", sql.NVarChar(100), admin.FullName)
        .input("Email", sql.NVarChar(100), admin.Email)
        .input("MobileNumber", sql.NVarChar(20), admin.MobileNumber)
        .input("Password", sql.NVarChar(255), admin.Password)
        .input("AdminType", sql.NVarChar(20), admin.AdminType)
        .input("IsActive", sql.Bit, admin.IsActive)

        .query(`
            UPDATE Admins

            SET

                FullName = @FullName,

                Email = @Email,

                MobileNumber = @MobileNumber,

                Password = @Password,

                AdminType = @AdminType,

                IsActive = @IsActive

            WHERE AdminID = @AdminID
        `);

    return result;

};


/* ===========================
   DELETE ADMIN
=========================== */

const deleteAdmin = async (id) => {

    const result = await new sql.Request()

        .input("AdminID", sql.Int, id)

        .query(`
            DELETE FROM Admins
            WHERE AdminID = @AdminID
        `);

    return result;

};

/* ===========================
verify email
=========================== */
const getAdminByEmail = async (Email) => {

    const result = await new sql.Request()

        .input("Email", sql.NVarChar(100), Email)

        .query(`
            SELECT *
            FROM Admins
            WHERE Email=@Email
        `);

    return result.recordset[0];

};

/* ===========================
   RESET PASSWORD
=========================== */
const updatePassword = async (Email, Password) => {

    const result = await new sql.Request()

        .input("Email", sql.NVarChar(100), Email)
        .input("Password", sql.NVarChar(255), Password)

        .query(`
            UPDATE Admins
            SET Password = @Password
            WHERE Email = @Email
        `);

    return result;

};
/* ===========================
   EXPORTS
=========================== */

module.exports = {

    login,

    addAdmin,

    getAdmins,

    getAdminById,

    getAdminByEmail,

    updateAdmin,

    deleteAdmin,

    updatePassword

};