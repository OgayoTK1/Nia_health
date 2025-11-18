#!/bin/bash
set -e
echo "[MySQL Root Reset Advanced] Starting..."

# Ensure run directory exists with correct ownership
sudo mkdir -p /var/run/mysqld
sudo chown mysql:mysql /var/run/mysqld

# Stop service
sudo service mysql stop || true

# Start mysqld with explicit datadir and pid
echo "Starting mysqld (no grants, no networking)..."
sudo -u mysql mysqld --skip-grant-tables --skip-networking --datadir=/var/lib/mysql --pid-file=/var/run/mysqld/mysqld.pid >/tmp/mysqld.reset.log 2>&1 &

# Wait for socket to be ready
for i in {1..10}; do
  if [ -S /var/run/mysqld/mysqld.sock ] || [ -S /var/lib/mysql/mysql.sock ]; then
    break
  fi
  sleep 1
done

# Try connecting using default socket
echo "Resetting root password to empty..."
mysql -u root <<'EOF'
FLUSH PRIVILEGES;
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '';
FLUSH PRIVILEGES;
EOF

# Cleanup and restart
echo "Stopping temporary mysqld..."
sudo kill $(cat /var/run/mysqld/mysqld.pid) || sudo killall mysqld || true
sleep 2

sudo service mysql start
sleep 2

echo "Verifying..."
mysql -u root -e "SELECT USER(), VERSION();"

echo "[MySQL Root Reset Advanced] Done."