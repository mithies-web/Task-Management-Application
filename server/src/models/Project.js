import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    maxlength: [200, 'Project name cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: [true, 'Team is required']
  },
  lead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Project lead is required']
  },
  teamMembers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  deadline: {
    type: Date,
    required: [true, 'Deadline is required']
  },
  status: {
    type: String,
    enum: ['not-started', 'in-progress', 'completed', 'on-hold', 'cancelled'],
    default: 'not-started'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  budget: {
    allocated: { type: Number, default: 0 },
    spent: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' }
  },
  tags: [{
    type: String,
    trim: true
  }],
  attachments: [{
    name: String,
    url: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  milestones: [{
    name: String,
    description: String,
    dueDate: Date,
    completed: { type: Boolean, default: false },
    completedAt: Date
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for id (to match frontend expectations)
projectSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Virtual for days remaining
projectSchema.virtual('daysRemaining').get(function() {
  if (!this.deadline) return null;
  const today = new Date();
  const deadline = new Date(this.deadline);
  const diffTime = deadline.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for budget utilization percentage
projectSchema.virtual('budgetUtilization').get(function() {
  if (!this.budget.allocated || this.budget.allocated === 0) return 0;
  return Math.round((this.budget.spent / this.budget.allocated) * 100);
});

// Indexes for performance
projectSchema.index({ team: 1 });
projectSchema.index({ lead: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ priority: 1 });
projectSchema.index({ startDate: 1, endDate: 1 });

// Middleware to validate dates
projectSchema.pre('save', function(next) {
  if (this.startDate && this.endDate && this.startDate >= this.endDate) {
    return next(new Error('End date must be after start date'));
  }
  if (this.startDate && this.deadline && this.startDate > this.deadline) {
    return next(new Error('Deadline must be after start date'));
  }
  next();
});

// Method to calculate progress based on tasks
projectSchema.methods.calculateProgress = async function() {
  const Task = mongoose.model('Task');
  const tasks = await Task.find({ projectId: this._id });
  
  if (tasks.length === 0) {
    this.progress = 0;
    return this.progress;
  }
  
  const completedTasks = tasks.filter(task => task.status === 'done').length;
  this.progress = Math.round((completedTasks / tasks.length) * 100);
  
  return this.progress;
};

const Project = mongoose.model('Project', projectSchema);

export default Project;