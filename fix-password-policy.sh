#!/bin/bash
# Fix MySQL password policy for development

echo "Fixing MySQL password policy..."

mysql -u root -pandrew@2025 <<EOF
-- Check current password validation settings
SHOW VARIABLES LIKE 'validate_password%';

-- Disable password validation temporarily (for development)
SET GLOBAL validate_password.policy = LOW;
SET GLOBAL validate_password.length = 4;
SET GLOBAL validate_password.number_count = 0;
SET GLOBAL validate_password.mixed_case_count = 0;
SET GLOBAL validate_password.special_char_count = 0;

-- Show updated settings
SHOW VARIABLES LIKE 'validate_password%';

-- Now we can create users with simpler passwords
CREATE USER IF NOT EXISTS 'root'@'%' IDENTIFIED WITH mysql_native_password BY 'andrew@2025';
CREATE USER IF NOT EXISTS 'root'@'OGAYOANDREW-A288TR.mshome.net' IDENTIFIED WITH mysql_native_password BY 'andrew@2025';
CREATE USER IF NOT EXISTS 'root'@'%.mshome.net' IDENTIFIED WITH mysql_native_password BY 'andrew@2025';

-- Grant privileges
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;
GRANT ALL PRIVILEGES ON *.* TO 'root'@'OGAYOANDREW-A288TR.mshome.net' WITH GRANT OPTION;
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%.mshome.net' WITH GRANT OPTION;

FLUSH PRIVILEGES;

-- Show all root users
SELECT user, host FROM mysql.user WHERE user='root';
EOF

echo "Password policy fixed and users created!"
