-- Create new database and user for NiaHealth backend
-- This script creates a fresh database with a dedicated user

-- Create the new database
DROP DATABASE IF EXISTS niahealth_new;
CREATE DATABASE niahealth_new CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create a dedicated user for the application
DROP USER IF EXISTS 'niahealth_user'@'%';
DROP USER IF EXISTS 'niahealth_user'@'localhost';
DROP USER IF EXISTS 'niahealth_user'@'%.mshome.net';

-- Create user with mysql_native_password authentication (better compatibility)
CREATE USER 'niahealth_user'@'%' IDENTIFIED WITH mysql_native_password BY 'NiaHealth2025!';
CREATE USER 'niahealth_user'@'localhost' IDENTIFIED WITH mysql_native_password BY 'NiaHealth2025!';
CREATE USER 'niahealth_user'@'%.mshome.net' IDENTIFIED WITH mysql_native_password BY 'NiaHealth2025!';

-- Grant all privileges on the niahealth_new database
GRANT ALL PRIVILEGES ON niahealth_new.* TO 'niahealth_user'@'%';
GRANT ALL PRIVILEGES ON niahealth_new.* TO 'niahealth_user'@'localhost';
GRANT ALL PRIVILEGES ON niahealth_new.* TO 'niahealth_user'@'%.mshome.net';

-- Flush privileges to apply changes
FLUSH PRIVILEGES;

-- Use the new database for subsequent commands
USE niahealth_new;

-- Show that we've successfully created everything
SELECT 'Database and user setup complete!' as Status;
SHOW DATABASES LIKE 'niahealth_new';

-- Show the users we created
SELECT user, host, plugin FROM mysql.user WHERE user = 'niahealth_user';