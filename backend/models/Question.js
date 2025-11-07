const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 15000
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  votes: {
    upvotes: {
      type: Number,
      default: 0
    },
    downvotes: {
      type: Number,
      default: 0
    },
    voters: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      voteType: {
        type: String,
        enum: ['upvote', 'downvote']
      }
    }]
  },
  views: {
    type: Number,
    default: 0
  },
  answers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Answer'
  }],
  acceptedAnswer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Answer'
  },
  isSolved: {
    type: Boolean,
    default: false
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  category: {
    type: String,
    // Allow both old and new categories for backward compatibility
    enum: [
      // New categories
      'Introduction & Performance',
      'Wireless Channel Models',
      'Diversity & Channel Capacity',
      'MIMO Systems',
      'OFDM (Multi-carrier Modulation)',
      'Cellular Standards',
      // Old categories (for backward compatibility)
      '5G',
      '4G',
      'MIMO',
      'OFDM',
      'Beamforming',
      'Channel Estimation',
      'Other'
    ],
    default: 'Other'
  }
}, {
  timestamps: true
});

// Index for search functionality
questionSchema.index({ title: 'text', description: 'text', tags: 'text' });
questionSchema.index({ author: 1, createdAt: -1 });
questionSchema.index({ tags: 1 });
questionSchema.index({ category: 1 });
questionSchema.index({ isSolved: 1, createdAt: -1 });

module.exports = mongoose.model('Question', questionSchema);

