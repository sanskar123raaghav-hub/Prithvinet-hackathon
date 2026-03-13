/**
 * Database Connection Pool
 * Connects to PostgreSQL using the pg library.
 * Exports a shared pool instance and a helper query function.
 * Gracefully handles missing database by flagging `db.connected`.
 */

const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

let connected = false;

async function init() {
  try {
    const client = await pool.connect();
    client.release();
    connected = true;
    console.log("[DB] PostgreSQL connected");
  } catch (err) {
    connected = false;
    console.warn("[DB] PostgreSQL unavailable — using in-memory fallback:", err.message);
  }
}

function query(text, params) {
  return pool.query(text, params);
}

function isConnected() {
  return connected;
}

module.exports = { pool, query, init, isConnected };
