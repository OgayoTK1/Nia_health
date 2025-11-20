const mysql = require('mysql2/promise');
require('dotenv').config();

(async () => {
  const DB_HOST = process.env.DB_HOST;
  const DB_USER = process.env.DB_USER;
  const DB_PASSWORD = process.env.DB_PASSWORD;
  const DB_NAME = process.env.DB_NAME;
  const DB_PORT = process.env.DB_PORT || 3306;
  const EMAIL = process.env.CHECK_HW_EMAIL || 'ogayoater@gmail.com';

  if (!DB_HOST || !DB_USER || !DB_PASSWORD || !DB_NAME) {
    console.error('Missing DB env vars in .env');
    process.exit(1);
  }

  let conn;
  try {
    conn = await mysql.createConnection({ host: DB_HOST, user: DB_USER, password: DB_PASSWORD, database: DB_NAME, port: DB_PORT });
    const [rows] = await conn.execute('SELECT id, email, name, password_hash, is_verified, is_active, failed_login_attempts, account_locked_until, last_login FROM health_workers WHERE email = ?', [EMAIL]);
    if (rows.length === 0) {
      console.log('NOT FOUND');
    } else {
      console.log(JSON.stringify(rows[0], null, 2));
    }
  } catch (err) {
    console.error('ERROR:', err.message || err);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
})();
