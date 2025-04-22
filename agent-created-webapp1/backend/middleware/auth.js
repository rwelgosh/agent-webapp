/**
 * Authentication middleware
 * Provides JWT token generation and verification
 */
const jwt = require('jsonwebtoken');
const { ApiError } = require('./errorHandler');
const config = require('../config/config');

/**
 * Generate JWT token with payload
 * 
 * @param {Object} payload - Data to include in the token
 * @returns {String} JWT token
 */
const generateToken = (payload) => {
  return jwt.sign(
    payload, 
    config.jwt.secret, 
    { expiresIn: config.jwt.expiresIn }
  );
};

/**
 * Middleware to authenticate JWT token
 * Verifies token and adds user data to request
 */
const authenticateJWT = (req, res, next) => {
  // Get auth header
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return next(new ApiError(401, 'Authentication required', 'AUTH_REQUIRED'));
  }
  
  // Check header format
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return next(new ApiError(401, 'Invalid authorization format. Use: Bearer <token>', 'INVALID_AUTH_FORMAT'));
  }
  
  const token = parts[1];
  
  // Verify token
  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Token has expired', 'TOKEN_EXPIRED'));
    }
    
    return next(new ApiError(401, 'Invalid token', 'INVALID_TOKEN'));
  }
};

/**
 * Middleware for role-based authorization
 * 
 * @param {...String} roles - Allowed roles
 * @returns {Function} Middleware function
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'User not authenticated', 'AUTH_REQUIRED'));
    }
    
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, 'Insufficient permissions', 'INSUFFICIENT_PERMISSIONS'));
    }
    
    next();
  };
};

module.exports = {
  generateToken,
  authenticateJWT,
  authorize
}; 