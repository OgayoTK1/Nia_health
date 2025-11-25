const mysql = require('mysql2/promise');

async function createSimpleTables() {
  const connection = await mysql.createConnection({
    host: 'sql12.freesqldatabase.com',
    port: 3306,
    user: 'sql12808713',
    password: 'JiP5vk3l1Z',
    database: 'sql12808713'
  });

  console.log(' Connected to FreeSQLDatabase');

  const queries = [
    `CREATE TABLE IF NOT EXISTS patients (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      phone VARCHAR(15),
      password_hash VARCHAR(255) NOT NULL,
      is_verified BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    
    `CREATE TABLE IF NOT EXISTS clinics (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      location VARCHAR(255) NOT NULL,
      contact VARCHAR(15),
      capacity INT DEFAULT 50,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    
    `CREATE TABLE IF NOT EXISTS health_workers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      role ENUM('health_worker', 'admin') DEFAULT 'health_worker',
      password_hash VARCHAR(255) NOT NULL,
      is_verified BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    
    `INSERT IGNORE INTO clinics (name, location, contact) VALUES 
    ('Test Clinic', 'Nairobi', '+254123456789')`
  ];

  for (const query of queries) {
    try {
      await connection.query(query);
      console.log(' Query executed');
    } catch (error) {
      console.log('', error.message.substring(0, 50));
    }
  }

  const [tables] = await connection.query('SHOW TABLES');
  console.log('\n Tables created:');
  tables.forEach(row => console.log('  -', Object.values(row)[0]));

  await connection.end();
}

createSimpleTables();
