/**
 * Item model for data persistence
 */
const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Item:
 *       type: object
 *       required:
 *         - title
 *         - content
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated ID of the item
 *         title:
 *           type: string
 *           description: The title of the item
 *         content:
 *           type: string
 *           description: The content of the item
 *         createdAt:
 *           type: string
 *           format: date
 *           description: The date the item was created
 *         updatedAt:
 *           type: string
 *           format: date
 *           description: The date the item was last updated
 */
const itemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  }
}, {
  timestamps: true
});

// Add text index for search functionality
itemSchema.index({ title: 'text', content: 'text' });

const Item = mongoose.model('Item', itemSchema);

module.exports = Item; 