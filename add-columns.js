const mysql = require('mysql2/promise');

async function addMissingColumns() {
  const connection = await mysql.createConnection({
    host: 'sql12.freesqldatabase.com',
    user: 'sql12808713',
    password: 'JiP5vk3l1Z',
    database: 'sql12808713'
  });

  console.log('Adding missing columns to patients table...');

  const columnsToAdd = [
    'otp VARCHAR(6)',
    'otp_expiry DATETIME',
    'failed_login_attempts INT DEFAULT 0',
    'account_locked_until DATETIME',
    'last_login DATETIME'
  ];

  for (const column of columnsToAdd) {
    try {
      await connection.query(`ALTER TABLE patients ADD COLUMN ${column}`);
      console.log('✅ Added:', column.split(' ')[0]);
    } catch (error) {
      if (error.message.includes('Duplicate')) {
        console.log('✓ Already exists:', column.split(' ')[0]);
      } else {
        console.log('✗ Error:', error.message.substring(0, 50));
      }
    }
  }

  console.log('✅ Database schema updated');
  await connection.end();
}

addMissingColumns();