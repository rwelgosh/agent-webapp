/**
 * Main router file that organizes all application routes
 */
const express = require('express');
const router = express.Router();

// Import route modules
const itemRoutes = require('./item.routes');
const authRoutes = require('./auth.routes');
const statusRoutes = require('./status.routes');

// Register routes with path prefixes
router.use('/items', itemRoutes);
router.use('/auth', authRoutes);
router.use('/', statusRoutes);

module.exports = router; 