const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  avatar: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    maxlength: 500,
    default: ''
  },
  points: {
    type: Number,
    default: 0
  },
  badges: [{
    name: String,
    description: String,
    earnedAt: {
      type: Date,
      default: Date.now
    }
  }],
  questionsAsked: {
    type: Number,
    default: 0
  },
  answersGiven: {
    type: Number,
    default: 0
  },
  reputation: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Update last active
userSchema.methods.updateLastActive = function() {
  this.lastActive = new Date();
  return this.save();
};

// Assign badges based on points
userSchema.methods.assignBadges = function() {
  const badgeThresholds = [
    { name: 'Beginner', points: 0, description: 'Welcome to NextComm!' },
    { name: 'Contributor', points: 100, description: 'Asked or answered 10+ questions' },
    { name: 'Scholar', points: 250, description: 'Consistent contributor' },
    { name: 'Expert', points: 500, description: 'Recognized subject matter expert' },
    { name: 'Master', points: 1000, description: 'Master of wireless communication' },
    { name: 'Legend', points: 2000, description: 'Top 10 contributor' },
    { name: 'Elite', points: 3000, description: 'Elite community member' },
    { name: 'Guru', points: 5000, description: 'Ultimate knowledge guru' }
  ];

  const currentBadgeNames = this.badges.map(b => b.name);
  const earnedBadges = badgeThresholds.filter(badge => this.points >= badge.points);
  
  // Add new badges that user has earned but doesn't have yet
  earnedBadges.forEach(badge => {
    if (!currentBadgeNames.includes(badge.name)) {
      this.badges.push({
        name: badge.name,
        description: badge.description,
        earnedAt: new Date()
      });
    }
  });

  return this;
};

module.exports = mongoose.model('User', userSchema);

