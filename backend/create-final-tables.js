const mysql = require('mysql2/promise');
require('dotenv').config(); // Load .env from the same directory

// Database connection configuration
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ...(process.env.DB_SSL === 'true' && { ssl: { rejectUnauthorized: false } })
};

// Log the configuration to verify it's loaded correctly
console.log('--- Database Configuration ---');
console.log(`Host: ${dbConfig.host}`);
console.log(`User: ${dbConfig.user}`);
console.log(`Database: ${dbConfig.database}`);
console.log(`Port: ${dbConfig.port}`);
console.log('-----------------------------');


// Simplified SQL for creating the missing tables
const queries = [
    `CREATE TABLE IF NOT EXISTS appointments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_id INT,
        clinic_id INT,
        appointment_date DATE,
        appointment_time TIME,
        reason TEXT,
        status VARCHAR(50) DEFAULT 'scheduled',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;`,

    `CREATE TABLE IF NOT EXISTS referrals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_id INT,
        clinic_id INT,
        hospital_name VARCHAR(150),
        reason TEXT,
        urgency VARCHAR(50) DEFAULT 'medium',
        status VARCHAR(50) DEFAULT 'pending',
        referral_date DATE,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;`,

    `CREATE TABLE IF NOT EXISTS audit_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        action VARCHAR(100),
        description TEXT,
        ip_address VARCHAR(45),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;`,

    `CREATE TABLE IF NOT EXISTS feedback (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(100),
        subject VARCHAR(200),
        message TEXT,
        status VARCHAR(50) DEFAULT 'new',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;`
];

async function setupDatabase() {
    if (!dbConfig.host || !dbConfig.user || !dbConfig.password || !dbConfig.database) {
        console.error('❌ Critical Error: Database environment variables are not loaded.');
        console.error('Please ensure the .env file is in the same directory as this script and contains DB_HOST, DB_USER, DB_PASSWORD, and DB_NAME.');
        return;
    }

    let connection;
    try {
        console.log('Connecting to the database...');
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Database connection successful.');

        for (const query of queries) {
            const tableName = query.match(/CREATE TABLE IF NOT EXISTS `?(\w+)`?/)[1];
            console.log(`\nEnsuring table '${tableName}' exists...`);
            await connection.query(query);
            console.log(`✅ Table '${tableName}' is ready.`);
        }

        console.log('\n🎉 Database schema is now complete!');

    } catch (error) {
        console.error('\n❌ An error occurred:', error.message);
    } finally {
        if (connection) {
            console.log('Closing database connection.');
            await connection.end();
        }
    }
}

setupDatabase();
