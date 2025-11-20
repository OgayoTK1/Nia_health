const mysql = require('mysql2/promise');

const DB_HOST = process.env.DB_HOST;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME;
const DB_PORT = process.env.DB_PORT;

// Admin details must be provided via environment variables to avoid committing secrets
const admin = {
  name: process.env.ADMIN_NAME,
  email: process.env.ADMIN_EMAIL,
  // Provide ADMIN_PASSWORD_HASH (bcrypt) or set ADMIN_PASSWORD to generate a hash
  password: process.env.ADMIN_PASSWORD_HASH || process.env.ADMIN_PASSWORD_HASH_FALLBACK,
  role: process.env.ADMIN_ROLE || 'admin'
};

async function insertAdmin() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      port: DB_PORT
    });
    if (!admin.name || !admin.email || !admin.password) {
      throw new Error('Admin details missing. Set ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD_HASH in environment.');
    }

    // Step 1: Create admins table if it doesn't exist
    const createTableSQL = `CREATE TABLE IF NOT EXISTS admins (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(20) DEFAULT 'admin',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;
    await connection.execute(createTableSQL);
    console.log('✅ Admins table checked/created.');

    // Step 2: Insert admin account
    const sql = `INSERT INTO admins (name, email, password, role, created_at) VALUES (?, ?, ?, ?, NOW())`;
    const [result] = await connection.execute(sql, [admin.name, admin.email, admin.password, admin.role]);
    console.log('✅ Admin account inserted:', result);
  } catch (err) {
    console.error('❌ Error inserting admin:', err);
  } finally {
    if (connection) await connection.end();
  }
}

insertAdmin();
