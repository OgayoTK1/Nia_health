// Error Handler Middleware
const { query } = require('../config/db');

// Custom error class
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Not Found Handler
const notFound = (req, res, next) => {
  const error = new AppError(`Route not found: ${req.originalUrl}`, 404);
  next(error);
};

// Global Error Handler
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err);
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    error = new AppError('Resource not found', 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000 || err.code === 'ER_DUP_ENTRY') {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    error = new AppError(`Duplicate ${field}. This value already exists.`, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new AppError(message, 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid token. Please log in again.', 401);
  }

  if (err.name === 'TokenExpiredError') {
    error = new AppError('Token expired. Please log in again.', 401);
  }

  // MySQL errors
  if (err.code === 'ER_NO_SUCH_TABLE') {
    error = new AppError('Database table not found. Please contact administrator.', 500);
  }

  if (err.code === 'ER_DUP_ENTRY') {
    const match = err.message.match(/Duplicate entry '(.*)' for key '(.*)'/);
    if (match) {
      error = new AppError(`${match[2]} already exists: ${match[1]}`, 400);
    } else {
      error = new AppError('Duplicate entry. This record already exists.', 400);
    }
  }

  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    error = new AppError('Referenced record does not exist.', 400);
  }

  // Send error response
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      error: err
    })
  });

  // Log critical errors to database
  if (error.statusCode >= 500) {
    logErrorToDatabase(err, req);
  }
};

// Log error to database
const logErrorToDatabase = async (err, req) => {
  try {
    const userId = req.user?.id || null;
    const userType = req.user?.userType || req.user?.role || 'unknown';
    
    await query(
      `INSERT INTO audit_logs (user_id, user_type, action, description, ip_address, user_agent) 
       VALUES (?, ?, 'error', ?, ?, ?)`,
      [
        userId,
        userType,
        err.message,
        req.ip || req.connection.remoteAddress,
        req.headers['user-agent']
      ]
    );
  } catch (error) {
    console.error('Failed to log error to database:', error);
  }
};

// Async handler wrapper
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  AppError,
  notFound,
  errorHandler,
  asyncHandler
};
