const mysql = require('mysql2/promise');
require('dotenv').config();

const DB_HOST = process.env.DB_HOST;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME;
const DB_PORT = process.env.DB_PORT || 3306;

if (!DB_HOST || !DB_USER || !DB_PASSWORD || !DB_NAME) {
  console.error('Database environment variables (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME) must be set.');
  process.exit(1);
}

const columns = [
  { name: 'password_hash', ddl: "VARCHAR(255)" },
  { name: 'phone', ddl: "VARCHAR(50) DEFAULT NULL" },
  { name: 'clinic_id', ddl: "INT DEFAULT NULL" },
  { name: 'role', ddl: "VARCHAR(50) DEFAULT 'health_worker'" },
  { name: 'otp', ddl: "VARCHAR(10) DEFAULT NULL" },
  { name: 'otp_expiry', ddl: "DATETIME DEFAULT NULL" },
  { name: 'is_verified', ddl: "BOOLEAN DEFAULT FALSE" },
  { name: 'is_active', ddl: "BOOLEAN DEFAULT TRUE" },
  { name: 'failed_login_attempts', ddl: "INT DEFAULT 0" },
  { name: 'account_locked_until', ddl: "DATETIME DEFAULT NULL" },
  { name: 'last_login', ddl: "DATETIME DEFAULT NULL" }
];

async function ensureColumns() {
  let conn;
  try {
    conn = await mysql.createConnection({ host: DB_HOST, user: DB_USER, password: DB_PASSWORD, database: DB_NAME, port: DB_PORT });
    console.log('Connected to DB:', DB_HOST, DB_NAME);

    for (const col of columns) {
      const [rows] = await conn.execute(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'health_workers' AND COLUMN_NAME = ?`,
        [DB_NAME, col.name]
      );
      if (rows.length === 0) {
        const alter = `ALTER TABLE health_workers ADD COLUMN ${col.name} ${col.ddl}`;
        console.log('Adding column:', col.name, col.ddl);
        await conn.execute(alter);
        console.log('✅ Added', col.name);
      } else {
        console.log('Exists:', col.name);
      }
    }

    // Ensure clinic_id foreign key exists? skip adding FK to avoid errors on some hosts.

    console.log('Schema check complete.');
  } catch (err) {
    console.error('Schema fix error:', err);
    process.exitCode = 1;
  } finally {
    if (conn) await conn.end();
  }
}

ensureColumns();
