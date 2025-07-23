import express from 'express';
import { body, validationResult } from 'express-validator';
import Sprint from '../models/Sprint.js';
import Project from '../models/Project.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authenticateToken, requireTeamLead } from '../middleware/auth.js';

const router = express.Router();

// Sprint model (create if not exists)
const sprintSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Sprint name is required'],
    trim: true
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project ID is required']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  status: {
    type: String,
    enum: ['not-started', 'in-progress', 'completed'],
    default: 'not-started'
  },
  goal: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  tasks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

sprintSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

const Sprint = mongoose.model('Sprint', sprintSchema);

// All routes require authentication
router.use(authenticateToken);

// @route   GET /api/sprints
// @desc    Get sprints (filtered by user permissions)
// @access  Private
router.get('/', asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, projectId } = req.query;
  
  // Build filter object
  let filter = {};
  
  if (status) filter.status = status;
  if (projectId) filter.projectId = projectId;

  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  // Get sprints with populated data
  const sprints = await Sprint.find(filter)
    .populate('projectId', 'name team')
    .populate('tasks', 'title status priority')
    .sort({ startDate: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  // Get total count for pagination
  const total = await Sprint.countDocuments(filter);

  res.json({
    success: true,
    data: sprints,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    }
  });
}));

// @route   GET /api/sprints/:id
// @desc    Get sprint by ID
// @access  Private
router.get('/:id', asyncHandler(async (req, res) => {
  const sprint = await Sprint.findById(req.params.id)
    .populate('projectId', 'name team')
    .populate('tasks', 'title status priority assignee dueDate');

  if (!sprint) {
    return res.status(404).json({
      success: false,
      message: 'Sprint not found'
    });
  }

  res.json({
    success: true,
    data: sprint
  });
}));

// @route   POST /api/sprints
// @desc    Create new sprint
// @access  Private (Team Lead or Admin)
router.post('/', requireTeamLead, [
  body('name').trim().isLength({ min: 1 }).withMessage('Sprint name is required'),
  body('projectId').isMongoId().withMessage('Valid project ID is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { projectId, startDate, endDate } = req.body;

  // Validate project exists
  const project = await Project.findById(projectId);
  if (!project) {
    return res.status(400).json({
      success: false,
      message: 'Project not found'
    });
  }

  // Validate dates
  if (new Date(startDate) >= new Date(endDate)) {
    return res.status(400).json({
      success: false,
      message: 'End date must be after start date'
    });
  }

  // Create sprint
  const sprint = await Sprint.create(req.body);

  // Populate the created sprint
  await sprint.populate('projectId', 'name team');

  res.status(201).json({
    success: true,
    message: 'Sprint created successfully',
    data: sprint
  });
}));

// @route   PUT /api/sprints/:id
// @desc    Update sprint
// @access  Private (Team Lead or Admin)
router.put('/:id', requireTeamLead, [
  body('name').optional().trim().isLength({ min: 1 }).withMessage('Sprint name cannot be empty'),
  body('startDate').optional().isISO8601().withMessage('Valid start date is required'),
  body('endDate').optional().isISO8601().withMessage('Valid end date is required'),
  body('status').optional().isIn(['not-started', 'in-progress', 'completed']).withMessage('Invalid status')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  // Find sprint
  const sprint = await Sprint.findById(req.params.id);
  if (!sprint) {
    return res.status(404).json({
      success: false,
      message: 'Sprint not found'
    });
  }

  // Validate dates if being updated
  const { startDate, endDate } = req.body;
  const currentStartDate = startDate ? new Date(startDate) : sprint.startDate;
  const currentEndDate = endDate ? new Date(endDate) : sprint.endDate;

  if (currentStartDate >= currentEndDate) {
    return res.status(400).json({
      success: false,
      message: 'End date must be after start date'
    });
  }

  // Update sprint
  const updatedSprint = await Sprint.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('projectId', 'name team')
   .populate('tasks', 'title status priority');

  res.json({
    success: true,
    message: 'Sprint updated successfully',
    data: updatedSprint
  });
}));

// @route   DELETE /api/sprints/:id
// @desc    Delete sprint
// @access  Private (Team Lead or Admin)
router.delete('/:id', requireTeamLead, asyncHandler(async (req, res) => {
  const sprint = await Sprint.findById(req.params.id);

  if (!sprint) {
    return res.status(404).json({
      success: false,
      message: 'Sprint not found'
    });
  }

  await Sprint.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Sprint deleted successfully'
  });
}));

export default router;