# NiaHealth API Specification

**Version:** 1.0.0  
**Base URL:** `http://localhost:5000/api`  
**Last Updated:** November 12, 2025

## Table of Contents
1. [Authentication](#authentication)
2. [Patient Endpoints](#patient-endpoints)
3. [Appointment Endpoints](#appointment-endpoints)
4. [Referral Endpoints](#referral-endpoints)
5. [Clinic Endpoints](#clinic-endpoints)
6. [Admin Endpoints](#admin-endpoints)
7. [Feedback Endpoints](#feedback-endpoints)
8. [Error Responses](#error-responses)

---

## Authentication

### Register Patient
**POST** `/auth/register/patient`

Register a new patient account.

**Request Body:**
```json
{
  "name": "ogayo Andrew",
  "email": "ogayo@example.com",
  "password": "SecurePass123",
  "phone": "254712345678",
  "dob": "1990-01-15",
  "gender": "Male",
  "address": "Nairobi, Kenya"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Registration successful. Please check your email for OTP verification.",
  "data": {
    "id": 1,
    "email": "ogayo@example.com",
    "name": "ogayo andrew"
  }
}
```

---

### Login Patient
**POST** `/auth/login/patient`

Login as a patient.

**Request Body:**
```json
{
  "email": "ogayo@example.com",
  "password": "SecurePass123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "name": "Ogayo Andrew",
      "email": "ogayo@example.com",
      "phone": "254712345678",
      "userType": "patient"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "30m"
  }
}
```

---

### Login Health Worker
**POST** `/auth/login/health-worker`

Login as a health worker or admin (requires 2FA).

**Request Body:**
```json
{
  "email": "worker@clinic.com",
  "password": "WorkerPass123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "OTP sent to your email. Please verify to complete login.",
  "requiresOTP": true,
  "data": {
    "email": "worker@clinic.com",
    "tempId": 1
  }
}
```

---

### Verify OTP
**POST** `/auth/verify-otp`

Verify OTP code for account verification or 2FA.

**Request Body:**
```json
{
  "email": "ogayo@example.com",
  "otp": "123456",
  "userType": "patient"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Verification successful",
  "data": {
    "user": { /* user object */ },
    "accessToken": "...",
    "refreshToken": "...",
    "expiresIn": "30m"
  }
}
```

---

### Resend OTP
**POST** `/auth/resend-otp`

Request a new OTP code.

**Request Body:**
```json
{
  "email": "ogayo@example.com",
  "userType": "patient"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "New OTP sent to your email"
}
```

---

### Refresh Token
**POST** `/auth/refresh`

Get a new access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "...",
    "refreshToken": "...",
    "expiresIn": "30m"
  }
}
```

---

### Logout
**POST** `/auth/logout`

Logout current user.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

## Patient Endpoints

### Get Patient Profile
**GET** `/patients/profile`

Get current patient profile.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Ogayo Andre",
    "email": "Ogayo@example.com",
    "phone": "254712345678",
    "dob": "1990-01-15",
    "gender": "Male",
    "address": "Nairobi, Kenya",
    "created_at": "2025-11-01T10:00:00.000Z"
  }
}
```

---

### Update Patient Profile
**PUT** `/patients/profile`

Update patient profile information.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "name": "Ogayo Updated",
  "phone": "254723456789",
  "address": "Mombasa, Kenya"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully"
}
```

---

### Change Password
**PUT** `/patients/change-password`

Change patient password.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "currentPassword": "OldPass123",
  "newPassword": "NewSecurePass456"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

### Get Patient Statistics
**GET** `/patients/statistics`

Get patient-specific statistics.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalAppointments": 5,
    "totalReferrals": 2,
    "upcomingAppointments": 1,
    "pendingReferrals": 0
  }
}
```

---

## Appointment Endpoints

### Create Appointment
**POST** `/appointments`

Book a new appointment (Patient only).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "clinic_id": 1,
  "appointment_date": "2025-11-20",
  "appointment_time": "10:30",
  "reason": "General checkup"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Appointment booked successfully",
  "data": {
    "id": 1,
    "clinic_id": 1,
    "appointment_date": "2025-11-20",
    "appointment_time": "10:30:00",
    "status": "scheduled"
  }
}
```

---

### Get My Appointments
**GET** `/appointments/my-appointments`

Get current patient's appointments.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `status` (optional): Filter by status (scheduled, confirmed, completed, cancelled)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "clinic_id": 1,
      "clinic_name": "Nairobi Community Clinic",
      "clinic_location": "Nairobi, Kibera",
      "clinic_contact": "+254712345678",
      "appointment_date": "2025-11-20",
      "appointment_time": "10:30:00",
      "reason": "General checkup",
      "status": "scheduled",
      "created_at": "2025-11-12T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "pages": 1
  }
}
```

---

### Get Appointment By ID
**GET** `/appointments/:id`

Get specific appointment details.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "patient_id": 1,
    "patient_name": "Ogayo Andrew",
    "patient_email": "Ogayo@example.com",
    "patient_phone": "254712345678",
    "clinic_id": 1,
    "clinic_name": "Nairobi Community Clinic",
    "appointment_date": "2025-11-20",
    "appointment_time": "10:30:00",
    "reason": "General checkup",
    "status": "scheduled",
    "notes": null
  }
}
```

---

### Cancel Appointment
**DELETE** `/appointments/:id/cancel`

Cancel an appointment.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Appointment cancelled successfully"
}
```

---

### Update Appointment Status
**PATCH** `/appointments/:id/status`

Update appointment status (Health Worker/Admin only).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "status": "completed",
  "notes": "Patient attended successfully"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Appointment status updated successfully"
}
```

---

### Get Clinic Appointments
**GET** `/appointments/clinic/:clinic_id`

Get all appointments for a specific clinic (Health Worker/Admin only).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `status` (optional): Filter by status
- `date` (optional): Filter by date (YYYY-MM-DD)
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response (200):**
```json
{
  "success": true,
  "data": [/* appointment objects */],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "pages": 3
  }
}
```

---

## Referral Endpoints

### Create Referral
**POST** `/referrals`

Create a new referral (Health Worker/Admin only).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "patient_id": 1,
  "clinic_id": 1,
  "hospital_name": "Kenyatta National Hospital",
  "hospital_location": "Nairobi",
  "reason": "Suspected cardiac issue requiring specialist care",
  "diagnosis": "Irregular heartbeat detected",
  "urgency": "high",
  "referral_date": "2025-11-12",
  "notes": "Patient requires urgent cardiology consultation"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Referral created successfully",
  "data": {
    "id": 1,
    "patient_id": 1,
    "hospital_name": "Kenyatta National Hospital",
    "urgency": "high",
    "status": "pending"
  }
}
```

---

### Get My Referrals
**GET** `/referrals/my-referrals`

Get current patient's referrals.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `status` (optional): Filter by status (pending, accepted, completed, cancelled)
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "clinic_name": "Nairobi Community Clinic",
      "hospital_name": "Kenyatta National Hospital",
      "hospital_location": "Nairobi",
      "reason": "Suspected cardiac issue",
      "urgency": "high",
      "status": "pending",
      "referral_date": "2025-11-12",
      "created_by_name": "Dr. Jane Wanjiku",
      "created_at": "2025-11-12T14:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 2,
    "pages": 1
  }
}
```

---

### Get Referral By ID
**GET** `/referrals/:id`

Get specific referral details.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "patient_id": 1,
    "patient_name": "Ogayo Andrew",
    "patient_email": "ogayo@example.com",
    "patient_phone": "254712345678",
    "patient_dob": "1990-01-15",
    "clinic_id": 1,
    "clinic_name": "Nairobi Community Clinic",
    "hospital_name": "Kenyatta National Hospital",
    "hospital_location": "Nairobi",
    "reason": "Suspected cardiac issue",
    "diagnosis": "Irregular heartbeat detected",
    "urgency": "high",
    "status": "pending",
    "referral_date": "2025-11-12",
    "created_by_name": "Dr. Jane Wanjiku",
    "notes": "Patient requires urgent consultation"
  }
}
```

---

### Update Referral Status
**PATCH** `/referrals/:id/status`

Update referral status (Health Worker/Admin only).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "status": "accepted",
  "notes": "Patient has been seen by specialist",
  "follow_up_date": "2025-11-25"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Referral status updated successfully"
}
```

---

## Clinic Endpoints

### Get All Clinics
**GET** `/clinics`

Get list of all clinics (public endpoint).

**Query Parameters:**
- `is_active` (optional): Filter by active status (true/false)
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Nairobi Community Clinic",
      "location": "Nairobi, Kibera",
      "contact": "+254712345678",
      "email": "kibera@niahealth.com",
      "capacity": 100,
      "operating_hours": "8:00 AM - 5:00 PM",
      "is_active": true,
      "created_at": "2025-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 3,
    "pages": 1
  }
}
```

---

### Get Clinic By ID
**GET** `/clinics/:id`

Get specific clinic details.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Nairobi Community Clinic",
    "location": "Nairobi, Kibera",
    "contact": "+254712345678",
    "email": "kibera@niahealth.com",
    "capacity": 100,
    "operating_hours": "8:00 AM - 5:00 PM",
    "is_active": true,
    "statistics": {
      "totalAppointments": 150,
      "totalReferrals": 45,
      "totalWorkers": 5
    }
  }
}
```

---

### Create Clinic
**POST** `/clinics`

Create a new clinic (Admin only).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "name": "Kisumu Health Center",
  "location": "Kisumu, Kondele",
  "contact": "+254734567890",
  "email": "kondele@niahealth.com",
  "capacity": 50,
  "operating_hours": "7:00 AM - 6:00 PM"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Clinic created successfully",
  "data": {
    "id": 4,
    "name": "Kisumu Health Center",
    "location": "Kisumu, Kondele"
  }
}
```

---

## Admin Endpoints

### Get Dashboard Statistics
**GET** `/admin/dashboard/stats`

Get overall system statistics (Admin only).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalPatients": 250,
    "totalClinics": 3,
    "totalAppointments": 500,
    "totalReferrals": 75,
    "upcomingAppointments": 25,
    "pendingReferrals": 10,
    "recentPatients": 15,
    "recentAppointments": 40
  }
}
```

---

### Get Analytics
**GET** `/admin/dashboard/analytics`

Get detailed analytics (Admin only).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `period` (optional): Number of days to analyze (default: 30)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "appointmentTrends": [/* daily appointment counts */],
    "referralStats": [/* referral statistics */],
    "topClinics": [/* most active clinics */],
    "referralCompletion": {
      "total": 75,
      "completed": 50,
      "pending": 15,
      "accepted": 5,
      "cancelled": 5
    }
  }
}
```

---

### Create Health Alert
**POST** `/admin/alerts`

Send health alert to users (Admin only).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "subject": "COVID-19 Vaccination Drive",
  "message": "Free COVID-19 vaccination available at all NiaHealth clinics this week. Book your slot now!",
  "target_group": "all",
  "target_location": null
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Health alert created and sent to 250 recipients",
  "data": {
    "id": 1,
    "sentCount": 250
  }
}
```

---

## Error Responses

### Standard Error Format
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

### Common HTTP Status Codes
- **200**: Success
- **201**: Created
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (authentication required)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found
- **409**: Conflict (duplicate entry)
- **423**: Locked (account locked)
- **429**: Too Many Requests (rate limit exceeded)
- **500**: Internal Server Error

---

**End of API Specification**
