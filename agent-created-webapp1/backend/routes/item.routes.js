/**
 * Item-related routes
 */
const express = require('express');
const { body, param, query } = require('express-validator');
const { validateRequest } = require('../middleware/validation');
const { authenticateJWT, authorize } = require('../middleware/auth');
const { ApiError } = require('../middleware/errorHandler');
const Item = require('../models/Item');

const router = express.Router();

/**
 * @swagger
 * /api/items:
 *   get:
 *     summary: Get all items
 *     description: Retrieve a list of all items
 *     responses:
 *       200:
 *         description: List of items
 */
router.get('/', async (req, res, next) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });
    
    res.json({
      success: true,
      items
    });
  } catch (error) {
    next(new ApiError(500, 'Error retrieving items'));
  }
});

/**
 * @swagger
 * /api/items/{id}:
 *   get:
 *     summary: Get item by ID
 *     description: Retrieve a specific item by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the item to retrieve
 *     responses:
 *       200:
 *         description: The item object
 *       404:
 *         description: Item not found
 */
router.get('/:id', [
  param('id').isMongoId().withMessage('Invalid item ID'),
  validateRequest
], async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    
    if (!item) {
      return next(new ApiError(404, `Item with ID ${req.params.id} not found`, 'ITEM_NOT_FOUND'));
    }
    
    res.json({
      success: true,
      item
    });
  } catch (error) {
    next(new ApiError(500, 'Error retrieving item'));
  }
});

/**
 * @swagger
 * /api/items:
 *   post:
 *     summary: Create a new item
 *     description: Add a new item to the database
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: The created item
 *       400:
 *         description: Validation error
 */
router.post('/', [
  body('title').trim().notEmpty().withMessage('Title is required')
    .isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),
  body('content').trim().notEmpty().withMessage('Content is required'),
  validateRequest
], async (req, res, next) => {
  try {
    const { title, content } = req.body;
    
    // Create new item
    const newItem = await Item.create({
      title,
      content,
      // Add user reference if authenticated
      ...(req.user && { user: req.user.id })
    });
    
    res.status(201).json({
      success: true,
      message: 'Item created successfully',
      item: newItem
    });
  } catch (error) {
    next(new ApiError(500, 'Error creating item'));
  }
});

/**
 * @swagger
 * /api/items/{id}:
 *   put:
 *     summary: Update an item
 *     description: Update an existing item by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the item to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: The updated item
 *       404:
 *         description: Item not found
 */
router.put('/:id', [
  param('id').isMongoId().withMessage('Invalid item ID'),
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty')
    .isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),
  body('content').optional().trim().notEmpty().withMessage('Content cannot be empty'),
  validateRequest
], async (req, res, next) => {
  try {
    const updates = {};
    if (req.body.title) updates.title = req.body.title;
    if (req.body.content) updates.content = req.body.content;
    
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );
    
    if (!item) {
      return next(new ApiError(404, `Item with ID ${req.params.id} not found`, 'ITEM_NOT_FOUND'));
    }
    
    res.json({
      success: true,
      message: 'Item updated successfully',
      item
    });
  } catch (error) {
    next(new ApiError(500, 'Error updating item'));
  }
});

/**
 * @swagger
 * /api/items/{id}:
 *   delete:
 *     summary: Delete an item
 *     description: Delete an item by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the item to delete
 *     responses:
 *       200:
 *         description: Successful deletion
 *       404:
 *         description: Item not found
 */
router.delete('/:id', [
  param('id').isMongoId().withMessage('Invalid item ID'),
  validateRequest
], async (req, res, next) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    
    if (!item) {
      return next(new ApiError(404, `Item with ID ${req.params.id} not found`, 'ITEM_NOT_FOUND'));
    }
    
    res.json({
      success: true,
      message: `Item with ID ${req.params.id} deleted successfully`
    });
  } catch (error) {
    next(new ApiError(500, 'Error deleting item'));
  }
});

/**
 * @swagger
 * /api/items/search:
 *   get:
 *     summary: Search items
 *     description: Search items by title or content
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Search results
 */
router.get('/search', [
  query('q').optional().isString(),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  validateRequest
], async (req, res, next) => {
  try {
    const { q } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const skip = (page - 1) * limit;
    
    // Build query
    let query = {};
    if (q) {
      query = { $text: { $search: q } };
    }
    
    // Execute query with pagination
    const items = await Item.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination metadata
    const total = await Item.countDocuments(query);
    
    res.json({
      success: true,
      results: items,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    next(new ApiError(500, 'Error searching items'));
  }
});

module.exports = router; 