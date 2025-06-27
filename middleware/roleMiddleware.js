const { ROLES } = require('../config/constants');

// Check if user has specific role
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Convert single role to array for consistency
      const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
      
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Insufficient permissions.',
          required: roles,
          current: req.user.role
        });
      }

      next();
    } catch (error) {
      console.error('Role middleware error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
};

// Specific role middlewares
const requireAdmin = requireRole(ROLES.ADMIN);
const requireTeacher = requireRole(ROLES.TEACHER);

// Check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === ROLES.ADMIN) {
    req.isAdmin = true;
  } else {
    req.isAdmin = false;
  }
  next();
};

// Check if user is teacher
const isTeacher = (req, res, next) => {
  if (req.user && req.user.role === ROLES.TEACHER) {
    req.isTeacher = true;
  } else {
    req.isTeacher = false;
  }
  next();
};


module.exports = {
  requireRole,
  requireAdmin,
  requireTeacher,
  isAdmin,
  isTeacher,
};
