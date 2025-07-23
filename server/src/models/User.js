import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  numericalId: {
    type: Number,
    unique: true,
    sparse: true
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    lowercase: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  role: {
    type: String,
    enum: ['admin', 'team-lead', 'user'],
    default: 'user'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'on-leave'],
    default: 'active'
  },
  phone: {
    type: String,
    trim: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', '']
  },
  dob: {
    type: Date
  },
  department: {
    type: String,
    trim: true
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    default: null
  },
  employeeType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'intern'],
    default: 'full-time'
  },
  location: {
    type: String,
    enum: ['office', 'remote', 'hybrid'],
    default: 'office'
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  address: {
    type: String,
    trim: true
  },
  about: {
    type: String,
    trim: true,
    maxlength: [500, 'About section cannot exceed 500 characters']
  },
  profileImg: {
    type: String,
    default: ''
  },
  notifications: [{
    id: String,
    title: String,
    message: String,
    date: { type: Date, default: Date.now },
    read: { type: Boolean, default: false },
    type: { type: String, enum: ['project', 'team', 'task', 'general'] },
    projectId: String,
    memberId: String,
    taskId: String
  }],
  performance: {
    taskCompletion: { type: Number, default: 0, min: 0, max: 100 },
    onTimeDelivery: { type: Number, default: 0, min: 0, max: 100 },
    qualityRating: { type: Number, default: 0, min: 0, max: 5 },
    projects: [String]
  },
  completionRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Auto-increment numericalId
userSchema.pre('save', async function(next) {
  if (this.isNew && !this.numericalId) {
    try {
      const lastUser = await this.constructor.findOne({}, {}, { sort: { numericalId: -1 } });
      this.numericalId = lastUser ? lastUser.numericalId + 1 : 1001;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

// Update lastActive on login
userSchema.methods.updateLastActive = function() {
  this.lastActive = new Date();
  return this.save({ validateBeforeSave: false });
};

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove sensitive data from JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.emailVerificationToken;
  delete userObject.passwordResetToken;
  delete userObject.passwordResetExpires;
  return userObject;
};

// Virtual for id (to match frontend expectations)
userSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ numericalId: 1 });
userSchema.index({ team: 1 });
userSchema.index({ role: 1, status: 1 });

const User = mongoose.model('User', userSchema);

export default User;