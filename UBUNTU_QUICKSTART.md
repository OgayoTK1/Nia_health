# 🚀 Ubuntu WSL2 NiaHealth - Quick Start Guide

## ✅ Installation Complete!

Your Ubuntu WSL2 environment has everything installed:
- ✅ Node.js v20.19.5
- ✅ npm 10.8.2  
- ✅ MySQL Server 8.0.43
- ✅ All backend and frontend dependencies

---

## 📋 Step 1: Reset MySQL Root Password (Important!)

Since MySQL was installed with a password, we need to reset it. Run these commands in Ubuntu:

```bash
# Enter WSL Ubuntu terminal
wsl

# Stop MySQL
sudo /etc/init.d/mysql stop

# Start MySQL without password verification
sudo mysqld_safe --skip-grant-tables &

# Wait 2-3 seconds, then connect
mysql -u root

# Run these commands in MySQL:
FLUSH PRIVILEGES;
ALTER USER 'root'@'localhost' IDENTIFIED BY '';
EXIT;

# Kill the MySQL safe process and restart normal
sudo killall mysqld
sudo /etc/init.d/mysql start
```

After this, you should be able to run:
```bash
mysql -u root
```

---

## 📋 Step 2: Create the Database

Once MySQL is accessible, run:

```bash
# Navigate to project directory
cd /mnt/c/Users/user/Desktop/Summative\ Assigment/Nia_health

# Create database
mysql -u root -e "CREATE DATABASE IF NOT EXISTS niahealth CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Import schema
mysql -u root niahealth < docs/DB_SCHEMA.sql

# Verify database was created
mysql -u root -e "SHOW DATABASES LIKE 'niahealth';"
mysql -u root -e "USE niahealth; SHOW TABLES;"
```

---

## 🚀 Step 3: Start the Application

### Terminal 1 - Backend:
```bash
cd /mnt/c/Users/user/Desktop/Summative\ Assigment/Nia_health
cd backend
npm run dev
```

The backend will start on: **http://localhost:5000**

### Terminal 2 - Frontend (Open NEW WSL terminal):
```bash
cd /mnt/c/Users/user/Desktop/Summative\ Assigment/Nia_health
cd frontend
npm run dev
```

The frontend will start on: **http://localhost:5173**

### Terminal 3 - Keep MySQL Running (if not as service):
```bash
wsl
sudo service mysql start
```

---

## 🌐 Access Your Application

Open your browser and go to:
```
http://localhost:5173
```

You should see the NiaHealth home page with login and register options.

---

## 📝 First Time Setup

1. **Register as a Patient:**
   - Click "Sign Up"
   - Fill in your details
   - You'll receive an OTP email (check spam folder)
   - Verify your OTP
   - You're now registered!

2. **Login:**
   - Use your email and password
   - You'll be logged in and see the patient dashboard

3. **Register as a Health Worker:**
   - Same process, but select "Health Worker" during registration
   - Health workers can manage patients and create referrals

---

## 🔧 Troubleshooting

### MySQL Access Denied
If you get "Access denied for user 'root'@'localhost'":
```bash
# In WSL Ubuntu, run:
sudo mysql -u root
# Then in MySQL:
FLUSH PRIVILEGES;
ALTER USER 'root'@'localhost' IDENTIFIED BY '';
# Then exit and restart MySQL
sudo service mysql restart
```

### Backend Port 5000 Already in Use
```bash
# Find what's using port 5000
sudo lsof -i :5000
# Kill the process
kill -9 <PID>
```

### Frontend Port 5173 Already in Use
```bash
# Change port in frontend/vite.config.js
# Or kill the process using it
sudo lsof -i :5173
kill -9 <PID>
```

### MySQL Service Won't Start
```bash
# Check MySQL service status
sudo /etc/init.d/mysql status

# Restart it
sudo /etc/init.d/mysql restart

# Or use systemctl
sudo systemctl restart mysql
```

---

## 📂 Project Structure in WSL

```
/mnt/c/Users/user/Desktop/Summative\ Assigment/Nia_health/
├── backend/          # Node.js/Express API
│   ├── src/
│   ├── server.js
│   └── package.json
├── frontend/         # React + Vite
│   ├── src/
│   ├── vite.config.js
│   └── package.json
├── docs/            # Documentation
│   ├── API_SPEC.md
│   ├── DB_SCHEMA.sql
│   └── ...
└── ...
```

---

## 🎯 Next Steps

1. ✅ Reset MySQL root password
2. ✅ Create database and import schema
3. ✅ Start backend and frontend
4. ✅ Test the application
5. ✅ Start building features!

---

## 💡 Tips

- Keep WSL terminal running with MySQL service in background
- Use multiple WSL tabs/windows for backend, frontend, and MySQL
- All code files are synced between Windows and WSL
- Edit files in Windows VS Code, run in WSL

---

**Happy Coding! 🚀**

For more details, check:
- `docs/INSTALLATION.md` - Full installation guide
- `docs/API_SPEC.md` - API documentation
- `docs/SYSTEM_DESIGN.md` - Architecture documentation
