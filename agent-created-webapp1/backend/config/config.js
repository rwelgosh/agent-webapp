/**
 * Configuration module for the application
 * Centralizes environment variables with sensible defaults
 */

// Export configuration object
module.exports = {
  // Server settings
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development',
  
  // MongoDB settings
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/express-api',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  },
  
  // JWT settings
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },
  
  // CORS settings
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  },
  
  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info'
  }
}; 