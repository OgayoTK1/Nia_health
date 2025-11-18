// Audit Logger Middleware
const { query } = require('../config/db');

// Log audit trail
const logAudit = async (userId, userType, action, entityType = null, entityId = null, description = null, req = null) => {
  try {
    const ipAddress = req ? (req.ip || req.connection.remoteAddress) : null;
    const userAgent = req ? req.headers['user-agent'] : null;
    
    await query(
      `INSERT INTO audit_logs (user_id, user_type, action, entity_type, entity_id, description, ip_address, user_agent) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, userType, action, entityType, entityId, description, ipAddress, userAgent]
    );
  } catch (error) {
    console.error('Audit logging error:', error);
    // Don't throw error - audit logging shouldn't break the application
  }
};

// Middleware to automatically log requests
const auditMiddleware = (action) => {
  return async (req, res, next) => {
    // Store original json method
    const originalJson = res.json;
    
    // Override json method to log after response
    res.json = function(data) {
      // Only log successful operations
      if (data.success !== false && req.user) {
        const entityType = req.baseUrl.split('/').pop(); // Get entity from URL
        const entityId = req.params.id || (data.data && data.data.id);
        
        logAudit(
          req.user.id,
          req.user.userType || req.user.role,
          action,
          entityType,
          entityId,
          `${action} ${entityType}`,
          req
        );
      }
      
      // Call original json method
      return originalJson.call(this, data);
    };
    
    next();
  };
};

module.exports = {
  logAudit,
  auditMiddleware
};
