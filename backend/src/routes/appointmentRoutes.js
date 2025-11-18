// Appointment Routes
const express = require('express');
const router = express.Router();
const {
  createAppointment,
  getPatientAppointments,
  getAppointmentById,
  cancelAppointment,
  updateAppointmentStatus,
  getClinicAppointments
} = require('../controllers/appointmentController');
const {
  authenticate,
  isPatient,
  isHealthWorker,
  authorize
} = require('../middleware/auth');
const {
  validateAppointment,
  validateId,
  validatePagination
} = require('../middleware/validator');
const { body } = require('express-validator');
const { validate } = require('../middleware/validator');

// Patient routes
router.post('/',
  authenticate,
  isPatient,
  validateAppointment,
  createAppointment
);

router.get('/my-appointments',
  authenticate,
  isPatient,
  validatePagination,
  getPatientAppointments
);

router.delete('/:id/cancel',
  authenticate,
  validateId,
  cancelAppointment
);

// Health Worker / Admin routes
router.get('/clinic/:clinic_id',
  authenticate,
  isHealthWorker,
  validateId,
  validatePagination,
  getClinicAppointments
);

router.patch('/:id/status',
  authenticate,
  isHealthWorker,
  validateId,
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show'])
    .withMessage('Invalid status'),
  validate,
  updateAppointmentStatus
);

// Shared routes
router.get('/:id',
  authenticate,
  validateId,
  getAppointmentById
);

module.exports = router;
