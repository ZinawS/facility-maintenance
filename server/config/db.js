const mysql = require("mysql2/promise");
const env = require("./env");
const logger = require("./logger");

const pool = mysql.createPool({
  host: env.db.host,
  user: env.db.user,
  password: env.db.password,
  database: env.db.database,
  port: env.db.port,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
});

pool.on("connection", () => logger.debug("New MySQL connection established"));

async function checkConnection() {
  const connection = await pool.getConnection();
  try {
    await connection.query("SELECT 1");
    return true;
  } finally {
    connection.release();
  }
}

module.exports = { pool, checkConnection };
