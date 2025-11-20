const mysql = require('mysql2/promise');

// --- IMPORTANT ---
// --- PLEASE FILL IN YOUR REMOTE DATABASE CREDENTIALS BELOW ---
const dbConfig = {
    host: "sql12.freesqldatabase.com",
    user: "sql12808713",
    password: "JiP5vk3l1Z",
    database: "sql12808713",
    port: 3306,
    connectTimeout: 20000 // Increased timeout for remote connection
};

// Final set of queries to complete the schema
const finalQueries = [
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

async function runFinalUpdate() {
    if (dbConfig.password === "YOUR_DATABASE_PASSWORD") {
        console.error("\n❌ STOP! Please edit this script and replace 'YOUR_DATABASE_PASSWORD' with your actual database password before running.");
        return;
    }

    console.log(`--- Connecting to ${dbConfig.host} ---`);

    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log("✅ Connection Successful!");

        for (const query of finalQueries) {
            const tableName = query.match(/CREATE TABLE IF NOT EXISTS `?(\w+)`?/)[1];
            console.log(`-> Creating table '${tableName}'...`);
            await connection.query(query);
            console.log(`   ...Done.`);
        }

        console.log("\n🎉🎉🎉 Success! Your database schema is now complete.");

    } catch (error) {
        console.error("\n❌ An error occurred:", error.message);
        if (error.code) console.error(`   Error Code: ${error.code}`);
    } finally {
        if (connection) {
            await connection.end();
            console.log("Connection closed.");
        }
    }
}

runFinalUpdate();
