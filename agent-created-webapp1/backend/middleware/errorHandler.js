/**
 * Error handling middleware
 * Provides centralized error processing for consistent error responses
 */
const { logger } = require('../utils/logger');

/**
 * Custom API Error class for better error classification
 */
class ApiError extends Error {
  constructor(statusCode, message, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Not Found error handler - catches 404 errors
 */
const notFoundHandler = (req, res, next) => {
  const error = new ApiError(404, `Route not found: ${req.originalUrl}`, 'NOT_FOUND');
  next(error);
};

/**
 * Global error handler - processes all errors
 */
const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error(`${err.name}: ${err.message}`, { 
    url: req.originalUrl,
    method: req.method,
    stack: err.stack,
    statusCode: err.statusCode || 500
  });
  
  // Handle API errors
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        code: err.code
      }
    });
  }
  
  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: Object.values(err.errors).map(e => ({
          field: e.path,
          message: e.message
        }))
      }
    });
  }
  
  // Handle all other errors
  return res.status(500).json({
    success: false,
    error: {
      message: process.env.NODE_ENV === 'production' 
        ? 'An unexpected error occurred' 
        : err.message || 'Internal Server Error',
      code: 'INTERNAL_ERROR'
    }
  });
};

module.exports = {
  ApiError,
  notFoundHandler,
  errorHandler
}; 