#!/bin/bash
# Reset MySQL root password to empty and restart server (WSL Ubuntu)
set -e
echo "[MySQL Root Reset] Starting..."

echo "Stopping MySQL service if running..."
sudo service mysql stop || true

echo "Starting mysqld in skip-grant-tables mode..."
nohup sudo mysqld --skip-grant-tables --skip-networking >/dev/null 2>&1 &
sleep 3

echo "Connecting without password to reset root credentials..."
mysql -u root <<'EOF'
FLUSH PRIVILEGES;
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '';
FLUSH PRIVILEGES;
EOF

echo "Killing temporary mysqld..."
sudo killall mysqld || true
sleep 2

echo "Restarting normal MySQL service..."
sudo service mysql start
sleep 3

echo "Verifying access with empty password..."
mysql -u root -e "SELECT VERSION() AS mysql_version;"

echo "[MySQL Root Reset] Completed successfully."