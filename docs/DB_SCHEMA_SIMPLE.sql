-- NiaHealth Database Schema
-- MySQL 8.0+
-- Created: November 12, 2025

-- Drop database if exists (use with caution)
-- DROP DATABASE IF EXISTS niahealth;

-- Create database
-- Database already created
USE niahealth_new;

-- Set character set
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- =============================================
-- TABLE: patients
-- Description: Stores patient information
-- =============================================
CREATE TABLE IF NOT EXISTS patients (
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_phone (phone),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: clinics
-- Description: Stores clinic/health facility information
-- =============================================
CREATE TABLE IF NOT EXISTS clinics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    location VARCHAR(255) NOT NULL,
    contact VARCHAR(15) NOT NULL,
    email VARCHAR(100),
    capacity INT DEFAULT 50,
    operating_hours VARCHAR(100) DEFAULT '8:00 AM - 5:00 PM',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_location (location),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: health_workers
-- Description: Stores health worker and admin information
-- =============================================
CREATE TABLE IF NOT EXISTS health_workers (
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE SET NULL,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_clinic_id (clinic_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: appointments
-- Description: Stores patient appointments
-- =============================================
CREATE TABLE IF NOT EXISTS appointments (
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE,
    INDEX idx_patient_id (patient_id),
    INDEX idx_clinic_id (clinic_id),
    INDEX idx_appointment_date (appointment_date),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: referrals
-- Description: Stores patient referrals to hospitals
-- =============================================
CREATE TABLE IF NOT EXISTS referrals (
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES health_workers(id) ON DELETE CASCADE,
    INDEX idx_patient_id (patient_id),
    INDEX idx_clinic_id (clinic_id),
    INDEX idx_status (status),
    INDEX idx_urgency (urgency),
    INDEX idx_referral_date (referral_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: alerts
-- Description: Stores health alerts and campaigns
-- =============================================
CREATE TABLE IF NOT EXISTS alerts (
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
    FOREIGN KEY (created_by) REFERENCES health_workers(id) ON DELETE CASCADE,
    INDEX idx_target_group (target_group),
    INDEX idx_delivery_status (delivery_status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: audit_logs
-- Description: Stores system audit trail
-- =============================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    user_type ENUM('patient', 'health_worker', 'admin') NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INT,
    description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_user_type (user_type),
    INDEX idx_action (action),
    INDEX idx_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: feedback
-- Description: Stores user feedback
-- =============================================
CREATE TABLE IF NOT EXISTS feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    user_type ENUM('patient', 'health_worker', 'admin', 'visitor') DEFAULT 'visitor',
    subject VARCHAR(200),
    message TEXT NOT NULL,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    status ENUM('new', 'reviewed', 'resolved') DEFAULT 'new',
    admin_response TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: refresh_tokens
-- Description: Stores JWT refresh tokens
-- =============================================
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    user_type ENUM('patient', 'health_worker') NOT NULL,
    token VARCHAR(500) NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_token (token),
    INDEX idx_user_id (user_id, user_type),
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- INSERT SAMPLE DATA
-- =============================================

-- Sample Clinics
INSERT INTO clinics (name, location, contact, email, capacity) VALUES
('Nairobi Community Clinic', 'Nairobi, Kibera', '+254712345678', 'kibera@niahealth.com', 100),
('Mombasa Health Center', 'Mombasa, Likoni', '+254723456789', 'likoni@niahealth.com', 75),
('Kisumu Medical Center', 'Kisumu, Kondele', '+254734567890', 'kondele@niahealth.com', 50);

-- Sample Admin (password: Admin@123)
-- Note: In production, hash this properly using bcrypt
INSERT INTO health_workers (name, email, phone, clinic_id, role, password_hash, is_verified) VALUES
('System Admin', 'admin@niahealth.com', '+254700000000', 1, 'admin', '$2b$10$YourHashedPasswordHere', TRUE);

-- Sample Health Worker (password: Worker@123)
INSERT INTO health_workers (name, email, phone, clinic_id, role, password_hash, is_verified) VALUES
('Dr. Jane Wanjiku', 'jane@niahealth.com', '+254711111111', 1, 'health_worker', '$2b$10$YourHashedPasswordHere', TRUE),
('Nurse John Omondi', 'john@niahealth.com', '+254722222222', 2, 'health_worker', '$2b$10$YourHashedPasswordHere', TRUE);

SET FOREIGN_KEY_CHECKS = 1;

-- =============================================
-- VIEWS FOR REPORTING
-- =============================================

-- View: Daily Appointments
CREATE OR REPLACE VIEW daily_appointments AS
SELECT 
    a.appointment_date,
    c.name AS clinic_name,
    COUNT(*) AS total_appointments,
    SUM(CASE WHEN a.status = 'completed' THEN 1 ELSE 0 END) AS completed,
    SUM(CASE WHEN a.status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled
FROM appointments a
JOIN clinics c ON a.clinic_id = c.id
GROUP BY a.appointment_date, c.id;

-- View: Referral Statistics
CREATE OR REPLACE VIEW referral_statistics AS
SELECT 
    DATE_FORMAT(r.created_at, '%Y-%m') AS month,
    r.urgency,
    r.status,
    COUNT(*) AS count
FROM referrals r
GROUP BY month, r.urgency, r.status;

-- View: Active Patients
CREATE OR REPLACE VIEW active_patients AS
SELECT 
    p.id,
    p.name,
    p.email,
    p.phone,
    COUNT(DISTINCT a.id) AS total_appointments,
    COUNT(DISTINCT r.id) AS total_referrals,
    MAX(a.appointment_date) AS last_appointment
FROM patients p
LEFT JOIN appointments a ON p.id = a.patient_id
LEFT JOIN referrals r ON p.id = r.patient_id
WHERE p.created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
GROUP BY p.id;

-- =============================================
-- STORED PROCEDURES
-- =============================================

-- Procedure: Clean expired OTPs
DELIMITER //
CREATE PROCEDURE clean_expired_otps()
BEGIN
    UPDATE patients SET otp = NULL, otp_expiry = NULL 
    WHERE otp_expiry < NOW();
    
    UPDATE health_workers SET otp = NULL, otp_expiry = NULL 
    WHERE otp_expiry < NOW();
END //
DELIMITER ;

-- Procedure: Purge old audit logs (older than 12 months)
DELIMITER //
CREATE PROCEDURE purge_old_audit_logs()
BEGIN
    DELETE FROM audit_logs 
    WHERE timestamp < DATE_SUB(NOW(), INTERVAL 12 MONTH);
END //
DELIMITER ;

-- =============================================
-- EVENTS FOR AUTOMATED TASKS
-- =============================================

-- Enable event scheduler

-- Event: Clean expired OTPs every hour
ON SCHEDULE EVERY 1 HOUR
DO CALL clean_expired_otps();

-- Event: Purge old audit logs monthly
ON SCHEDULE EVERY 1 MONTH
DO CALL purge_old_audit_logs();

-- =============================================
-- END OF SCHEMA
-- =============================================
