import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// @route   GET /api/notifications
// @desc    Get user notifications
// @access  Private
router.get('/', asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, read, type } = req.query;
  
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  let notifications = user.notifications || [];

  // Filter by read status
  if (read !== undefined) {
    const isRead = read === 'true';
    notifications = notifications.filter(n => n.read === isRead);
  }

  // Filter by type
  if (type) {
    notifications = notifications.filter(n => n.type === type);
  }

  // Sort by date (newest first)
  notifications.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const paginatedNotifications = notifications.slice(skip, skip + parseInt(limit));

  res.json({
    success: true,
    data: paginatedNotifications,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: notifications.length,
      pages: Math.ceil(notifications.length / parseInt(limit))
    },
    unreadCount: notifications.filter(n => !n.read).length
  });
}));

// @route   POST /api/notifications
// @desc    Create notification for user
// @access  Private
router.post('/', [
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
  body('message').trim().isLength({ min: 1 }).withMessage('Message is required'),
  body('type').isIn(['project', 'team', 'task', 'general']).withMessage('Invalid notification type'),
  body('userId').isMongoId().withMessage('Valid user ID is required')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { title, message, type, userId, projectId, taskId } = req.body;

  // Find target user
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Create notification object
  const notification = {
    id: new Date().getTime().toString(),
    title,
    message,
    type,
    date: new Date(),
    read: false,
    projectId,
    taskId,
    memberId: req.user._id
  };

  // Add notification to user
  user.notifications = user.notifications || [];
  user.notifications.push(notification);

  await user.save();

  res.status(201).json({
    success: true,
    message: 'Notification created successfully',
    data: notification
  });
}));

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read', asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const notification = user.notifications.find(n => n.id === req.params.id);
  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found'
    });
  }

  notification.read = true;
  await user.save();

  res.json({
    success: true,
    message: 'Notification marked as read',
    data: notification
  });
}));

// @route   PUT /api/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
router.put('/read-all', asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  if (user.notifications) {
    user.notifications.forEach(notification => {
      notification.read = true;
    });
    await user.save();
  }

  res.json({
    success: true,
    message: 'All notifications marked as read'
  });
}));

// @route   DELETE /api/notifications/:id
// @desc    Delete notification
// @access  Private
router.delete('/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const notificationIndex = user.notifications.findIndex(n => n.id === req.params.id);
  if (notificationIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found'
    });
  }

  user.notifications.splice(notificationIndex, 1);
  await user.save();

  res.json({
    success: true,
    message: 'Notification deleted successfully'
  });
}));

// @route   DELETE /api/notifications
// @desc    Delete all notifications
// @access  Private
router.delete('/', asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  user.notifications = [];
  await user.save();

  res.json({
    success: true,
    message: 'All notifications deleted successfully'
  });
}));

export default router;