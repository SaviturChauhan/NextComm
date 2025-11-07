const mongoose = require('mongoose');

const BookmarkSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    index: true
  },
  answer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Answer',
    index: true
  },
  list: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BookmarkList',
    default: null
  },
  notes: {
    type: String,
    maxlength: 500
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Ensure user can only bookmark a question once
BookmarkSchema.index({ user: 1, question: 1 }, { unique: true, sparse: true, partialFilterExpression: { question: { $exists: true } } });
// Ensure user can only bookmark an answer once
BookmarkSchema.index({ user: 1, answer: 1 }, { unique: true, sparse: true, partialFilterExpression: { answer: { $exists: true } } });
// Ensure either question or answer is provided, but not both at the same time
BookmarkSchema.pre('validate', function(next) {
  if (!this.question && !this.answer) {
    next(new Error('Either question or answer must be provided'));
  } else if (this.question && this.answer) {
    next(new Error('Cannot bookmark both question and answer in the same bookmark'));
  } else {
    next();
  }
});

module.exports = mongoose.model('Bookmark', BookmarkSchema);

