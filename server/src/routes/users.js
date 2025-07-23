import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/users/register
// @desc    Register a new user (public endpoint)
// @access  Public
router.post('/register', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { name, username, email, password } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { username }]
  });

  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: existingUser.email === email ? 'Email already registered' : 'Username already taken'
    });
  }

  // Create user with default role 'user'
  const user = await User.create({
    name,
    username,
    email,
    password,
    role: 'user'
  });

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    _id: user._id,
    numericalId: user.numericalId,
    name: user.name,
    username: user.username,
    email: user.email,
    role: user.role,
    status: user.status,
    profileImg: user.profileImg
  });
}));

// @route   POST /api/users/login
// @desc    Login user (public endpoint)
// @access  Public
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { email, password } = req.body;

  // Find user and include password for comparison
  const user = await User.findOne({ email }).select('+password').populate('team', 'name');

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  // Check if account is active
  if (user.status !== 'active') {
    return res.status(401).json({
      success: false,
      message: 'Account is not active. Please contact administrator.'
    });
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  // Update last active
  await user.updateLastActive();

  // Generate token
  const jwt = require('jsonwebtoken');
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });

  // Return user data (password excluded by toJSON method)
  res.json({
    success: true,
    message: 'Login successful',
    token,
    _id: user._id,
    numericalId: user.numericalId,
    name: user.name,
    username: user.username,
    email: user.email,
    role: user.role,
    status: user.status,
    phone: user.phone,
    gender: user.gender,
    dob: user.dob,
    department: user.department,
    team: user.team?._id || null,
    employeeType: user.employeeType,
    location: user.location,
    joinDate: user.joinDate,
    lastActive: user.lastActive,
    address: user.address,
    about: user.about,
    profileImg: user.profileImg,
    notifications: user.notifications,
    performance: user.performance,
    completionRate: user.completionRate
  });
}));

// All routes below require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// @route   GET /api/admin/users
// @desc    Get all users (admin only)
// @access  Private/Admin
router.get('/', asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, role, status, search, team } = req.query;
  
  // Build filter object
  const filter = {};
  
  if (role) filter.role = role;
  if (status) filter.status = status;
  if (team) filter.team = team;
  
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { username: { $regex: search, $options: 'i' } }
    ];
  }

  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  // Get users with pagination
  const users = await User.find(filter)
    .populate('team', 'name department')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  // Get total count for pagination
  const total = await User.countDocuments(filter);

  res.json({
    success: true,
    data: users,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    }
  });
}));

// @route   GET /api/admin/users/:id
// @desc    Get user by ID (admin only)
// @access  Private/Admin
router.get('/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).populate('team', 'name department');
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.json({
    success: true,
    data: user
  });
}));

// @route   POST /api/admin/users
// @desc    Create new user (admin only)
// @access  Private/Admin
router.post('/', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['admin', 'team-lead', 'user']).withMessage('Invalid role')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email: req.body.email }, { username: req.body.username }]
  });

  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: existingUser.email === req.body.email ? 'Email already registered' : 'Username already taken'
    });
  }

  // Create user
  const user = await User.create(req.body);

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: user
  });
}));

// @route   PUT /api/admin/users/:id
// @desc    Update user (admin only)
// @access  Private/Admin
router.put('/:id', [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('username').optional().trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('role').optional().isIn(['admin', 'team-lead', 'user']).withMessage('Invalid role'),
  body('status').optional().isIn(['active', 'inactive', 'suspended', 'on-leave']).withMessage('Invalid status')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { password, ...updateData } = req.body;

  // If password is being updated, hash it
  if (password) {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    user.password = password;
    await user.save();
    delete updateData.password;
  }

  // Update user
  const user = await User.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  ).populate('team', 'name department');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.json({
    success: true,
    message: 'User updated successfully',
    data: user
  });
}));

// @route   DELETE /api/admin/users/:id
// @desc    Delete user (admin only)
// @access  Private/Admin
router.delete('/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Prevent admin from deleting themselves
  if (user._id.toString() === req.user._id.toString()) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete your own account'
    });
  }

  await User.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'User deleted successfully'
  });
}));

export default router;