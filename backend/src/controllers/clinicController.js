// Clinic Controller
const { query } = require('../config/db');
const { logAudit } = require('../middleware/audit');
const { asyncHandler } = require('../middleware/errorHandler');
const { sortByDistance, filterByRadius, formatDistance } = require('../utils/distance');

// Get all clinics
const getAllClinics = asyncHandler(async (req, res) => {
  const { is_active, page, limit } = req.query;
  
  // Provide defaults and ensure they're numbers
  const validPageNum = Math.max(1, parseInt(page) || 1);
  const validLimitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
  
  console.log('🏥 Clinics Pagination:', { 
    raw: { page, limit }, 
    parsed: { validPageNum, validLimitNum },
    offset: (validPageNum - 1) * validLimitNum
  });
  
  const offset = (validPageNum - 1) * validLimitNum;

  let sql = 'SELECT * FROM clinics WHERE 1=1';
  const params = [];

  if (is_active !== undefined) {
    sql += ' AND is_active = ?';
    params.push(is_active === 'true' ? 1 : 0);
  }

  sql += ' ORDER BY name ASC LIMIT ? OFFSET ?';
  params.push(parseInt(validLimitNum, 10).toString(), parseInt(offset, 10).toString());

  console.log('🔍 FINAL CLINICS SQL PARAMS:', {
    sql: sql.substring(sql.length - 40),
    params,
    types: params.map(p => typeof p),
    isNaN: params.map(p => Number.isNaN(p))
  });

  const clinics = await query(sql, params);

  // Get total count
  let countSql = 'SELECT COUNT(*) as total FROM clinics WHERE 1=1';
  const countParams = [];
  if (is_active !== undefined) {
    countSql += ' AND is_active = ?';
    countParams.push(is_active === 'true' ? 1 : 0);
  }
  const total = await query(countSql, countParams);

  res.json({
    success: true,
    data: clinics,
    pagination: {
      page: validPageNum,
      limit: validLimitNum,
      total: total[0].total,
      pages: Math.ceil(total[0].total / validLimitNum)
    }
  });
});

// Get clinic by ID
const getClinicById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const clinics = await query('SELECT * FROM clinics WHERE id = ?', [id]);

  if (clinics.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Clinic not found'
    });
  }

  // Get clinic statistics
  const appointmentCount = await query(
    'SELECT COUNT(*) as count FROM appointments WHERE clinic_id = ?',
    [id]
  );

  const referralCount = await query(
    'SELECT COUNT(*) as count FROM referrals WHERE clinic_id = ?',
    [id]
  );

  const workerCount = await query(
    'SELECT COUNT(*) as count FROM health_workers WHERE clinic_id = ? AND is_active = TRUE',
    [id]
  );

  const clinic = {
    ...clinics[0],
    statistics: {
      totalAppointments: appointmentCount[0].count,
      totalReferrals: referralCount[0].count,
      totalWorkers: workerCount[0].count
    }
  };

  res.json({
    success: true,
    data: clinic
  });
});

// Get nearest clinics using Haversine distance
const getNearestClinics = asyncHandler(async (req, res) => {
  const { latitude, longitude, radius = 50, limit = 10 } = req.query;

  if (latitude === undefined || longitude === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Latitude and longitude are required'
    });
  }

  const userLat = parseFloat(latitude);
  const userLon = parseFloat(longitude);
  const maxRadius = parseFloat(radius);
  const maxLimit = parseInt(limit, 10);

  if (Number.isNaN(userLat) || Number.isNaN(userLon)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid coordinates provided'
    });
  }

  // Fetch clinics with coordinates
  const clinics = await query(
    `SELECT id, name, location, contact, email, capacity, operating_hours,
            latitude, longitude, is_active
       FROM clinics
      WHERE is_active = TRUE
        AND latitude IS NOT NULL
        AND longitude IS NOT NULL`
  );

  if (!clinics.length) {
    return res.json({
      success: true,
      message: 'No clinics with location data found',
      data: {
        userLocation: { latitude: userLat, longitude: userLon },
        clinics: [],
        count: 0
      }
    });
  }

  // Calculate and sort by distance
  let sortedClinics = sortByDistance(clinics, userLat, userLon).map((clinic) => ({
    ...clinic,
    distanceLabel: formatDistance(clinic.distance)
  }));

  // Filter by radius if provided
  if (!Number.isNaN(maxRadius) && maxRadius > 0) {
    sortedClinics = filterByRadius(sortedClinics, maxRadius);
  }

  // Apply limit
  const limitedClinics = sortedClinics.slice(0, Number.isNaN(maxLimit) || maxLimit <= 0 ? 10 : maxLimit);

  res.json({
    success: true,
    message: `Found ${limitedClinics.length} clinic(s) near you`,
    data: {
      userLocation: { latitude: userLat, longitude: userLon },
      searchRadius: Number.isNaN(maxRadius) ? null : maxRadius,
      clinics: limitedClinics,
      count: limitedClinics.length
    }
  });
});

// Create clinic (Admin only)
const createClinic = asyncHandler(async (req, res) => {
  const { name, location, contact, email, capacity, operating_hours } = req.body;
  const userId = req.user.id;

  // Check if clinic name exists
  const existing = await query(
    'SELECT id FROM clinics WHERE name = ? AND location = ?',
    [name, location]
  );

  if (existing.length > 0) {
    return res.status(409).json({
      success: false,
      message: 'Clinic with this name already exists at this location'
    });
  }

  // Create clinic
  const result = await query(
    `INSERT INTO clinics (name, location, contact, email, capacity, operating_hours) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [name, location, contact, email || null, capacity || 50, operating_hours || '8:00 AM - 5:00 PM']
  );

  const clinicId = result.insertId;

  // Log audit
  await logAudit(userId, 'admin', 'create', 'clinic', clinicId, `Clinic created: ${name}`, req);

  res.status(201).json({
    success: true,
    message: 'Clinic created successfully',
    data: {
      id: clinicId,
      name,
      location
    }
  });
});

// Update clinic (Admin only)
const updateClinic = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, location, contact, email, capacity, operating_hours, is_active } = req.body;
  const userId = req.user.id;

  // Check if clinic exists
  const clinics = await query('SELECT * FROM clinics WHERE id = ?', [id]);

  if (clinics.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Clinic not found'
    });
  }

  // Build update query
  const updates = [];
  const values = [];

  if (name) {
    updates.push('name = ?');
    values.push(name);
  }
  if (location) {
    updates.push('location = ?');
    values.push(location);
  }
  if (contact) {
    updates.push('contact = ?');
    values.push(contact);
  }
  if (email !== undefined) {
    updates.push('email = ?');
    values.push(email);
  }
  if (capacity !== undefined) {
    updates.push('capacity = ?');
    values.push(capacity);
  }
  if (operating_hours) {
    updates.push('operating_hours = ?');
    values.push(operating_hours);
  }
  if (is_active !== undefined) {
    updates.push('is_active = ?');
    values.push(is_active ? 1 : 0);
  }

  if (updates.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No fields to update'
    });
  }

  values.push(id);

  await query(
    `UPDATE clinics SET ${updates.join(', ')} WHERE id = ?`,
    values
  );

  // Log audit
  await logAudit(userId, 'admin', 'update', 'clinic', id, `Clinic updated: ${clinics[0].name}`, req);

  res.json({
    success: true,
    message: 'Clinic updated successfully'
  });
});

// Delete clinic (Admin only)
const deleteClinic = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  // Check if clinic exists
  const clinics = await query('SELECT name FROM clinics WHERE id = ?', [id]);

  if (clinics.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Clinic not found'
    });
  }

  // Check if clinic has active appointments or referrals
  const activeAppointments = await query(
    `SELECT COUNT(*) as count FROM appointments 
     WHERE clinic_id = ? AND status IN ('scheduled', 'confirmed')`,
    [id]
  );

  if (activeAppointments[0].count > 0) {
    return res.status(409).json({
      success: false,
      message: 'Cannot delete clinic with active appointments. Please cancel or complete them first.'
    });
  }

  // Soft delete by setting inactive
  await query('UPDATE clinics SET is_active = FALSE WHERE id = ?', [id]);

  // Log audit
  await logAudit(userId, 'admin', 'delete', 'clinic', id, `Clinic deleted: ${clinics[0].name}`, req);

  res.json({
    success: true,
    message: 'Clinic deleted successfully'
  });
});

module.exports = {
  getAllClinics,
  getClinicById,
  createClinic,
  updateClinic,
  deleteClinic,
  getNearestClinics
};
