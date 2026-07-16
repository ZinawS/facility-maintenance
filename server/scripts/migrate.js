/**
 * Applies db/schema.sql to the configured database. Safe to re-run against
 * an existing database (tables use CREATE TABLE IF NOT EXISTS); note the
 * content seed INSERTs are not upsert-safe, so only run this against a
 * fresh database or comment out the seed section for a database that
 * already has content.
 */
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
const env = require("../config/env");

async function migrate() {
  const connection = await mysql.createConnection({
    host: env.db.host,
    user: env.db.user,
    password: env.db.password,
    database: env.db.database,
    port: env.db.port,
    multipleStatements: true,
  });

  try {
    const sql = fs.readFileSync(path.join(__dirname, "..", "db", "schema.sql"), "utf8");
    await connection.query(sql);
    console.log("Schema applied successfully.");
  } finally {
    await connection.end();
  }
}

migrate().catch((err) => {
  console.error("Migration failed:", err.message);
  process.exit(1);
});
