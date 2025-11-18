#!/bin/bash
# Configure MySQL to accept connections from Windows host

echo "Configuring MySQL to accept Windows connections..."

# Get WSL IP
WSL_IP=$(hostname -I | awk '{print $1}')
echo "WSL IP: $WSL_IP"

# Allow root from any host (for development only)
mysql -u root -pandrew@2025 <<EOF
CREATE USER IF NOT EXISTS 'root'@'%' IDENTIFIED WITH mysql_native_password BY 'andrew@2025';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;
SELECT user, host FROM mysql.user WHERE user='root';
EOF

# Configure MySQL to bind to all interfaces
echo "Updating MySQL configuration..."
sudo sed -i 's/^bind-address.*/bind-address = 0.0.0.0/' /etc/mysql/mysql.conf.d/mysqld.cnf
sudo sed -i 's/^mysqlx-bind-address.*/mysqlx-bind-address = 0.0.0.0/' /etc/mysql/mysql.conf.d/mysqld.cnf

# Restart MySQL
sudo service mysql restart
sleep 2

echo ""
echo "MySQL configured to accept external connections"
echo "WSL IP: $WSL_IP"
echo "Update backend/.env with: DB_HOST=$WSL_IP"
