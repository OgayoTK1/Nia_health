const mysql = require('mysql2/promise');

// --- Database Credentials ---
// Using the same credentials you provided earlier.
const dbConfig = {
    host: "sql12.freesqldatabase.com",
    user: "sql12808713",
        password: "JiP5vk3l1Z",
    database: "sql12808713",
    port: 3306,
    connectTimeout: 20000
};

async function checkClinics() {
    console.log("--- Checking Clinics in the Database ---");
    let connection;
    try {
        console.log(`Connecting to ${dbConfig.host}...`);
        connection = await mysql.createConnection(dbConfig);
        console.log("✅ Connection Successful!");

        const [rows] = await connection.query("SELECT id, name, is_active FROM clinics;");

        if (rows.length === 0) {
            console.log("\nRESULT: The 'clinics' table is completely empty.");
        } else {
            console.log("\n--- Found Clinics ---");
            console.table(rows);
            console.log("\nRESULT: The 'clinics' table contains data.");
        }

    } catch (error) {
        console.error("\n❌ An error occurred:", error.message);
    } finally {
        if (connection) {
            await connection.end();
            console.log("\nConnection closed.");
        }
    }
}

checkClinics();
