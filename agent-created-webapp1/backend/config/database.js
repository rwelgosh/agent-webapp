/**
 * Database connection module for MongoDB
 * Handles connection, error handling, and cleanup
 */
const mongoose = require('mongoose');
const config = require('./config');

// MongoDB connection function
const connectToDatabase = async () => {
  try {
    await mongoose.connect(config.mongodb.uri, config.mongodb.options);
    
    console.log('Connected to MongoDB successfully');
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...');
    });
    
    // Handle application termination
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed due to app termination');
      process.exit(0);
    });
    
    return mongoose.connection;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
};

module.exports = { connectToDatabase }; 