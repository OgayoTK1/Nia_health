// Patient Controller
const { query } = require('../config/db');
const bcrypt = require('bcrypt');
const { logAudit } = require('../middleware/audit');
const { asyncHandler } = require('../middleware/errorHandler');

// Get patient profile
const getProfile = asyncHandler(async (req, res) => {
  const patientId = req.user.id;

  const patients = await query(
    `SELECT id, name, email, phone, dob, gender, address, created_at 
     FROM patients WHERE id = ?`,
    [patientId]
  );

  if (patients.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Patient not found'
    });
  }

  res.json({
    success: true,
    data: patients[0]
  });
});

// Update patient profile
const updateProfile = asyncHandler(async (req, res) => {
  const patientId = req.user.id;
  const { name, phone, address } = req.body;

  const updates = [];
  const values = [];

  if (name) {
    updates.push('name = ?');
    values.push(name);
  }
  if (phone) {
    updates.push('phone = ?');
    values.push(phone);
  }
  if (address !== undefined) {
    updates.push('address = ?');
    values.push(address);
  }

  if (updates.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No fields to update'
    });
  }

  values.push(patientId);

  await query(
    `UPDATE patients SET ${updates.join(', ')} WHERE id = ?`,
    values
  );

  // Log audit
  await logAudit(patientId, 'patient', 'update', 'patient', patientId, 'Profile updated', req);

  res.json({
    success: true,
    message: 'Profile updated successfully'
  });
});

// Change password
const changePassword = asyncHandler(async (req, res) => {
  const patientId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  // Get current password hash
  const patients = await query(
    'SELECT password_hash FROM patients WHERE id = ?',
    [patientId]
  );

  if (patients.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Patient not found'
    });
  }

  // Verify current password
  const isValid = await bcrypt.compare(currentPassword, patients[0].password_hash);
  
  if (!isValid) {
    return res.status(401).json({
      success: false,
      message: 'Current password is incorrect'
    });
  }

  // Hash new password
  const newPasswordHash = await bcrypt.hash(newPassword, 10);

  // Update password
  await query(
    'UPDATE patients SET password_hash = ? WHERE id = ?',
    [newPasswordHash, patientId]
  );

  // Log audit
  await logAudit(patientId, 'patient', 'change_password', 'patient', patientId, 'Password changed', req);

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
});

// Get patient statistics
const getStatistics = asyncHandler(async (req, res) => {
  const patientId = req.user.id;

  // Get appointment count
  const appointmentCount = await query(
    'SELECT COUNT(*) as count FROM appointments WHERE patient_id = ?',
    [patientId]
  );

  // Get referral count
  const referralCount = await query(
    'SELECT COUNT(*) as count FROM referrals WHERE patient_id = ?',
    [patientId]
  );

  // Get upcoming appointments
  const upcomingAppointments = await query(
    `SELECT COUNT(*) as count FROM appointments 
     WHERE patient_id = ? AND appointment_date >= CURDATE() AND status IN ('scheduled', 'confirmed')`,
    [patientId]
  );

  // Get pending referrals
  const pendingReferrals = await query(
    `SELECT COUNT(*) as count FROM referrals 
     WHERE patient_id = ? AND status = 'pending'`,
    [patientId]
  );

  res.json({
    success: true,
    data: {
      totalAppointments: appointmentCount[0].count,
      totalReferrals: referralCount[0].count,
      upcomingAppointments: upcomingAppointments[0].count,
      pendingReferrals: pendingReferrals[0].count
    }
  });
});

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  getStatistics
};
