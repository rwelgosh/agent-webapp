/**
 * Swagger/OpenAPI configuration for API documentation
 */
const swaggerJsdoc = require('swagger-jsdoc');
const config = require('./config');

// Swagger options
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Express API Documentation',
      version: '1.0.0',
      description: 'API documentation for the Express backend server',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      }
    },
    servers: [
      {
        url: `http://localhost:${config.port}`,
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [
    './backend/routes/*.js',
    './backend/models/*.js'
  ]
};

// Generate Swagger specification
const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec; 