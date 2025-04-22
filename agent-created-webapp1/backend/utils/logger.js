/**
 * Logging utility using Winston and Morgan
 * Provides structured logging for the application
 */
const winston = require('winston');
const morgan = require('morgan');
const config = require('../config/config');

// Define log format
const logFormat = winston.format.printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

// Create Winston logger
const logger = winston.createLogger({
  level: config.logging.level,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.colorize(),
    logFormat
  ),
  transports: [
    new winston.transports.Console()
  ]
});

// Add file transports in production
if (config.env === 'production') {
  logger.add(new winston.transports.File({ 
    filename: 'logs/error.log', 
    level: 'error',
    maxsize: 5242880, // 5MB
    maxFiles: 5
  }));
  
  logger.add(new winston.transports.File({ 
    filename: 'logs/combined.log',
    maxsize: 5242880, // 5MB
    maxFiles: 5
  }));
}

// Create a stream object for Morgan
const morganStream = {
  write: (message) => logger.info(message.trim())
};

// Create Morgan middleware with custom format
const httpLogger = morgan(
  // Custom format that excludes sensitive data
  ':method :url :status :response-time ms - :res[content-length]',
  { stream: morganStream }
);

module.exports = { logger, httpLogger }; 