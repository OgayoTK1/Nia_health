const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// --- Robust Manual .env Loader ---
function loadEnvFile() {
    const envPath = path.resolve(__dirname, '.env');
    console.log(`[Loader] Attempting to read .env file from: ${envPath}`);
    
    if (!fs.existsSync(envPath)) {
        console.error(`[Loader] ❌ Critical Error: .env file not found.`);
        return false;
    }

    try {
        const envFileContent = fs.readFileSync(envPath, 'utf8');
        envFileContent.split(/\r?\n/).forEach(line => {
            const trimmedLine = line.trim();
            if (trimmedLine && !trimmedLine.startsWith('#')) {
                const parts = trimmedLine.split('=');
                const key = parts.shift().trim();
                const value = parts.join('=').trim().replace(/^"|"$/g, ''); // Handle quoted values
                if (key && value) {
                    process.env[key] = value;
                }
            }
        });
        console.log('[Loader] ✅ .env file processed manually.');
        return true;
    } catch (error) {
        console.error('[Loader] ❌ Error reading or processing .env file:', error.message);
        return false;
    }
}
// --- End of Loader ---

// SQL statements for the final tables
const finalTableQueries = [
    `CREATE TABLE IF NOT EXISTS appointments (
        id INT AUTO_INCREMENT PRIMARY KEY, patient_id INT, clinic_id INT, appointment_date DATE,
        appointment_time TIME, reason TEXT, status VARCHAR(50) DEFAULT 'scheduled',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;`,
    `CREATE TABLE IF NOT EXISTS referrals (
        id INT AUTO_INCREMENT PRIMARY KEY, patient_id INT, clinic_id INT, hospital_name VARCHAR(150),
        reason TEXT, urgency VARCHAR(50) DEFAULT 'medium', status VARCHAR(50) DEFAULT 'pending',
        referral_date DATE, created_by INT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;`,
    `CREATE TABLE IF NOT EXISTS audit_logs (
        id INT AUTO_INCREMENT PRIMARY KEY, user_id INT, action VARCHAR(100), description TEXT,
        ip_address VARCHAR(45), timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;`,
    `CREATE TABLE IF NOT EXISTS feedback (
        id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100), email VARCHAR(100), subject VARCHAR(200),
        message TEXT, status VARCHAR(50) DEFAULT 'new', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;`
];

async function runFinalSetup() {
    if (!loadEnvFile()) {
        console.error("Setup aborted due to .env loading failure.");
        return;
    }

    const dbConfig = {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306,
        connectTimeout: 20000, // 20 seconds
        ...(process.env.DB_SSL === 'true' && { ssl: { rejectUnauthorized: false } })
    };

    console.log('\n--- Final Database Configuration Check ---');
    console.log(`Host:     ${dbConfig.host || 'NOT FOUND'}`);
    console.log(`User:     ${dbConfig.user || 'NOT FOUND'}`);
    console.log(`Database: ${dbConfig.database || 'NOT FOUND'}`);
    console.log('----------------------------------------');

    if (!dbConfig.host || !dbConfig.user || !dbConfig.password || !dbConfig.database) {
        console.error('❌ Critical Error: One or more database credentials were not found in the .env file.');
        return;
    }

    let connection;
    try {
        console.log('\nConnecting to the remote database...');
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Database connection successful!');

        for (const query of finalTableQueries) {
            const tableName = query.match(/CREATE TABLE IF NOT EXISTS `?(\w+)`?/)[1];
            console.log(`-> Creating table '${tableName}'...`);
            await connection.query(query);
            console.log(`   ...Done.`);
        }

        console.log('\n🎉🎉🎉 Success! Your database is now complete and all tables are created.');

    } catch (error) {
        console.error('\n❌ An error occurred during the database operation:', error.message);
        if (error.code) {
            console.error(`   Error Code: ${error.code}`);
        }
    } finally {
        if (connection) {
            console.log('Closing database connection.');
            await connection.end();
        }
    }
}

runFinalSetup();
