# NiaHealth Data Dictionary

## Overview
This document provides detailed information about all tables, columns, data types, constraints, and relationships in the NiaHealth database.

---

## Table: `patients`

**Description:** Stores patient demographic and authentication information.

| Column Name | Data Type | Length | Nullable | Default | Description |
|------------|-----------|--------|----------|---------|-------------|
| id | INT | - | NO | AUTO_INCREMENT | Primary key, unique patient identifier |
| name | VARCHAR | 100 | NO | - | Patient full name |
| gender | ENUM | - | NO | - | Patient gender (Male, Female, Other) |
| dob | DATE | - | NO | - | Date of birth |
| phone | VARCHAR | 15 | NO | - | Contact phone number |
| email | VARCHAR | 100 | NO | - | Email address (unique) |
| address | TEXT | - | YES | NULL | Physical address |
| password_hash | VARCHAR | 255 | NO | - | Bcrypt hashed password |
| otp | VARCHAR | 6 | YES | NULL | One-time password for 2FA |
| otp_expiry | DATETIME | - | YES | NULL | OTP expiration timestamp |
| is_verified | BOOLEAN | - | NO | FALSE | Email verification status |
| failed_login_attempts | INT | - | NO | 0 | Count of consecutive failed logins |
| account_locked_until | DATETIME | - | YES | NULL | Account lockout timestamp |
| last_login | DATETIME | - | YES | NULL | Last successful login |
| created_at | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Record creation timestamp |
| updated_at | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Last update timestamp |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE KEY (email)
- INDEX (email, phone, created_at)

**Relationships:**
- One patient → Many appointments
- One patient → Many referrals

---

## Table: `clinics`

**Description:** Stores health facility/clinic information.

| Column Name | Data Type | Length | Nullable | Default | Description |
|------------|-----------|--------|----------|---------|-------------|
| id | INT | - | NO | AUTO_INCREMENT | Primary key, unique clinic identifier |
| name | VARCHAR | 150 | NO | - | Clinic name |
| location | VARCHAR | 255 | NO | - | Physical location/address |
| contact | VARCHAR | 15 | NO | - | Contact phone number |
| email | VARCHAR | 100 | YES | NULL | Clinic email address |
| capacity | INT | - | NO | 50 | Maximum patient capacity |
| operating_hours | VARCHAR | 100 | NO | '8:00 AM - 5:00 PM' | Operating hours |
| is_active | BOOLEAN | - | NO | TRUE | Clinic active status |
| created_at | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Record creation timestamp |
| updated_at | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Last update timestamp |

**Indexes:**
- PRIMARY KEY (id)
- INDEX (location, is_active)

**Relationships:**
- One clinic → Many health_workers
- One clinic → Many appointments
- One clinic → Many referrals

---

## Table: `health_workers`

**Description:** Stores health worker and administrator information.

| Column Name | Data Type | Length | Nullable | Default | Description |
|------------|-----------|--------|----------|---------|-------------|
| id | INT | - | NO | AUTO_INCREMENT | Primary key, unique worker identifier |
| name | VARCHAR | 100 | NO | - | Worker full name |
| email | VARCHAR | 100 | NO | - | Email address (unique) |
| phone | VARCHAR | 15 | YES | NULL | Contact phone number |
| clinic_id | INT | - | YES | NULL | Associated clinic (foreign key) |
| role | ENUM | - | NO | 'health_worker' | Role (health_worker, admin) |
| password_hash | VARCHAR | 255 | NO | - | Bcrypt hashed password |
| otp | VARCHAR | 6 | YES | NULL | One-time password for 2FA |
| otp_expiry | DATETIME | - | YES | NULL | OTP expiration timestamp |
| is_verified | BOOLEAN | - | NO | TRUE | Email verification status |
| failed_login_attempts | INT | - | NO | 0 | Count of consecutive failed logins |
| account_locked_until | DATETIME | - | YES | NULL | Account lockout timestamp |
| last_login | DATETIME | - | YES | NULL | Last successful login |
| is_active | BOOLEAN | - | NO | TRUE | Account active status |
| created_at | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Record creation timestamp |
| updated_at | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Last update timestamp |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE KEY (email)
- FOREIGN KEY (clinic_id) → clinics(id)
- INDEX (email, role, clinic_id)

**Relationships:**
- Many health_workers → One clinic
- One health_worker → Many referrals (created)
- One health_worker → Many alerts (created)

---

## Table: `appointments`

**Description:** Stores patient appointment information.

| Column Name | Data Type | Length | Nullable | Default | Description |
|------------|-----------|--------|----------|---------|-------------|
| id | INT | - | NO | AUTO_INCREMENT | Primary key, unique appointment identifier |
| patient_id | INT | - | NO | - | Patient identifier (foreign key) |
| clinic_id | INT | - | NO | - | Clinic identifier (foreign key) |
| appointment_date | DATE | - | NO | - | Appointment date |
| appointment_time | TIME | - | NO | - | Appointment time |
| reason | TEXT | - | YES | NULL | Reason for visit |
| status | ENUM | - | NO | 'scheduled' | Status (scheduled, confirmed, completed, cancelled, no-show) |
| notes | TEXT | - | YES | NULL | Additional notes |
| created_by | INT | - | YES | NULL | Creator identifier |
| updated_by | INT | - | YES | NULL | Last updater identifier |
| created_at | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Record creation timestamp |
| updated_at | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Last update timestamp |

**Indexes:**
- PRIMARY KEY (id)
- FOREIGN KEY (patient_id) → patients(id)
- FOREIGN KEY (clinic_id) → clinics(id)
- INDEX (patient_id, clinic_id, appointment_date, status)

**Relationships:**
- Many appointments → One patient
- Many appointments → One clinic

---

## Table: `referrals`

**Description:** Stores patient referral information to hospitals.

| Column Name | Data Type | Length | Nullable | Default | Description |
|------------|-----------|--------|----------|---------|-------------|
| id | INT | - | NO | AUTO_INCREMENT | Primary key, unique referral identifier |
| patient_id | INT | - | NO | - | Patient identifier (foreign key) |
| clinic_id | INT | - | NO | - | Referring clinic (foreign key) |
| hospital_name | VARCHAR | 150 | NO | - | Destination hospital name |
| hospital_location | VARCHAR | 255 | YES | NULL | Hospital location |
| reason | TEXT | - | NO | - | Reason for referral |
| diagnosis | TEXT | - | YES | NULL | Preliminary diagnosis |
| urgency | ENUM | - | NO | 'medium' | Urgency level (low, medium, high, critical) |
| status | ENUM | - | NO | 'pending' | Status (pending, accepted, completed, cancelled) |
| referral_date | DATE | - | NO | - | Date of referral |
| follow_up_date | DATE | - | YES | NULL | Follow-up appointment date |
| notes | TEXT | - | YES | NULL | Additional notes |
| created_by | INT | - | NO | - | Health worker who created (foreign key) |
| updated_by | INT | - | YES | NULL | Last updater identifier |
| created_at | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Record creation timestamp |
| updated_at | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Last update timestamp |

**Indexes:**
- PRIMARY KEY (id)
- FOREIGN KEY (patient_id) → patients(id)
- FOREIGN KEY (clinic_id) → clinics(id)
- FOREIGN KEY (created_by) → health_workers(id)
- INDEX (patient_id, clinic_id, status, urgency, referral_date)

**Relationships:**
- Many referrals → One patient
- Many referrals → One clinic
- Many referrals → One health_worker (creator)

---

## Table: `alerts`

**Description:** Stores health alerts and campaign messages.

| Column Name | Data Type | Length | Nullable | Default | Description |
|------------|-----------|--------|----------|---------|-------------|
| id | INT | - | NO | AUTO_INCREMENT | Primary key, unique alert identifier |
| subject | VARCHAR | 200 | NO | - | Alert subject line |
| message | TEXT | - | NO | - | Alert message content |
| target_group | ENUM | - | NO | 'all' | Target audience (all, patients, health_workers, specific) |
| target_location | VARCHAR | 255 | YES | NULL | Specific location targeting |
| email_sent | BOOLEAN | - | NO | FALSE | Email sending status |
| sent_count | INT | - | NO | 0 | Number of emails sent |
| delivery_status | ENUM | - | NO | 'pending' | Delivery status (pending, sending, sent, failed) |
| created_by | INT | - | NO | - | Admin who created (foreign key) |
| scheduled_at | DATETIME | - | YES | NULL | Scheduled sending time |
| sent_at | DATETIME | - | YES | NULL | Actual sending time |
| created_at | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Record creation timestamp |

**Indexes:**
- PRIMARY KEY (id)
- FOREIGN KEY (created_by) → health_workers(id)
- INDEX (target_group, delivery_status, created_at)

**Relationships:**
- Many alerts → One health_worker (creator)

---

## Table: `audit_logs`

**Description:** Stores system activity audit trail.

| Column Name | Data Type | Length | Nullable | Default | Description |
|------------|-----------|--------|----------|---------|-------------|
| id | INT | - | NO | AUTO_INCREMENT | Primary key, unique log identifier |
| user_id | INT | - | YES | NULL | User identifier |
| user_type | ENUM | - | NO | - | User type (patient, health_worker, admin) |
| action | VARCHAR | 100 | NO | - | Action performed |
| entity_type | VARCHAR | 50 | YES | NULL | Entity type affected |
| entity_id | INT | - | YES | NULL | Entity identifier affected |
| description | TEXT | - | YES | NULL | Detailed description |
| ip_address | VARCHAR | 45 | YES | NULL | IP address of request |
| user_agent | TEXT | - | YES | NULL | Browser user agent |
| timestamp | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Action timestamp |

**Indexes:**
- PRIMARY KEY (id)
- INDEX (user_id, user_type, action, timestamp)

---

## Table: `feedback`

**Description:** Stores user feedback and suggestions.

| Column Name | Data Type | Length | Nullable | Default | Description |
|------------|-----------|--------|----------|---------|-------------|
| id | INT | - | NO | AUTO_INCREMENT | Primary key, unique feedback identifier |
| name | VARCHAR | 100 | NO | - | Feedback provider name |
| email | VARCHAR | 100 | YES | NULL | Contact email |
| user_type | ENUM | - | NO | 'visitor' | User type (patient, health_worker, admin, visitor) |
| subject | VARCHAR | 200 | YES | NULL | Feedback subject |
| message | TEXT | - | NO | - | Feedback message |
| rating | INT | - | YES | NULL | Rating (1-5) |
| status | ENUM | - | NO | 'new' | Status (new, reviewed, resolved) |
| admin_response | TEXT | - | YES | NULL | Admin response |
| created_at | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Record creation timestamp |
| updated_at | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Last update timestamp |

**Indexes:**
- PRIMARY KEY (id)
- INDEX (status, created_at)

---

## Table: `refresh_tokens`

**Description:** Stores JWT refresh tokens for authentication.

| Column Name | Data Type | Length | Nullable | Default | Description |
|------------|-----------|--------|----------|---------|-------------|
| id | INT | - | NO | AUTO_INCREMENT | Primary key, unique token identifier |
| user_id | INT | - | NO | - | User identifier |
| user_type | ENUM | - | NO | - | User type (patient, health_worker) |
| token | VARCHAR | 500 | NO | - | Refresh token string |
| expires_at | DATETIME | - | NO | - | Token expiration timestamp |
| created_at | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | Record creation timestamp |

**Indexes:**
- PRIMARY KEY (id)
- INDEX (token, user_id + user_type, expires_at)

---

## Data Validation Rules

### Patient Registration
- **name**: Required, 2-100 characters, alphabets and spaces only
- **email**: Required, valid email format, unique
- **password**: Required, minimum 8 characters, must contain letters and numbers
- **dob**: Required, must be in the past
- **phone**: Required, 9-15 digits
- **gender**: Required, must be Male/Female/Other

### Appointment Booking
- **appointment_date**: Required, cannot be in the past
- **appointment_time**: Required, valid time format
- **clinic_id**: Required, must exist in clinics table

### Referral Creation
- **patient_id**: Required, must exist
- **hospital_name**: Required, 2-150 characters
- **reason**: Required, minimum 10 characters
- **urgency**: Required, must be low/medium/high/critical
- **referral_date**: Required, cannot be in the future

---

## Entity Relationships Diagram (ERD)

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│  patients   │───────│appointments │───────│   clinics   │
└─────────────┘   1:N └─────────────┘   N:1 └─────────────┘
       │                                            │
       │ 1:N                                    1:N │
       │                                            │
┌─────────────┐                            ┌─────────────┐
│  referrals  │                            │health_workers│
└─────────────┘                            └─────────────┘
       │                                            │
       │ N:1                                    1:N │
       └────────────────────────────────────────────┘
                           1:N
                            │
                      ┌─────────────┐
                      │   alerts    │
                      └─────────────┘
```

---

## Stored Procedures

### `clean_expired_otps()`
- **Description**: Removes expired OTP codes from patients and health_workers tables
- **Schedule**: Runs every hour via event scheduler
- **Parameters**: None

### `purge_old_audit_logs()`
- **Description**: Deletes audit logs older than 12 months
- **Schedule**: Runs monthly via event scheduler
- **Parameters**: None

---

## Database Views

### `daily_appointments`
- **Description**: Aggregates daily appointment statistics by clinic
- **Columns**: appointment_date, clinic_name, total_appointments, completed, cancelled

### `referral_statistics`
- **Description**: Monthly referral statistics by urgency and status
- **Columns**: month, urgency, status, count

### `active_patients`
- **Description**: Patients with activity in the last 12 months
- **Columns**: id, name, email, phone, total_appointments, total_referrals, last_appointment

---

## Security Considerations

1. **Password Storage**: All passwords stored using bcrypt with salt rounds = 10
2. **Email Encryption**: Sensitive patient emails encrypted at rest using AES-256
3. **Indexes**: Strategic indexes for query performance without exposing sensitive data
4. **Foreign Keys**: Cascade deletes configured to maintain data integrity
5. **Audit Trail**: All sensitive operations logged in audit_logs table

---

**Document Version**: 1.0  
**Last Updated**: November 12, 2025  
**Maintained By**: NiaHealth Development Team
