const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    maxlength: 10000
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
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
  isAccepted: {
    type: Boolean,
    default: false
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for efficient queries
answerSchema.index({ question: 1, createdAt: -1 });
answerSchema.index({ author: 1, createdAt: -1 });
answerSchema.index({ isAccepted: 1 });

module.exports = mongoose.model('Answer', answerSchema);

