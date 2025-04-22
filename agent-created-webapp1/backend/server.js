/**
 * Express server with production-ready features:
 * - API validation with express-validator
 * - Structured logging with winston/morgan
 * - Centralized error handling
 * - API documentation with Swagger
 * - JWT authentication
 * - MongoDB database with Mongoose
 * - Socket.io for real-time updates
 */
const express = require('express');
const path = require('path');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const http = require('http');
const socketIo = require('socket.io');

// Import configuration
const config = require('./config/config');
const swaggerSpec = require('./config/swagger');
const { connectToDatabase } = require('./config/database');

// Import middleware
const { httpLogger } = require('./utils/logger');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

// Import routes
const routes = require('./routes');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketIo(server, {
  cors: {
    origin: config.cors.origin,
    methods: config.cors.methods
  }
});

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('A client connected', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected', socket.id);
  });
  
  // Add any custom socket event handlers here
});

// Add Socket.IO instance to app for use in routes
app.set('io', io);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(httpLogger);

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// API routes
app.use('/api', routes);

// Serve Swagger UI
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Serve OpenAPI spec at /api/docs.json
app.get('/api/docs.json', (req, res) => {
  res.json(swaggerSpec);
});

// Handle 404 errors for API routes
app.use('/api/*', notFoundHandler);

// Serve frontend SPA for all other routes (client-side routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Global error handler
app.use(errorHandler);

// Start server
const PORT = config.port;

// IIFE to use async/await with the server startup
(async () => {
  try {
    // Connect to MongoDB
    if (config.env !== 'test') {
      await connectToDatabase();
    }
    
    // Start the server
    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`API documentation available at http://localhost:${PORT}/api/docs`);
      console.log(`Environment: ${config.env}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();

// Export for testing
module.exports = { app, server };
