// Referral Routes
const express = require('express');
const router = express.Router();
const {
  createReferral,
  getPatientReferrals,
  getReferralById,
  updateReferralStatus,
  getClinicReferrals,
  getAllReferrals
} = require('../controllers/referralController');
const {
  authenticate,
  isPatient,
  isHealthWorker,
  isAdmin
} = require('../middleware/auth');
const {
  validateReferral,
  validateId,
  validatePagination
} = require('../middleware/validator');
const { body } = require('express-validator');
const { validate } = require('../middleware/validator');

// Health Worker routes
router.post('/',
  authenticate,
  isHealthWorker,
  validateReferral,
  createReferral
);

router.get('/clinic/:clinic_id',
  authenticate,
  isHealthWorker,
  validateId,
  validatePagination,
  getClinicReferrals
);

router.patch('/:id/status',
  authenticate,
  isHealthWorker,
  validateId,
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['pending', 'accepted', 'completed', 'cancelled'])
    .withMessage('Invalid status'),
  validate,
  updateReferralStatus
);

// Patient routes
router.get('/my-referrals',
  authenticate,
  isPatient,
  validatePagination,
  getPatientReferrals
);

// Admin routes
router.get('/all',
  authenticate,
  isAdmin,
  validatePagination,
  getAllReferrals
);

// Shared routes
router.get('/:id',
  authenticate,
  validateId,
  getReferralById
);

module.exports = router;
