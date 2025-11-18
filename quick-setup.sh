#!/bin/bash

# Quick database setup script for Ubuntu/WSL
echo "Setting up NiaHealth database on Ubuntu..."

# Start MySQL if not already running
sudo service mysql start

# Wait a moment for MySQL to start
sleep 2

# Create database
mysql -u root -e "CREATE DATABASE IF NOT EXISTS niahealth CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Check if schema exists and import it
if [ -f "docs/DB_SCHEMA.sql" ]; then
    echo "Importing database schema..."
    mysql -u root niahealth < docs/DB_SCHEMA.sql
    echo "Database setup complete!"
else
    echo "Schema file not found. Make sure you're in the project root directory."
fi

# Display database info
echo ""
echo "Checking database..."
mysql -u root -e "SHOW DATABASES LIKE 'niahealth';"
