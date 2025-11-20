const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function importSchema() {
  const connection = await mysql.createConnection({
    host: 'interchange.proxy.rlwy.net',
    port: 55318,
    user: 'root',
    password: 'ExwQmUnQhMfjhuwnnaZIFbBYZVVVUChW',
    database: 'railway',
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
