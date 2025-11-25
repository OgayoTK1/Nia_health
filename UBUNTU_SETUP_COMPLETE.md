#  NiaHealth Ubuntu WSL2 Setup - Summary

##  What Has Been Installed

Your Ubuntu WSL2 environment is **fully prepared** with:

| Component | Version | Status |
|-----------|---------|--------|
| Node.js | 20.19.5 |  Installed |
| npm | 10.8.2 |  Installed |
| MySQL Server | 8.0.43 |  Installed & Running |
| Backend Dependencies | All |  Installed (456 packages) |
| Frontend Dependencies | All |  Installed (406 packages) |

---

##  Next: Quick Start (3 Simple Steps)

### **Step 1: Fix MySQL Root Access (Run Once)**

Open PowerShell and run:
```powershell
wsl bash ubuntu-setup-mysql.sh
```

This script will:
- Reset MySQL root password
- Create the `niahealth` database
- Import the database schema
- Verify everything is working

**Wait for it to complete** (should take ~1-2 minutes)

---

### **Step 2: Start Backend**

In WSL Ubuntu terminal, run:
```bash
cd /mnt/c/Users/user/Desktop/Summative\ Assigment/Nia_health/backend
npm run dev
```

You should see:
```
✓ Backend server running on http://localhost:5000
```

---

### **Step 3: Start Frontend**

In a **NEW** WSL Ubuntu terminal, run:
```bash
cd /mnt/c/Users/user/Desktop/Summative\ Assigment/Nia_health/frontend
npm run dev
```

You should see:
```
✓ Frontend running on http://localhost:5173
```

---

##  Access Your Application

**Open your browser and go to:**
```
http://localhost:5173
```

You'll see the NiaHealth application with:
- Home page with hero section
- Login/Register buttons
- Navigation menu

---

##  First Time Usage

### Create a Patient Account:
1. Click **"Sign Up"** button
2. Select **"Patient"** as user type
3. Fill in your details:
   - Name
   - Email
   - Password (minimum 8 characters, 1 uppercase, 1 number)
   - Phone
   - Date of Birth
   - Gender
4. Click **"Register"**
5. You'll receive an **OTP email** (might be in spam)
6. Enter the OTP to verify
7. Done! You can now login

### Create a Health Worker Account:
Same as above, but select **"Health Worker"** instead

---

##  Important Files & Directories

```
Nia_health/
├── backend/              # Express.js API
│   ├── src/
│   │   ├── controllers/  # Business logic
│   │   ├── routes/       # API endpoints
│   │   ├── middleware/   # Auth, validation, etc.
│   │   └── config/       # DB, Email config
│   └── server.js         # Entry point
│
├── frontend/             # React + Vite
│   ├── src/
│   │   ├── pages/        # Page components
│   │   ├── components/   # Reusable components
│   │   ├── contexts/     # Auth context
│   │   └── api/          # API client
│   └── vite.config.js    # Build config
│
├── docs/                 # Documentation
│   ├── API_SPEC.md       # 42+ API endpoints
│   ├── DB_SCHEMA.sql     # Database schema
│   └── SYSTEM_DESIGN.md  # Architecture
│
└── UBUNTU_QUICKSTART.md  # This quick start guide
```

---

##  Backend Port 5000

**API Base URL:** `http://localhost:5000/api`

Example endpoints:
- `POST /api/auth/register/patient` - Register patient
- `POST /api/auth/login/patient` - Login
- `GET /api/patients/profile` - Get profile
- `POST /api/appointments` - Create appointment
- See `docs/API_SPEC.md` for all 42+ endpoints

---

##  Frontend Port 5173

**Access:** `http://localhost:5173`

Pages available:
- `/` - Home page
- `/login` - Login page
- `/register` - Registration page
- `/dashboard` - Patient dashboard (after login)

---

##  Database

**Database Name:** `niahealth`

**Tables:** 9 main tables
- `patients` - Patient profiles
- `clinics` - Clinic information
- `health_workers` - Staff and admins
- `appointments` - Appointment bookings
- `referrals` - Patient referrals
- `alerts` - Health alerts
- `audit_logs` - Activity logs
- `feedback` - User feedback
- `refresh_tokens` - JWT tokens

**MySQL Connection:**
- Host: `localhost`
- Port: `3306`
- User: `root`
- Password: (empty for development)
- Database: `niahealth`

---

## 🔧 Troubleshooting

### Backend won't start
```bash
# Check if port 5000 is in use
sudo lsof -i :5000

# Kill the process if needed
kill -9 <PID>

# Try again
npm run dev
```

### Frontend won't start
```bash
# Check if port 5173 is in use
sudo lsof -i :5173

# Kill the process if needed
kill -9 <PID>

# Try again
npm run dev
```

### MySQL connection error
```bash
# Check MySQL status
sudo /etc/init.d/mysql status

# Restart MySQL
sudo /etc/init.d/mysql restart

# Test connection
mysql -u root -e "SELECT 1;"
```

### "Database not found" error
1. Make sure MySQL is running: `sudo /etc/init.d/mysql status`
2. Check database exists: `mysql -u root -e "SHOW DATABASES;"`
3. If not, run the setup script again: `wsl bash ubuntu-setup-mysql.sh`

---

##  Documentation

- **`UBUNTU_QUICKSTART.md`** - Ubuntu setup guide (you are here)
- **`DEV_GUIDE.md`** - Development guide
- **`docs/API_SPEC.md`** - Complete API documentation
- **`docs/INSTALLATION.md`** - Installation instructions
- **`docs/SYSTEM_DESIGN.md`** - Architecture documentation
- **`docs/DB_SCHEMA.sql`** - Database schema with tables, views, procedures
- **`README.md`** - Project overview

---

## 🎓 Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│              Browser (Port 5173)                    │
│                  React + Vite                       │
└────────────┬────────────────────────────────────────┘
             │ HTTP Requests (Axios)
             │
┌────────────▼────────────────────────────────────────┐
│         Backend API Server (Port 5000)              │
│              Express.js + Node.js                   │
│  ┌──────────────────────────────────────────────┐   │
│  │ Routes → Controllers → Services → Database   │   │
│  └──────────────────────────────────────────────┘   │
└────────────┬────────────────────────────────────────┘
             │ SQL Queries
             │
┌────────────▼────────────────────────────────────────┐
│           MySQL Database (Port 3306)                │
│              niahealth Database                     │
│  9 Tables, Views, Procedures, Events               │
└─────────────────────────────────────────────────────┘
```

---

##  Checklist for Full Setup

- [ ] Run `wsl bash ubuntu-setup-mysql.sh` (MySQL setup)
- [ ] Verify database created: `mysql -u root -e "SHOW DATABASES;"`
- [ ] Start backend: `npm run dev` in `backend/` folder
- [ ] Start frontend: `npm run dev` in `frontend/` folder
- [ ] Open browser to `http://localhost:5173`
- [ ] Register a test account
- [ ] Login successfully
- [ ] See dashboard
- [ ] Start developing! 

---

##  What You Can Do Now

1. **Register & Login** - Test authentication system
2. **View Profile** - See your patient information
3. **Book Appointments** - Schedule appointments at clinics
4. **View Dashboard** - See your appointments and referrals
5. **Send Feedback** - Submit feedback about the system
6. **Admin Features** - Switch to admin role to see analytics

---

##  Support

If you encounter issues:

1. Check the **Troubleshooting** section above
2. Review the documentation in `docs/` folder
3. Check MySQL/backend/frontend are all running
4. Verify ports aren't blocked (5000, 5173, 3306)
5. Check for error messages in terminal

---

##  You're Ready!

Everything is installed and configured. Just run the MySQL setup script once, then you can start developing!

**Run this command in PowerShell to begin:**
```powershell
wsl bash ubuntu-setup-mysql.sh
```

Then follow the "Quick Start" steps above.

