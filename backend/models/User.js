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
    required: function() {
      // Password is required only if user is not using OAuth
      return !this.googleId && this.authProvider !== 'google';
    },
    minlength: function() {
      // Only enforce minlength if password is provided
      return this.password ? 6 : undefined;
    }
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true // Allows multiple null values
  },
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
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
  },
  role: {
    type: String,
    enum: ['USER', 'ADMIN'],
    default: 'USER'
  }
}, {
  timestamps: true
});

// Hash password before saving (only if password exists and is modified)
userSchema.pre('save', async function(next) {
  // Skip password hashing for OAuth users or if password is not modified or doesn't exist
  if (!this.password || !this.isModified('password') || this.authProvider === 'google') {
    // For OAuth users, ensure password is not set
    if (this.authProvider === 'google' && this.password === '') {
      this.password = undefined;
    }
    return next();
  }
  
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
    { name: 'Contributor', points: 100, description: 'Earned at 100 points milestone' },
    { name: 'Scholar', points: 250, description: 'Earned at 250 points milestone' },
    { name: 'Expert', points: 500, description: 'Earned at 500 points milestone' },
    { name: 'Master', points: 1000, description: 'Earned at 1000 points milestone' },
    { name: 'Legend', points: 2000, description: 'Earned at 2000 points milestone' },
    { name: 'Elite', points: 3000, description: 'Earned at 3000 points milestone' },
    { name: 'Guru', points: 5000, description: 'Earned at 5000 points milestone' }
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

