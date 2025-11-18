// Referral Controller
const { query } = require('../config/db');
const { sendReferralEmail } = require('../config/email');
const { logAudit } = require('../middleware/audit');
const { asyncHandler } = require('../middleware/errorHandler');

// Create referral (Health Worker/Admin)
const createReferral = asyncHandler(async (req, res) => {
  const {
    patient_id,
    clinic_id,
    hospital_name,
    hospital_location,
    reason,
    diagnosis,
    urgency,
    referral_date,
    notes
  } = req.body;

  const createdBy = req.user.id;

  // Verify patient exists
  const patients = await query(
    'SELECT name, email FROM patients WHERE id = ?',
    [patient_id]
  );

  if (patients.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Patient not found'
    });
  }

  // Verify clinic exists
  const clinics = await query(
    'SELECT name FROM clinics WHERE id = ?',
    [clinic_id]
  );

  if (clinics.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Clinic not found'
    });
  }

  // Create referral
  const result = await query(
    `INSERT INTO referrals 
     (patient_id, clinic_id, hospital_name, hospital_location, reason, diagnosis, urgency, referral_date, notes, created_by) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      patient_id,
      clinic_id,
      hospital_name,
      hospital_location || null,
      reason,
      diagnosis || null,
      urgency,
      referral_date,
      notes || null,
      createdBy
    ]
  );

  const referralId = result.insertId;

  // Send referral email to patient
  await sendReferralEmail(patients[0].email, {
    patientName: patients[0].name,
    hospitalName: hospital_name,
    reason,
    urgency,
    referralDate: referral_date
  });

  // Log audit
  await logAudit(createdBy, req.user.role, 'create', 'referral', referralId, `Referral created for patient ${patient_id}`, req);

  res.status(201).json({
    success: true,
    message: 'Referral created successfully',
    data: {
      id: referralId,
      patient_id,
      hospital_name,
      urgency,
      status: 'pending'
    }
  });
});

// Get patient referrals
const getPatientReferrals = asyncHandler(async (req, res) => {
  const patientId = req.user.id;
  const { status, page = 1, limit = 10 } = req.query;

  const offset = (page - 1) * limit;
  let sql = `
    SELECT r.*, 
           c.name as clinic_name,
           hw.name as created_by_name
    FROM referrals r
    JOIN clinics c ON r.clinic_id = c.id
    JOIN health_workers hw ON r.created_by = hw.id
    WHERE r.patient_id = ?
  `;
  const params = [patientId];

  if (status) {
    sql += ' AND r.status = ?';
    params.push(status);
  }

  sql += ' ORDER BY r.created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit).toString(), offset.toString());

  const referrals = await query(sql, params);

  // Get total count
  let countSql = 'SELECT COUNT(*) as total FROM referrals WHERE patient_id = ?';
  const countParams = [patientId];
  if (status) {
    countSql += ' AND status = ?';
    countParams.push(status);
  }
  const total = await query(countSql, countParams);

  res.json({
    success: true,
    data: referrals,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: total[0].total,
      pages: Math.ceil(total[0].total / limit)
    }
  });
});

// Get referral by ID
const getReferralById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const userType = req.user.userType || req.user.role;

  let sql = `
    SELECT r.*, 
           c.name as clinic_name, c.location as clinic_location,
           p.name as patient_name, p.email as patient_email, p.phone as patient_phone, p.dob as patient_dob,
           hw.name as created_by_name
    FROM referrals r
    JOIN clinics c ON r.clinic_id = c.id
    JOIN patients p ON r.patient_id = p.id
    JOIN health_workers hw ON r.created_by = hw.id
    WHERE r.id = ?
  `;

  // Restrict access based on role
  if (userType === 'patient') {
    sql += ' AND r.patient_id = ?';
  } else if (userType === 'health_worker') {
    sql += ' AND c.id IN (SELECT clinic_id FROM health_workers WHERE id = ?)';
  }

  const params = userType === 'patient' || userType === 'health_worker' ? [id, userId] : [id];
  const referrals = await query(sql, params);

  if (referrals.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Referral not found or access denied'
    });
  }

  res.json({
    success: true,
    data: referrals[0]
  });
});

// Update referral status (Health Worker/Admin)
const updateReferralStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, notes, follow_up_date } = req.body;
  const userId = req.user.id;

  // Validate status
  const validStatuses = ['pending', 'accepted', 'completed', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status'
    });
  }

  // Check if referral exists
  const referrals = await query('SELECT * FROM referrals WHERE id = ?', [id]);

  if (referrals.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Referral not found'
    });
  }

  // Build update query
  const updates = ['status = ?', 'updated_by = ?'];
  const values = [status, userId];

  if (notes) {
    updates.push('notes = ?');
    values.push(notes);
  }

  if (follow_up_date) {
    updates.push('follow_up_date = ?');
    values.push(follow_up_date);
  }

  values.push(id);

  // Update referral
  await query(
    `UPDATE referrals SET ${updates.join(', ')} WHERE id = ?`,
    values
  );

  // Log audit
  await logAudit(userId, req.user.role, 'update_status', 'referral', id, `Status changed to ${status}`, req);

  res.json({
    success: true,
    message: 'Referral status updated successfully'
  });
});

// Get clinic referrals (Health Worker/Admin)
const getClinicReferrals = asyncHandler(async (req, res) => {
  const { clinic_id } = req.params;
  const { status, urgency, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  let sql = `
    SELECT r.*, 
           p.name as patient_name, p.email as patient_email, p.phone as patient_phone,
           hw.name as created_by_name
    FROM referrals r
    JOIN patients p ON r.patient_id = p.id
    JOIN health_workers hw ON r.created_by = hw.id
    WHERE r.clinic_id = ?
  `;
  const params = [clinic_id];

  if (status) {
    sql += ' AND r.status = ?';
    params.push(status);
  }

  if (urgency) {
    sql += ' AND r.urgency = ?';
    params.push(urgency);
  }

  sql += ' ORDER BY r.urgency DESC, r.created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), offset);

  const referrals = await query(sql, params);

  // Get total count
  let countSql = 'SELECT COUNT(*) as total FROM referrals WHERE clinic_id = ?';
  const countParams = [clinic_id];
  if (status) {
    countSql += ' AND status = ?';
    countParams.push(status);
  }
  if (urgency) {
    countSql += ' AND urgency = ?';
    countParams.push(urgency);
  }
  const total = await query(countSql, countParams);

  res.json({
    success: true,
    data: referrals,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: total[0].total,
      pages: Math.ceil(total[0].total / limit)
    }
  });
});

// Get all referrals (Admin)
const getAllReferrals = asyncHandler(async (req, res) => {
  const { status, urgency, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  let sql = `
    SELECT r.*, 
           p.name as patient_name,
           c.name as clinic_name,
           hw.name as created_by_name
    FROM referrals r
    JOIN patients p ON r.patient_id = p.id
    JOIN clinics c ON r.clinic_id = c.id
    JOIN health_workers hw ON r.created_by = hw.id
    WHERE 1=1
  `;
  const params = [];

  if (status) {
    sql += ' AND r.status = ?';
    params.push(status);
  }

  if (urgency) {
    sql += ' AND r.urgency = ?';
    params.push(urgency);
  }

  sql += ' ORDER BY r.urgency DESC, r.created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), offset);

  const referrals = await query(sql, params);

  // Get total count
  let countSql = 'SELECT COUNT(*) as total FROM referrals WHERE 1=1';
  const countParams = [];
  if (status) {
    countSql += ' AND status = ?';
    countParams.push(status);
  }
  if (urgency) {
    countSql += ' AND urgency = ?';
    countParams.push(urgency);
  }
  const total = await query(countSql, countParams);

  res.json({
    success: true,
    data: referrals,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: total[0].total,
      pages: Math.ceil(total[0].total / limit)
    }
  });
});

module.exports = {
  createReferral,
  getPatientReferrals,
  getReferralById,
  updateReferralStatus,
  getClinicReferrals,
  getAllReferrals
};
