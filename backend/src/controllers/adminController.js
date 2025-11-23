// Admin Controller
const { query } = require('../config/db');
const { sendHealthAlert } = require('../config/email');
const { logAudit } = require('../middleware/audit');
const { asyncHandler } = require('../middleware/errorHandler');
const bcrypt = require('bcrypt');

// Dashboard Statistics
const getDashboardStats = asyncHandler(async (req, res) => {
  // Debug: print user info from request
  console.log('🟦 getDashboardStats called by user:', {
    id: req.user?.id,
    email: req.user?.email,
    role: req.user?.role,
    userType: req.user?.userType
  });
  // Total patients
  const totalPatients = await query('SELECT COUNT(*) as count FROM patients WHERE is_verified = TRUE');
  
  // Total clinics
  const totalClinics = await query('SELECT COUNT(*) as count FROM clinics WHERE is_active = TRUE');
  
  // Total appointments
  const totalAppointments = await query('SELECT COUNT(*) as count FROM appointments');
  
  // Total referrals
  const totalReferrals = await query('SELECT COUNT(*) as count FROM referrals');
  
  // Upcoming appointments
  const upcomingAppointments = await query(
    `SELECT COUNT(*) as count FROM appointments 
     WHERE appointment_date >= CURDATE() AND status IN ('scheduled', 'confirmed')`
  );
  
  // Pending referrals
  const pendingReferrals = await query(
    `SELECT COUNT(*) as count FROM referrals WHERE status = 'pending'`
  );
  
  // Recent activity (last 30 days)
  const recentPatients = await query(
    `SELECT COUNT(*) as count FROM patients 
     WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`
  );
  
  const recentAppointments = await query(
    `SELECT COUNT(*) as count FROM appointments 
     WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`
  );

  res.json({
    success: true,
    data: {
      totalPatients: totalPatients[0].count,
      totalClinics: totalClinics[0].count,
      totalAppointments: totalAppointments[0].count,
      totalReferrals: totalReferrals[0].count,
      upcomingAppointments: upcomingAppointments[0].count,
      pendingReferrals: pendingReferrals[0].count,
      recentPatients: recentPatients[0].count,
      recentAppointments: recentAppointments[0].count
    }
  });
});

// Get analytics data
const getAnalytics = asyncHandler(async (req, res) => {
  const { period = '30' } = req.query; // days

  // Appointment trends
  const appointmentTrends = await query(
    `SELECT DATE(appointment_date) as date, COUNT(*) as count, status
     FROM appointments
     WHERE appointment_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
     GROUP BY DATE(appointment_date), status
     ORDER BY date DESC`,
    [parseInt(period)]
  );

  // Referral statistics
  const referralStats = await query(
    `SELECT urgency, status, COUNT(*) as count
     FROM referrals
     WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
     GROUP BY urgency, status`,
    [parseInt(period)]
  );

  // Top clinics by appointments
  const topClinics = await query(
    `SELECT c.id, c.name, c.location, COUNT(a.id) as appointment_count
     FROM clinics c
     LEFT JOIN appointments a ON c.id = a.clinic_id
     WHERE a.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
     GROUP BY c.id
     ORDER BY appointment_count DESC
     LIMIT 10`,
    [parseInt(period)]
  );

  // Referral completion rate
  const referralCompletion = await query(
    `SELECT 
       COUNT(*) as total,
       SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
       SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
       SUM(CASE WHEN status = 'accepted' THEN 1 ELSE 0 END) as accepted,
       SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled
     FROM referrals
     WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)`,
    [parseInt(period)]
  );

  res.json({
    success: true,
    data: {
      appointmentTrends,
      referralStats,
      topClinics,
      referralCompletion: referralCompletion[0]
    }
  });
});

// Get all patients (Admin)
const getAllPatients = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  let sql = `
    SELECT id, name, email, phone, dob, gender, address, is_verified, created_at
    FROM patients
    WHERE 1=1
  `;
  const params = [];

  if (search) {
    sql += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), offset);

  const patients = await query(sql, params);

  // Get total count
  let countSql = 'SELECT COUNT(*) as total FROM patients WHERE 1=1';
  const countParams = [];
  if (search) {
    countSql += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)';
    const searchTerm = `%${search}%`;
    countParams.push(searchTerm, searchTerm, searchTerm);
  }
  const total = await query(countSql, countParams);

  res.json({
    success: true,
    data: patients,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: total[0].total,
      pages: Math.ceil(total[0].total / limit)
    }
  });
});

// Get all health workers (Admin)
const getAllHealthWorkers = asyncHandler(async (req, res) => {
  const { clinic_id, role, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  let sql = `
    SELECT hw.*, c.name as clinic_name
    FROM health_workers hw
    LEFT JOIN clinics c ON hw.clinic_id = c.id
    WHERE 1=1
  `;
  const params = [];

  if (clinic_id) {
    sql += ' AND hw.clinic_id = ?';
    params.push(clinic_id);
  }

  if (role) {
    sql += ' AND hw.role = ?';
    params.push(role);
  }

  sql += ' ORDER BY hw.created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), offset);

  const workers = await query(sql, params);

  // Get total count
  let countSql = 'SELECT COUNT(*) as total FROM health_workers WHERE 1=1';
  const countParams = [];
  if (clinic_id) {
    countSql += ' AND clinic_id = ?';
    countParams.push(clinic_id);
  }
  if (role) {
    countSql += ' AND role = ?';
    countParams.push(role);
  }
  const total = await query(countSql, countParams);

  res.json({
    success: true,
    data: workers,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: total[0].total,
      pages: Math.ceil(total[0].total / limit)
    }
  });
});

// Create health alert
const createAlert = asyncHandler(async (req, res) => {
  const { subject, message, target_group, target_location } = req.body;
  const userId = req.user.id;
  try {
    // Create alert
    const result = await query(
      `INSERT INTO alerts (subject, message, target_group, target_location, created_by) 
       VALUES (?, ?, ?, ?, ?)`,
      [subject, message, target_group, target_location || null, userId]
    );

    const alertId = result.insertId;


    // Get all registered users (patients and health workers)
    let recipients = [];
    try {
      const patients = await query('SELECT email, name FROM patients WHERE is_verified = TRUE');
      const workers = await query('SELECT email, name FROM health_workers WHERE is_active = TRUE');
      recipients = [...patients, ...workers];
    } catch (recErr) {
      console.error('Error fetching recipients:', recErr);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch registered users for alert delivery.'
      });
    }

    // Send emails (in background)
    let sentCount = 0;
    for (const recipient of recipients) {
      try {
        await sendHealthAlert(recipient.email, { subject, message });
        sentCount++;
      } catch (error) {
        console.error(`Failed to send alert to ${recipient.email}:`, error);
      }
    }

    // Update alert status
    await query(
      `UPDATE alerts SET email_sent = TRUE, sent_count = ?, delivery_status = 'sent', sent_at = NOW() 
       WHERE id = ?`,
      [sentCount, alertId]
    );

    // Log audit
    await logAudit(userId, 'admin', 'create', 'alert', alertId, `Health alert sent to ${sentCount} recipients`, req);

    return res.status(201).json({
      success: true,
      message: `Health alert created and sent to ${sentCount} recipients`,
      data: {
        id: alertId,
        sentCount
      }
    });

  } catch (error) {
    console.error('createAlert error:', error);
    // Handle missing table specifically
    if (error && error.code === 'ER_NO_SUCH_TABLE') {
      return res.status(500).json({
        success: false,
        message: 'Database table not available: alerts. Please run database migrations or contact the administrator.'
      });
    }
    // Re-throw other errors to be handled by asyncHandler/global error handler
    throw error;
  }
});

// Get all alerts
const getAllAlerts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const alerts = await query(
      `SELECT a.*, hw.name as created_by_name
       FROM alerts a
       JOIN health_workers hw ON a.created_by = hw.id
       ORDER BY a.created_at DESC
       LIMIT ? OFFSET ?`,
      [parseInt(limit), offset]
    );

    const total = await query('SELECT COUNT(*) as total FROM alerts');

    return res.json({
      success: true,
      data: alerts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total[0].total,
        pages: Math.ceil(total[0].total / limit)
      }
    });
  } catch (error) {
    console.error('getAllAlerts error:', error);
    if (error && error.code === 'ER_NO_SUCH_TABLE') {
      return res.status(500).json({
        success: false,
        message: 'Database table not available: alerts. Please run database migrations or contact the administrator.'
      });
    }
    throw error;
  }
});

// Get audit logs
const getAuditLogs = asyncHandler(async (req, res) => {
  const { user_type, action, page = 1, limit = 50 } = req.query;
  const offset = (page - 1) * limit;

  let sql = 'SELECT * FROM audit_logs WHERE 1=1';
  const params = [];

  if (user_type) {
    sql += ' AND user_type = ?';
    params.push(user_type);
  }

  if (action) {
    sql += ' AND action = ?';
    params.push(action);
  }

  sql += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), offset);

  const logs = await query(sql, params);

  // Get total count
  let countSql = 'SELECT COUNT(*) as total FROM audit_logs WHERE 1=1';
  const countParams = [];
  if (user_type) {
    countSql += ' AND user_type = ?';
    countParams.push(user_type);
  }
  if (action) {
    countSql += ' AND action = ?';
    countParams.push(action);
  }
  const total = await query(countSql, countParams);

  res.json({
    success: true,
    data: logs,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: total[0].total,
      pages: Math.ceil(total[0].total / limit)
    }
  });
});

// Update user status (activate/deactivate)
const updateUserStatus = asyncHandler(async (req, res) => {
  const { userId, userType, isActive } = req.body;
  const adminId = req.user.id;

  const table = userType === 'patient' ? 'patients' : 'health_workers';
  const field = userType === 'patient' ? 'is_verified' : 'is_active';

  await query(
    `UPDATE ${table} SET ${field} = ? WHERE id = ?`,
    [isActive ? 1 : 0, userId]
  );

  // Log audit
  await logAudit(
    adminId,
    'admin',
    isActive ? 'activate' : 'deactivate',
    userType,
    userId,
    `User ${isActive ? 'activated' : 'deactivated'}`,
    req
  );

  res.json({
    success: true,
    message: `User ${isActive ? 'activated' : 'deactivated'} successfully`
  });
});

module.exports = {
  getDashboardStats,
  getAnalytics,
  getAllPatients,
  getAllHealthWorkers,
  createAlert,
  getAllAlerts,
  getAuditLogs,
  updateUserStatus
};
