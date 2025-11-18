# NiaHealth System Design Document

## 1. Executive Summary

NiaHealth is a comprehensive community health monitoring and referral web application designed to enhance healthcare access in underserved African communities. The system digitizes patient registration, clinic management, appointment scheduling, and referral processes while enabling health alerts via email.

**Key Features:**
- Patient self-registration and appointment booking
- Health worker patient management and referral system
- Admin dashboard with analytics and health alert broadcasting
- Email notifications for appointments, referrals, and alerts
- Role-based access control with JWT authentication
- Audit logging and security features

---

## 2. System Architecture

### 2.1 Architecture Overview

NiaHealth follows a **3-tier architecture**:

```
┌─────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                    │
│            React 18 + TailwindCSS Frontend              │
│              (http://localhost:5173)                    │
└─────────────────────────────────────────────────────────┘
                           │
                           │ HTTP/REST API
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                     │
│          Node.js + Express.js Backend API               │
│              (http://localhost:5000)                    │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐           │
│  │   Auth   │  │ Business │  │ Security │           │
│  │ Service  │  │  Logic   │  │Middleware│           │
│  └──────────┘  └──────────┘  └──────────┘           │
└─────────────────────────────────────────────────────────┘
                           │
                           │ SQL Queries
                           ▼
┌─────────────────────────────────────────────────────────┐
│                      DATA LAYER                          │
│                  MySQL 8 Database                        │
│            (InnoDB Storage Engine)                      │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐           │
│  │ Patients │  │ Clinics  │  │Referrals │           │
│  └──────────┘  └──────────┘  └──────────┘           │
└─────────────────────────────────────────────────────────┘
                           │
                           │ SMTP
                           ▼
┌─────────────────────────────────────────────────────────┐
│                   EXTERNAL SERVICES                      │
│            Nodemailer / SendGrid (Email)                │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | React 18 | UI component library |
| Styling | TailwindCSS | Utility-first CSS framework |
| HTTP Client | Axios | API communication |
| Routing | React Router v6 | Client-side routing |
| Backend | Node.js 20 | Runtime environment |
| Framework | Express.js | Web application framework |
| Database | MySQL 8 | Relational database |
| Authentication | JWT + bcrypt | Token-based auth with password hashing |
| Email | Nodemailer | Email service |
| Security | Helmet + express-validator | HTTP security and input validation |
| Rate Limiting | express-rate-limit | DDoS protection |

---

## 3. Database Design

### 3.1 Entity Relationship Diagram

```
┌──────────────┐          ┌──────────────┐          ┌──────────────┐
│   PATIENTS   │          │  APPOINTMENTS │          │   CLINICS    │
├──────────────┤          ├──────────────┤          ├──────────────┤
│ id (PK)      │──────┐   │ id (PK)      │   ┌──────│ id (PK)      │
│ name         │      │   │ patient_id(FK)│   │      │ name         │
│ email (UQ)   │      └───│ clinic_id(FK)─┼───┘      │ location     │
│ password_hash│          │ date         │          │ contact      │
│ phone        │          │ time         │          │ email        │
│ dob          │          │ status       │          │ capacity     │
│ gender       │          │ reason       │          │ is_active    │
│ address      │          └──────────────┘          └──────────────┘
│ is_verified  │                                           │
└──────────────┘                                           │
       │                                                   │
       │                                                   │
       │ 1:N                                           1:N │
       ▼                                                   ▼
┌──────────────┐                                    ┌──────────────┐
│  REFERRALS   │                                    │HEALTH_WORKERS│
├──────────────┤                                    ├──────────────┤
│ id (PK)      │                                    │ id (PK)      │
│ patient_id(FK)│◄────────────────────────────────┼│ clinic_id(FK)│
│ clinic_id(FK)│                                    │ name         │
│ hospital_name│                                    │ email (UQ)   │
│ reason       │                                    │ role         │
│ urgency      │                                    │ password_hash│
│ status       │                                    │ is_active    │
│ created_by(FK)│◄───────────────────────────────────┘              │
└──────────────┘                                    └──────────────┘
       │                                                   │
       │                                                   │ 1:N
       ▼                                                   ▼
┌──────────────┐                                    ┌──────────────┐
│    ALERTS    │                                    │  AUDIT_LOGS  │
├──────────────┤                                    ├──────────────┤
│ id (PK)      │                                    │ id (PK)      │
│ subject      │                                    │ user_id      │
│ message      │                                    │ user_type    │
│ target_group │                                    │ action       │
│ sent_count   │                                    │ entity_type  │
│ created_by(FK)│                                    │ timestamp    │
└──────────────┘                                    └──────────────┘
```

### 3.2 Key Tables

**patients**: Patient demographic and authentication data
**clinics**: Health facility information
**health_workers**: Staff and admin accounts
**appointments**: Appointment bookings and scheduling
**referrals**: Patient referrals to hospitals
**alerts**: Health campaign messages
**audit_logs**: System activity tracking
**refresh_tokens**: JWT refresh token storage
**feedback**: User feedback and suggestions

---

## 4. Security Architecture

### 4.1 Authentication Flow

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   CLIENT    │         │    API      │         │  DATABASE   │
└──────┬──────┘         └──────┬──────┘         └──────┬──────┘
       │                       │                       │
       │ POST /auth/login      │                       │
       ├──────────────────────>│                       │
       │ email + password      │                       │
       │                       │ Query user            │
       │                       ├──────────────────────>│
       │                       │                       │
       │                       │ User data             │
       │                       │<──────────────────────┤
       │                       │                       │
       │                       │ Verify password       │
       │                       │ (bcrypt compare)      │
       │                       │                       │
       │                       │ Generate JWT          │
       │                       │ (access + refresh)    │
       │                       │                       │
       │ Tokens + User data    │                       │
       │<──────────────────────┤                       │
       │                       │                       │
       │ Store in localStorage │                       │
       │                       │                       │
       │ Subsequent requests   │                       │
       ├──────────────────────>│                       │
       │ Authorization: Bearer │                       │
       │ <access_token>        │                       │
       │                       │ Verify JWT            │
       │                       │                       │
       │ Protected resource    │                       │
       │<──────────────────────┤                       │
       │                       │                       │
```

### 4.2 Security Features

1. **Password Security**
   - bcrypt hashing with salt rounds = 10
   - Minimum 8 characters with letters and numbers
   - Password strength validation

2. **JWT Authentication**
   - Access token: 30 minutes expiry
   - Refresh token: 7 days expiry
   - Secure token storage and rotation

3. **Two-Factor Authentication (2FA)**
   - Email-based OTP for health workers
   - 6-digit codes valid for 10 minutes

4. **Rate Limiting**
   - General API: 100 requests per 15 minutes
   - Login endpoint: 5 attempts per 15 minutes
   - OTP requests: 3 attempts per 5 minutes

5. **Account Security**
   - Account lockout after 5 failed login attempts
   - 15-minute lockout duration
   - Automatic unlock after expiry

6. **Input Validation**
   - express-validator for all inputs
   - SQL injection prevention
   - XSS protection via input sanitization

7. **HTTP Security**
   - Helmet middleware for security headers
   - CORS configuration
   - HTTPS ready for production

---

## 5. API Design

### 5.1 RESTful Principles

- **Resource-based URLs**: `/api/patients`, `/api/appointments`
- **HTTP Methods**: GET (read), POST (create), PUT/PATCH (update), DELETE (delete)
- **Status Codes**: 200 (OK), 201 (Created), 400 (Bad Request), 401 (Unauthorized), etc.
- **JSON Responses**: Consistent response format across all endpoints

### 5.2 Response Format

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

### 5.3 Pagination

```json
{
  "success": true,
  "data": [/* items */],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

---

## 6. Frontend Architecture

### 6.1 Component Structure

```
src/
├── api/                   # API integration
│   ├── axios.js          # Axios configuration
│   └── index.js          # API functions
├── components/           # Reusable components
│   ├── common/          # Buttons, Inputs, Cards
│   ├── layout/          # Header, Sidebar, Footer
│   └── forms/           # Form components
├── contexts/            # React contexts
│   └── AuthContext.jsx  # Authentication context
├── pages/               # Page components
│   ├── auth/           # Login, Register
│   ├── patient/        # Patient dashboard
│   ├── worker/         # Health worker dashboard
│   └── admin/          # Admin dashboard
├── utils/               # Utility functions
├── App.jsx              # Main app component
└── main.jsx             # Entry point
```

### 6.2 State Management

- **Local State**: useState for component-specific state
- **Context API**: AuthContext for global authentication state
- **API State**: Direct API calls with loading/error handling

### 6.3 Routing

```javascript
/                    → Home/Landing page
/login               → Login page
/register            → Registration page
/dashboard           → Role-based dashboard
/appointments        → Appointment management
/referrals           → Referral management
/profile             → User profile
/admin               → Admin panel (admin only)
```

---

## 7. Email System

### 7.1 Email Templates

1. **OTP Verification**: 6-digit code for account verification
2. **Appointment Confirmation**: Booking details and clinic information
3. **Referral Notification**: Hospital details and urgency level
4. **Health Alerts**: Campaign messages and health announcements

### 7.2 Email Configuration

**Provider**: Nodemailer with Gmail SMTP
**Format**: HTML emails with responsive design
**Tracking**: Delivery status stored in database

---

## 8. Performance Optimization

### 8.1 Database Optimization

- **Indexes**: Primary keys, foreign keys, frequently queried columns
- **Connection Pooling**: Reuse database connections
- **Prepared Statements**: Prevent SQL injection and improve performance

### 8.2 API Optimization

- **Pagination**: Limit query results
- **Caching**: Static data caching where appropriate
- **Compression**: Response compression in production

### 8.3 Frontend Optimization

- **Code Splitting**: Lazy loading for routes
- **Asset Optimization**: Minification in production
- **Bundle Size**: Tree shaking unused code

---

## 9. Error Handling

### 9.1 Backend Error Handling

- Centralized error handler middleware
- Consistent error response format
- Error logging to file system
- Database logging for critical errors

### 9.2 Frontend Error Handling

- Try-catch blocks for API calls
- User-friendly error messages
- Loading states for async operations
- Fallback UI for errors

---

## 10. Deployment Architecture

### 10.1 Development Environment

```
Frontend: http://localhost:5173
Backend:  http://localhost:5000
Database: localhost:3306
```

### 10.2 Production Deployment

**Backend:**
- Process manager: PM2
- Reverse proxy: Nginx
- SSL: Let's Encrypt
- Environment: Ubuntu Server

**Frontend:**
- Build: `npm run build`
- Hosting: Static file server / CDN
- CDN: Cloudflare (optional)

**Database:**
- Daily backups
- Replication for high availability
- Regular maintenance

---

## 11. Scalability Considerations

### 11.1 Horizontal Scaling

- Load balancer for multiple backend instances
- Database read replicas
- Microservices architecture (future)

### 11.2 Vertical Scaling

- Increase server resources
- Database optimization
- Query caching

---

## 12. Monitoring and Maintenance

### 12.1 Monitoring

- Application logs
- Error tracking
- Performance metrics
- Database query performance

### 12.2 Maintenance

- Regular database backups
- Security updates
- Dependency updates
- Performance optimization

---

## 13. Future Enhancements

1. **Mobile Application**: React Native app for iOS and Android
2. **Telemedicine**: Video consultation feature
3. **SMS Notifications**: In addition to email
4. **Payment Integration**: For appointment fees
5. **Medical Records**: Digital health records
6. **Analytics Dashboard**: Advanced reporting
7. **Multi-language Support**: Swahili, French, etc.
8. **API Documentation**: Swagger/OpenAPI
9. **Real-time Updates**: WebSocket for live notifications
10. **AI Integration**: Predictive analytics for health trends

---

**Document Version**: 1.0  
**Last Updated**: November 12, 2025  
**Maintained By**: NiaHealth Development Team
