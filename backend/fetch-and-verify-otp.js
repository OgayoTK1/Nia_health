const mysql = require('mysql2/promise');
const https = require('https');
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
    const [rows] = await conn.execute('SELECT id, email, otp, otp_expiry FROM health_workers WHERE email = ?', [EMAIL]);
    if (!rows.length) {
      console.error('Health worker not found');
      process.exit(1);
    }

    const hw = rows[0];
    console.log('Found:', { id: hw.id, email: hw.email, otp: hw.otp, otp_expiry: hw.otp_expiry });

    if (!hw.otp) {
      console.error('No OTP present for this user. You may need to trigger login to generate OTP first.');
      process.exit(1);
    }

    const postData = JSON.stringify({ email: EMAIL, otp: String(hw.otp), userType: 'health-worker' });

    const options = {
      hostname: 'nia-health.onrender.com',
      port: 443,
      path: '/api/auth/verify-otp',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      console.log('statusCode:', res.statusCode);
      res.on('data', (d) => { body += d.toString(); });
      res.on('end', () => {
        console.log('response body:', body);
        process.exit(0);
      });
    });

    req.on('error', (e) => { console.error('request error', e); process.exit(1); });
    req.write(postData);
    req.end();

  } catch (err) {
    console.error('ERROR:', err.message || err);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
})();
