-- NiaHealth Database Schema (Tables Only)
-- MySQL 8.0+

USE niahealth_new;

-- Set character set
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- =============================================
-- TABLE: patients
-- =============================================
CREATE TABLE IF NOT EXISTS patients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    date_of_birth DATE,
    gender ENUM('male', 'female', 'other'),
    address TEXT,
    emergency_contact_name VARCHAR(200),
    emergency_contact_phone VARCHAR(20),
    medical_history TEXT,
    current_medications TEXT,
    allergies TEXT,
    blood_type VARCHAR(5),
    height DECIMAL(5,2),
    weight DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_patient_id (patient_id),
    INDEX idx_email (email),
    INDEX idx_phone (phone)
);

-- =============================================
-- TABLE: clinics
-- =============================================
CREATE TABLE IF NOT EXISTS clinics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    clinic_id VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    operating_hours JSON,
    services_offered TEXT,
    capacity INT DEFAULT 50,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_clinic_id (clinic_id)
);

-- =============================================
-- TABLE: health_workers
-- =============================================
CREATE TABLE IF NOT EXISTS health_workers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    worker_id VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    role ENUM('admin', 'doctor', 'nurse', 'chw', 'supervisor') NOT NULL,
    clinic_id VARCHAR(20),
    specialization VARCHAR(100),
    license_number VARCHAR(50),
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_worker_id (worker_id),
    INDEX idx_email (email),
    INDEX idx_clinic_id (clinic_id),
    FOREIGN KEY (clinic_id) REFERENCES clinics(clinic_id) ON UPDATE CASCADE
);

-- =============================================
-- TABLE: appointments
-- =============================================
CREATE TABLE IF NOT EXISTS appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    appointment_id VARCHAR(20) UNIQUE NOT NULL,
    patient_id VARCHAR(20) NOT NULL,
    health_worker_id VARCHAR(20) NOT NULL,
    clinic_id VARCHAR(20) NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    duration_minutes INT DEFAULT 30,
    status ENUM('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show') DEFAULT 'scheduled',
    appointment_type ENUM('consultation', 'follow_up', 'emergency', 'screening', 'vaccination', 'other') NOT NULL,
    notes TEXT,
    diagnosis TEXT,
    treatment_plan TEXT,
    prescription TEXT,
    follow_up_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_appointment_id (appointment_id),
    INDEX idx_patient_id (patient_id),
    INDEX idx_health_worker_id (health_worker_id),
    INDEX idx_clinic_id (clinic_id),
    INDEX idx_appointment_date (appointment_date),
    INDEX idx_status (status),
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON UPDATE CASCADE,
    FOREIGN KEY (health_worker_id) REFERENCES health_workers(worker_id) ON UPDATE CASCADE,
    FOREIGN KEY (clinic_id) REFERENCES clinics(clinic_id) ON UPDATE CASCADE
);

-- =============================================
-- TABLE: referrals
-- =============================================
CREATE TABLE IF NOT EXISTS referrals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    referral_id VARCHAR(20) UNIQUE NOT NULL,
    patient_id VARCHAR(20) NOT NULL,
    referring_worker_id VARCHAR(20) NOT NULL,
    referring_clinic_id VARCHAR(20) NOT NULL,
    target_clinic_id VARCHAR(20),
    target_specialization VARCHAR(100),
    reason TEXT NOT NULL,
    urgency ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    status ENUM('pending', 'accepted', 'completed', 'declined') DEFAULT 'pending',
    notes TEXT,
    referral_date DATE NOT NULL,
    appointment_id VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_referral_id (referral_id),
    INDEX idx_patient_id (patient_id),
    INDEX idx_referring_worker_id (referring_worker_id),
    INDEX idx_status (status),
    INDEX idx_urgency (urgency),
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON UPDATE CASCADE,
    FOREIGN KEY (referring_worker_id) REFERENCES health_workers(worker_id) ON UPDATE CASCADE,
    FOREIGN KEY (referring_clinic_id) REFERENCES clinics(clinic_id) ON UPDATE CASCADE,
    FOREIGN KEY (target_clinic_id) REFERENCES clinics(clinic_id) ON UPDATE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id) ON UPDATE CASCADE
);

-- =============================================
-- TABLE: alerts
-- =============================================
CREATE TABLE IF NOT EXISTS alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    alert_id VARCHAR(20) UNIQUE NOT NULL,
    patient_id VARCHAR(20),
    health_worker_id VARCHAR(20),
    clinic_id VARCHAR(20),
    alert_type ENUM('appointment_reminder', 'medication_reminder', 'follow_up_due', 'critical_result', 'system_notification') NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    status ENUM('active', 'read', 'resolved', 'dismissed') DEFAULT 'active',
    scheduled_for TIMESTAMP,
    expires_at TIMESTAMP,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_alert_id (alert_id),
    INDEX idx_patient_id (patient_id),
    INDEX idx_health_worker_id (health_worker_id),
    INDEX idx_status (status),
    INDEX idx_alert_type (alert_type),
    INDEX idx_scheduled_for (scheduled_for),
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON UPDATE CASCADE,
    FOREIGN KEY (health_worker_id) REFERENCES health_workers(worker_id) ON UPDATE CASCADE,
    FOREIGN KEY (clinic_id) REFERENCES clinics(clinic_id) ON UPDATE CASCADE
);

-- =============================================
-- TABLE: audit_logs
-- =============================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    log_id VARCHAR(20) UNIQUE NOT NULL,
    user_id VARCHAR(20),
    user_type ENUM('patient', 'health_worker', 'system') NOT NULL,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(50),
    record_id VARCHAR(20),
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    session_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_log_id (log_id),
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_table_name (table_name),
    INDEX idx_created_at (created_at)
);

-- =============================================
-- TABLE: feedback
-- =============================================
CREATE TABLE IF NOT EXISTS feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    feedback_id VARCHAR(20) UNIQUE NOT NULL,
    patient_id VARCHAR(20),
    appointment_id VARCHAR(20),
    clinic_id VARCHAR(20),
    rating INT CHECK (rating >= 1 AND rating <= 5),
    feedback_text TEXT,
    category ENUM('service_quality', 'facility', 'staff', 'waiting_time', 'other') DEFAULT 'service_quality',
    is_anonymous BOOLEAN DEFAULT FALSE,
    status ENUM('pending', 'reviewed', 'resolved') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_feedback_id (feedback_id),
    INDEX idx_patient_id (patient_id),
    INDEX idx_appointment_id (appointment_id),
    INDEX idx_rating (rating),
    INDEX idx_category (category),
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON UPDATE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id) ON UPDATE CASCADE,
    FOREIGN KEY (clinic_id) REFERENCES clinics(clinic_id) ON UPDATE CASCADE
);

-- =============================================
-- TABLE: refresh_tokens
-- =============================================
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    user_id VARCHAR(20) NOT NULL,
    user_type ENUM('patient', 'health_worker') NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_token_hash (token_hash),
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at)
);

SET FOREIGN_KEY_CHECKS = 1;

-- Show created tables
SHOW TABLES;
SELECT 'Database schema imported successfully!' as Status;