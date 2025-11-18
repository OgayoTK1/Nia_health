// Input Validation Middleware
const { body, param, query, validationResult } = require('express-validator');

// Validation result checker
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    console.error('❌ Validation errors:', errors.array());
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  
  next();
};

// Patient registration validation
const validatePatientRegistration = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters')
    .matches(/^[a-zA-Z\s]+$/).withMessage('Name must contain only letters and spaces'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/).withMessage('Password must contain at least one letter and one number'),
  
  body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .matches(/^[0-9]{9,15}$/).withMessage('Phone must be 9-15 digits'),
  
  body('dob')
    .notEmpty().withMessage('Date of birth is required')
    .isDate().withMessage('Please provide a valid date')
    .custom(value => {
      const birthDate = new Date(value);
      const today = new Date();
      if (birthDate >= today) {
        throw new Error('Date of birth must be in the past');
      }
      return true;
    }),
  
  body('gender')
    .notEmpty().withMessage('Gender is required')
    .isIn(['Male', 'Female', 'Other']).withMessage('Gender must be Male, Female, or Other'),
  
  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Address must not exceed 500 characters'),
  
  validate
];

// Login validation
const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required'),
  
  (req, res, next) => {
    console.log('📍 Login Request Body:', req.body);
    console.log('📍 Request Headers:', req.headers);
    validate(req, res, next);
  }
];

// OTP validation
const validateOTP = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('otp')
    .trim()
    .notEmpty().withMessage('OTP is required')
    .isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
    .isNumeric().withMessage('OTP must contain only numbers'),
  
  validate
];

// Appointment validation
const validateAppointment = [
  body('clinic_id')
    .notEmpty().withMessage('Clinic is required')
    .isInt({ min: 1 }).withMessage('Invalid clinic ID'),
  
  body('appointment_date')
    .notEmpty().withMessage('Appointment date is required')
    .isDate().withMessage('Please provide a valid date')
    .custom(value => {
      const appointmentDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (appointmentDate < today) {
        throw new Error('Appointment date cannot be in the past');
      }
      return true;
    }),
  
  body('appointment_time')
    .notEmpty().withMessage('Appointment time is required')
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Please provide a valid time (HH:MM)'),
  
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Reason must not exceed 500 characters'),
  
  validate
];

// Referral validation
const validateReferral = [
  body('patient_id')
    .notEmpty().withMessage('Patient ID is required')
    .isInt({ min: 1 }).withMessage('Invalid patient ID'),
  
  body('clinic_id')
    .notEmpty().withMessage('Clinic ID is required')
    .isInt({ min: 1 }).withMessage('Invalid clinic ID'),
  
  body('hospital_name')
    .trim()
    .notEmpty().withMessage('Hospital name is required')
    .isLength({ min: 2, max: 150 }).withMessage('Hospital name must be 2-150 characters'),
  
  body('reason')
    .trim()
    .notEmpty().withMessage('Reason for referral is required')
    .isLength({ min: 10 }).withMessage('Reason must be at least 10 characters'),
  
  body('urgency')
    .notEmpty().withMessage('Urgency level is required')
    .isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid urgency level'),
  
  body('referral_date')
    .notEmpty().withMessage('Referral date is required')
    .isDate().withMessage('Please provide a valid date')
    .custom(value => {
      const referralDate = new Date(value);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      if (referralDate > tomorrow) {
        throw new Error('Referral date cannot be in the future');
      }
      return true;
    }),
  
  body('diagnosis')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Diagnosis must not exceed 1000 characters'),
  
  body('hospital_location')
    .optional()
    .trim()
    .isLength({ max: 255 }).withMessage('Hospital location must not exceed 255 characters'),
  
  validate
];

// Clinic validation
const validateClinic = [
  body('name')
    .trim()
    .notEmpty().withMessage('Clinic name is required')
    .isLength({ min: 2, max: 150 }).withMessage('Clinic name must be 2-150 characters'),
  
  body('location')
    .trim()
    .notEmpty().withMessage('Location is required')
    .isLength({ min: 2, max: 255 }).withMessage('Location must be 2-255 characters'),
  
  body('contact')
    .trim()
    .notEmpty().withMessage('Contact is required')
    .matches(/^[0-9]{9,15}$/).withMessage('Contact must be 9-15 digits'),
  
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('capacity')
    .optional()
    .isInt({ min: 1, max: 1000 }).withMessage('Capacity must be between 1 and 1000'),
  
  validate
];

// Alert validation
const validateAlert = [
  body('subject')
    .trim()
    .notEmpty().withMessage('Subject is required')
    .isLength({ min: 5, max: 200 }).withMessage('Subject must be 5-200 characters'),
  
  body('message')
    .trim()
    .notEmpty().withMessage('Message is required')
    .isLength({ min: 10 }).withMessage('Message must be at least 10 characters'),
  
  body('target_group')
    .notEmpty().withMessage('Target group is required')
    .isIn(['all', 'patients', 'health_workers', 'specific']).withMessage('Invalid target group'),
  
  body('target_location')
    .optional()
    .trim()
    .isLength({ max: 255 }).withMessage('Target location must not exceed 255 characters'),
  
  validate
];

// Feedback validation
const validateFeedback = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('message')
    .trim()
    .notEmpty().withMessage('Message is required')
    .isLength({ min: 10 }).withMessage('Message must be at least 10 characters'),
  
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  
  validate
];

// ID parameter validation
const validateId = [
  param('id')
    .isInt({ min: 1 }).withMessage('Invalid ID'),
  
  validate
];

// Pagination validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  
  validate
];

module.exports = {
  validate,
  validatePatientRegistration,
  validateLogin,
  validateOTP,
  validateAppointment,
  validateReferral,
  validateClinic,
  validateAlert,
  validateFeedback,
  validateId,
  validatePagination
};
