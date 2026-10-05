const sql = require("mssql");
const { getDatabaseConfig, getConnectionPool } = require("../../serverless/database");

module.exports = async function passwordRecoveryHandler(req, res, accountType) {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return res.status(405).json({ success: false, message: "Method not allowed" });
    }

    const operation = req.query?.route;
    if (operation !== "verify-email" && operation !== "reset-password") {
        return res.status(404).json({ message: "Password recovery method not found" });
    }

    const { Email, NewPassword } = req.body || {};
    if (!Email) {
        return res.status(400).json({ message: "Email is required" });
    }
    if (operation === "reset-password" && !NewPassword) {
        return res.status(400).json({ message: "New password is required" });
    }

    const config = getDatabaseConfig();
    if (!config) {
        return res.status(503).json({ success: false, message: "Database is not configured" });
    }

    try {
        const pool = await getConnectionPool(config);
        const accounts = accountType === "admin"
            ? [
                { table: "SuperAdmins", userType: "SuperAdmin", resetMessage: "Super Admin password reset successfully." },
                { table: "Admins", userType: "Admin", resetMessage: "Admin password reset successfully." }
            ]
            : [
                { table: "Employees", userType: undefined, resetMessage: "Password reset successfully." }
            ];
        let inactiveAccountFound = false;

        for (const account of accounts) {
            const accountResult = await pool.request()
                .input("Email", sql.NVarChar(100), Email)
                .query(`SELECT Email, IsActive FROM ${account.table} WHERE Email = @Email`);

            const matchingAccount = accountResult.recordset[0];
            if (!matchingAccount) {
                continue;
            }

            if (!matchingAccount.IsActive) {
                inactiveAccountFound = true;
                continue;
            }

            if (operation === "verify-email") {
                const response = { message: "Email verified successfully." };
                if (account.userType) {
                    response.userType = account.userType;
                }
                return res.status(200).json(response);
            }

            const updateResult = await pool.request()
                .input("Email", sql.NVarChar(100), Email)
                .input("NewPassword", sql.NVarChar(255), NewPassword)
                .query(`
                    UPDATE ${account.table}
                    SET Password = @NewPassword
                    WHERE Email = @Email AND IsActive = 1
                `);

            if (!updateResult.rowsAffected[0]) {
                return res.status(403).json({
                    message: "This account is inactive and cannot sign in. Contact your administrator."
                });
            }

            return res.status(200).json({ message: account.resetMessage });
        }

        if (inactiveAccountFound) {
            return res.status(403).json({
                message: "This account is inactive and cannot sign in. Contact your administrator."
            });
        }

        return res.status(404).json({ message: "Email not found." });
    } catch (error) {
        console.error("Password recovery API failed:", error);
        return res.status(500).json({ message: error.message });
    }
};
