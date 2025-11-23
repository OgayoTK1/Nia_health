const { query } = require('./db');

const runStartupMigrations = async () => {
  console.log('🔧 Running startup DB migrations (safe, idempotent)...');

  // 1) Ensure audit_logs has user_type column
  try {
    await query(
      `ALTER TABLE audit_logs ADD COLUMN user_type ENUM('patient','health_worker','admin') DEFAULT NULL AFTER user_id`
    );
    console.log('✅ Added column `user_type` to `audit_logs`.');
  } catch (err) {
    // Ignore if column already exists or table missing — we'll handle both cases
    if (err && (err.code === 'ER_DUP_FIELDNAME' || err.code === 'ER_BAD_FIELD_ERROR' || err.code === 'ER_CANT_DROP_FIELD_OR_KEY')) {
      console.log('ℹ️ `user_type` column may already exist or audit_logs missing. Skipping add column.');
    } else {
      console.warn('⚠️ Could not add `user_type` column (non-fatal):', err.message);
    }
  }

  // 2) Ensure alerts table exists (create if missing)
  try {
    await query(
      `CREATE TABLE IF NOT EXISTS alerts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        subject VARCHAR(200) NOT NULL,
        message TEXT NOT NULL,
        target_group ENUM('all','patients','health_workers','specific') DEFAULT 'all',
        target_location VARCHAR(255) DEFAULT NULL,
        email_sent BOOLEAN DEFAULT FALSE,
        sent_count INT DEFAULT 0,
        delivery_status ENUM('pending','sending','sent','failed') DEFAULT 'pending',
        created_by INT NOT NULL,
        scheduled_at DATETIME DEFAULT NULL,
        sent_at DATETIME DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES health_workers(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;`
    );

    console.log('✅ Ensured `alerts` table exists (created if missing).');
  } catch (err) {
    console.warn('⚠️ Could not create `alerts` table (non-fatal):', err.message);
  }

  console.log('🔧 Startup DB migrations completed.');
};

module.exports = { runStartupMigrations };
