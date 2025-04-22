/**
 * Status and utility routes
 */
const express = require('express');
const { body } = require('express-validator');
const { validateRequest } = require('../middleware/validation');
const { ApiError } = require('../middleware/errorHandler');

const router = express.Router();

/**
 * @swagger
 * /api/status:
 *   get:
 *     summary: Get server status
 *     description: Returns server status information
 *     responses:
 *       200:
 *         description: Server status
 */
router.get('/status', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'online',
      time: new Date().toISOString(),
      uptime: process.uptime() + ' seconds',
      environment: process.env.NODE_ENV || 'development'
    }
  });
});

/**
 * @swagger
 * /api/echo:
 *   post:
 *     summary: Echo request data
 *     description: Returns the request body with timestamp
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Echo response
 *       400:
 *         description: Invalid request
 */
router.post('/echo', [
  body().notEmpty().withMessage('Request body cannot be empty'),
  validateRequest
], (req, res) => {
  const requestData = req.body;
  
  res.json({
    success: true,
    data: {
      ...requestData,
      timestamp: new Date().toISOString(),
      echoed: true
    }
  });
});

/**
 * @swagger
 * /api/data:
 *   get:
 *     summary: Get dummy data
 *     description: Returns dummy data for frontend development
 *     responses:
 *       200:
 *         description: Dummy data
 */
router.get('/data', (req, res) => {
  res.json({
    success: true,
    data: {
      title: 'Backend API Response',
      content: 'This is dummy data from the backend server',
      items: [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
        { id: 3, name: 'Item 3' }
      ]
    }
  });
});

/**
 * @swagger
 * /api/random:
 *   get:
 *     summary: Get random data
 *     description: Returns randomly generated data
 *     responses:
 *       200:
 *         description: Random data
 */
router.get('/random', (req, res) => {
  // Generate random number of items (between 1 and 5)
  const itemCount = Math.floor(Math.random() * 5) + 1;
  const items = [];
  
  // Generate random items
  for (let i = 0; i < itemCount; i++) {
    items.push({
      id: i + 1,
      name: `Random Item ${i + 1}`,
      value: Math.floor(Math.random() * 1000),
      isActive: Math.random() > 0.5
    });
  }
  
  // Random title options
  const titles = [
    'Random Data Response',
    'Dynamic Content',
    'Generated Information',
    'Fresh Data Sample',
    'Randomized Dataset'
  ];
  
  // Random content options
  const contents = [
    'This data is randomly generated on each request',
    'Dynamically created content for testing purposes',
    'Fresh data generated just for you',
    'New information generated on demand',
    'Random values for frontend testing'
  ];
  
  // Create response with random selections
  res.json({
    success: true,
    data: {
      title: titles[Math.floor(Math.random() * titles.length)],
      content: contents[Math.floor(Math.random() * contents.length)],
      items: items,
      timestamp: new Date().toISOString(),
      randomFactor: Math.random().toFixed(4)
    }
  });
});

/**
 * @swagger
 * /api/search:
 *   get:
 *     summary: Search endpoint
 *     description: Legacy search endpoint (redirects to /api/items/search)
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query
 *     responses:
 *       200:
 *         description: Search results
 */
router.get('/search', (req, res) => {
  // Redirect to the new search endpoint in items routes
  res.redirect(`/api/items/search?${new URLSearchParams(req.query).toString()}`);
});

module.exports = router; 