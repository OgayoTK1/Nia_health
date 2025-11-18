#!/bin/bash
# Complete MySQL setup for NiaHealth - fixes auth and creates database
set -e

echo "=================================="
echo "NiaHealth MySQL Complete Setup"
echo "=================================="
echo ""

PASSWORD="andrew@2025"
DB_NAME="niahealth"

# Step 1: Stop MySQL
echo "[1/7] Stopping MySQL service..."
sudo service mysql stop
sleep 2

# Step 2: Start MySQL in safe mode
echo "[2/7] Starting MySQL in safe mode (no auth)..."
sudo mkdir -p /var/run/mysqld
sudo chown mysql:mysql /var/run/mysqld
sudo mysqld_safe --skip-grant-tables --skip-networking &
SAFE_PID=$!
sleep 5

# Step 3: Reset root password
echo "[3/7] Resetting root password..."
mysql -u root <<EOF
FLUSH PRIVILEGES;
SET GLOBAL validate_password.policy = LOW;
SET GLOBAL validate_password.length = 6;
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '$PASSWORD';
FLUSH PRIVILEGES;
EOF

if [ $? -eq 0 ]; then
    echo "✓ Root password set successfully"
else
    echo "✗ Failed to set password"
    sudo kill $SAFE_PID 2>/dev/null || true
    exit 1
fi

# Step 4: Stop safe mode
echo "[4/7] Stopping safe mode MySQL..."
sudo kill $SAFE_PID 2>/dev/null || sudo killall mysqld || true
sleep 3

# Step 5: Start MySQL normally
echo "[5/7] Starting MySQL service normally..."
sudo service mysql start
sleep 3

# Step 6: Verify login works
echo "[6/7] Verifying root login..."
mysql -u root -p"$PASSWORD" -e "SELECT VERSION() AS mysql_version, USER() AS current_user;" || {
    echo "✗ Login verification failed"
    exit 1
}
echo "✓ Login successful"

# Step 7: Create database and import schema
echo "[7/7] Creating database and importing schema..."
mysql -u root -p"$PASSWORD" <<EOF
CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
SHOW DATABASES LIKE '$DB_NAME';
EOF

# Find schema file
SCHEMA_FILE=""
if [ -f "docs/DB_SCHEMA.sql" ]; then
    SCHEMA_FILE="docs/DB_SCHEMA.sql"
elif [ -f "/mnt/c/Users/user/Desktop/Summative Assigment/Nia_health/docs/DB_SCHEMA.sql" ]; then
    SCHEMA_FILE="/mnt/c/Users/user/Desktop/Summative Assigment/Nia_health/docs/DB_SCHEMA.sql"
fi

if [ -n "$SCHEMA_FILE" ] && [ -f "$SCHEMA_FILE" ]; then
    echo "Importing schema from $SCHEMA_FILE..."
    mysql -u root -p"$PASSWORD" "$DB_NAME" < "$SCHEMA_FILE"
    echo "✓ Schema imported"
    
    # Verify tables
    echo ""
    echo "Database tables:"
    mysql -u root -p"$PASSWORD" -e "USE $DB_NAME; SHOW TABLES;"
else
    echo "⚠ Schema file not found, database created but empty"
fi

echo ""
echo "=================================="
echo "✓ MySQL Setup Complete!"
echo "=================================="
echo ""
echo "Connection details:"
echo "  Host: 127.0.0.1"
echo "  Port: 3306"
echo "  User: root"
echo "  Password: $PASSWORD"
echo "  Database: $DB_NAME"
echo ""
echo "Test connection:"
echo "  mysql -u root -p$PASSWORD -e 'USE $DB_NAME; SELECT COUNT(*) FROM patients;'"
echo ""
