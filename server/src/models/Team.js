import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Team name is required'],
    unique: true,
    trim: true,
    maxlength: [100, 'Team name cannot exceed 100 characters']
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true
  },
  lead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  projects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  }],
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  parentTeam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    default: null
  },
  subTeams: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  }],
  performanceMetrics: {
    taskCompletion: { type: Number, default: 0, min: 0, max: 100 },
    onTimeDelivery: { type: Number, default: 0, min: 0, max: 100 },
    qualityRating: { type: Number, default: 0, min: 0, max: 5 }
  },
  completionRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for member count
teamSchema.virtual('memberCount').get(function() {
  return this.members ? this.members.length : 0;
});

// Virtual for project count
teamSchema.virtual('projectCount').get(function() {
  return this.projects ? this.projects.length : 0;
});

// Virtual for id (to match frontend expectations)
teamSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Indexes for performance
teamSchema.index({ name: 1 });
teamSchema.index({ department: 1 });
teamSchema.index({ lead: 1 });
teamSchema.index({ parentTeam: 1 });

// Middleware to update parent team's subTeams array
teamSchema.pre('save', async function(next) {
  if (this.isNew && this.parentTeam) {
    try {
      await this.constructor.findByIdAndUpdate(
        this.parentTeam,
        { $addToSet: { subTeams: this._id } }
      );
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Middleware to remove from parent team's subTeams array on deletion
teamSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  if (this.parentTeam) {
    try {
      await this.constructor.findByIdAndUpdate(
        this.parentTeam,
        { $pull: { subTeams: this._id } }
      );
    } catch (error) {
      return next(error);
    }
  }
  next();
});

const Team = mongoose.model('Team', teamSchema);

export default Team;