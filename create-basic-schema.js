const mysql = require('mysql2/promise');

async function createBasicSchema() {
  const connection = await mysql.createConnection({
    host: 'sql12.freesqldatabase.com',
    port: 3306,
    user: 'sql12808713',
    password: 'JiP5vk3l1Z',
    database: 'sql12808713'
  });

  console.log('✅ Connected to FreeSQLDatabase');

  // Basic tables needed for the app
  const tables = [
    `CREATE TABLE IF NOT EXISTS patients (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      gender ENUM('Male', 'Female', 'Other') NOT NULL,
      dob DATE NOT NULL,
      phone VARCHAR(15) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      address TEXT,
      password_hash VARCHAR(255) NOT NULL,
      otp VARCHAR(6) DEFAULT NULL,
      otp_expiry DATETIME DEFAULT NULL,
      is_verified BOOLEAN DEFAULT FALSE,
      failed_login_attempts INT DEFAULT 0,
      account_locked_until DATETIME DEFAULT NULL,
      last_login DATETIME DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8`,

    `CREATE TABLE IF NOT EXISTS clinics (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      location VARCHAR(255) NOT NULL,
      contact VARCHAR(15) NOT NULL,
      email VARCHAR(100),
      capacity INT DEFAULT 50,
      operating_hours VARCHAR(100) DEFAULT '8:00 AM - 5:00 PM',
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8`,

    `CREATE TABLE IF NOT EXISTS health_workers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      phone VARCHAR(15),
      clinic_id INT,
      role ENUM('health_worker', 'admin') NOT NULL DEFAULT 'health_worker',
      password_hash VARCHAR(255) NOT NULL,
      otp VARCHAR(6) DEFAULT NULL,
      otp_expiry DATETIME DEFAULT NULL,
      is_verified BOOLEAN DEFAULT TRUE,
      failed_login_attempts INT DEFAULT 0,
      account_locked_until DATETIME DEFAULT NULL,
      last_login DATETIME DEFAULT NULL,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8`,

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
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
      FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8`,

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
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
      FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE,
      FOREIGN KEY (created_by) REFERENCES health_workers(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8`,

    `CREATE TABLE IF NOT EXISTS refresh_tokens (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      user_type ENUM('patient', 'health_worker') NOT NULL,
      token VARCHAR(500) NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8`,

    // Sample data
    `INSERT IGNORE INTO clinics (name, location, contact, email, capacity) VALUES
    ('Nairobi Community Clinic', 'Nairobi, Kibera', '+254712345678', 'kibera@niahealth.com', 100),
    ('Mombasa Health Center', 'Mombasa, Likoni', '+254723456789', 'likoni@niahealth.com', 75),
    ('Kisumu Medical Center', 'Kisumu, Kondele', '+254734567890', 'kondele@niahealth.com', 50)`,

    `INSERT IGNORE INTO health_workers (name, email, phone, clinic_id, role, password_hash, is_verified) VALUES
    ('System Admin', 'admin@niahealth.com', '+254700000000', 1, 'admin', '$2b$10$YourHashedPasswordHere', TRUE),
    ('Dr. Jane Wanjiku', 'jane@niahealth.com', '+254711111111', 1, 'health_worker', '$2b$10$YourHashedPasswordHere', TRUE)`
  ];

  for (const sql of tables) {
    try {
      await connection.query(sql);
      console.log('✅ Table created/updated');
    } catch (error) {
      console.log('⚠️ Error:', error.message);
    }
  }

  const [tables_result] = await connection.query('SHOW TABLES');
  console.log('\n📋 Final tables:');
  tables_result.forEach(row => console.log('  -', Object.values(row)[0]));

  await connection.end();
}

createBasicSchema().catch(console.error);