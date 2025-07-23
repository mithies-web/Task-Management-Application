import express from 'express';
import { body, validationResult } from 'express-validator';
import Task from '../models/Task.js';
import Project from '../models/Project.js';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authenticateToken, requireTeamLead } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// @route   GET /api/tasks
// @desc    Get tasks (filtered by user permissions)
// @access  Private
router.get('/', asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, priority, projectId, assigneeId, sprintId } = req.query;
  
  // Build filter object based on user role
  let filter = {};
  
  // Non-admin users can only see tasks they're assigned to or created
  if (req.user.role !== 'admin') {
    filter.$or = [
      { assigneeId: req.user._id },
      { createdBy: req.user._id }
    ];
  }
  
  // Apply additional filters
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (projectId) filter.projectId = projectId;
  if (assigneeId) filter.assigneeId = assigneeId;
  if (sprintId) filter.sprintId = sprintId;

  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  // Get tasks with populated data
  const tasks = await Task.find(filter)
    .populate('projectId', 'name team')
    .populate('assigneeId', 'name email profileImg')
    .populate('createdBy', 'name email')
    .populate('sprintId', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  // Get total count for pagination
  const total = await Task.countDocuments(filter);

  res.json({
    success: true,
    data: tasks,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    }
  });
}));

// @route   GET /api/tasks/:id
// @desc    Get task by ID
// @access  Private
router.get('/:id', asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate('projectId', 'name team')
    .populate('assigneeId', 'name email profileImg')
    .populate('createdBy', 'name email')
    .populate('sprintId', 'name')
    .populate('comments.author', 'name profileImg');

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found'
    });
  }

  // Check permissions
  if (req.user.role !== 'admin' && 
      task.assigneeId?.toString() !== req.user._id.toString() && 
      task.createdBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  res.json({
    success: true,
    data: task
  });
}));

// @route   POST /api/tasks
// @desc    Create new task
// @access  Private (Team Lead or Admin)
router.post('/', requireTeamLead, [
  body('title').trim().isLength({ min: 1 }).withMessage('Task title is required'),
  body('projectId').isMongoId().withMessage('Valid project ID is required'),
  body('dueDate').isISO8601().withMessage('Valid due date is required'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid priority'),
  body('assigneeId').optional().isMongoId().withMessage('Invalid assignee ID')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { projectId, assigneeId } = req.body;

  // Validate project exists
  const project = await Project.findById(projectId);
  if (!project) {
    return res.status(400).json({
      success: false,
      message: 'Project not found'
    });
  }

  // Validate assignee exists if provided
  if (assigneeId) {
    const assignee = await User.findById(assigneeId);
    if (!assignee) {
      return res.status(400).json({
        success: false,
        message: 'Assignee not found'
      });
    }
    req.body.assignee = assignee.name;
  }

  // Create task
  const task = await Task.create({
    ...req.body,
    createdBy: req.user._id
  });

  // Populate the created task
  await task.populate('projectId', 'name team');
  await task.populate('assigneeId', 'name email profileImg');
  await task.populate('createdBy', 'name email');

  res.status(201).json({
    success: true,
    message: 'Task created successfully',
    data: task
  });
}));

// @route   PUT /api/tasks/:id
// @desc    Update task
// @access  Private
router.put('/:id', [
  body('title').optional().trim().isLength({ min: 1 }).withMessage('Task title cannot be empty'),
  body('dueDate').optional().isISO8601().withMessage('Valid due date is required'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid priority'),
  body('status').optional().isIn(['todo', 'in-progress', 'review', 'done', 'blocked']).withMessage('Invalid status'),
  body('progress').optional().isInt({ min: 0, max: 100 }).withMessage('Progress must be between 0 and 100')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  // Find task
  const task = await Task.findById(req.params.id);
  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found'
    });
  }

  // Check permissions
  if (req.user.role !== 'admin' && 
      req.user.role !== 'team-lead' &&
      task.assigneeId?.toString() !== req.user._id.toString() && 
      task.createdBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  // Update assignee name if assigneeId is being updated
  if (req.body.assigneeId) {
    const assignee = await User.findById(req.body.assigneeId);
    if (!assignee) {
      return res.status(400).json({
        success: false,
        message: 'Assignee not found'
      });
    }
    req.body.assignee = assignee.name;
  }

  // Update task
  const updatedTask = await Task.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('projectId', 'name team')
   .populate('assigneeId', 'name email profileImg')
   .populate('createdBy', 'name email');

  res.json({
    success: true,
    message: 'Task updated successfully',
    data: updatedTask
  });
}));

// @route   DELETE /api/tasks/:id
// @desc    Delete task
// @access  Private (Team Lead or Admin)
router.delete('/:id', requireTeamLead, asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found'
    });
  }

  await Task.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Task deleted successfully'
  });
}));

// @route   POST /api/tasks/:id/comments
// @desc    Add comment to task
// @access  Private
router.post('/:id/comments', [
  body('content').trim().isLength({ min: 1 }).withMessage('Comment content is required')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const task = await Task.findById(req.params.id);
  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found'
    });
  }

  // Add comment
  await task.addComment(req.user._id, req.body.content);

  // Populate and return updated task
  await task.populate('comments.author', 'name profileImg');

  res.json({
    success: true,
    message: 'Comment added successfully',
    data: task
  });
}));

// @route   PUT /api/tasks/:id/progress
// @desc    Update task progress
// @access  Private
router.put('/:id/progress', [
  body('progress').isInt({ min: 0, max: 100 }).withMessage('Progress must be between 0 and 100')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const task = await Task.findById(req.params.id);
  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found'
    });
  }

  // Check permissions
  if (req.user.role !== 'admin' && 
      req.user.role !== 'team-lead' &&
      task.assigneeId?.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  // Update progress
  await task.updateProgress(req.body.progress);

  res.json({
    success: true,
    message: 'Task progress updated successfully',
    data: task
  });
}));

export default router;