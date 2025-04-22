/**
 * Authentication routes
 */
const express = require('express');
const { body } = require('express-validator');
const { validateRequest } = require('../middleware/validation');
const { generateToken, authenticateJWT } = require('../middleware/auth');
const { ApiError } = require('../middleware/errorHandler');
const User = require('../models/User');

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Create a new user account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 */
router.post('/register', [
  body('username').trim().notEmpty().withMessage('Username is required')
    .isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters')
    .custom(async (value) => {
      const existingUser = await User.findOne({ username: value });
      if (existingUser) {
        throw new Error('Username already exists');
      }
      return true;
    }),
  body('password').trim().notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  validateRequest
], async (req, res, next) => {
  try {
    const { username, password } = req.body;
    
    // Create new user
    const user = await User.create({
      username,
      password
    });
    
    // Don't include password in response
    const userResponse = {
      id: user._id,
      username: user.username,
      role: user.role,
      createdAt: user.createdAt
    };
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: userResponse
    });
  } catch (error) {
    next(new ApiError(500, 'Error registering user'));
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticate a user and generate JWT token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').trim().notEmpty().withMessage('Password is required'),
  validateRequest
], async (req, res, next) => {
  try {
    const { username, password } = req.body;
    
    // Find user with password (password field is excluded by default)
    const user = await User.findOne({ username }).select('+password');
    
    if (!user) {
      return next(new ApiError(401, 'Invalid username or password', 'INVALID_CREDENTIALS'));
    }
    
    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return next(new ApiError(401, 'Invalid username or password', 'INVALID_CREDENTIALS'));
    }
    
    // Generate JWT token
    const token = generateToken({
      id: user._id,
      username: user.username,
      role: user.role
    });
    
    // Don't include password in response
    const userResponse = {
      id: user._id,
      username: user.username,
      role: user.role
    };
    
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userResponse
    });
  } catch (error) {
    next(new ApiError(500, 'Error during login'));
  }
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user
 *     description: Get the profile of the currently authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *       401:
 *         description: Unauthorized
 */
router.get('/me', authenticateJWT, async (req, res, next) => {
  try {
    // The user object comes from the authenticateJWT middleware
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return next(new ApiError(404, 'User not found', 'USER_NOT_FOUND'));
    }
    
    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(new ApiError(500, 'Error retrieving user profile'));
  }
});

module.exports = router; 