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
    },
    connectionTimeout: 15000,
    requestTimeout: 15000
};

async function connectDB() {
    const { DB_SERVER, DB_DATABASE, DB_USER, DB_PASSWORD } = process.env;
    if (!DB_SERVER || !DB_DATABASE || !DB_USER || !DB_PASSWORD) {
        console.error("❌ Database configuration error: Missing DB_SERVER, DB_DATABASE, DB_USER, or DB_PASSWORD in Backend/.env");
        return false;
    }

    try {
        await sql.connect(config);
        console.log("✅ Database Connected");
        return true;
    } catch (err) {
        console.error("❌ Database connection failed:", err.message);
        return false;
    }
}

module.exports = { sql, config, connectDB };