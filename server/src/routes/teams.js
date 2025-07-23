import express from 'express';
import { body, validationResult } from 'express-validator';
import Team from '../models/Team.js';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// @route   GET /api/admin/teams
// @desc    Get all teams
// @access  Private/Admin
router.get('/', asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, department, search } = req.query;
  
  // Build filter object
  const filter = {};
  
  if (department) filter.department = department;
  
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { department: { $regex: search, $options: 'i' } }
    ];
  }

  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  // Get teams with populated data
  const teams = await Team.find(filter)
    .populate('lead', 'name email role')
    .populate('members', 'name email role')
    .populate('projects', 'name status progress')
    .populate('parentTeam', 'name')
    .populate('subTeams', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  // Get total count for pagination
  const total = await Team.countDocuments(filter);

  res.json({
    success: true,
    data: teams,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    }
  });
}));

// @route   GET /api/admin/teams/:id
// @desc    Get team by ID
// @access  Private/Admin
router.get('/:id', asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.id)
    .populate('lead', 'name email role profileImg')
    .populate('members', 'name email role profileImg status')
    .populate('projects', 'name status progress startDate deadline')
    .populate('parentTeam', 'name department')
    .populate('subTeams', 'name department memberCount');

  if (!team) {
    return res.status(404).json({
      success: false,
      message: 'Team not found'
    });
  }

  res.json({
    success: true,
    data: team
  });
}));

// @route   POST /api/admin/teams
// @desc    Create new team
// @access  Private/Admin
router.post('/', [
  body('name').trim().isLength({ min: 2 }).withMessage('Team name must be at least 2 characters'),
  body('department').trim().isLength({ min: 2 }).withMessage('Department must be at least 2 characters'),
  body('lead').optional().isMongoId().withMessage('Invalid lead user ID'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { name, department, lead, description, parentTeam } = req.body;

  // Check if team name already exists
  const existingTeam = await Team.findOne({ name });
  if (existingTeam) {
    return res.status(400).json({
      success: false,
      message: 'Team name already exists'
    });
  }

  // Validate lead user exists and has appropriate role
  if (lead) {
    const leadUser = await User.findById(lead);
    if (!leadUser) {
      return res.status(400).json({
        success: false,
        message: 'Lead user not found'
      });
    }
    
    if (!['admin', 'team-lead'].includes(leadUser.role)) {
      return res.status(400).json({
        success: false,
        message: 'Lead user must have admin or team-lead role'
      });
    }
  }

  // Validate parent team exists
  if (parentTeam) {
    const parentTeamDoc = await Team.findById(parentTeam);
    if (!parentTeamDoc) {
      return res.status(400).json({
        success: false,
        message: 'Parent team not found'
      });
    }
  }

  // Create team
  const team = await Team.create({
    name,
    department,
    lead,
    description,
    parentTeam
  });

  // Populate the created team
  await team.populate('lead', 'name email role');

  res.status(201).json({
    success: true,
    message: 'Team created successfully',
    data: team
  });
}));

// @route   PUT /api/admin/teams/:id
// @desc    Update team
// @access  Private/Admin
router.put('/:id', [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Team name must be at least 2 characters'),
  body('department').optional().trim().isLength({ min: 2 }).withMessage('Department must be at least 2 characters'),
  body('lead').optional().isMongoId().withMessage('Invalid lead user ID'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { name, lead } = req.body;

  // Check if team exists
  const existingTeam = await Team.findById(req.params.id);
  if (!existingTeam) {
    return res.status(404).json({
      success: false,
      message: 'Team not found'
    });
  }

  // Check if new name conflicts with existing team
  if (name && name !== existingTeam.name) {
    const nameConflict = await Team.findOne({ name, _id: { $ne: req.params.id } });
    if (nameConflict) {
      return res.status(400).json({
        success: false,
        message: 'Team name already exists'
      });
    }
  }

  // Validate lead user if provided
  if (lead) {
    const leadUser = await User.findById(lead);
    if (!leadUser) {
      return res.status(400).json({
        success: false,
        message: 'Lead user not found'
      });
    }
    
    if (!['admin', 'team-lead'].includes(leadUser.role)) {
      return res.status(400).json({
        success: false,
        message: 'Lead user must have admin or team-lead role'
      });
    }
  }

  // Update team
  const team = await Team.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('lead', 'name email role')
   .populate('members', 'name email role')
   .populate('projects', 'name status progress');

  res.json({
    success: true,
    message: 'Team updated successfully',
    data: team
  });
}));

// @route   DELETE /api/admin/teams/:id
// @desc    Delete team
// @access  Private/Admin
router.delete('/:id', asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.id);

  if (!team) {
    return res.status(404).json({
      success: false,
      message: 'Team not found'
    });
  }

  // Check if team has members
  if (team.members && team.members.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete team with members. Please reassign members first.'
    });
  }

  // Check if team has projects
  if (team.projects && team.projects.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete team with active projects. Please reassign projects first.'
    });
  }

  await Team.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Team deleted successfully'
  });
}));

// @route   PUT /api/admin/teams/:id/add-members
// @desc    Add members to team
// @access  Private/Admin
router.put('/:id/add-members', [
  body('memberIds').isArray({ min: 1 }).withMessage('Member IDs array is required'),
  body('memberIds.*').isMongoId().withMessage('Invalid member ID')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { memberIds } = req.body;

  // Check if team exists
  const team = await Team.findById(req.params.id);
  if (!team) {
    return res.status(404).json({
      success: false,
      message: 'Team not found'
    });
  }

  // Validate all member IDs exist
  const users = await User.find({ _id: { $in: memberIds } });
  if (users.length !== memberIds.length) {
    return res.status(400).json({
      success: false,
      message: 'One or more user IDs are invalid'
    });
  }

  // Add members to team
  const updatedTeam = await Team.findByIdAndUpdate(
    req.params.id,
    { $addToSet: { members: { $each: memberIds } } },
    { new: true }
  ).populate('members', 'name email role');

  // Update users' team field
  await User.updateMany(
    { _id: { $in: memberIds } },
    { team: req.params.id }
  );

  res.json({
    success: true,
    message: 'Members added to team successfully',
    data: updatedTeam
  });
}));

// @route   PUT /api/admin/teams/:id/remove-members
// @desc    Remove members from team
// @access  Private/Admin
router.put('/:id/remove-members', [
  body('memberIds').isArray({ min: 1 }).withMessage('Member IDs array is required'),
  body('memberIds.*').isMongoId().withMessage('Invalid member ID')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { memberIds } = req.body;

  // Check if team exists
  const team = await Team.findById(req.params.id);
  if (!team) {
    return res.status(404).json({
      success: false,
      message: 'Team not found'
    });
  }

  // Remove members from team
  const updatedTeam = await Team.findByIdAndUpdate(
    req.params.id,
    { $pull: { members: { $in: memberIds } } },
    { new: true }
  ).populate('members', 'name email role');

  // Update users' team field to null
  await User.updateMany(
    { _id: { $in: memberIds } },
    { team: null }
  );

  res.json({
    success: true,
    message: 'Members removed from team successfully',
    data: updatedTeam
  });
}));

export default router;