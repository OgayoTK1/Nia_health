// Feedback Routes
const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const { asyncHandler } = require('../middleware/errorHandler');
const { validateFeedback, validateId, validatePagination } = require('../middleware/validator');
const { authenticate, isAdmin, optionalAuth } = require('../middleware/auth');

// Submit feedback
const submitFeedback = asyncHandler(async (req, res) => {
  const { name, email, subject, message, rating, user_type } = req.body;

  const result = await query(
    `INSERT INTO feedback (name, email, user_type, subject, message, rating) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [name, email || null, user_type || 'visitor', subject || null, message, rating || null]
  );

  res.status(201).json({
    success: true,
    message: 'Thank you for your feedback!',
    data: { id: result.insertId }
  });
});

// Get all feedback (Admin)
const getAllFeedback = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  let sql = 'SELECT * FROM feedback WHERE 1=1';
  const params = [];

  if (status) {
    sql += ' AND status = ?';
    params.push(status);
  }

  sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), offset);

  const feedback = await query(sql, params);

  let countSql = 'SELECT COUNT(*) as total FROM feedback WHERE 1=1';
  const countParams = [];
  if (status) {
    countSql += ' AND status = ?';
    countParams.push(status);
  }
  const total = await query(countSql, countParams);

  res.json({
    success: true,
    data: feedback,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: total[0].total,
      pages: Math.ceil(total[0].total / limit)
    }
  });
});

// Update feedback status (Admin)
const updateFeedbackStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, admin_response } = req.body;

  await query(
    'UPDATE feedback SET status = ?, admin_response = ? WHERE id = ?',
    [status, admin_response || null, id]
  );

  res.json({
    success: true,
    message: 'Feedback updated successfully'
  });
});

router.post('/', optionalAuth, validateFeedback, submitFeedback);
router.get('/', authenticate, isAdmin, validatePagination, getAllFeedback);
router.patch('/:id', authenticate, isAdmin, validateId, updateFeedbackStatus);

module.exports = router;
