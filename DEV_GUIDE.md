# NiaHealth Project - Development Guide

## Project Overview

NiaHealth is a full-stack community health monitoring and referral system built with:
- **Frontend**: React 18 + TailwindCSS + Vite
- **Backend**: Node.js + Express.js
- **Database**: MySQL 8
- **Authentication**: JWT + bcrypt
- **Email**: Nodemailer

---

## Quick Start

### 1. Automated Setup (Recommended)

Run the setup script:
```powershell
.\setup.ps1
```

### 2. Manual Setup

**Backend:**
```powershell
cd backend
npm install
cp .env.example .env
# Edit .env with your settings
npm run dev
```

**Frontend:**
```powershell
cd frontend
npm install
npm run dev
```

**Database:**
```powershell
mysql -u root -p
CREATE DATABASE niahealth;
USE niahealth;
SOURCE docs/DB_SCHEMA.sql;
```

---

## Project Structure

```
NiaHealth/
├── backend/                 # Backend API
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API routes
│   │   └── app.js          # Express app
│   ├── server.js           # Entry point
│   └── package.json
│
├── frontend/               # React frontend
│   ├── src/
│   │   ├── api/           # API integration
│   │   ├── components/    # React components
│   │   ├── contexts/      # React contexts
│   │   ├── pages/         # Page components
│   │   ├── App.jsx        # Main app
│   │   └── main.jsx       # Entry point
│   └── package.json
│
├── docs/                   # Documentation
│   ├── API_SPEC.md        # API documentation
│   ├── DB_SCHEMA.sql      # Database schema
│   ├── DATA_DICTIONARY.md # Database documentation
│   ├── SYSTEM_DESIGN.md   # System architecture
│   └── INSTALLATION.md    # Setup guide
│
├── logs/                   # Application logs
├── backups/               # Database backups
└── README.md              # Project readme
```

---

## Development Commands

### Backend

```powershell
# Development with auto-restart
npm run dev

# Production
npm start

# Run tests
npm test
```

### Frontend

```powershell
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

---

## API Endpoints

### Authentication
- `POST /api/auth/register/patient` - Register patient
- `POST /api/auth/login/patient` - Patient login
- `POST /api/auth/login/health-worker` - Worker login
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout

### Patients
- `GET /api/patients/profile` - Get profile
- `PUT /api/patients/profile` - Update profile
- `PUT /api/patients/change-password` - Change password
- `GET /api/patients/statistics` - Get statistics

### Appointments
- `POST /api/appointments` - Create appointment
- `GET /api/appointments/my-appointments` - Get my appointments
- `GET /api/appointments/:id` - Get appointment by ID
- `DELETE /api/appointments/:id/cancel` - Cancel appointment
- `PATCH /api/appointments/:id/status` - Update status (worker/admin)
- `GET /api/appointments/clinic/:clinic_id` - Get clinic appointments

### Referrals
- `POST /api/referrals` - Create referral (worker/admin)
- `GET /api/referrals/my-referrals` - Get my referrals
- `GET /api/referrals/:id` - Get referral by ID
- `PATCH /api/referrals/:id/status` - Update status
- `GET /api/referrals/clinic/:clinic_id` - Get clinic referrals
- `GET /api/referrals/all` - Get all referrals (admin)

### Clinics
- `GET /api/clinics` - Get all clinics
- `GET /api/clinics/:id` - Get clinic by ID
- `POST /api/clinics` - Create clinic (admin)
- `PUT /api/clinics/:id` - Update clinic (admin)
- `DELETE /api/clinics/:id` - Delete clinic (admin)

### Admin
- `GET /api/admin/dashboard/stats` - Dashboard statistics
- `GET /api/admin/dashboard/analytics` - Analytics data
- `GET /api/admin/patients` - Get all patients
- `GET /api/admin/health-workers` - Get all workers
- `POST /api/admin/alerts` - Create health alert
- `GET /api/admin/alerts` - Get all alerts
- `GET /api/admin/audit-logs` - Get audit logs
- `PATCH /api/admin/users/status` - Update user status

### Feedback
- `POST /api/feedback` - Submit feedback
- `GET /api/feedback` - Get all feedback (admin)
- `PATCH /api/feedback/:id` - Update feedback status (admin)

---

## Database Schema

### Main Tables
- `patients` - Patient information
- `clinics` - Clinic information
- `health_workers` - Staff and admin accounts
- `appointments` - Appointment bookings
- `referrals` - Patient referrals
- `alerts` - Health alerts and campaigns
- `audit_logs` - System activity logs
- `feedback` - User feedback
- `refresh_tokens` - JWT refresh tokens

See `docs/DB_SCHEMA.sql` for complete schema.

---

## Environment Variables

### Backend (.env)

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=niahealth

# JWT
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_EXPIRES_IN=30m
JWT_REFRESH_EXPIRES_IN=7d

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Application
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:5000/api
```

---

## Testing

### Manual Testing

1. **Register a patient**:
```powershell
curl -X POST http://localhost:5000/api/auth/register/patient `
  -H "Content-Type: application/json" `
  -d '{"name":"Test User","email":"test@test.com","password":"Test@123","phone":"254712345678","dob":"1990-01-01","gender":"Male"}'
```

2. **Login**:
```powershell
curl -X POST http://localhost:5000/api/auth/login/patient `
  -H "Content-Type: application/json" `
  -d '{"email":"test@test.com","password":"Test@123"}'
```

3. **Health Check**:
```powershell
curl http://localhost:5000/health
```

---

## Security Best Practices

1. **Never commit .env files**
2. **Use strong JWT secrets** (minimum 32 characters)
3. **Enable HTTPS** in production
4. **Regular security updates** for dependencies
5. **Database backups** (daily recommended)
6. **Monitor audit logs** for suspicious activity
7. **Rate limiting** enabled by default
8. **Input validation** on all endpoints

---

## Common Issues

### Port Already in Use
```powershell
# Find process using port
netstat -ano | findstr :5000

# Kill process
taskkill /PID <PID> /F
```

### Database Connection Failed
- Check MySQL is running
- Verify credentials in .env
- Check database exists

### Email Not Sending
- Use Gmail App Password (not regular password)
- Enable 2FA for Gmail account
- Check spam folder

### CORS Errors
- Verify FRONTEND_URL in backend .env
- Check proxy settings in vite.config.js

---

## Contributing

1. Create feature branch: `git checkout -b feature/amazing-feature`
2. Commit changes: `git commit -m 'Add amazing feature'`
3. Push to branch: `git push origin feature/amazing-feature`
4. Open Pull Request

---

## License

MIT License - See LICENSE file for details

---

## Support

- **Documentation**: Check `docs/` folder
- **Issues**: Open GitHub issue
- **Email**: support@niahealth.com

---

## Authors

- **OgayoTK1** - Initial development

---

**Happy Coding! 🚀**
