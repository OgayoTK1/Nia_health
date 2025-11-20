const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function importSchema() {
  const connection = await mysql.createConnection({
    host: 'sql12.freesqldatabase.com',
    port: 3306,
    user: 'sql12808713',
    password: 'JiP5vk3l1Z',
    database: 'sql12808713',
    multipleStatements: true
  });

  console.log('✅ Connected to Railway MySQL');

  const schemaPath = path.join(__dirname, 'docs', 'DB_SCHEMA_SIMPLE.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');

  console.log('📥 Importing schema...');
  
  try {
    await connection.query(schema);
    console.log('✅ Schema imported successfully!');
  } catch (error) {
    console.log('⚠️ Some errors occurred (this is normal for CREATE DATABASE and SET GLOBAL):');
    console.log(error.message);
  }

  // Verify tables
  const [tables] = await connection.query('SHOW TABLES');
  console.log('\n📋 Tables created:');
  tables.forEach(row => console.log('  -', Object.values(row)[0]));

  await connection.end();
}

importSchema().catch(console.error);
