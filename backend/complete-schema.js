const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// --- Manually load .env file ---
function loadEnv() {
    const envPath = path.resolve(__dirname, '.env');
    console.log(`Attempting to load environment variables from: ${envPath}`);
    try {
        if (!fs.existsSync(envPath)) {
            console.error(`❌ Critical Error: .env file not found at ${envPath}`);
            return false;
        }
        const envFileContent = fs.readFileSync(envPath, 'utf8');
        envFileContent.split('\n').forEach(line => {
            const trimmedLine = line.trim();
            if (trimmedLine && !trimmedLine.startsWith('#')) {
                const [key, value] = trimmedLine.split('=');
                if (key && value) {
                    process.env[key.trim()] = value.trim().replace(/^"|"$/g, ''); // Remove surrounding quotes
                }
            }
        });
        console.log('✅ Environment variables loaded manually.');
        return true;
    } catch (error) {
        console.error('❌ Error loading .env file:', error.message);
        return false;
    }
}
// --- End of manual .env loader ---

// SQL statements for creating the final tables
const finalTableQueries = [
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

async function completeSchema() {
    if (!loadEnv()) {
        return; // Stop if .env file failed to load
    }

    const dbConfig = {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306,
        ...(process.env.DB_SSL === 'true' && { ssl: { rejectUnauthorized: false } })
    };

    console.log('\n--- Verifying Database Configuration ---');
    console.log(`Host: ${dbConfig.host}`);
    console.log(`User: ${dbConfig.user ? 'Loaded' : 'Not Loaded'}`);
    console.log(`Database: ${dbConfig.database}`);
    console.log('------------------------------------');

    if (!dbConfig.host || !dbConfig.user || !dbConfig.password || !dbConfig.database) {
        console.error('❌ Critical Error: Database credentials missing after attempting to load .env file.');
        return;
    }

    let connection;
    try {
        console.log('\nConnecting to the database...');
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Database connection successful.');

        for (const query of finalTableQueries) {
            const tableName = query.match(/CREATE TABLE IF NOT EXISTS `?(\w+)`?/)[1];
            console.log(`\nEnsuring table '${tableName}' exists...`);
            await connection.query(query);
            console.log(`✅ Table '${tableName}' is ready.`);
        }

        console.log('\n🎉🎉 Database schema is now complete! All required tables have been created.');

    } catch (error) {
        console.error('\n❌ An error occurred during the database operation:', error.message);
    } finally {
        if (connection) {
            console.log('Closing database connection.');
            await connection.end();
        }
    }
}

completeSchema();
