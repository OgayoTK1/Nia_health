// Patient Routes
const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  changePassword,
  getStatistics
} = require('../controllers/patientController');
const { authenticate, isPatient } = require('../middleware/auth');
const { body } = require('express-validator');
const { validate } = require('../middleware/validator');

// All routes require authentication and patient role
router.use(authenticate, isPatient);

// Profile routes
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// Password change
router.put('/change-password',
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/).withMessage('New password must contain letters and numbers'),
  validate,
  changePassword
);

// Statistics
router.get('/statistics', getStatistics);

module.exports = router;
