// Appointment Controller
const { query } = require('../config/db');
const { sendAppointmentEmail } = require('../config/email');
const { sendEmail } = require('../config/email');
const { logAudit } = require('../middleware/audit');
const { asyncHandler } = require('../middleware/errorHandler');
const { format } = require('date-fns');

// Create appointment (Patient)
const createAppointment = asyncHandler(async (req, res) => {
  const patientId = req.user.id;
  const { clinic_id, appointment_date, appointment_time, reason } = req.body;

  // Verify clinic exists
  const clinics = await query(
    'SELECT name FROM clinics WHERE id = ? AND is_active = TRUE',
    [clinic_id]
  );

  if (clinics.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Clinic not found or inactive'
    });
  }

  // Check for existing appointment at same time
  const existing = await query(
    `SELECT id FROM appointments 
     WHERE clinic_id = ? AND appointment_date = ? AND appointment_time = ? 
     AND status NOT IN ('cancelled', 'completed')`,
    [clinic_id, appointment_date, appointment_time]
  );

  if (existing.length > 0) {
    return res.status(409).json({
      success: false,
      message: 'This time slot is already booked'
    });
  }

  // Create appointment
  const result = await query(
    `INSERT INTO appointments (patient_id, clinic_id, appointment_date, appointment_time, reason, status) 
     VALUES (?, ?, ?, ?, ?, 'scheduled')`,
    [patientId, clinic_id, appointment_date, appointment_time, reason || null]
  );

  const appointmentId = result.insertId;

  // Get patient details
  const patients = await query(
    'SELECT name, email FROM patients WHERE id = ?',
    [patientId]
  );

  // Send confirmation email
  if (patients.length > 0) {
    try {
      const emailResult = await sendAppointmentEmail(patients[0].email, {
        patientName: patients[0].name,
        clinicName: clinics[0].name,
        date: appointment_date,
        time: appointment_time,
        reason,
        appointmentId,
        text: `Hello ${patients[0].name},\nYour appointment at ${clinics[0].name} on ${appointment_date} at ${appointment_time} is confirmed. Reason: ${reason || 'N/A'}. Ref ID: ${appointmentId}.`
      });
      if (!emailResult?.success) {
        console.error('❌ Appointment confirmation email failed:', emailResult?.error || emailResult);
      } else {
        console.log('✅ Appointment confirmation email sent.');
      }
    } catch (emailError) {
        console.error('🔥🔥 CRITICAL: Sending appointment email threw an exception! 🔥🔥');
        console.error(emailError);
    }
  }

  // Log audit
  try {
    await logAudit(patientId, 'patient', 'create', 'appointment', appointmentId, 'Appointment created', req);
    console.log('✅ Audit log created for appointment.');
  } catch (auditError) {
    console.error('🔥🔥 CRITICAL: Logging audit trail for appointment creation failed! 🔥🔥');
    console.error(auditError);
  }

  res.status(201).json({
    success: true,
    message: 'Appointment booked successfully',
    data: {
      id: appointmentId,
      clinic_id,
      appointment_date,
      appointment_time,
      status: 'scheduled'
    }
  });
});

// Get patient appointments
const getPatientAppointments = asyncHandler(async (req, res) => {
  const patientId = req.user.id;
  const { status, page, limit } = req.query;

  // Provide defaults and ensure they're numbers
  const validPageNum = Math.max(1, parseInt(page) || 1);
  const validLimitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
  
  console.log('📊 Appointments Pagination:', { 
    raw: { page, limit }, 
    parsed: { validPageNum, validLimitNum },
    offset: (validPageNum - 1) * validLimitNum
  });
  
  const offset = (validPageNum - 1) * validLimitNum;
  let sql = `
    SELECT a.*, c.name as clinic_name, c.location as clinic_location, c.contact as clinic_contact
    FROM appointments a
    JOIN clinics c ON a.clinic_id = c.id
    WHERE a.patient_id = ?
  `;
  const params = [patientId];

  if (status) {
    sql += ' AND a.status = ?';
    params.push(status);
  }

  sql += ' ORDER BY a.appointment_date DESC, a.appointment_time DESC LIMIT ? OFFSET ?';
  params.push(validLimitNum, offset);

  console.log('🔍 FINAL SQL PARAMS:', {
    sql: sql.substring(sql.length - 50),
    params,
    types: params.map(p => typeof p),
    isNaN: params.map(p => Number.isNaN(p))
  });

  const appointments = await query(sql, params);

  // Get total count
  let countSql = 'SELECT COUNT(*) as total FROM appointments WHERE patient_id = ?';
  const countParams = [patientId];
  if (status) {
    countSql += ' AND status = ?';
    countParams.push(status);
  }
  const total = await query(countSql, countParams);

  res.json({
    success: true,
    data: appointments,
    pagination: {
      page: validPageNum,
      limit: validLimitNum,
      total: total[0].total,
      pages: Math.ceil(total[0].total / validLimitNum)
    }
  });
});

// Get appointment by ID
const getAppointmentById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const userType = req.user.userType || req.user.role;

  let sql = `
    SELECT a.*, 
           c.name as clinic_name, c.location as clinic_location, c.contact as clinic_contact,
           p.name as patient_name, p.email as patient_email, p.phone as patient_phone
    FROM appointments a
    JOIN clinics c ON a.clinic_id = c.id
    JOIN patients p ON a.patient_id = p.id
    WHERE a.id = ?
  `;

  // Restrict access based on role
  if (userType === 'patient') {
    sql += ' AND a.patient_id = ?';
  } else if (userType === 'health_worker') {
    sql += ' AND c.id IN (SELECT clinic_id FROM health_workers WHERE id = ?)';
  }

  const params = userType === 'patient' || userType === 'health_worker' ? [id, userId] : [id];
  const appointments = await query(sql, params);

  if (appointments.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Appointment not found or access denied'
    });
  }

  res.json({
    success: true,
    data: appointments[0]
  });
});

// Cancel appointment
const cancelAppointment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const userType = req.user.userType || req.user.role;

  // Check if appointment exists and belongs to user
  let checkSql = 'SELECT * FROM appointments WHERE id = ?';
  const checkParams = [id];

  if (userType === 'patient') {
    checkSql += ' AND patient_id = ?';
    checkParams.push(userId);
  }

  const appointments = await query(checkSql, checkParams);

  if (appointments.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Appointment not found or access denied'
    });
  }

  const appointment = appointments[0];

  // Send cancellation email
  if (appointment.email) {
    const cancelEmailResult = await sendEmail({
      to: appointment.email,
      subject: 'Appointment Cancelled - NiaHealth',
      html: `
        <html>
        <body style="font-family:Segoe UI,Tahoma,Geneva,Verdana,sans-serif;background:#f4f4f4;margin:0;padding:0;">
          <div style="max-width:600px;margin:0 auto;background:white;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
            <div style="background:linear-gradient(135deg,#ef4444,#dc2626);color:white;padding:30px 20px;text-align:center;">
              <h1>❌ Appointment Cancelled</h1>
              <p>NiaHealth Community Health System</p>
            </div>
            <div style="padding:40px 30px;">
              <h2>Hello ${appointment.name},</h2>
              <p>Your appointment at <strong>${appointment.clinic_name || ''}</strong> on <strong>${appointment.appointment_date}</strong> at <strong>${appointment.appointment_time}</strong> has been <span style="color:#dc2626;font-weight:bold;">cancelled</span>.</p>
              <div style="background:#f8f9fa;padding:25px;margin:25px 0;border-left:5px solid #dc2626;border-radius:0 8px 8px 0;">
                <div style="margin:15px 0;"><strong>Reason:</strong> ${appointment.reason || 'No reason provided.'}</div>
                <div style="margin:15px 0;"><strong>Ref ID:</strong> <span style="font-family:'Courier New',monospace;background:#e9ecef;padding:5px 10px;border-radius:4px;">${appointment.id}</span></div>
              </div>
              <p>If you have questions or wish to reschedule, please log into your NiaHealth account or contact the clinic directly.</p>
            </div>
            <div style="text-align:center;padding:25px;color:#666;font-size:14px;background:#f8f9fa;border-top:1px solid #e9ecef;">
              <p>&copy; 2025 <strong>NiaHealth</strong>. All rights reserved.</p>
              <p>Building healthier communities together</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Hello ${appointment.name},\nYour appointment at ${appointment.clinic_name || ''} on ${appointment.appointment_date} at ${appointment.appointment_time} has been cancelled. Reason: ${appointment.reason || 'No reason provided.'} Ref ID: ${appointment.id}. If you have questions or wish to reschedule, please log into your NiaHealth account or contact the clinic.`
    });
    if (!cancelEmailResult?.success) {
      console.error('❌ Appointment cancellation email failed:', cancelEmailResult?.error || cancelEmailResult);
    } else {
      console.log('✅ Appointment cancellation email sent:', cancelEmailResult);
    }
  }

  // Log audit
  await logAudit(userId, userType, 'cancel', 'appointment', id, 'Appointment cancelled', req);

  res.json({
    success: true,
    message: 'Appointment cancelled successfully'
  });
});

// Update appointment status (Health Worker/Admin)
const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;
  const userId = req.user.id;

  // Validate status
  const validStatuses = ['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status'
    });
  }

  // Check if appointment exists
  const appointments = await query('SELECT * FROM appointments WHERE id = ?', [id]);

  if (appointments.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Appointment not found'
    });
  }

  // Update appointment
  await query(
    'UPDATE appointments SET status = ?, notes = ?, updated_by = ? WHERE id = ?',
    [status, notes || appointments[0].notes, userId, id]
  );

  // Log audit
  await logAudit(userId, req.user.role, 'update_status', 'appointment', id, `Status changed to ${status}`, req);

  res.json({
    success: true,
    message: 'Appointment status updated successfully'
  });
});

// Get clinic appointments (Health Worker/Admin)
const getClinicAppointments = asyncHandler(async (req, res) => {
  const { clinic_id } = req.params;
  const { status, date, page, limit } = req.query;
  
  // Provide defaults and ensure they're numbers
  const validPageNum = Math.max(1, parseInt(page) || 1);
  const validLimitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
  
  const offset = (validPageNum - 1) * validLimitNum;

  let sql = `
    SELECT a.*, p.name as patient_name, p.email as patient_email, p.phone as patient_phone
    FROM appointments a
    JOIN patients p ON a.patient_id = p.id
    WHERE a.clinic_id = ?
  `;
  const params = [clinic_id];

  if (status) {
    sql += ' AND a.status = ?';
    params.push(status);
  }

  if (date) {
    sql += ' AND a.appointment_date = ?';
    params.push(date);
  }

  sql += ' ORDER BY a.appointment_date DESC, a.appointment_time DESC LIMIT ? OFFSET ?';
  params.push(limitNum, offset);

  const appointments = await query(sql, params);

  // Get total count
  let countSql = 'SELECT COUNT(*) as total FROM appointments WHERE clinic_id = ?';
  const countParams = [clinic_id];
  if (status) {
    countSql += ' AND status = ?';
    countParams.push(status);
  }
  if (date) {
    countSql += ' AND appointment_date = ?';
    countParams.push(date);
  }
  const total = await query(countSql, countParams);

  res.json({
    success: true,
    data: appointments,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total: total[0].total,
      pages: Math.ceil(total[0].total / limitNum)
    }
  });
});

module.exports = {
  createAppointment,
  getPatientAppointments,
  getAppointmentById,
  cancelAppointment,
  updateAppointmentStatus,
  getClinicAppointments
};
