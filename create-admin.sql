-- Create admin account with proper password hash
-- Email: admin@example.com
-- Password: Admin@123
INSERT INTO health_workers (name, email, password_hash, role, is_verified, is_active) 
VALUES ('Admin', 'admin@example.com', '$2b$10$xVskYXpOO3lrGZOviV.mguSX9X2t80JV/frMShI4UoDsyoAPaBWXO', 'admin', 1, 1);
