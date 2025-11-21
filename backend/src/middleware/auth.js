// Authentication Middleware
const { verifyAccessToken } = require('../config/jwt');
const { query } = require('../config/db');

// Verify JWT token
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    console.log('🔐 Auth Header:', authHeader ? 'Present' : 'Missing');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No Bearer token found');
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const token = authHeader.split(' ')[1];
    console.log('🔑 Token received (first 20 chars):', token.substring(0, 20) + '...');

    // Verify token
    const decoded = verifyAccessToken(token);
    console.log('✅ Token decoded:', { id: decoded.id, userType: decoded.userType, email: decoded.email });
    
    // Check if user exists and is active
    let user;
    if (decoded.userType === 'patient') {
      console.log('👤 Checking patient in database with ID:', decoded.id);
      const patients = await query(
        'SELECT id, name, email, is_verified FROM patients WHERE id = ? AND is_verified = TRUE',
        [decoded.id]
      );
      user = patients[0];
      console.log('👤 Patient found:', user ? 'Yes' : 'No');
      if (patients.length > 0) {
        console.log('👤 Patient details:', { id: user.id, name: user.name, email: user.email, is_verified: user.is_verified });
      }
    } else {
      console.log('👨‍⚕️ Checking health worker in database with ID:', decoded.id);
      const workers = await query(
        'SELECT id, name, email, role, is_active FROM health_workers WHERE id = ? AND is_active = TRUE',
        [decoded.id]
      );
      user = workers[0];
      console.log('👨‍⚕️ Health worker found:', user ? 'Yes' : 'No');
    }

    if (!user) {
      console.log('❌ User not found in database or inactive');
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found or inactive.'
      });
    }

    // Attach user to request
    req.user = {
      ...decoded,
      ...user
    };
    
    console.log('✅ Authentication successful for user:', req.user.email);
    next();
  } catch (error) {
    console.error('❌ Authentication error:', error.message);
    return res.status(401).json({
      success: false,
      message: error.message || 'Invalid or expired token'
    });
  }
};

// Authorization middleware - check roles
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. Please log in.'
      });
    }

    const userRole = req.user.role || req.user.userType;
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You do not have permission to access this resource.'
      });
    }

    next();
  };
};

// Check if user is patient
const isPatient = (req, res, next) => {
  console.log('🔍 isPatient middleware - checking user:', {
    userType: req.user?.userType,
    role: req.user?.role,
    email: req.user?.email
  });
  
  if (req.user && req.user.userType === 'patient') {
    console.log('✅ Patient access granted');
    return next();
  }
  
  console.log('❌ Patient access denied - userType:', req.user?.userType);
  return res.status(403).json({
    success: false,
    message: 'Access denied. Patients only.'
  });
};

// Check if user is health worker
const isHealthWorker = (req, res, next) => {
  console.log('🔍 isHealthWorker middleware - checking user:', {
    userType: req.user?.userType,
    role: req.user?.role,
    email: req.user?.email
  });
  
  if (req.user && (req.user.userType === 'health_worker' || req.user.role === 'health_worker' || req.user.role === 'admin')) {
    console.log('✅ Health worker access granted');
    return next();
  }
  
  console.log('❌ Health worker access denied - userType:', req.user?.userType, 'role:', req.user?.role);
  return res.status(403).json({
    success: false,
    message: 'Access denied. Health workers only.'
  });
};

// Check if user is admin
const isAdmin = (req, res, next) => {
  console.log('🔍 isAdmin middleware - checking user:', {
    userType: req.user?.userType,
    role: req.user?.role,
    email: req.user?.email,
    id: req.user?.id
  });
  if (req.user && req.user.role === 'admin') {
    console.log('✅ Admin access granted:', req.user.email);
    return next();
  }
  console.log('❌ Admin access denied - userType:', req.user?.userType, 'role:', req.user?.role);
  return res.status(403).json({
    success: false,
    message: 'Access denied. Administrators only.'
  });
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyAccessToken(token);
      req.user = decoded;
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

module.exports = {
  authenticate,
  authorize,
  isPatient,
  isHealthWorker,
  isAdmin,
  optionalAuth
};
