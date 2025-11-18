# NiaHealth - Setup and Installation Guide

## Quick Setup Script

This guide will help you set up the complete NiaHealth application on your local machine.

### Prerequisites

Before you begin, ensure you have the following installed:
- Node.js 20 or higher
- MySQL 8 or higher
- npm or yarn package manager
- Git

### Step 1: Database Setup

1. **Start MySQL server**
   ```powershell
   # Check if MySQL is running
   Get-Service -Name MySQL*
   ```

2. **Create database**
   ```powershell
   mysql -u root -p
   ```
   
   In MySQL console:
   ```sql
   CREATE DATABASE niahealth;
   USE niahealth;
   SOURCE docs/DB_SCHEMA.sql;
   EXIT;
   ```

3. **Verify database creation**
   ```powershell
   mysql -u root -p -e "SHOW TABLES FROM niahealth;"
   ```

### Step 2: Backend Setup

1. **Navigate to backend directory**
   ```powershell
   cd backend
   ```

2. **Install dependencies**
   ```powershell
   npm install
   ```

3. **Create environment file**
   ```powershell
   cp .env.example .env
   ```

4. **Edit .env file** with your settings:
   ```
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=niahealth
   JWT_SECRET=your_secret_key_here
   JWT_REFRESH_SECRET=your_refresh_secret_here
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_app_password
   FRONTEND_URL=http://localhost:5173
   ```

5. **Start backend server**
   ```powershell
   npm run dev
   ```

   You should see:
   ```
   ✅ Database connected successfully
   ✅ Email service configured successfully
   🚀 Server running on port 5000
   ```

### Step 3: Frontend Setup

1. **Open new terminal and navigate to frontend**
   ```powershell
   cd frontend
   ```

2. **Install dependencies**
   ```powershell
   npm install
   ```

3. **Start frontend development server**
   ```powershell
   npm run dev
   ```

   You should see:
   ```
   VITE v5.0.0  ready in 500 ms
   ➜  Local:   http://localhost:5173/
   ```

### Step 4: Access Application

Open your browser and navigate to:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

### Step 5: Create Admin Account

Run this SQL command to create an admin account:

```sql
USE niahealth;

-- Create admin account
-- Password will be: Admin@123
INSERT INTO health_workers (name, email, phone, clinic_id, role, password_hash, is_verified)
VALUES (
  'System Admin',
  'admin@niahealth.com',
  '+254700000000',
  1,
  'admin',
  '$2b$10$rBV2KfY.7QHVqZ7fK4H5H.YRJxEP5A5vWZLW9Np2qE4f5G6H7I8J9',
  TRUE
);
```

You can now login with:
- Email: admin@niahealth.com
- Password: Admin@123

### Troubleshooting

#### Database Connection Issues
```powershell
# Check MySQL service
Get-Service -Name MySQL*

# Start MySQL if stopped
Start-Service -Name MySQL80

# Test connection
mysql -u root -p -e "SELECT 1;"
```

#### Port Already in Use
```powershell
# Find process using port 5000
netstat -ano | findstr :5000

# Kill process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

#### Email Configuration
For Gmail, you need to:
1. Enable 2-Factor Authentication
2. Create an App Password
3. Use the App Password in .env file

### Testing the Application

1. **Health Check**
   ```powershell
   curl http://localhost:5000/health
   ```

2. **Register a patient**
   ```powershell
   curl -X POST http://localhost:5000/api/auth/register/patient `
     -H "Content-Type: application/json" `
     -d '{
       \"name\": \"Test Patient\",
       \"email\": \"test@example.com\",
       \"password\": \"Test@123\",
       \"phone\": \"254712345678\",
       \"dob\": \"1990-01-01\",
       \"gender\": \"Male\"
     }'
   ```

3. **Check database**
   ```powershell
   mysql -u root -p niahealth -e "SELECT id, name, email FROM patients;"
   ```

### Next Steps

1. Create additional clinic records
2. Register health workers
3. Test appointment booking
4. Test referral creation
5. Test email notifications

### Development Workflow

**Backend Development:**
```powershell
cd backend
npm run dev  # Auto-restarts on file changes
```

**Frontend Development:**
```powershell
cd frontend
npm run dev  # Hot reload enabled
```

**Running Both:**
```powershell
# Terminal 1
cd backend; npm run dev

# Terminal 2
cd frontend; npm run dev
```

### Building for Production

**Backend:**
```powershell
cd backend
npm start
```

**Frontend:**
```powershell
cd frontend
npm run build
npm run preview
```

### Database Backup

Create regular backups:
```powershell
# Create backup
mysqldump -u root -p niahealth > backups/backup_$(Get-Date -Format "yyyyMMdd_HHmmss").sql

# Restore from backup
mysql -u root -p niahealth < backups/backup_20251112_120000.sql
```

### Environment Variables Reference

**Backend (.env):**
```
# Server
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=niahealth
DB_PORT=3306

# JWT
JWT_SECRET=your_jwt_secret_minimum_32_characters
JWT_REFRESH_SECRET=your_refresh_secret_minimum_32_characters
JWT_EXPIRES_IN=30m
JWT_REFRESH_EXPIRES_IN=7d

# Email (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM="NiaHealth <noreply@niahealth.com>"

# Security
ENCRYPTION_KEY=your_32_character_encryption_key
SESSION_TIMEOUT=1800000

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
LOGIN_RATE_LIMIT_MAX=5

# Application
FRONTEND_URL=http://localhost:5173
```

**Frontend (.env):**
```
VITE_API_URL=http://localhost:5000/api
```

### Common Issues and Solutions

1. **"Cannot find module" errors**
   ```powershell
   # Delete node_modules and reinstall
   rm -rf node_modules
   npm install
   ```

2. **Database connection timeout**
   - Check MySQL is running
   - Verify credentials in .env
   - Check firewall settings

3. **Email not sending**
   - Verify email credentials
   - Check spam folder
   - Enable "Less secure app access" (Gmail)

4. **CORS errors**
   - Verify FRONTEND_URL in backend .env
   - Check proxy settings in vite.config.js

### Getting Help

- Check logs: `backend/logs/error.log`
- Review API docs: `docs/API_SPEC.md`
- Check database: Run SQL queries to inspect data

---

**Setup Complete! 🎉**

Your NiaHealth application should now be running successfully.
