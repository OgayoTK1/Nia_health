// Authentication Routes
const express = require('express');
const router = express.Router();
const {
  registerPatient,
  registerHealthWorker,
  loginPatient,
  loginHealthWorker,
  loginAdmin,
  verifyOTP,
  resendOTP,
  refreshToken,
  logout
} = require('../controllers/authController');
const {
  validatePatientRegistration,
  validateLogin,
  validateOTP
} = require('../middleware/validator');
const {
  authLimiter,
  otpLimiter,
  registrationLimiter
} = require('../middleware/security');
const { authenticate, isAdmin } = require('../middleware/auth');

// Patient routes
router.post('/register/patient', registrationLimiter, validatePatientRegistration, registerPatient);
router.post('/login/patient', authLimiter, validateLogin, loginPatient);

// Health Worker routes
router.post('/register/health-worker', authenticate, isAdmin, validatePatientRegistration, registerHealthWorker);
router.post('/login/health-worker', authLimiter, validateLogin, loginHealthWorker);
// Admin login
router.post('/login/admin', authLimiter, validateLogin, loginAdmin);

// OTP routes
router.post('/verify-otp', otpLimiter, validateOTP, verifyOTP);
router.post('/resend-otp', otpLimiter, resendOTP);

// Token routes
router.post('/refresh', refreshToken);
router.post('/logout', authenticate, logout);

module.exports = router;
