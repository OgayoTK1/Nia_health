// Admin Routes
const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAnalytics,
  getAllPatients,
  getAllHealthWorkers,
  createAlert,
  getAllAlerts,
  getAuditLogs,
  updateUserStatus
} = require('../controllers/adminController');
const { authenticate, isAdmin } = require('../middleware/auth');
const {
  validateAlert,
  validatePagination
} = require('../middleware/validator');
const { body } = require('express-validator');
const { validate } = require('../middleware/validator');
const { emailLimiter } = require('../middleware/security');

// All routes require authentication and admin role
router.use(authenticate, isAdmin);

// Dashboard
router.get('/dashboard/stats', getDashboardStats);
router.get('/dashboard/analytics', getAnalytics);

// User management
router.get('/patients', validatePagination, getAllPatients);
router.get('/health-workers', validatePagination, getAllHealthWorkers);
router.patch('/users/status',
  body('userId').isInt({ min: 1 }).withMessage('Valid user ID is required'),
  body('userType').isIn(['patient', 'health_worker']).withMessage('Invalid user type'),
  body('isActive').isBoolean().withMessage('isActive must be boolean'),
  validate,
  updateUserStatus
);

// Alerts
router.post('/alerts', emailLimiter, validateAlert, createAlert);
router.get('/alerts', validatePagination, getAllAlerts);

// Audit logs
router.get('/audit-logs', validatePagination, getAuditLogs);

module.exports = router;
