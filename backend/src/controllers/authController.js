// Authentication Controller
const bcrypt = require('bcrypt');
const { query } = require('../config/db');
const { generateTokens } = require('../config/jwt');
const { sendOTPEmail } = require('../config/email');
const { 
  generateOTP, 
  checkAccountLockout, 
  updateFailedLoginAttempts,
  resetFailedLoginAttempts 
} = require('../middleware/security');
const { logAudit } = require('../middleware/audit');
const { asyncHandler } = require('../middleware/errorHandler');

// Patient Registration
const registerPatient = asyncHandler(async (req, res) => {
  const { name, email, password, phone, dob, gender, address } = req.body;

  // Check if patient exists
  const existingPatient = await query(
    'SELECT id FROM patients WHERE email = ?',
    [email]
  );

  if (existingPatient.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Email already registered'
    });
  }

  // Hash password
  const password_hash = await bcrypt.hash(password, 10);

  // Generate OTP
  const otp = generateOTP();
  const otp_expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Insert patient
  const result = await query(
    `INSERT INTO patients (name, email, password_hash, phone, dob, gender, address, otp, otp_expiry) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, email, password_hash, phone, dob, gender, address || null, otp, otp_expiry]
  );

  const patientId = result.insertId;

  // Send OTP email
  await sendOTPEmail(email, otp, name);

  // Log audit
  await logAudit(patientId, 'patient', 'register', 'patient', patientId, 'Patient registered', req);

  res.status(201).json({
    success: true,
    message: 'Registration successful. Please check your email for OTP verification.',
    data: {
      id: patientId,
      email,
      name
    }
  });
});

// Health Worker Registration (Admin only)
const registerHealthWorker = asyncHandler(async (req, res) => {
  const { name, email, password, phone, clinic_id, role } = req.body;

  // Check if health worker exists
  const existingWorker = await query(
    'SELECT id FROM health_workers WHERE email = ?',
    [email]
  );

  if (existingWorker.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Email already registered'
    });
  }

  // Verify clinic exists
  if (clinic_id) {
    const clinics = await query('SELECT id FROM clinics WHERE id = ?', [clinic_id]);
    if (clinics.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Clinic not found'
      });
    }
  }

  // Hash password
  const password_hash = await bcrypt.hash(password, 10);

  // Generate OTP for 2FA
  const otp = generateOTP();
  const otp_expiry = new Date(Date.now() + 10 * 60 * 1000);

  // Insert health worker
  const result = await query(
    `INSERT INTO health_workers (name, email, password_hash, phone, clinic_id, role, otp, otp_expiry) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, email, password_hash, phone || null, clinic_id || null, role || 'health_worker', otp, otp_expiry]
  );

  const workerId = result.insertId;

  // Send OTP email
  await sendOTPEmail(email, otp, name);

  // Log audit
  await logAudit(req.user.id, 'admin', 'create', 'health_worker', workerId, `Created health worker: ${name}`, req);

  res.status(201).json({
    success: true,
    message: 'Health worker registered successfully. OTP sent to email.',
    data: {
      id: workerId,
      email,
      name,
      role
    }
  });
});

// Patient Login
const loginPatient = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check account lockout
  const lockCheck = await checkAccountLockout(query, email, 'patient');
  if (lockCheck.isLocked) {
    return res.status(423).json({
      success: false,
      message: lockCheck.message
    });
  }

  // Find patient
  const patients = await query(
    'SELECT * FROM patients WHERE email = ?',
    [email]
  );

  if (patients.length === 0) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  const patient = patients[0];

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, patient.password_hash);

  if (!isPasswordValid) {
    // Update failed login attempts
    await updateFailedLoginAttempts(query, patient.id, 'patient');
    
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  // Check if verified
  if (!patient.is_verified) {
    // Resend OTP
    const otp = generateOTP();
    const otp_expiry = new Date(Date.now() + 10 * 60 * 1000);
    
    await query(
      'UPDATE patients SET otp = ?, otp_expiry = ? WHERE id = ?',
      [otp, otp_expiry, patient.id]
    );
    
    await sendOTPEmail(email, otp, patient.name);
    
    return res.status(403).json({
      success: false,
      message: 'Account not verified. New OTP sent to your email.',
      requiresVerification: true
    });
  }

  // Reset failed attempts
  await resetFailedLoginAttempts(query, patient.id, 'patient');

  // Generate tokens
  const tokens = generateTokens({
    id: patient.id,
    email: patient.email,
    name: patient.name,
    userType: 'patient'
  });

  // Store refresh token
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  await query(
    'INSERT INTO refresh_tokens (user_id, user_type, token, expires_at) VALUES (?, ?, ?, ?)',
    [patient.id, 'patient', tokens.refreshToken, expiresAt]
  );

  // Log audit
  await logAudit(patient.id, 'patient', 'login', 'patient', patient.id, 'Patient logged in', req);

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: patient.id,
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        userType: 'patient'
      },
      ...tokens
    }
  });
});

// Health Worker Login
const loginHealthWorker = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check account lockout
  const lockCheck = await checkAccountLockout(query, email, 'health_worker');
  if (lockCheck.isLocked) {
    return res.status(423).json({
      success: false,
      message: lockCheck.message
    });
  }

  // Find health worker
  const workers = await query(
    'SELECT * FROM health_workers WHERE email = ? AND is_active = TRUE',
    [email]
  );

  if (workers.length === 0) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  const worker = workers[0];

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, worker.password_hash);

  if (!isPasswordValid) {
    // Update failed login attempts
    await updateFailedLoginAttempts(query, worker.id, 'health_worker');
    
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  // Generate and send OTP for 2FA
  const otp = generateOTP();
  const otp_expiry = new Date(Date.now() + 10 * 60 * 1000);
  
  await query(
    'UPDATE health_workers SET otp = ?, otp_expiry = ? WHERE id = ?',
    [otp, otp_expiry, worker.id]
  );
  
  await sendOTPEmail(email, otp, worker.name);

  res.json({
    success: true,
    message: 'OTP sent to your email. Please verify to complete login.',
    requiresOTP: true,
    data: {
      email: worker.email,
      tempId: worker.id
    }
  });
});

// Verify OTP
const verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp, userType = 'patient' } = req.body;

  // Normalize userType (convert 'health-worker' to 'health_worker' for database)
  const normalizedUserType = userType === 'health-worker' ? 'health_worker' : userType;
  const table = normalizedUserType === 'patient' ? 'patients' : 'health_workers';
  
  // Find user with OTP
  const users = await query(
    `SELECT * FROM ${table} WHERE email = ? AND otp = ? AND otp_expiry > NOW()`,
    [email, otp]
  );

  if (users.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired OTP'
    });
  }

  const user = users[0];

  // Update verification status and clear OTP
  await query(
    `UPDATE ${table} SET is_verified = TRUE, otp = NULL, otp_expiry = NULL WHERE id = ?`,
    [user.id]
  );

  // Reset failed attempts
  await resetFailedLoginAttempts(query, user.id, normalizedUserType);

  // Generate tokens
  const tokens = generateTokens({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    userType: normalizedUserType
  });

  // Store refresh token
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await query(
    'INSERT INTO refresh_tokens (user_id, user_type, token, expires_at) VALUES (?, ?, ?, ?)',
    [user.id, normalizedUserType, tokens.refreshToken, expiresAt]
  );

  // Log audit
  await logAudit(user.id, normalizedUserType, 'verify_otp', table, user.id, 'OTP verified', req);

  res.json({
    success: true,
    message: 'Verification successful',
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        userType: normalizedUserType
      },
      ...tokens
    }
  });
});

// Resend OTP
const resendOTP = asyncHandler(async (req, res) => {
  const { email, userType = 'patient' } = req.body;

  // Normalize userType (convert 'health-worker' to 'health_worker' for database)
  const normalizedUserType = userType === 'health-worker' ? 'health_worker' : userType;
  const table = normalizedUserType === 'patient' ? 'patients' : 'health_workers';
  
  // Find user
  const users = await query(
    `SELECT id, name, email FROM ${table} WHERE email = ?`,
    [email]
  );

  if (users.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const user = users[0];

  // Generate new OTP
  const otp = generateOTP();
  const otp_expiry = new Date(Date.now() + 10 * 60 * 1000);

  await query(
    `UPDATE ${table} SET otp = ?, otp_expiry = ? WHERE id = ?`,
    [otp, otp_expiry, user.id]
  );

  // Send OTP email
  await sendOTPEmail(email, otp, user.name);

  res.json({
    success: true,
    message: 'New OTP sent to your email'
  });
});

// Refresh Token
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      message: 'Refresh token is required'
    });
  }

  // Verify refresh token in database
  const tokens = await query(
    'SELECT * FROM refresh_tokens WHERE token = ? AND expires_at > NOW()',
    [refreshToken]
  );

  if (tokens.length === 0) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired refresh token'
    });
  }

  const tokenData = tokens[0];

  // Get user data
  const table = tokenData.user_type === 'patient' ? 'patients' : 'health_workers';
  const users = await query(`SELECT * FROM ${table} WHERE id = ?`, [tokenData.user_id]);

  if (users.length === 0) {
    return res.status(401).json({
      success: false,
      message: 'User not found'
    });
  }

  const user = users[0];

  // Generate new tokens
  const newTokens = generateTokens({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    userType: tokenData.user_type
  });

  // Delete old refresh token
  await query('DELETE FROM refresh_tokens WHERE token = ?', [refreshToken]);

  // Store new refresh token
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await query(
    'INSERT INTO refresh_tokens (user_id, user_type, token, expires_at) VALUES (?, ?, ?, ?)',
    [user.id, tokenData.user_type, newTokens.refreshToken, expiresAt]
  );

  res.json({
    success: true,
    message: 'Token refreshed successfully',
    data: newTokens
  });
});

// Logout
const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    // Delete refresh token
    await query('DELETE FROM refresh_tokens WHERE token = ?', [refreshToken]);
  }

  // Log audit
  if (req.user) {
    await logAudit(req.user.id, req.user.userType || req.user.role, 'logout', null, null, 'User logged out', req);
  }

  res.json({
    success: true,
    message: 'Logout successful'
  });
});

module.exports = {
  registerPatient,
  registerHealthWorker,
  loginPatient,
  loginHealthWorker,
  verifyOTP,
  resendOTP,
  refreshToken,
  logout
};
