const sql = require("mssql");

const config = {
    user: "desideaAdmin",
    password: "De$ide@2019",
    server: "desidea.database.windows.net",
    database: "SCLANDEMP",
    options: {
        trustServerCertificate: true
    }
};

async function connectDB() {
    try {
        await sql.connect(config);
        console.log("Database Connected");
    } catch (err) {
        console.log(err);
    }
}

module.exports = { sql, connectDB };