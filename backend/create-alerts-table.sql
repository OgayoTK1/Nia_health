CREATE TABLE IF NOT EXISTS alerts (
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;