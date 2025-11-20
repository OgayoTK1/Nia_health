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

// Sample clinic data
const clinics = [
    { name: 'Nairobi Community Clinic', location: 'Nairobi, Kibera', contact: '+254712345678', email: 'kibera@niahealth.com' },
    { name: 'Mombasa Health Center', location: 'Mombasa, Likoni', contact: '+254723456789', email: 'likoni@niahealth.com' },
    { name: 'Kisumu Medical Point', location: 'Kisumu, Kondele', contact: '+254734567890', email: 'kondele@niahealth.com' }
];

async function insertSampleClinics() {
    console.log("--- Inserting Sample Clinics ---");
    let connection;
    try {
        console.log(`Connecting to ${dbConfig.host}...`);
        connection = await mysql.createConnection(dbConfig);
        console.log("✅ Connection Successful!");

        const insertQuery = "INSERT INTO clinics (name, location, contact, email) VALUES (?, ?, ?, ?)";

        for (const clinic of clinics) {
            // Check if a clinic with the same name already exists to avoid duplicates
            const [existing] = await connection.query("SELECT id FROM clinics WHERE name = ?", [clinic.name]);
            
            if (existing.length === 0) {
                console.log(`-> Inserting '${clinic.name}'...`);
                await connection.query(insertQuery, [clinic.name, clinic.location, clinic.contact, clinic.email]);
                console.log("   ...Done.");
            } else {
                console.log(`-> Skipping '${clinic.name}' (already exists).`);
            }
        }

        console.log("\n🎉 Sample clinics have been added to the database.");

    } catch (error) {
        console.error("\n❌ An error occurred:", error.message);
    } finally {
        if (connection) {
            await connection.end();
            console.log("\nConnection closed.");
        }
    }
}

insertSampleClinics();
