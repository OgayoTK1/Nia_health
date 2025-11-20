const mysql = require('mysql2/promise');
const path = require('path');

// Load environment variables from the .env file in the current directory
require('dotenv').config();

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
    // Use SSL if the variable is set
    ...(process.env.DB_SSL === 'true' && { ssl: { rejectUnauthorized: false } })
};

// Log the configuration to debug connection issues
console.log('Attempting to connect with the following configuration:');
console.log({
    host: dbConfig.host,
    user: dbConfig.user,
    database: dbConfig.database,
    port: dbConfig.port,
    ssl: dbConfig.ssl ? 'true' : 'false'
});

// SQL statements for creating missing tables
const createTablesQueries = [
    `CREATE TABLE IF NOT EXISTS appointments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_id INT NOT NULL,
        clinic_id INT NOT NULL,
        appointment_date DATE NOT NULL,
        appointment_time TIME NOT NULL,
        reason TEXT,
        status ENUM('scheduled', 'confirmed', 'completed', 'cancelled', 'no-show') DEFAULT 'scheduled',
        notes TEXT,
        created_by INT DEFAULT NULL,
        updated_by INT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT NULL,
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
        FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;`,

    `CREATE TABLE IF NOT EXISTS referrals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_id INT NOT NULL,
        clinic_id INT NOT NULL,
        hospital_name VARCHAR(150) NOT NULL,
        hospital_location VARCHAR(255),
        reason TEXT NOT NULL,
        diagnosis TEXT,
        urgency ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
        status ENUM('pending', 'accepted', 'completed', 'cancelled') DEFAULT 'pending',
        referral_date DATE NOT NULL,
        follow_up_date DATE DEFAULT NULL,
        notes TEXT,
        created_by INT NOT NULL,
        updated_by INT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT NULL,
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
        FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES health_workers(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;`,

    `CREATE TABLE IF NOT EXISTS alerts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        subject VARCHAR(200) NOT NULL,
        message TEXT NOT NULL,
        target_group ENUM('all', 'patients', 'health_workers', 'specific') DEFAULT 'all',
        target_location VARCHAR(255) DEFAULT NULL,
        email_sent BOOLEAN DEFAULT FALSE,
        sent_count INT DEFAULT 0,
        delivery_status ENUM('pending', 'sending', 'sent', 'failed') DEFAULT 'pending',
        created_by INT NOT NULL,
        scheduled_at DATETIME DEFAULT NULL,
        sent_at DATETIME DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES health_workers(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;`,

    `CREATE TABLE IF NOT EXISTS audit_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        user_type ENUM('patient', 'health_worker', 'admin') NOT NULL,
        action VARCHAR(100) NOT NULL,
        entity_type VARCHAR(50),
        entity_id INT,
        description TEXT,
        ip_address VARCHAR(45),
        user_agent TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;`,

    `CREATE TABLE IF NOT EXISTS feedback (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100),
        user_type ENUM('patient', 'health_worker', 'admin', 'visitor') DEFAULT 'visitor',
        subject VARCHAR(200),
        message TEXT NOT NULL,
        rating INT,
        status ENUM('new', 'reviewed', 'resolved') DEFAULT 'new',
        admin_response TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT NULL
    ) ENGINE=InnoDB;`
];

async function createTables() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Database connection successful.');

        for (const query of createTablesQueries) {
            const tableNameMatch = query.match(/CREATE TABLE IF NOT EXISTS `?(\w+)`?/);
            if (!tableNameMatch) continue;
            
            const tableName = tableNameMatch[1];
            try {
                console.log(`\nCreating table '${tableName}'...`);
                await connection.query(query);
                console.log(`✅ Table '${tableName}' created successfully or already exists.`);
            } catch (error) {
                console.error(`❌ Error creating table '${tableName}':`, error.message);
                throw error;
            }
        }

        console.log('\n🎉 All missing tables have been created successfully!');

    } catch (error) {
        console.error('\n❌ An error occurred during the database operation:', error.message);
    } finally {
        if (connection) {
            console.log('Closing database connection.');
            await connection.end();
        }
    }
}

createTables();
