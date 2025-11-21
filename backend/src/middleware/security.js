// Security Middleware
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

// General rate limiter
const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || 100), // Max 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Strict rate limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.LOGIN_RATE_LIMIT_MAX || 5), // Max 5 attempts
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// OTP rate limiter
const otpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // Max 3 OTP requests
  message: {
    success: false,
    message: 'Too many OTP requests. Please try again after 5 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Registration rate limiter
const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Max 3 registrations per IP per hour
  message: {
    success: false,
    message: 'Too many registration attempts. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Email sending rate limiter
const emailLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10, // Max 10 emails
  message: {
    success: false,
    message: 'Email sending limit reached. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Helmet configuration for security headers
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin'
  }
});

// Input sanitization
const sanitizeInput = (req, res, next) => {
  // Sanitize request body
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        // Remove potential XSS attacks
        req.body[key] = req.body[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .trim();
      }
    });
  }
  
  next();
};

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:5173',
      'https://nia-health.vercel.app',
      'https://nia-health-1a219z2la-ogayo-andrew-aters-projects.vercel.app',
      'http://localhost:5174', // Additional Vite dev server port
      'http://localhost:3000'
    ];
    
    console.log('🔍 CORS Check:', { 
      origin, 
      frontendUrl: process.env.FRONTEND_URL,
      allowedOrigins 
    });
    
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('❌ CORS Blocked:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Session timeout middleware
const sessionTimeout = (req, res, next) => {
  if (req.user && req.user.last_activity) {
    const timeout = parseInt(process.env.SESSION_TIMEOUT || 1800000); // 30 minutes default
    const now = Date.now();
    const lastActivity = new Date(req.user.last_activity).getTime();
    
    if (now - lastActivity > timeout) {
      return res.status(401).json({
        success: false,
        message: 'Session expired due to inactivity. Please log in again.'
      });
    }
  }
  
  next();
};

// Password strength validator
const validatePasswordStrength = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const errors = [];
  
  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters`);
  }
  if (!hasUpperCase) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!hasLowerCase) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!hasNumbers) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    strength: calculatePasswordStrength(password)
  };
};

// Calculate password strength
const calculatePasswordStrength = (password) => {
  let strength = 0;
  
  if (password.length >= 8) strength += 1;
  if (password.length >= 12) strength += 1;
  if (/[a-z]/.test(password)) strength += 1;
  if (/[A-Z]/.test(password)) strength += 1;
  if (/\d/.test(password)) strength += 1;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 1;
  
  if (strength <= 2) return 'weak';
  if (strength <= 4) return 'medium';
  return 'strong';
};

// Generate secure OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Check account lockout
const checkAccountLockout = async (query, email, userType) => {
  const table = userType === 'patient' ? 'patients' : 'health_workers';
  
  const users = await query(
    `SELECT id, failed_login_attempts, account_locked_until FROM ${table} WHERE email = ?`,
    [email]
  );
  
  if (users.length === 0) {
    return { isLocked: false };
  }
  
  const user = users[0];
  
  // Check if account is currently locked
  if (user.account_locked_until && new Date(user.account_locked_until) > new Date()) {
    const unlockTime = new Date(user.account_locked_until);
    const minutesLeft = Math.ceil((unlockTime - new Date()) / 60000);
    
    return {
      isLocked: true,
      message: `Account is locked. Try again in ${minutesLeft} minutes.`
    };
  }
  
  // Reset failed attempts if lock has expired
  if (user.account_locked_until && new Date(user.account_locked_until) <= new Date()) {
    await query(
      `UPDATE ${table} SET failed_login_attempts = 0, account_locked_until = NULL WHERE id = ?`,
      [user.id]
    );
  }
  
  return { isLocked: false, user };
};

// Update failed login attempts
const updateFailedLoginAttempts = async (query, userId, userType) => {
  const table = userType === 'patient' ? 'patients' : 'health_workers';
  const maxAttempts = 5;
  const lockDuration = 15; // minutes
  
  // Increment failed attempts
  await query(
    `UPDATE ${table} SET failed_login_attempts = failed_login_attempts + 1 WHERE id = ?`,
    [userId]
  );
  
  // Check if we need to lock the account
  const users = await query(
    `SELECT failed_login_attempts FROM ${table} WHERE id = ?`,
    [userId]
  );
  
  if (users.length > 0 && users[0].failed_login_attempts >= maxAttempts) {
    const lockUntil = new Date(Date.now() + lockDuration * 60000);
    
    await query(
      `UPDATE ${table} SET account_locked_until = ? WHERE id = ?`,
      [lockUntil, userId]
    );
    
    return {
      locked: true,
      message: `Account locked due to too many failed attempts. Try again in ${lockDuration} minutes.`
    };
  }
  
  return {
    locked: false,
    attemptsLeft: users.length > 0 ? maxAttempts - users[0].failed_login_attempts : maxAttempts
  };
};

// Reset failed login attempts on successful login
const resetFailedLoginAttempts = async (query, userId, userType) => {
  const table = userType === 'patient' ? 'patients' : 'health_workers';
  
  await query(
    `UPDATE ${table} SET failed_login_attempts = 0, account_locked_until = NULL, last_login = NOW() WHERE id = ?`,
    [userId]
  );
};

module.exports = {
  generalLimiter,
  authLimiter,
  otpLimiter,
  registrationLimiter,
  emailLimiter,
  helmetConfig,
  sanitizeInput,
  corsOptions,
  sessionTimeout,
  validatePasswordStrength,
  calculatePasswordStrength,
  generateOTP,
  checkAccountLockout,
  updateFailedLoginAttempts,
  resetFailedLoginAttempts
};
