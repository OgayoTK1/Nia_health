// Clinic Routes
const express = require('express');
const router = express.Router();
const {
  getAllClinics,
  getClinicById,
  createClinic,
  updateClinic,
  deleteClinic,
  getNearestClinics
} = require('../controllers/clinicController');
const { authenticate, isAdmin, optionalAuth } = require('../middleware/auth');
const {
  validateClinic,
  validateId,
  validatePagination
} = require('../middleware/validator');

// Public/authenticated routes
router.get('/', optionalAuth, validatePagination, getAllClinics);
router.get('/nearest', optionalAuth, getNearestClinics);
router.get('/:id', optionalAuth, validateId, getClinicById);

// Admin only routes
router.post('/', authenticate, isAdmin, validateClinic, createClinic);
router.put('/:id', authenticate, isAdmin, validateId, validateClinic, updateClinic);
router.delete('/:id', authenticate, isAdmin, validateId, deleteClinic);

module.exports = router;
