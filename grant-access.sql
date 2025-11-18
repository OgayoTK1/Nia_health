SET GLOBAL validate_password.length = 6;
SET GLOBAL validate_password.policy = LOW;
CREATE USER IF NOT EXISTS 'root'@'OGAYOANDREW-A288TR.mshome.net' IDENTIFIED WITH mysql_native_password BY 'andrew@2025';
CREATE USER IF NOT EXISTS 'root'@'%.mshome.net' IDENTIFIED WITH mysql_native_password BY 'andrew@2025';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'OGAYOANDREW-A288TR.mshome.net' WITH GRANT OPTION;
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%.mshome.net' WITH GRANT OPTION;
FLUSH PRIVILEGES;
SELECT user, host FROM mysql.user WHERE user='root';
