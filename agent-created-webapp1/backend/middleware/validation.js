/**
 * Express Validator middleware
 * Provides validation and sanitization for request data
 */
const { validationResult } = require('express-validator');

/**
 * Middleware to validate request data using express-validator
 * Checks for validation errors and returns standardized error response
 */
const validateRequest = (req, res, next) => {
  // Get validation errors from Express-validator
  const errors = validationResult(req);
  
  // If there are validation errors, return a 400 response with error details
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: errors.array().map(err => ({
          field: err.path,
          message: err.msg
        }))
      }
    });
  }
  
  // If validation passes, continue to the next middleware/controller
  next();
};

module.exports = { validateRequest }; 