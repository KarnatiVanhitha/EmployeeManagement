const sql = require("mssql");

let poolPromise;

function getDatabaseConfig() {
    const { DB_SERVER, DB_DATABASE, DB_USER, DB_PASSWORD } = process.env;
    if (!DB_SERVER || !DB_DATABASE || !DB_USER || !DB_PASSWORD) {
        return null;
    }

    return {
        server: DB_SERVER,
        database: DB_DATABASE,
        user: DB_USER,
        password: DB_PASSWORD,
        port: Number(process.env.DB_PORT || 1433),
        options: {
            encrypt: true,
            trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === "true"
        },
        connectionTimeout: 15000,
        requestTimeout: 15000,
        pool: {
            max: 3,
            min: 0,
            idleTimeoutMillis: 30000
        }
    };
}

function getConnectionPool(config) {
    if (!poolPromise) {
        poolPromise = new sql.ConnectionPool(config).connect().catch((error) => {
            poolPromise = undefined;
            throw error;
        });
    }

    return poolPromise;
}

module.exports = { sql, getDatabaseConfig, getConnectionPool };