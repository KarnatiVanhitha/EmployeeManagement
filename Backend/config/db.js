const sql = require("mssql");

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    port: Number(process.env.DB_PORT || 1433),
    options: {
        encrypt: true,
        trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === "true"
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