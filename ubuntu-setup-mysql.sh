#!/bin/bash
# Simple script to set up NiaHealth on Ubuntu WSL - Run this FIRST

echo "🔧 NiaHealth MySQL Setup for Ubuntu WSL"
echo "=========================================="
echo ""
echo "  IMPORTANT: This script needs sudo access"
echo ""
echo "Step 1: Stopping MySQL..."
sudo /etc/init.d/mysql stop

echo "Step 2: Starting MySQL in safe mode (no password check)..."
sudo mysqld_safe --skip-grant-tables > /dev/null 2>&1 &
MYSQLD_PID=$!
sleep 3

echo "Step 3: Resetting root password..."
mysql -u root << EOF
FLUSH PRIVILEGES;
ALTER USER 'root'@'localhost' IDENTIFIED BY '';
EXIT;
EOF

echo "Step 4: Killing safe mode MySQL..."
sudo killall mysqld
sleep 2

echo "Step 5: Restarting MySQL normally..."
sudo /etc/init.d/mysql start
sleep 3

echo "Step 6: Creating NiaHealth database..."
mysql -u root << EOF
CREATE DATABASE IF NOT EXISTS niahealth CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EOF

if [ $? -eq 0 ]; then
    echo " Database created!"
    
    # Find the SQL file - handle both Windows and WSL paths
    SCHEMA_FILE=""
    if [ -f "docs/DB_SCHEMA.sql" ]; then
        SCHEMA_FILE="docs/DB_SCHEMA.sql"
    elif [ -f "/mnt/c/Users/user/Desktop/Summative Assigment/Nia_health/docs/DB_SCHEMA.sql" ]; then
        SCHEMA_FILE="/mnt/c/Users/user/Desktop/Summative Assigment/Nia_health/docs/DB_SCHEMA.sql"
    fi
    
    if [ -n "$SCHEMA_FILE" ]; then
        echo "Step 7: Importing schema from $SCHEMA_FILE..."
        mysql -u root niahealth < "$SCHEMA_FILE"
        
        if [ $? -eq 0 ]; then
            echo " Schema imported successfully!"
            echo ""
            echo " Setup complete!"
            echo ""
            echo "You can now run:"
            echo "  cd backend && npm run dev   (Backend on port 5000)"
            echo "  cd frontend && npm run dev  (Frontend on port 5173)"
        else
            echo " Failed to import schema"
        fi
    else
        echo " Schema file not found"
    fi
else
    echo " Failed to create database"
fi

echo ""
echo "Verifying database..."
mysql -u root -e "USE niahealth; SELECT COUNT(*) as 'Tables' FROM information_schema.tables WHERE table_schema='niahealth';"
