import express from 'express';
import { body, validationResult } from 'express-validator';
import Project from '../models/Project.js';
import Team from '../models/Team.js';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authenticateToken, requireTeamLead } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// @route   GET /api/projects
// @desc    Get projects (filtered by user permissions)
// @access  Private
router.get('/', asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, priority, team } = req.query;
  
  // Build filter object based on user role
  let filter = {};
  
  // Non-admin users can only see projects they're part of
  if (req.user.role !== 'admin') {
    if (req.user.team) {
      filter.team = req.user.team;
    } else {
      filter.teamMembers = req.user._id;
    }
  }
  
  // Apply additional filters
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (team) filter.team = team;

  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  // Get projects with populated data
  const projects = await Project.find(filter)
    .populate('team', 'name department')
    .populate('lead', 'name email profileImg')
    .populate('teamMembers', 'name email profileImg')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  // Get total count for pagination
  const total = await Project.countDocuments(filter);

  res.json({
    success: true,
    data: projects,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    }
  });
}));

// @route   GET /api/projects/:id
// @desc    Get project by ID
// @access  Private
router.get('/:id', asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate('team', 'name department')
    .populate('lead', 'name email profileImg')
    .populate('teamMembers', 'name email profileImg role')
    .populate('attachments.uploadedBy', 'name');

  if (!project) {
    return res.status(404).json({
      success: false,
      message: 'Project not found'
    });
  }

  // Check permissions
  if (req.user.role !== 'admin' && 
      project.team?.toString() !== req.user.team?.toString() &&
      !project.teamMembers.some(member => member._id.toString() === req.user._id.toString())) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  res.json({
    success: true,
    data: project
  });
}));

// @route   POST /api/projects
// @desc    Create new project
// @access  Private (Team Lead or Admin)
router.post('/', requireTeamLead, [
  body('name').trim().isLength({ min: 1 }).withMessage('Project name is required'),
  body('team').isMongoId().withMessage('Valid team ID is required'),
  body('lead').isMongoId().withMessage('Valid lead ID is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
  body('deadline').isISO8601().withMessage('Valid deadline is required'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid priority')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { team, lead, startDate, endDate, deadline } = req.body;

  // Validate team exists
  const teamDoc = await Team.findById(team);
  if (!teamDoc) {
    return res.status(400).json({
      success: false,
      message: 'Team not found'
    });
  }

  // Validate lead exists
  const leadUser = await User.findById(lead);
  if (!leadUser) {
    return res.status(400).json({
      success: false,
      message: 'Lead user not found'
    });
  }

  // Validate dates
  if (new Date(startDate) >= new Date(endDate)) {
    return res.status(400).json({
      success: false,
      message: 'End date must be after start date'
    });
  }

  if (new Date(startDate) > new Date(deadline)) {
    return res.status(400).json({
      success: false,
      message: 'Deadline must be after start date'
    });
  }

  // Create project
  const project = await Project.create(req.body);

  // Add project to team's projects array
  await Team.findByIdAndUpdate(team, {
    $addToSet: { projects: project._id }
  });

  // Populate the created project
  await project.populate('team', 'name department');
  await project.populate('lead', 'name email profileImg');

  res.status(201).json({
    success: true,
    message: 'Project created successfully',
    data: project
  });
}));

// @route   PUT /api/projects/:id
// @desc    Update project
// @access  Private (Team Lead or Admin)
router.put('/:id', requireTeamLead, [
  body('name').optional().trim().isLength({ min: 1 }).withMessage('Project name cannot be empty'),
  body('startDate').optional().isISO8601().withMessage('Valid start date is required'),
  body('endDate').optional().isISO8601().withMessage('Valid end date is required'),
  body('deadline').optional().isISO8601().withMessage('Valid deadline is required'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid priority'),
  body('status').optional().isIn(['not-started', 'in-progress', 'completed', 'on-hold', 'cancelled']).withMessage('Invalid status'),
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

  // Find project
  const project = await Project.findById(req.params.id);
  if (!project) {
    return res.status(404).json({
      success: false,
      message: 'Project not found'
    });
  }

  // Check permissions
  if (req.user.role !== 'admin' && 
      project.lead.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  // Validate dates if being updated
  const { startDate, endDate, deadline } = req.body;
  const currentStartDate = startDate ? new Date(startDate) : project.startDate;
  const currentEndDate = endDate ? new Date(endDate) : project.endDate;
  const currentDeadline = deadline ? new Date(deadline) : project.deadline;

  if (currentStartDate >= currentEndDate) {
    return res.status(400).json({
      success: false,
      message: 'End date must be after start date'
    });
  }

  if (currentStartDate > currentDeadline) {
    return res.status(400).json({
      success: false,
      message: 'Deadline must be after start date'
    });
  }

  // Update project
  const updatedProject = await Project.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('team', 'name department')
   .populate('lead', 'name email profileImg')
   .populate('teamMembers', 'name email profileImg');

  res.json({
    success: true,
    message: 'Project updated successfully',
    data: updatedProject
  });
}));

// @route   DELETE /api/projects/:id
// @desc    Delete project
// @access  Private (Admin only)
router.delete('/:id', asyncHandler(async (req, res) => {
  // Only admins can delete projects
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Only administrators can delete projects'
    });
  }

  const project = await Project.findById(req.params.id);

  if (!project) {
    return res.status(404).json({
      success: false,
      message: 'Project not found'
    });
  }

  // Remove project from team's projects array
  await Team.findByIdAndUpdate(project.team, {
    $pull: { projects: project._id }
  });

  await Project.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Project deleted successfully'
  });
}));

// @route   PUT /api/projects/:id/members
// @desc    Update project team members
// @access  Private (Team Lead or Admin)
router.put('/:id/members', requireTeamLead, [
  body('teamMembers').isArray().withMessage('Team members must be an array'),
  body('teamMembers.*').isMongoId().withMessage('Invalid member ID')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { teamMembers } = req.body;

  // Find project
  const project = await Project.findById(req.params.id);
  if (!project) {
    return res.status(404).json({
      success: false,
      message: 'Project not found'
    });
  }

  // Check permissions
  if (req.user.role !== 'admin' && 
      project.lead.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  // Validate all member IDs exist
  const users = await User.find({ _id: { $in: teamMembers } });
  if (users.length !== teamMembers.length) {
    return res.status(400).json({
      success: false,
      message: 'One or more user IDs are invalid'
    });
  }

  // Update project team members
  const updatedProject = await Project.findByIdAndUpdate(
    req.params.id,
    { teamMembers },
    { new: true, runValidators: true }
  ).populate('team', 'name department')
   .populate('lead', 'name email profileImg')
   .populate('teamMembers', 'name email profileImg role');

  res.json({
    success: true,
    message: 'Project team members updated successfully',
    data: updatedProject
  });
}));

export default router;