const mysql = require('mysql2/promise');

// --- Database Credentials ---
const dbConfig = {
    host: "sql12.freesqldatabase.com",
    user: "sql12808713",
    password: "JiP5vk3l1Z",
    database: "sql12808713",
    port: 3306,
    connectTimeout: 20000
};

async function addIsActiveColumn() {
    console.log("--- Altering 'clinics' table ---");
    let connection;
    try {
        console.log(`Connecting to ${dbConfig.host}...`);
        connection = await mysql.createConnection(dbConfig);
        console.log("✅ Connection Successful!");

        const alterQuery = "ALTER TABLE clinics ADD COLUMN is_active BOOLEAN DEFAULT TRUE;";
        console.log("\nExecuting query to add 'is_active' column...");
        await connection.query(alterQuery);
        console.log("✅ Column 'is_active' added successfully with a default value of TRUE.");

    } catch (error) {
        // It's okay if the column already exists, we can ignore that specific error.
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log("✅ Column 'is_active' already exists. No changes needed.");
        } else {
            console.error("\n❌ An error occurred:", error.message);
        }
    } finally {
        if (connection) {
            await connection.end();
            console.log("\nConnection closed.");
        }
    }
}

addIsActiveColumn();
